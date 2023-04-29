const nonAudioButtonElementIds = ["dropdownMenuButton"];  // dont forget to update array after each new button
const allButtonElements = document.getElementsByClassName('btn');
const audioButtonElements = [];

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


function updateTextWithSelected(selectedDropdownItem) {
    document.getElementById("dropdownMenuButton").innerHTML = selectedDropdownItem.innerHTML;
}