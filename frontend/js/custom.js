var currentSearchURL = "";
var currentSearchPage = 0;
var currentDisplayedIcon;
var iconPacks;

/**
 * Displays the custom drop down menu on the index page
 * @param {Event} event 
 */
function dropDown(event) {
    event.target.parentElement.children[1].classList.remove("d-none");
    document.getElementById("overlay").classList.remove("d-none");
}

/**
 * Hides the custom drop down menu menu
 * @param {Event} event 
 */
function hide(event) {
    var items = document.getElementsByClassName('menu');
    for (let i = 0; i < items.length; i++) {
        items[i].classList.add("d-none");
    }
    document.getElementById("overlay").classList.add("d-none");
}

/**
 * Used in icon modal to copy text
 * @param {Event} event 
 */
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
 * @param {HTMLCollection} form Collection of objects to parse
 */
function formToURL(form) {
    var data = "";
    for (var i = 0; i < form.length; i++) {
        // This allows us to skip fields in the input if we need to as well as skipping buttons
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
                        // Single checkboxes
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
    // Remove extra &
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
        currentSearchURL = queryString;
        currentSearchPage = 0;
        // Display loading spinner
        document.getElementById("tiles").innerHTML = '<div class="text-center" style="padding-top:5%"><i class="fas fa-spinner fa-spin fa-3x"></i></div>';
        document.getElementById("pagination").innerHTML = "";
        let url = "https://tmtvan5cd2.execute-api.eu-west-2.amazonaws.com/prod/icons?" + queryString;
        var res = await fetch(url);
        var jsonResult = await res.json();
        // Error handling
        if (res.status == 500 && jsonResult.error === "No search filters supplied") {
            document.getElementById("tiles").innerHTML = "";
            alert("Please either select a framework or enter search terms");
            return false;
        }
        else if (res.status != 200) {
            document.getElementById("tiles").innerHTML = '<h2 class="text-center">Error occurred</h2>';
            document.getElementById("tiles").innerHTML += '<p class="text-center">' + res + '</p>';
            document.getElementById("tiles").innerHTML += '<p class="text-center">' + jsonResult + '</p>';
        }
        // Put the search results into the page
        populateSearchResults(JSON.parse(jsonResult.items), jsonResult.totalResults);
        // Load in the required iconpacks/frameworks
        var frameworkURLs = JSON.parse(jsonResult.frameworkURLs);
        for (let index = 0; index < frameworkURLs.length; index++) {
            if (!document.head.innerHTML.includes(frameworkURLs[index])) {
                document.head.innerHTML += '<link rel="stylesheet" href="' + frameworkURLs[index] + '">';
            }
        }
        // Doing UI and maths for pagination
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
        document.getElementById("tiles").innerHTML = '<h2 class="text-center">Exception occurred</h2>';
        document.getElementById("tiles").innerHTML += '<p class="text-center">' + e.toString() + '</p>';
        console.log(e);
        console.log(jsonResult);
        return false;
    }
}

/**
 * Place the search results on to the page. 
 * @param {Array} items 
 */
async function populateSearchResults(items, totalResults) {
    document.getElementById("tiles").innerHTML = "";
    document.getElementById("searchHeader").innerHTML = '<h2 class="text-center" style="margin: 5% 0% 3%">Displaying ' + items.length + 
                                                        ' of ' + totalResults + ' Results<hr style="width: 100px;border-width: 3px;"></h2>';
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

/**
 * Open a modal populated with the information about the icon
 * @param {Event} event 
 * @param {Number} iconID The ID of the icon (number of element on page)
 */
function openModal(event, iconID) {
    // If we're trying to view icons that don't exist
    if (iconID < 0 || iconID > document.getElementById("tiles").childElementCount) {
        return;
    }
    let frameworkID = document.getElementById(iconID).dataset.frameworkid;
    let className = document.getElementById(iconID).dataset.classname;
    // populate icon details 
    document.getElementById("icon").className = className;
    document.getElementById("iconTagLine").innerText = className.split(" ")[1] + " from " + iconPacks[frameworkID].name;
    document.getElementById("loadIconPack").value = '<link rel="stylesheet" href="' + iconPacks[frameworkID].url + '">';
    document.getElementById("loadIcon").value = '<i class="' + className + '"></i>';
    if (iconPacks[frameworkID].displayOpts) {
        let options = "";
        for (let displayOpt = 0; displayOpt < iconPacks[frameworkID].displayOpts.length; displayOpt++) {
            options += '<option value="' + iconPacks[frameworkID].displayOpts[displayOpt].class + '">' + iconPacks[frameworkID].displayOpts[displayOpt].name + '</option>';
        }
        document.getElementById("iconBehavior").innerHTML = "<label>Display</label><br><select onchange='toggleFeature(event);'  class='form-control'>" +
                                                            "<option value=''>-- Select --</option>" + options + "</select>";
    }
    document.getElementById("iconLooks").innerHTML = "<label>Color</label>"
    for (let look = 0; look < iconPacks[frameworkID].looks.length; look++) {
        console.log(iconPacks[frameworkID].looks[look])
        document.getElementById("iconLooks").innerHTML += '<input type="' + iconPacks[frameworkID].looks[look].elementType + '" class="form-control" onchange="' +
        iconPacks[frameworkID].looks[look].JavaScript + '">';
    }
    // Icon pack details
    document.getElementById("iconPack").innerHTML = '<table class="table">' +
                                                    '    <thead>' +
                                                    '      <tr>' +
                                                    '        <th scope="col">Pack Version</th>' +
                                                    '        <th scope="col">Icons in Pack</th>' +
                                                    '      </tr>' +
                                                    '    </thead>' +
                                                    '    <tbody>' +
                                                    '      <tr>' +
                                                    '        <td>'+ iconPacks[frameworkID].version +'</td>' +
                                                    '        <td>' + iconPacks[frameworkID].details.numberOfIcons + '</td>' +
                                                    '      </tr>' +
                                                    '    </tbody>' +
                                                    ' </table>' +
                                                    ' <div class="row">' +
                                                    '      <div class="col-6">' +
                                                    (iconPacks[frameworkID].details.repo ? '<a href="' + iconPacks[frameworkID].details.repo + '">Repo</a>' : "") +
                                                    '      </div>' +
                                                    '      <div class="col-6">' +
                                                    '        <a href="' + iconPacks[frameworkID].details.creatorSite + '">Creator Site</a>' +
                                                    '    </div>' +
                                                    '</div><hr>';
    currentDisplayedIcon = iconID;
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("exampleModal").style.display = "block"
    document.getElementById("exampleModal").className += "show"
}

/**
 * Hide the modal
 */
function closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("exampleModal").style.display = "none"
    document.getElementById("exampleModal").className += document.getElementById("exampleModal").className.replace("show", "")
}

