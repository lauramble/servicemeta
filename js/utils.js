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

function getNbActors(prefix) {
    var nbField = document.querySelector(`#${prefix}_nb`);
    return parseInt(nbField.value, 10);
}

function setNbActors(prefix, nb) {
    var nbField = document.querySelector(`#${prefix}_nb`);
    nbField.value = nb;
}

function setError(msg) {
    document.querySelector("#errorMessage").innerHTML = msg;
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

// From https://stackoverflow.com/a/43467144
function isUrl(s) {
    try {
        new URL(s);
        return true;
    } catch (e) {
        return false;
    }
}
