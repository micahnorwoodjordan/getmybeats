let buttonElements = document.getElementsByClassName('btn');

function playAudio(buttonElement) {
    let targetAudioElement = buttonElement.getElementsByTagName("audio")[0];

    for (let i = 0; i < buttonElements.length; i++) {
        let audioElement = buttonElements[i].getElementsByTagName("audio")[0];
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