var currentSearchURL = "";
var currentSearchPage = 0;
var currentDisplayedIcon;
var iconPacks;
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
        if (!iconPacks) {
            let res = await fetch("iconPacks.json");
            iconPacks = await res.json();
        }
        let queryString = formToURL(event.target);
        if (!queryString) {
            return;
        }
        queryString = queryString.replace("search-bar", "keywords");
        currentSearchURL = queryString;
        currentSearchPage = 0;
        document.getElementById("tiles").innerHTML = '<div class="text-center" style="padding-top:5%"><i class="fas fa-spinner fa-spin fa-3x"></i></div>';
        document.getElementById("pagination").innerHTML = "";
        let url = "https://tmtvan5cd2.execute-api.eu-west-2.amazonaws.com/prod/icons?" + queryString;
        var res = await fetch(url);
        var jsonResult = await res.json();
        if (res.status != 200) {
            alert("The endpoint returned a status code other than 200");
            console.log(jsonResult);
            return false;
        }
        console.log(jsonResult);
        console.log((new Date()).valueOf());
        populateSearchResults(JSON.parse(jsonResult.items));
        var frameworkURLs = JSON.parse(jsonResult.frameworkURLs);
        for (let index = 0; index < frameworkURLs.length; index++) {
            if (!document.head.innerHTML.includes(frameworkURLs[index])) {
                document.head.innerHTML += '<link rel="stylesheet" href="' + frameworkURLs[index] + '">';
            }
        }
        if (jsonResult.remainingResults) {
            var pages = (jsonResult.remainingResults / 100);
            if (jsonResult.remainingResults % 100) {
                pages += 1;
            }
            let pagination = document.getElementById("pagination");
            pagination.innerHTML += '<nav aria-label="..."><ul class="pagination" id="pagination-bar">' +
                                    '<li class="page-item active" onclick="handleNav(event)"><a class="page-link" href="#">1</a></li>'+
                                    '</ul></nav>';
            pagination = document.getElementById("pagination-bar");
            for (let index = 2; index < pages+1; index++) {
                pagination.innerHTML += '<li class="page-item"  onclick="handleNav(event)"><a class="page-link" href="#">' + index.toString() + '</a></li>';
            }
        }
        return true;
    }
    catch (e) {
        alert("Error occurred")
        console.log(e);
        console.log(jsonResult);
        return false;
    }
}

async function populateSearchResults(items) {
    document.getElementById("tiles").innerHTML = "";
    for (let item = 0; item < items.length; item++) {
        const element = items[item];
        let tiles = document.getElementById("tiles");
        
        tiles.innerHTML += '<button data-frameworkID="' + element.item.frameworkID +'" data-className="' + element.item.className +
            '" class="btn" style="width: 12em; padding: 0em"  type="button" id="' + item + '" onclick="openModal(event, \'' +
             item + '\')">' +
            '    <div class="card-body text-center">' +
            '       <h1><i class="' + element.item.className + '"></i></h1>' +
            '       <span class="card-subtitle mb-2 text-muted" style="font-size:small">' +
            element.item.className.split(" ")[1] + " from " + iconPacks[element.item.frameworkID].name +
            '       </span>' +
            '    </div>' +
            '</button>';
    }
}
function openModal(event, iconID) {
    if (iconID < 0 || iconID > document.getElementById("tiles").childElementCount) {
        return;
    }
    let frameworkID = document.getElementById(iconID).dataset.frameworkid;
    let className = document.getElementById(iconID).dataset.classname;
    document.getElementById("icon").className = className;
    document.getElementById("iconTagLine").innerText = className.split(" ")[1] + " from " + iconPacks[frameworkID].name;
    document.getElementById("loadIconPack").value = '<link rel="stylesheet" href="' + iconPacks[frameworkID].url + '">';
    document.getElementById("loadIcon").value = '<i class="' + className + '"></i>';
    document.getElementById("iconBehavior").innerHTML = "<label>Animations</label>"
    for (let animation = 0; animation < iconPacks[frameworkID].animations.length; animation++) {
        console.log(iconPacks[frameworkID].animations[animation])
        document.getElementById("iconBehavior").innerHTML += '<button type="button" class="btn btn-outline-info d-block w-100" onclick="' +
        iconPacks[frameworkID].animations[animation].JavaScript + '">' + iconPacks[frameworkID].animations[animation].name +
        '</button>';
    }
    document.getElementById("iconLooks").innerHTML = "<label>Looks</label>"
    for (let look = 0; look < iconPacks[frameworkID].looks.length; look++) {
        console.log(iconPacks[frameworkID].looks[look])
        document.getElementById("iconLooks").innerHTML += '<input type="' + iconPacks[frameworkID].looks[look].elementType + '" class="form-control" onchange="' +
        iconPacks[frameworkID].looks[look].JavaScript + '">';
    }
    currentDisplayedIcon = iconID;
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("exampleModal").style.display = "block"
    document.getElementById("exampleModal").className += "show"
}
function closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("exampleModal").style.display = "none"
    document.getElementById("exampleModal").className += document.getElementById("exampleModal").className.replace("show", "")
}

async function handleNav(event) {
    let paginationButtons = document.getElementById("pagination-bar").children;
    paginationButtons[currentSearchPage].classList.remove("active");
    if (event.target.classList.contains("disabled") || event.target.classList.contains("active")) {
        return;
    }
    currentSearchPage = Number(event.target.innerText)-1;
    paginationButtons[currentSearchPage].classList.add("active");
    document.getElementById("tiles").innerHTML = '<div class="text-center" style="padding-top:5%"><i class="fas fa-spinner fa-spin fa-3x"></i></div>';
    let url = "https://tmtvan5cd2.execute-api.eu-west-2.amazonaws.com/prod/icons?" + currentSearchURL + "&startNum=" + (currentSearchPage * 100).toString();
    var res = await fetch(url);
    var jsonResult = await res.json();
    if (res.status != 200) {
        alert("The endpoint returned a status code other than 200");
        console.log(jsonResult);
        return false;
    }
    console.log(jsonResult);
    console.log((new Date()).valueOf());
    populateSearchResults(JSON.parse(jsonResult.items));
    var frameworkURLs = JSON.parse(jsonResult.frameworkURLs);
    for (let index = 0; index < frameworkURLs.length; index++) {
        if (!document.head.innerHTML.includes(frameworkURLs[index])) {
            document.head.innerHTML += '<link rel="stylesheet" href="' + frameworkURLs[index] + '">';
        }
    }
}

window.onclick = function (event) {
    var modal = document.getElementById('exampleModal');
    if (event.target == modal) {
        closeModal()
    }
}

document.onload = function (event) {
    if (document.getElementById("search-form")) {
        document.getElementById("search-form").reset()
    }
}
function toggleFeature(event, className) {
    let initialClass = document.getElementById('icon').className;
    if (!document.getElementById('icon').classList.contains(className)) {
        document.getElementById('icon').classList.add(className)
    }
    else {
        document.getElementById('icon').classList.remove(className)
    }
    document.getElementById('loadIcon').value = document.getElementById('loadIcon').value.replace(initialClass, document.getElementById('icon').className)
}
function changeIconColor(event) {
    document.getElementById('icon').style.color = event.target.value
    document.getElementById('loadIcon').value = '<i class="' + document.getElementById("icon").className + '" style="color:' + event.target.value + ';"></i>'
}