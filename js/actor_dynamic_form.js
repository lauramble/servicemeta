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

function personFieldsetHTML(prefix, id, legend,
    actorPrefix = `${prefix}_${id}`) {
    return `
        <legend class="person" id="${actorPrefix}_legend">${legend} #<span class="actorID">${id}</span></legend>
        <input class="actorType" type="hidden" id="${actorPrefix}_type" name="actorType" value="person" />
        <input class="actorID" type="hidden" name="actorID" value=${id} />
        <div class="moveButtons">
            <input type="button" id="${actorPrefix}_moveLeft" value="<" class="moveLeft"
                title="Move to the left." onclick="moveLeft(this, '${prefix}')"/>
            <input type="button" id="${actorPrefix}_delete" value="x" class="delete"
                title="Delete." onclick="deleteActor(this, '${prefix}')"/>
            <input type="button" id="${actorPrefix}_moveRight" value=">" class="moveRight"
                title="Move to the right." onclick="moveRight(this, '${prefix}')" />
        </div>
        <p>
            <label for="${actorPrefix}_givenName">Given name</label>
            <input type="text" id="${actorPrefix}_givenName" name="givenName"
                placeholder="Jane" required="true" />
        </p>
        <p>
            <label for="${actorPrefix}_familyName">Family name</label>
            <input type="text" id="${actorPrefix}_familyName" name="familyName"
                placeholder="Doe" />
        </p>
        <p>
            <label for="${actorPrefix}_email">E-mail address</label>
            <input type="email" id="${actorPrefix}_email" name="email"
                placeholder="jane.doe@example.org" />
        </p>
        <p>
            <label for="${actorPrefix}_identifier">Identifier</label>
            <input type="url" id="${actorPrefix}_identifier" name="identifier"
                placeholder="http://orcid.org/0000-0002-1825-0097" />
        </p>
        <p>
        <label for="${actorPrefix}_affiliation">Affiliation</label>
            <input type="text" id="${actorPrefix}_affiliation" name="affiliation"
                placeholder="Department of Computer Science, University of Pisa" />
        </p>
        <div class="roles">
            <input type="hidden" id="${actorPrefix}_role_index" value="0" />
            <input type="button" id="${actorPrefix}_role_add" value="Add one role" onclick="addRole('${prefix}', ${id})"/>
        </div>
    `
}

function organizationFieldsetHTML(prefix, id, legend,
    actorPrefix = `${prefix}_${id}`) {
    return `
    <legend class="organization" id="${actorPrefix}_legend">${legend} #<span class="actorID">${id}</span></legend>
        <input class="actorType" type="hidden" id="${actorPrefix}_type" name="actorType" value="organization" />
        <input class="actorID" type="hidden" name="actorID" value=${id} />
        <div class="moveButtons">
            <input type="button" id="${actorPrefix}_moveLeft" value="<" class="moveLeft"
                title="Move to the left." onclick="moveLeft(this, '${prefix}')"/>
            <input type="button" id="${actorPrefix}_delete" value="x" class="delete"
                title="Delete." onclick="deleteActor(this, '${prefix}')"/>
            <input type="button" id="${actorPrefix}_moveRight" value=">" class="moveRight"
                title="Move to the right." onclick="moveRight(this, '${prefix}')" />
        </div>
        <p>
            <label for="${actorPrefix}_name">Name</label>
            <input type="text" id="${actorPrefix}_name" name="name"
                placeholder="The University Academy" required="true" />
        </p>
        <p>
            <label for="${actorPrefix}_alternateName">Short name</label>
            <input type="text" id="${actorPrefix}_alternateName" name="alternateName"
                placeholder="UA" />
        </p>
        <p>
            <label for="${actorPrefix}_url">Website</label>
            <input type="url" id="${actorPrefix}_url" name="url"
                placeholder="http://www.university-academy.org" />
        </p>
        <p>
            <label for="${actorPrefix}_identifier">Identifier</label>
            <input type="url" id="${actorPrefix}_identifier" name="identifier"
                placeholder="" />
        </p>
`
}

function createActorFieldset(actorType, prefix, id, legend) {
    // Creates a fieldset containing inputs for informations about an actor 
    const fieldset = document.createElement("fieldset");
    fieldset.classList = `${prefix} actor ${actorType} leafFieldset`;
    fieldset.id = `${prefix}_${id}`;
    switch (actorType.toLowerCase()) {
        case "person":
            fieldset.innerHTML = personFieldsetHTML(prefix, id, legend);
            break;
        case "organization":
            fieldset.innerHTML = organizationFieldsetHTML(prefix, id, legend);
            break;
        default:
            throw new TypeError(`Wrong actor type, must be "person" or "organization", not ${actorType.toLowerCase()}`)
    }
    fieldset.addEventListener("change", () => saveActorsToLocalStorage(prefix));
    return fieldset;
}


function saveActorsToLocalStorage(prefix) {
    const data = [];
    const container = document.querySelector(`#${prefix}_container`);
    container.querySelectorAll('fieldset').forEach((fieldset) => {
        const inputs = fieldset.querySelectorAll('input');
        const fieldsetData = {};
        inputs.forEach(input => {
            if (input.name && !input.classList.contains("role")) {
                fieldsetData[input.name] = input.value;
            }          
        });
        const roles = fieldset.querySelector(".roles");
        if (roles) {
            const rolesUl = [];
            roles.querySelectorAll("ul").forEach( role => {
                const rolesLi = role.querySelectorAll("input");
                let roleObj = {};
                rolesLi.forEach(roleInput => {
                    if (roleInput.name) {
                        roleObj[roleInput.name] = roleInput.value
                    } 
                });
                rolesUl.push(roleObj)
            });
            fieldsetData["roles"] = rolesUl;
        }
        data.push(fieldsetData);
    });
    localStorage.setItem(prefix, JSON.stringify(data));
    return data;
}

