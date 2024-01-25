import _ from "lodash";
import "./styles/main.scss";

import * as allImages from "./image_loader";

console.log(_.join(["Hello", "World"]));

// add a event listener to a button
const button = document.createElement("button");
button.innerHTML = "Click Me";
button.onclick = () => {
  const p = document.createElement("p");
  p.innerHTML = "Hello World";
  document.body.appendChild(p);
};

document.body.appendChild(button);