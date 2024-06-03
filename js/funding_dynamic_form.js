const fundingFields = [
    'funder',
    'name',
    'description',
    'identifier'
]

function fundingFieldsetHTML(id) {
    const fundingPrefix = `funding_${id}`; // TODO: remove
    return `
    <legend>Funding #<span name="fundingId">${id}</span></legend>
    <div class="delete funding moveButtons">
        <input type="button" value="x" onclick="deleteFunding(this)"/>
    </div>
    <p>
        <label for="${fundingPrefix}_identifier">Award Number</label>
        <input class="funding" id="${fundingPrefix}_identifier" name="identifier" placeholder="945539"/>
    </p>
    <p>
        <label for="${fundingPrefix}_name">Award name</label>
        <input class="funding" id="${fundingPrefix}_name" name="name" placeholder="Human Brain Project Specific Grant Agreement 3"/>
    </p>
    <p>
        <label for="${fundingPrefix}_description">Acknowledgement</label>
        <input class="funding" id="${fundingPrefix}_description" name="description" placeholder="This project/research has received funding from the European Union’s Horizon 2020 Framework Programme for Research and Innovation under the Specific Grant Agreement No. 945539 (Human Brain Project SGA3)."/>
    </p>
    <div id="${fundingPrefix}_funder">
        <fieldset class="actors" id="${fundingPrefix}_funder_container">
        <legend>Funder</legend>
            
            <div id="${fundingPrefix}_addRemoveFunder">
                <div class="dropdown">
                    <input type="button" class="btn add dropdownHeader" id="${fundingPrefix}_dropdownHeaderFunder" value="+ Add Funder..." onclick="dropdownListener(this)"/>
                    <div class="dropdownContent" id="${fundingPrefix}_actorDropdownFunder">
                    <a class="dropdownOption" onclick="addFunder('${fundingPrefix}_funder', 'person')">Person</a>
                    <a class="dropdownOption" onclick="addFunder('${fundingPrefix}_funder', 'organization')">Organization</a>
                    </div>
                </div>
                <input type="button" id="${fundingPrefix}_removeFunder" value="Remove" class="btn rm"
                    onclick="removeActor('${fundingPrefix}_funder');" />
            </div>
        </fieldset>
    </div>
    `
}

function createFundingFieldset(id) {
    var fieldset = document.createElement("fieldset");

    fieldset.classList.add("funding");
    fieldset.classList.add("leafFieldset");
    fieldset.id = `funding_${id}`;

    fieldset.innerHTML = fundingFieldsetHTML(id);
    fieldset.addEventListener("change", () => saveFundingToLocalStorage());

    return fieldset;
}

function addFundingWithId(container, id) {
    const fieldset = createFundingFieldset(id);

    container.appendChild(fieldset);
}

function addFunding() {
    const id = document.querySelector("#funding_container").querySelectorAll("fieldset.funding").length +1;
    const container = document.querySelector(`#funding_container`);

    addFundingWithId(container, id);

    return container.querySelector(`#funding_${id}`);
}

function deleteFunding(button) {
    const fieldsetContainer = document.querySelector(`#funding_container`);
    const fieldset = button.parentElement.parentElement;
    fieldsetContainer.removeChild(fieldset);
    updateId("funding");
    saveFundingToLocalStorage();
}

function addFunder(prefix, type) {
    addActor(prefix, type, "Funder", false)
}

function saveFundingToLocalStorage() {
    const data = [];
    const container = document.querySelector(`#funding_container`);
    container.querySelectorAll('fieldset.funding').forEach((fieldset) => {
        const inputs = fieldset.querySelectorAll('input.funding');
        const fieldsetData = {};
        inputs.forEach((input) => {
            if (input.name) {
                fieldsetData[input.name] = input.value;
            }
        })
        const funder = saveActorsToLocalStorage(`${fieldset.id}_funder`);
        if (funder && funder.length > 0) {
            fieldsetData["funder"] = funder[0];
        }
        data.push(fieldsetData);
    })

    localStorage.setItem("funding", JSON.stringify(data))
    
}

function loadFundingFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("funding"));
    data.forEach(item => {
        const fieldset = addFunding();
        for (let [name, value] of Object.entries(item)) {
            if (name && name !== "funder") {
                fieldset.querySelector(`input[name=${name}]`).value = value;
            }
        }
        //loadActorsFromLocalStorage(`${fieldset.id}_funder`);
        //document.querySelector("#funding_container").appendChild(fieldset);
    })
}