function loadActorsFromLocalStorage(prefix) {
    const data = JSON.parse(localStorage.getItem(prefix)) || [];
    const fieldsetContainer = document.querySelector(`#${prefix}_container`);
    data.forEach(item => {
        const fieldset = addActor(prefix, item["actorType"]);
        for (let [name, value] of Object.entries(item)) {
            if (name !== "roles") {
                fieldset.querySelector(`input[name=${name}]`).value = value;
            }
        }
        fieldsetContainer.appendChild(fieldset);
    });
}

function moveLeft(button, prefix) {
    const fieldset = button.parentElement.parentElement;
    const fieldsetContainer = document.querySelector(`#${prefix}_container`);
    const prevFieldset = fieldset.previousElementSibling;
    if (prevFieldset) {
        fieldsetContainer.insertBefore(fieldset, prevFieldset);
        updateId(prefix);
        saveActorsToLocalStorage(prefix);
    } else {
        fieldsetContainer.appendChild(fieldset);
        updateId(prefix);
        saveActorsToLocalStorage(prefix);
    }
}

function moveRight(button, prefix) {
    const fieldset = button.parentElement.parentElement;
    const fieldsetContainer = document.querySelector(`#${prefix}_container`);
    const nextFieldset = fieldset.nextElementSibling;
    if (nextFieldset) {
        fieldsetContainer.insertBefore(nextFieldset, fieldset);
        updateId(prefix);
        saveActorsToLocalStorage(prefix);
    } else {
        fieldsetContainer.insertBefore(fieldset, fieldsetContainer.firstChild);
        updateId(prefix);
        saveActorsToLocalStorage(prefix);
    }
}

function deleteActor(button, prefix) {
    const fieldsetContainer = document.querySelector(`#${prefix}_container`);
    const fieldset = button.parentElement.parentElement;
    fieldsetContainer.removeChild(fieldset);
    updateId(prefix);
    saveActorsToLocalStorage(prefix);
}

function updateId(prefix) {
    let i = 1;
    const fieldsetContainer = document.querySelector(`#${prefix}_container`);
    fieldsetContainer.querySelectorAll("fieldset").forEach((fieldset) => {
        fieldset.querySelector("span").innerText = i;
        fieldset.id = `${prefix}_${i}`;
        i++;
      })
}

function addActor(prefix, type, legend = prefix[0].toUpperCase() + prefix.slice(1)) {
    const fieldsetContainer = document.querySelector(`#${prefix}_container`);
    const id = getNbChildren(prefix) + 1;
    const actorPrefix = `${prefix}_${id}`;
    let newFieldset = createActorFieldset(type, prefix, id, legend);

    fieldsetContainer.appendChild(newFieldset)

    return fieldsetContainer.querySelector(`#${prefix}_${id}`);
}

function removeActors(prefix) {
    var nbActors = getNbChildren(prefix);

    for (let actorId = 1; actorId <= nbActors; actorId++) {
        removeActor(prefix);
    }
}

function addRole(prefix, id) {
    const personPrefix = `${prefix}_${id}`;
    const roleButtonGroup = document.querySelector(`#${personPrefix}_role_add`);
    const roleIndexNode = document.querySelector(`#${personPrefix}_role_index`);
    const roleIndex = parseInt(roleIndexNode.value, 10);

    const ul = document.createElement("ul")
    ul.classList.add("role");
    ul.id = `${personPrefix}_role_${roleIndex}`;

    ul.innerHTML = `
        <li><label for="${personPrefix}_roleName_${roleIndex}">Role</label>
            <input type="text" class="role roleName" id="${personPrefix}_roleName_${roleIndex}" name="roleName"
                placeholder="Developer" size="10" /></li>
        <li><label for="${personPrefix}_startDate_${roleIndex}">Start date:</label>
            <input type="date" class="role startDate" id="${personPrefix}_startDate_${roleIndex}" name="startDate" /></li>
        <li><label for="${personPrefix}_endDate_${roleIndex}">End date:</label>
            <input type="date" class="role endDate" id="${personPrefix}_endDate_${roleIndex}" name="endDate" /></li>
        <li><input type="button" id="${personPrefix}_role_remove_${roleIndex}" value="X" title="Remove role" /></li>
    `;
    roleButtonGroup.after(ul);

    document.querySelector(`#${personPrefix}_role_remove_${roleIndex}`)
        .addEventListener('click', () => removeRole(prefix, id, roleIndex));

    roleIndexNode.value = roleIndex + 1;
}

function removeRole(prefix, id, roleIndex) {
    document.querySelector(`#${prefix}_${id}_role_${roleIndex}`).remove();
    saveActorsToLocalStorage(prefix)
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
   
    //initActors('author', 'Author');
    //initActors('contributor', 'Contributor');
    loadActorsFromLocalStorage("author");
    loadFundingFromLocalStorage();
}
