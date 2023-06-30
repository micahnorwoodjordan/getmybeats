import React from "react";
import path from "path";
import { Carousel } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";

import AudioButton from "./components/AudioButton";
import megatron from "./public/static/megatron.jpeg"


const App = () => {
    const audioObjects = Array.from(document.getElementsByTagName("audio"));
    window.globalAudioObjects = audioObjects;

    return (
      <div className="App">
            <Carousel interval={ null } className="carousel">
                {audioObjects.map((audioElement, idx) => (
                    <Carousel.Item key={ idx }>
                        <img
                            className="d-block w-100"
                            alt={ idx.toString() }
                            src={ megatron }
                        />
                        <Carousel.Caption>
                            <h3
                                style={{ fontFamily: "Monospace", font: "consolas", fontWeight: "bold" }}
                            > { path.basename(audioElement.src.replace(".wav", "").replace(".mp3", "")) }
                            </h3>
                            <AudioButton
                                srcAudioElement={ audioElement }
                            > click
                            </AudioButton>
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>
      </div>
    );
}

export default App;
