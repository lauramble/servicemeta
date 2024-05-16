const fundingFields = [
    'funder',
    'name',
    'description',
    'identifier'
]

function fundingFieldsetHTML(fundingPrefix, legend) {return `
    <legend>${legend}</legend>
    <div id="${fundingPrefix}_funder">
        <fieldset class="actors" id="${fundingPrefix}_funder_container">
            <input type="hidden" id="${fundingPrefix}_funder_nb" value="0" />
            <div id="${fundingPrefix}_addRemoveFunder">
                <div class="dropdown">
                    <input type="button" class="btn add dropdownHeader" id="${fundingPrefix}_dropdownHeaderFunder" value="+ Add..." />
                    <div class="dropdownContent" id="${fundingPrefix}_actorDropdownFunder">
                    <a class="dropdownOption" onclick="addActor('${fundingPrefix}_funder', 'Funder', 'person')">Person</a>
                    <a class="dropdownOption" onclick="addActor('${fundingPrefix}_funder', 'Funder', 'organization')">Organization</a>
                    </div>
                </div>
                <input type="button" id="${fundingPrefix}_removeFunder" value="Remove" class="btn rm"
                    onclick="removeActor('${fundingPrefix}_funder');" />
            </div>
        </fieldset>
    </div>
    `
}

function createFundingFieldset(fundingPrefix, legend) {
    var fieldset = document.createElement("fieldset");

    fieldset.classList.add("funding");
    fieldset.classList.add("leafFieldset");
    fieldset.id = fundingPrefix;

    fieldset.innerHTML = fundingFieldsetHTML(fundingPrefix, legend);

    return fieldset;
}

function addFundingWithId(container, prefix, legend, id) {
    var fundingPrefix = `${prefix}_${id}`;
    var fieldset = createFundingFieldset(fundingPrefix, `${legend} #${id}`);

    container.appendChild(fieldset);
}

function addFunding(prefix, legend) {
    var container = document.querySelector(`#${prefix}_container`);
    var fundingId = getNbChildren(prefix) + 1;

    addFundingWithId(container, prefix, legend, fundingId);

    setNbChildren(prefix, fundingId);

    updateDropdown();

    return fundingId;
}

