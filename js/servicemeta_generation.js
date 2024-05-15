/**
 * Copyright (C) 2019-2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

const LOCAL_CONTEXT_PATH = "./data/contexts/servicemeta.jsonld";
const LOCAL_CONTEXT_URL = "local";
const SERVICEMETA_CONTEXTS = {
    "0.1": {
        path: "./data/contexts/servicemeta.jsonld",
        url: "https://gitlab.ebrains.eu/lauramble/servicemeta/-/raw/main/data/contexts/servicemeta.jsonld"
    }
}

const SPDX_PREFIX = 'https://spdx.org/licenses/';

const loadContextData = async () => {
    const [contextLocal, contextV01] =
        await Promise.all([
            fetch(LOCAL_CONTEXT_PATH).then(response => response.json()),
            fetch(SERVICEMETA_CONTEXTS["0.1"].path).then(response => response.json())
        ]);
    return {
        [LOCAL_CONTEXT_URL]: contextLocal,
        [SERVICEMETA_CONTEXTS["0.1"].url]: contextV01
    }
}

const getJsonldCustomLoader = contexts => {
    return url => {
        const xhrDocumentLoader = jsonld.documentLoaders.xhr();
        if (url in contexts) {
            return {
                contextUrl: null,
                document: contexts[url],
                documentUrl: url
            };
        }
        return xhrDocumentLoader(url);
    }
};

const initJsonldLoader = contexts => {
    jsonld.documentLoader = getJsonldCustomLoader(contexts);
};

function emptyToUndefined(v) {
    if (v == null || v == "")
        return undefined;
    else
        return v;
}

function getIfSet(query) {
    console.log(query, document)
    return emptyToUndefined(document.querySelector(query).value);
}

function setIfDefined(query, value) {
    if (value !== undefined) {
        document.querySelector(query).value = value;
    }
}

function getLicenses() {
    let selectedLicenses = Array.from(document.getElementById("selected-licenses").children);
    return selectedLicenses.map(licenseDiv => SPDX_PREFIX + licenseDiv.children[0].innerText);
}

// Names of servicemeta properties with a matching HTML field name
const directServicemetaFields = [
    'alternateName',
    'codeRepository',
    'dateCreated',
    'dateModified',
    'description',
    'documentation',
    'funder',
    'funding',
    'url',
    'identifier',
    'license',
    'name',
    'releaseNotes',
    'version',
];

const splittedServicemetaFields = [
    ['keywords', ','],
    ['relatedLink', '\n'],
    ['inputFormat', ','],
    ['outputFormat', ',']
]

// Names of servicemeta properties with a matching HTML field name,
// in a Person object
const directPersonServicemetaFields = [
    'givenName',
    'familyName',
    'email',
    'identifier',
    'affiliation',
];

const directRoleServicemetaFields = [
    'roleName',
    'startDate',
    'endDate',
];

/* 
const directReviewServicemetaFields = [
    'reviewAspect',
    'reviewBody'
];
*/

const crossedServicemetaFields = {
    "contIntegration": ["contIntegration", "continuousIntegration"],
    "embargoDate": ["embargoDate", "embargoEndDate"],
};

function generateShortOrg(fieldName) {
    var affiliation = getIfSet(fieldName);
    if (affiliation !== undefined) {
        if (isUrl(affiliation)) {
            return {
                "@type": "Organization",
                "@id": affiliation,
            };
        }
        else {
            return {
                "@type": "Organization",
                "name": affiliation,
            };
        }
    }
    else {
        return undefined;
    }
}

function generatePerson(idPrefix) {
    var doc = {
        "@type": "Person",
    }
    var id = getIfSet(`#${idPrefix}_identifier`);
    if (id !== undefined) {
        doc["@id"] = id;
    }
    directPersonServicemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet(`#${idPrefix}_${item}`);
    });
    doc["affiliation"] = generateShortOrg(`#${idPrefix}_affiliation`);

    return doc;
}

function generateRole(id) {
    const doc = {
        "@type": "Role"
    };
    directRoleServicemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet(`#${id} .${item}`);
    });
    return doc;
}

function generateRoles(idPrefix, person) {
    const roles = [];
    const roleNodes = document.querySelectorAll(`ul[id^=${idPrefix}_role_`);
    roleNodes.forEach(roleNode => {
        const role = generateRole(roleNode.id);
        role["schema:author"] = person; // Prefix with "schema:" to prevent it from expanding into a list
        roles.push(role);
    });
    return roles;
}

function generatePersons(prefix) {
    var persons = [];
    var nbPersons = getNbPersons(prefix);

    for (let personId = 1; personId <= nbPersons; personId++) {
        const idPrefix = `${prefix}_${personId}`;
        const person = generatePerson(idPrefix);
        persons.push(person);
        const roles = generateRoles(idPrefix, person);
        if (roles.length > 0) {
            persons = persons.concat(roles);
        }
    }

    return persons;
}

/*
function generateReview() {
    const doc = {
        "@type": "Review"
    };
    directReviewServicemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet(`#${item}`);
    });
    return doc;
}
*/

