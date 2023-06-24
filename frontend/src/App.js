import React from "react";

import path from "path";
import {Carousel} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.css';
import AudioButton from "./components/AudioButton";
import TestImage from "./public/static/megatron.jpeg"

const App = () => {    
  const audioObjects = Array.from(document.getElementsByTagName("audio"));

    return (
      <div className="App">
          <div style={{ display: 'block', width: 700, padding: 30, marginLeft: 600, marginTop: 100 }}>
            <h4>Sound Library</h4>
            <Carousel interval={null}>
                {audioObjects.map((audioElement, idx) => (
                    <Carousel.Item key={idx}>
                        <img
                            className="d-block w-100"
                            alt={idx.toString()}
                            src={TestImage}
                        />
                        <Carousel.Caption>
                            <h3>Label for slide {idx}</h3>
                            <AudioButton audioElement={audioObjects[idx]}> click </AudioButton>
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>
          </div>
      </div>
    );
}

export default App;
