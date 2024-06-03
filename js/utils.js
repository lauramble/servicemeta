/**
 * Copyright (C) 2019  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

"use strict";

/*
 * Returns the overlap between an Object's keys and an array of fields.
 */
function getFieldsInObject(doc, fields) {
    return Object.keys(doc).filter(value => fields.includes(value));
}

function getNbChildren_OLD(prefix) {
    var nbField = document.querySelector(`#${prefix}_nb`);
    return parseInt(nbField.value, 10);
}

function getNbChildren(prefix) {
    try {
        return document.querySelectorAll(`#${prefix}_container fieldset`).length;
    } catch (TypeError) {
        return 0;
    } 
}

function updateNbChildren(prefix) {
    setNbChildren(prefix, getNbChildren(prefix))
}

function setNbChildren(prefix, nb) {
    var nbField = document.querySelector(`#${prefix}_nb`);
    nbField.value = nb;
}

function setError(msg) {
    document.querySelector("#errorMessage").innerHTML = msg;
}

function dropdownListener(header) {
    const dropdownContent = header.parentElement.querySelector(".dropdownContent");
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
}

function updateDropdown() {
    // Handle dropdown menus
    var dropdownHeaders = document.getElementsByClassName("dropdownHeader");
    var dropdownContents = document.getElementsByClassName("dropdownContent");

    if (dropdownHeaders.length === dropdownContents.length) {
        for (let i = 0; i < dropdownHeaders.length; i++) {
            dropdownHeaders[i].addEventListener('click', function() {
                dropdownContents[i].style.display = dropdownContents[i].style.display === "block" ? "none" : "block";
            });
        }

    }
}

function closeAllDropdown(){
    console.log("CLOSE");
    var dropdownContents = document.getElementsByClassName("dropdownContent");

    for (let i = 0; i < dropdownContents.length; i++) {
        dropdownContents[i].style.display = "none";
        
    }
}

/*
 * Checks if exactly one of the elements in an array is a key in the doc Object. If so, returns the value
 */
function getIfExactlyOneField(doc, fields) {
    var fieldsarray = getFieldsInObject(doc, fields);
    if (fieldsarray.length == 1) {
        return doc[fieldsarray[0]]
    } else {
        setError(`"Error! Expected exactly one of these properties: ${fields} but got ${fieldsarray.length}."`)
    }
}

/*
 * Checks if at most one of the elements in an array is a key in the doc Object. If one is present, returns the value
 */
function getIfAtMostOneField(doc, fields) {
    var fieldsarray = getFieldsInObject(doc, fields);
    var nfields = fieldsarray.length;
    if (nfields === 1) {
        return doc[fieldsarray[0]]
    } else if (nfields > 1) {
        setError(`"Error! Expected at most one of these properties: ${fields} but got ${fieldsarray.length}."`)
    }
}

function trimSpaces(s) {
    return s.replace(/^\s+|\s+$/g, '');
}

function capitalize(s) {
    if (s.length > 0) {
        return s[0].toUpperCase() + s.slice(1)
    } else {
        return "";
    }
}

// From https://stackoverflow.com/a/43467144
function isUrl(s) {
    try {
        new URL(s);
        return true;
    } catch (e) {
        return false;
    }
}
