const statusAll = "All";
const nonAudioButtonElementIds = ["dropdownMenuButton"];  // bad design; DONT forget to update array after each new button
const allButtonElements = document.getElementsByClassName('btn');
const audioButtonElements = [];


// construct to protect me from myself. naming scheme based on `title_to_js` custom template tag
const Statuses = Object.freeze({
    Concept: "1",
    InProgress: "2",
    NeedsFineTuning: "3",
    Finished: "4",
})

// initialize page by isolating all button elements with an inner Audio element
window.onload = function() {
    for (let i = 0; i < allButtonElements.length; i++) {
        let currentButton = allButtonElements[i];
        if (!nonAudioButtonElementIds.includes(currentButton.id)) {
            audioButtonElements.push(currentButton);
        }
    }
}

function playAudio(buttonElement) {
    let targetAudioElement = buttonElement.getElementsByTagName("audio")[0];

    for (let i = 0; i < audioButtonElements.length; i++) {
        let audioElement = audioButtonElements[i].getElementsByTagName("audio")[0];
        if (audioElement !== targetAudioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
    }

    if (targetAudioElement.paused) {
        targetAudioElement.play();
    } else {
        targetAudioElement.pause();
    }
}


function filterSongsByStatus(selectedDropdownItem, statusString) {
    // https://stackoverflow.com/questions/63628163/trying-to-get-the-bootstrap-dropdown-button-text-to-change-to-the-item-selected
    document.getElementById("dropdownMenuButton").innerHTML = selectedDropdownItem.innerHTML;
    const audioListElements = document.getElementsByName("audioListItem");
    if (statusString === statusAll) {
        for (let i = 0; i < audioListElements.length; i++) {
            audioListElements[i].style.visibility = "visible";
        }
    } else {
        for (let i = 0; i < audioListElements.length; i++) {
            let currentAudioListElement = audioListElements[i];
            if (currentAudioListElement.className === Statuses[statusString]) {
                currentAudioListElement.style.visibility = "visible";
            } else {
                currentAudioListElement.style.visibility = "hidden";
            }
        }
    }
}