async function buildExpandedJson() {
    var doc = {
        "@context": LOCAL_CONTEXT_URL,
        "@type": "WebApplication",
    };

    let licenses = getLicenses();
    if (licenses.length > 0) {
        doc["license"] = licenses;
    }

    // Generate most fields
    directServicemetaFields.forEach(function (item, index) {
        doc[item] = getIfSet('#' + item)
    });

    doc["funder"] = generateShortOrg("#funder");
    console.log(doc["funder"])

    /*
    const review = generateReview();
    if (review["reviewAspect"] || review["reviewBody"]) {
        doc["review"] = generateReview();
    }
    */

    // Generate simple fields parsed simply by splitting
    splittedServicemetaFields.forEach(function (item, index) {
        const id = item[0];
        const separator = item[1];
        const value = getIfSet('#' + id);
        if (value !== undefined) {
            doc[id] = value.split(separator).map(trimSpaces);
        }
    });

    // Generate dynamic fields
    var authors = generatePersons('author');
    if (authors.length > 0) {
        doc["author"] = authors;
    }
    var contributors = generatePersons('contributor');
    if (contributors.length > 0) {
        doc["contributor"] = contributors;
    }

    for (const [key, values] of Object.entries(crossedServicemetaFields)) {
        values.forEach(value => {
           doc[value] = doc[key];
        });
    }
    console.log(doc["funder"])
    return await jsonld.expand(doc);
}

async function generateServicemeta(servicemetaVersion = "0.1") {
    var inputForm = document.querySelector('#inputForm');
    var servicemetaText, errorHTML;

    if (inputForm.checkValidity()) {
        const expanded = await buildExpandedJson();
        const compacted = await jsonld.compact(expanded, SERVICEMETA_CONTEXTS[servicemetaVersion].url);
        servicemetaText = JSON.stringify(compacted, null, 4);
        errorHTML = "";
    }
    else {
        servicemetaText = "";
        errorHTML = "invalid input (see error above)";
        inputForm.reportValidity();
    }

    document.querySelector('#servicemetaText').innerText = servicemetaText;
    setError(errorHTML);


    // Run validator on the exported value, for extra validation.
    // If this finds a validation, it means there is a bug in our code (either
    // generation or validation), and the generation MUST NOT generate an
    // invalid servicemeta file, regardless of user input.
    if (servicemetaText && !validateDocument(JSON.parse(servicemetaText))) {
        alert('Bug detected! The data you wrote is correct; but for some reason, it seems we generated an invalid servicemeta.json. Please report this bug at https://github.com/servicemeta/servicemeta-generator/issues/new and copy-paste the generated servicemeta.json file. Thanks!');
    }

    if (servicemetaText) {
        // For restoring the form state on page reload
        sessionStorage.setItem('servicemetaText', servicemetaText);
    }
}

// Imports a single field (name or @id) from an Organization.
function importShortOrg(fieldName, doc) {
    if (doc !== undefined) {
        // Use @id if set, else use name
        setIfDefined(fieldName, doc["name"]);
        setIfDefined(fieldName, getDocumentId(doc));
    }
}

function importPersons(prefix, legend, docs) {
    if (docs === undefined) {
        return;
    }

    docs.forEach(function (doc, index) {
        var personId = addPerson(prefix, legend);

        setIfDefined(`#${prefix}_${personId}_identifier`, getDocumentId(doc));
        directPersonServicemetaFields.forEach(function (item, index) {
            setIfDefined(`#${prefix}_${personId}_${item}`, doc[item]);
        });

        importShortOrg(`#${prefix}_${personId}_affiliation`, doc['affiliation'])
    })
}

async function importServicemeta() {
    var inputForm = document.querySelector('#inputForm');
    var doc = await parseAndValidateServicemeta(false);
    resetForm();

    if (doc['license'] !== undefined) {
        if (typeof doc['license'] === 'string') {
            doc['license'] = [doc['license']];
        }

        doc['license'].forEach(l => {
            if (l.indexOf(SPDX_PREFIX) !== 0) { return; }
            let licenseId = l.substring(SPDX_PREFIX.length);
            insertLicenseElement(licenseId);
        });
    }

    directServicemetaFields.forEach(function (item, index) {
        setIfDefined('#' + item, doc[item]);
    });
    importShortOrg('#funder', doc["funder"]);

    // Import simple fields by joining on their separator
    splittedServicemetaFields.forEach(function (item, index) {
        const id = item[0];
        const separator = item[1];
        let value = doc[id];
        if (value !== undefined) {
            if (Array.isArray(value)) {
                value = value.join(separator);
            }
            setIfDefined('#' + id, value);
        }
    });

    importPersons('author', 'Author', doc['author'])
    importPersons('contributor', 'Contributor', doc['contributor'])
}

function loadStateFromStorage() {
    var servicemetaText = sessionStorage.getItem('servicemetaText')
    if (servicemetaText) {
        document.querySelector('#servicemetaText').innerText = servicemetaText;
        importServicemeta();
    }
}