/**
 * Used to handle pagination. 
 * @param {Event} event 
 */
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
    // Error handling
    if (res.status == 500 && jsonResult.error === "No search filters supplied") {
        document.getElementById("tiles").innerHTML = "";
        alert("Please either select a framework or enter search terms");
        return false;
    }
    else if (res.status != 200) {
        document.getElementById("tiles").innerHTML = '<h2 class="text-center">Error occurred</h2>';
        document.getElementById("tiles").innerHTML += '<p class="text-center">' + res + '</p>';
        document.getElementById("tiles").innerHTML += '<p class="text-center">' + jsonResult + '</p>';
    }
    populateSearchResults(JSON.parse(jsonResult.items), jsonResult.totalResults);
    var frameworkURLs = JSON.parse(jsonResult.frameworkURLs);
    for (let index = 0; index < frameworkURLs.length; index++) {
        if (!document.head.innerHTML.includes(frameworkURLs[index])) {
            document.head.innerHTML += '<link rel="stylesheet" href="' + frameworkURLs[index] + '">';
        }
    }
}

// Close modal on click outside it
window.onclick = function (event) {
    var modal = document.getElementById('exampleModal');
    if (event.target == modal) {
        closeModal()
    }
}

/**
 * Adds/removes a class name to both the icon and the icon code (in the modal)
 * @param {Event} event 
 */
function toggleFeature(event) {
    let className = event.target[event.target.selectedIndex].value;
    let initialClass = document.getElementById('icon').className;
    document.getElementById('icon').className = initialClass.split(" ").slice(0,2).join(" ") + " " + className;
    document.getElementById('loadIcon').value = document.getElementById('loadIcon').value.replace(initialClass, document.getElementById('icon').className)
}

/**
 * Restores class name to original
 * @param {Event} event 
 */
function clearFeatures() {
    let initialClass = document.getElementById('icon').className;
    document.getElementById('icon').className = initialClass.split(" ").slice(0,2).join(" ");
    document.getElementById('loadIcon').value = document.getElementById('loadIcon').value.replace(initialClass, document.getElementById('icon').className)
}

 /**
  * Change the color of the icon (in the modal)
  * @param {Event} event 
  */
function changeIconColor(event) {
    document.getElementById('icon').style.color = event.target.value
    document.getElementById('loadIcon').value = '<i class="' + document.getElementById("icon").className + '" style="color:' + event.target.value + ';"></i>'
}

/**
 * For iconpacks.html, inserts the list of icon packs into the page.
 * @param {Event} event 
 */
async function insertIconPacks(event) {
    let iconPackList = document.getElementById("iconPackList");
    if (!iconPacks) {
        let res = await fetch("iconPacks.json");
        iconPacks = await res.json();
    }
    for (let index = 0; index < iconPacks.length; index++) {
        const element = iconPacks[index];
        iconPackList.innerHTML += '<div class="card shadow col-3" style="margin: 15px; padding:0px">' +
        '<a href="' + element.details.creatorSite + '" class="card-header">' +
        '<h5>' + element.name + '</h5></a>' +
        '<ul class="list-group list-group-flush">' +
            '<li class="list-group-item">' +
                'Version: ' + element.version +
            '</li>' +
            '<li class="list-group-item">'+
                'Icons: ' + element.details.numberOfIcons +
            '</li>'+
            '<li class="list-group-item">'+
                '<a href="' + element.details.repo + '">Repo</a>' +
            '</li>' +
        '</ul></div>';
        
    }
}