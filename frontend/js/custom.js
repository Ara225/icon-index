function displayMenu(event) {
    if (document.getElementById("navbar-list").classList.contains("show")) {
        document.getElementById("navbar-list").classList.remove("show")
    }
    else {
        document.getElementById("navbar-list").classList.add("show")
    }
}
function dropDown(event) {
    event.target.parentElement.children[1].classList.remove("d-none");
    document.getElementById("overlay").classList.remove("d-none");
}
function hide(event) {
    var items = document.getElementsByClassName('menu');
    for (let i = 0; i < items.length; i++) {
        items[i].classList.add("d-none");
    }
    document.getElementById("overlay").classList.add("d-none");
}
function copyToClipboard(event) {
    /* Get the text field */
    var copyText = event.target.parentElement.children[2];

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/

    /* Copy the text inside the text field */
    document.execCommand("copy");
    event.target.innerText = "Copied!";
}

/**
 * Parses a collection of HTML elements into a URL.
 * @param {HTMLCollection} form Collection of objects to parse in to JSON
 */
function formToURL(form) {
    var data = "";
    for (var i = 0; i < form.length; i++) {
        // This allows us to skip fields in the input if we need to
        console.log(form[i])
        if (form[i].id == "" || form[i].tagName == "BUTTON") {
            continue
        }
        else {
            if (form[i].value == "" && form[i].required) {
                alert("Unable to validate form. Please ensure all required fields are completed")
                return false;
            }
            else {
                if (form[i].type == "checkbox") {
                    // Code to handle groups of checkboxes as one
                    if (form[i].name) {
                        let selected = document.querySelectorAll('input[name="' + form[i].name + '"]:checked');
                        if (selected.length == 0) {
                            continue
                        }
                        let values = [];
                        for (let index = 0; index < selected.length; index++) {
                            values.push(selected[index].value);
                        }
                        data += "&" + encodeURIComponent(form[i].name) + "=" + encodeURIComponent(values.toString());
                    }
                    else {
                        data += "&" + encodeURIComponent(form[i].id) + "=" + form[i].checked;
                    }
                }
                else if (form[i].type == "radio") {
                    // Radio buttons are grouped by name and only one can be selected at any time. Requires slightly different approach
                    let selectedRadioButton = document.querySelector('input[name="' + form[i].name + '"]:checked').id;
                    if (!selectedRadioButton && form[i].required) {
                        alert("Unable to validate form. Please ensure all required fields are completed")
                        return false;
                    }
                    data += "&" + encodeURIComponent(form[i].name) + "=" + encodeURIComponent(selectedRadioButton);
                }
                else {
                    data += "&" + encodeURIComponent(form[i].id) + "=" + encodeURIComponent(form[i].value);
                }
            }
        }
    }
    data = data.slice(1, data.length);
    return data;
}

/**
 * Handles form submission
 * @param {Object} event 
 */
async function onFormSubmit(event) {
    try {
        document.getElementById("tiles").innerHTML = '<div class="text-center" style="padding-top:5%"><i class="fas fa-spinner fa-spin fa-3x"></i></div>';
        let url = "https://tmtvan5cd2.execute-api.eu-west-2.amazonaws.com/prod/icons?" + formToURL(event.target).replace("search-bar", "keywords");
        var res = await fetch(url);
        var jsonResult = await res.json();
        if (res.status != 200) {
            alert("The endpoint returned a status code other than 200")
            console.log(jsonResult);
            return false;
        }
        console.log(jsonResult);
        console.log((new Date()).valueOf());
        populateSearchResults(jsonResult)
        return true;
    }
    catch (e) {
        alert("Error occurred")
        console.log(e);
        console.log(jsonResult);
        return false;
    }
}

let iconPacks = [
    {
        "name": "Font Awesome Brands",
        "version": "5.14.0",
        "url": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css",
        "fileURL": "brand.css",
        "prefix": "fa-",
        "class": "fab",
        "features": [{ "name": "Spinning Animation", "class": "fa-spin", "JavaScript": "turnOnFeature('fa-spin')" }],
        "details": { "creatorSite": "", "repo": "", "packageSize": "", "numberOfIcons": 100, "dependencies": [] }
    },
    {
        "name": "Font Awesome Other",
        "version": "5.14.0",
        "url": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css",
        "fileURL": "other.css",
        "prefix": "fa-",
        "class": "fas",
        "features": [{ "name": "Spinning Animation", "class": "fa-spin", "JavaScript": "turnOnFeature('fa-spin')" }],
        "details": { "creatorSite": "", "repo": "", "packageSize": "", "numberOfIcons": 100, "dependencies": [] }
    },
    {
        "name": "Material Design Icons",
        "version": "5.4.55",
        "url": "http://cdn.materialdesignicons.com/5.4.55/css/materialdesignicons.min.css",
        "prefix": "mdi-",
        "class": "mdi",
        "features": [],
        "details": { "creatorSite": "", "repo": "", "packageSize": "", "numberOfIcons": 100, "dependencies": [] }
    }
];
function populateSearchResults(items) {
    document.getElementById("tiles").innerHTML = "";
    document.getElementById("tiles").style.minHeight = "";
    for (let item = 0; item < items.length; item++) {
        const element = items[item];
        let tiles = document.getElementById("tiles");
        tiles.innerHTML += '<button class="btn" style="width: 12em; padding: 0em"  type="button" onclick="openModal(event, \'' +
            element.item.frameworkID + '\', \'' + element.item.className + '\')">' +
            '    <div class="card-body text-center">' +
            '       <h1><i class="' + element.item.className + '"></i></h1>' +
            '       <span class="card-subtitle mb-2 text-muted" style="font-size:small">' +
            element.item.className.split(" ")[1] + " from " + iconPacks[element.item.frameworkID].name +
            '       </span>' +
            '    </div>' +
            '</button>';
    }
}
function openModal(event, frameworkID, className) {
    document.getElementById("icon").className = className;
    document.getElementById("iconTagLine").innerText = className.split(" ")[1] + " from " + iconPacks[frameworkID].name;
    document.getElementById("loadIconPack").value = '<link rel="stylesheet" href="' + iconPacks[frameworkID].url + '">';
    document.getElementById("loadIcon").value = '<i class="' + className + '"></i>';
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("exampleModal").style.display = "block"
    document.getElementById("exampleModal").className += "show"
}
function closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("exampleModal").style.display = "none"
    document.getElementById("exampleModal").className += document.getElementById("exampleModal").className.replace("show", "")
}

window.onclick = function (event) {
    var modal = document.getElementById('exampleModal');
    if (event.target == modal) {
        closeModal()
    }
}