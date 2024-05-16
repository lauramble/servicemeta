/**
 * Copyright (C) 2019  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

// List of all HTML fields in a Person fieldset.
const personFields = [
    'givenName',
    'familyName',
    'email',
    'identifier',
    'affiliation',
];

const organizationFields = [
    "name",
    "alternateName",
    "url",
    "identifier",
    "affiliation"
]

const actorFieldsMap = {
    "person" : personFields,
    "organization": organizationFields
}

function personFieldsetHTML(actorPrefix, legend) {
    return `
    <legend>${legend}</legend>
    <input type="hidden" id="${actorPrefix}_type" value="person" />
    <div class="moveButtons">
        <input type="button" id="${actorPrefix}_moveToLeft" value="<" class="moveToLeft"
            title="Moves this person to the left." />
        <input type="button" id="${actorPrefix}_moveToRight" value=">" class="moveToRight"
            title="Moves this person to the right." />
    </div>
    <p>
        <label for="${actorPrefix}_givenName">Given name</label>
        <input type="text" id="${actorPrefix}_givenName" name="${actorPrefix}_givenName"
            placeholder="Jane" required="true" />
    </p>
    <p>
        <label for="${actorPrefix}_familyName">Family name</label>
        <input type="text" id="${actorPrefix}_familyName" name="${actorPrefix}_familyName"
            placeholder="Doe" />
    </p>
    <p>
        <label for="${actorPrefix}_email">E-mail address</label>
        <input type="email" id="${actorPrefix}_email" name="${actorPrefix}_email"
            placeholder="jane.doe@example.org" />
    </p>
    <p>
        <label for="${actorPrefix}_identifier">Identifier</label>
        <input type="url" id="${actorPrefix}_identifier" name="${actorPrefix}_identifier"
            placeholder="http://orcid.org/0000-0002-1825-0097" />
    </p>
    <p>
    <label for="${actorPrefix}_affiliation">Affiliation</label>
        <input type="text" id="${actorPrefix}_affiliation" name="${actorPrefix}_affiliation"
            placeholder="Department of Computer Science, University of Pisa" />
    </p>
    <input type="hidden" id="${actorPrefix}_role_index" value="0" />
    <input type="button" id="${actorPrefix}_role_add" value="Add one role" />
`
}

function organizationFieldsetHTML(actorPrefix, legend) {
    return `
    <legend>${legend}</legend>
    <input type="hidden" id="${actorPrefix}_type" value="organization" />
    <div class="moveButtons">
        <input type="button" id="${actorPrefix}_moveToLeft" value="<" class="moveToLeft"
            title="Moves this organization to the left." />
        <input type="button" id="${actorPrefix}_moveToRight" value=">" class="moveToRight"
            title="Moves this orgnaization to the right." />
    </div>
    <p>
        <label for="${actorPrefix}_name">Name</label>
        <input type="text" id="${actorPrefix}_name" name="${actorPrefix}_name"
            placeholder="hello test hello" required="true" />
    </p>
    <p>
        <label for="${actorPrefix}_alternateName">Short name</label>
        <input type="text" id="${actorPrefix}_alternateName" name="${actorPrefix}_alternateName"
            placeholder="hi" />
    </p>
    <p>
        <label for="${actorPrefix}_url">Website</label>
        <input type="url" id="${actorPrefix}_url" name="${actorPrefix}_url"
            placeholder="http://www.hello.org" />
    </p>
    <p>
        <label for="${actorPrefix}_identifier">Identifier</label>
        <input type="url" id="${actorPrefix}_identifier" name="${actorPrefix}_identifier"
            placeholder="http://hello" />
    </p>
    <p>
    <label for="${actorPrefix}_affiliation">Affiliation</label>
        <input type="text" id="${actorPrefix}_affiliation" name="${actorPrefix}_affiliation"
            placeholder="Department of Computer Science, University of Pisa" />
    </p>
`
}

function createActorFieldset(actorPrefix, actorType, legend) {
    // Creates a fieldset containing inputs for informations about a person
    var fieldset = document.createElement("fieldset");

    fieldset.classList.add("actor");
    fieldset.classList.add(actorType);
    fieldset.classList.add("leafFieldset");
    fieldset.id = actorPrefix;
   
    switch (actorType) {
        case "person":
            fieldset.innerHTML = personFieldsetHTML(actorPrefix, legend);
            break;
        case "organization":
            fieldset.innerHTML = organizationFieldsetHTML(actorPrefix, legend);
            break;
    }
    

    return fieldset;
}

function addActorWithId(container, actorType, prefix, legend, id) {
    var actorPrefix = `${prefix}_${id}`;
    var fieldset = createActorFieldset(actorPrefix, actorType, `${legend} #${id}`);

    container.appendChild(fieldset);

    document.querySelector(`#${actorPrefix}_moveToLeft`)
        .addEventListener('click', () => moveActor(prefix, id, "left", legend));
    document.querySelector(`#${actorPrefix}_moveToRight`)
        .addEventListener('click', () => moveActor(prefix, id, "right", legend));
    if (document.querySelector(`#${actorPrefix}_role_add`)) {
        document.querySelector(`#${actorPrefix}_role_add`)
            .addEventListener('click', () => addRole(actorPrefix));
    }
}

function replaceActor(prefix, actorType, legend, id, fieldsValues) {
    var actorPrefix = `${prefix}_${id}`;
    var fieldset = createActorFieldset(actorPrefix, actorType, `${legend} #${id}`);

    document.querySelector(`#${actorPrefix}`).innerHTML = fieldset.innerHTML;
    document.querySelector(`#${actorPrefix}`).classList = fieldset.classList;

    actorFieldsMap[actorType].forEach((fieldName) => {
        document.querySelector(`#${actorPrefix}_${fieldName}`).value = fieldsValues[fieldName];
    });

    document.querySelector(`#${actorPrefix}_moveToLeft`)
        .addEventListener('click', () => moveActor(prefix, id, "left", legend));
    document.querySelector(`#${actorPrefix}_moveToRight`)
        .addEventListener('click', () => moveActor(prefix, id, "right", legend));
    if (document.querySelector(`#${actorPrefix}_role_add`)) {
        document.querySelector(`#${actorPrefix}_role_add`)
            .addEventListener('click', () => addRole(actorPrefix));
    }
    
}

function moveActor(prefix, id1, direction, legend) {
    console.log("hello");
    var nbActors = getNbActors(prefix);
    var id2;

    // Computer id2, the id of the person to flip id1 with (wraps around the
    // end of the list of persons)
    if (direction == "left") {
        id2 = id1 - 1;
        if (id2 <= 0) {
            id2 = nbActors;
        }
    }
    else {
        id2 = id1 + 1;
        if (id2 > nbActors) {
            id2 = 1;
        }
    }

    var actor1Prefix = `${prefix}_${id1}`;
    var actor2Prefix = `${prefix}_${id2}`;

    var actor1Type = document.querySelector(`#${actor1Prefix}_type`).value;
    var actor2Type = document.querySelector(`#${actor2Prefix}_type`).value;

    var newId1Values = {};
    var newId2Values = {};

    actorFieldsMap[actor2Type].forEach((fieldName) => {
        newId1Values[fieldName] = document.querySelector(`#${actor2Prefix}_${fieldName}`).value;
    });
    actorFieldsMap[actor1Type].forEach((fieldName) => {
        newId2Values[fieldName] = document.querySelector(`#${actor1Prefix}_${fieldName}`).value;
    });

    replaceActor(prefix, actor2Type, legend, id1, newId1Values);
    replaceActor(prefix, actor1Type, legend, id2, newId2Values);

    // Form was changed; regenerate
    generateServicemeta();
}

function addActor(prefix, legend, type) {
    var container = document.querySelector(`#${prefix}_container`);
    var actorId = getNbActors(prefix) + 1;

    addActorWithId(container, type, prefix, legend, actorId);

    setNbActors(prefix, actorId);

    return actorId;
}


function removeActor(prefix) {
    var actorId = getNbActors(prefix);

    document.querySelector(`#${prefix}_${actorId}`).remove();

    setNbActors(prefix, actorId - 1);
}

// Initialize a group of persons (authors, contributors) on page load.
// Useful if the page is reloaded.
function initActors(prefix, legend) {
    var nbActors = getNbActors(prefix);
    var personContainer = document.querySelector(`#${prefix}_container`)

    for (let actorId = 1; actorId <= nbActors; actorId++) {
        addActorWithId(personContainer, "person", prefix, legend, actorId);
    }
}

function removeActors(prefix) {
    var nbActors = getNbActors(prefix);
    var personContainer = document.querySelector(`#${prefix}_container`)

    for (let actorId = 1; actorId <= nbActors; actorId++) {
        removeActor(prefix)
    }
}

function addRole(personPrefix) {
    const roleButtonGroup = document.querySelector(`#${personPrefix}_role_add`);
    const roleIndexNode = document.querySelector(`#${personPrefix}_role_index`);
    const roleIndex = parseInt(roleIndexNode.value, 10);

    const ul = document.createElement("ul")
    ul.classList.add("role");
    ul.id = `${personPrefix}_role_${roleIndex}`;

    ul.innerHTML = `
        <li><label for="${personPrefix}_roleName_${roleIndex}">Role</label>
            <input type="text" class="roleName" id="${personPrefix}_roleName_${roleIndex}" name="${personPrefix}_roleName_${roleIndex}"
                placeholder="Developer" size="10" /></li>
        <li><label for="${personPrefix}_startDate_${roleIndex}">Start date:</label>
            <input type="date" class="startDate" id="${personPrefix}_startDate_${roleIndex}" name="${personPrefix}_startDate_${roleIndex}" /></li>
        <li><label for="${personPrefix}_endDate_${roleIndex}">End date:</label>
            <input type="date" class="endDate" id="${personPrefix}_endDate_${roleIndex}" name="${personPrefix}_endDate_${roleIndex}" /></li>
        <li><input type="button" id="${personPrefix}_role_remove_${roleIndex}" value="X" title="Remove role" /></li>
    `;
    roleButtonGroup.after(ul);

    document.querySelector(`#${personPrefix}_role_remove_${roleIndex}`)
        .addEventListener('click', () => removeRole(personPrefix, roleIndex));

    roleIndexNode.value = roleIndex + 1;
}

function removeRole(personPrefix, roleIndex) {
    document.querySelector(`#${personPrefix}_role_${roleIndex}`).remove();
}

function resetForm() {
    removeActors('author');
    removeActors('contributor');
    // Reset the list of selected licenses
    document.getElementById("selected-licenses").innerHTML = '';

    // Reset the form after deleting elements, so nbActors doesn't get
    // reset before it's read.
    document.querySelector('#inputForm').reset();
}

function fieldToLower(event) {
    event.target.value = event.target.value.toLowerCase();
}

function initCallbacks() {
    document.querySelector('#license')
        .addEventListener('change', validateLicense);

    document.querySelector('#generateServicemeta').disabled = false;
    document.querySelector('#generateServicemeta')
        .addEventListener('click', () => generateServicemeta("0.1"));

    document.querySelector('#resetForm')
        .addEventListener('click', resetForm);

    document.querySelector('#validateServicemeta').disabled = false;
    document.querySelector('#validateServicemeta')
        .addEventListener('click', () => parseAndValidateServicemeta(true));

    document.querySelector('#importServicemeta').disabled = false;
    document.querySelector('#importServicemeta')
        .addEventListener('click', importServicemeta);

    document.querySelector('#inputForm')
        .addEventListener('change', () => generateServicemeta());

    /*
    document.querySelector('#developmentStatus')
        .addEventListener('change', fieldToLower);
    */
   
    initActors('author', 'Author');
    initActors('contributor', 'Contributor');
}
