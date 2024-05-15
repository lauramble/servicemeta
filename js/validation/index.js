/**
 * Copyright (C) 2020  The Software Heritage developers
 * See the AUTHORS file at the top-level directory of this distribution
 * License: GNU Affero General Public License version 3, or any later version
 * See top-level LICENSE file for more information
 */

/*
 * Reads a Servicemeta file and shows human-friendly errors on it.
 *
 * This validator intentionaly does not use a schema, in order to show errors
 * that are easy to understand for users with no understanding of JSON-LD.
 */


function validateDocument(doc) {
    if (!Array.isArray(doc) && typeof doc != 'object') {
        setError("Document must be an object (starting and ending with { and }), not ${typeof doc}.")
        return false;
    }
    // TODO: validate id/@id

    var type = getDocumentType(doc);
    if (type === undefined) {
        setError("Missing type (must be WebAPI or WebApplication).")
        return false;
    }
    else if (!isCompactTypeEqual(type, "WebAPI") && !isCompactTypeEqual(type, "WebApplication")) {
        // Check this before other fields, as a wrong type error is more
        // understandable than "invalid field".
        setError(`Wrong document type: must be "WebAPI"/"WebApplication", not ${JSON.stringify(type)}`)
        return false;
    }
    else {
        return Object.entries(doc).every((entry) => {
            var fieldName = entry[0];
            var subdoc = entry[1];
            if (fieldName == "@context") {
                // Was checked before
                return true;
            }
            else if (fieldName == "type" || fieldName == "@type") {
                // Was checked before
                return true;
            }
            else if (isFieldFromOtherVersionToIgnore(fieldName)) {
                // Do not check fields from other versions FIXME
                return true;
            }
            else {
                var validator = webApplicationFieldValidators[fieldName];
                if (validator === undefined) {
                    // TODO: find if it's a field that belongs to another type,
                    // and suggest that to the user
                    setError(`Unknown field "${fieldName}".`)
                    return false;
                }
                else {
                    return validator(fieldName, subdoc);
                }
            }
        });
    }
}


async function parseAndValidateServicemeta(showPopup) {
    var servicemetaText = document.querySelector('#servicemetaText').innerText;
    let parsed, doc;

    try {
        parsed = JSON.parse(servicemetaText);
    }
    catch (e) {
        setError(`Could not read servicemeta document because it is not valid JSON (${e}). Check for missing or extra quote, colon, or bracket characters.`);
        return;
    }

    setError("");

    var isValid = validateDocument(parsed);
    if (showPopup) {
        if (isValid) {
            alert('Document is valid!')
        }
        else {
            alert('Document is invalid.');
        }
    }

    doc = await jsonld.compact(parsed, SERVICEMETA_CONTEXTS["0.1"].url); 
}
