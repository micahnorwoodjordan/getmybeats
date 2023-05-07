// EXAMPLE IMPORTS FOR WEBPACK BUNDLING
// import <./local_file.js>
// import <./local_file.css>

import TestImage from '../static/images/megatron.jpeg';

window.addEventListener('load', () => {
    const myImg = new Image();
    myImg.src = TestImage;
    myImg.style.width = "200px";
    myImg.style.height = "200px";
    document.body.appendChild(myImg);
})