let currentCursor = "None";

const none = "None";
const short = "Short";
const medium = "Medium";
const long = "Long";
const connect = "Connect";
const remove = "Remove";

let isClicked = false;
let clickX = 0,
  clickY = 0;

window.onload = () => {
  const board = document.getElementById("board");
  board.addEventListener("mousedown", boardClick);

  const follower = document.querySelector(".cursor-follow");

  let mouseX = 0,
    mouseY = 0;
  let posX = 0,
    posY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    switch (currentCursor) {
      case "None":
        follower.style.display = "None";
        break;
      case "Short":
        follower.style.display = "Block";
        follower.style.width = "45px";
        follower.style.height = "45px";
        break;
      case "Medium":
        follower.style.display = "Block";
        follower.style.width = "60px";
        follower.style.height = "60px";
        break;
      case "Long":
        follower.style.display = "Block";
        follower.style.width = "75px";
        follower.style.height = "75px";
        break;
      case "Remove":
        follower.style.display = "Block";
        follower.style.width = "15px";
        follower.style.height = "15px";
        break;
    }
    posX += (mouseX - posX) * 0.15;
    posY += (mouseY - posY) * 0.15;
    let targetX = posX;
    let targetY = posY;

    if (isClicked) {
      targetX += (clickX - posX) * 0.3;
      targetY += (clickY - posY) * 0.3;

      if (Math.hypot(clickX - posX, clickY - posY) < 5) {
        Place(clickX, clickY, currentCursor);
        currentCursor = none;
        isClicked = false;
      }
    }

    const angle = Math.atan2(mouseY - posY, mouseX - posX) * (180 / Math.PI);
    follower.style.transform = `translate(${posX}px, ${posY}px) translate(-50%, -50%) rotate(${angle}deg)`;
    requestAnimationFrame(animate);
  }

  animate();
};

function boardClick(e) {
  if (currentCursor === remove) {
    const target = e.target;

    if (
      target.classList.contains("board-child-sh") ||
      target.classList.contains("board-child-md") ||
      target.classList.contains("board-child-lo")
    ) {
      deleteElement(target);
    }

    return;
  }

  isClicked = true;
  clickX = e.clientX;
  clickY = e.clientY;
}
function deleteElement(element) {
  elementTexts.delete(element);
  document.querySelector(".temp-textbox")?.remove();
  document.querySelector(".temp-line")?.remove();
  element.remove();

  currentCursor = none;
}

const elementTexts = new WeakMap();

let shCounter = 0;
let mdCounter = 0;
let loCounter = 0;

function Place(clickX, clickY, elementToPlace) {
  if (elementToPlace === none) {
    return;
  }
  const rect = board.getBoundingClientRect();
  const x = clickX - rect.left;
  const y = clickY - rect.top;

  const newDiv = document.createElement("div");

  let addon;
  let counter;

  switch (currentCursor) {
    case short:
      addon = "-sh";
      shCounter++;
      counter = shCounter;
      break;
    case medium:
      addon = "-md";
      mdCounter++;
      counter = mdCounter;
      break;
    case long:
      addon = "-lo";
      loCounter++;
      counter = loCounter;
      break;
  }

  newDiv.classList.add("board-child" + addon);

  newDiv.style.left = `${x}px`;
  newDiv.style.top = `${y}px`;

  newDiv.addEventListener("click", (e) => {
    e.stopPropagation();
    showTextbox(newDiv, x, y);
  });

  newDiv.innerHTML = counter;

  board.appendChild(newDiv);
}
function showTextbox(element, x, y) {
  const existingBox = document.querySelector(".temp-textbox");
  const existingLine = document.querySelector(".temp-line");
  if (existingBox) existingBox.remove();
  if (existingLine) existingLine.remove();

  const input = document.createElement("textarea");
  input.className = "temp-textbox";
  input.style.position = "absolute";
  input.style.left = `${x}px`;
  input.style.top = `${y - 150}px`;
  input.style.transform = "translate(-50%, 0)";
  input.style.zIndex = "1000";
  input.style.width = "200px";
  input.style.height = "80px";
  input.style.resize = "none";
  input.value = elementTexts.get(element) || "";
  board.appendChild(input);
  input.focus();

  const svgLine = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgLine.classList.add("temp-line");
  svgLine.style.position = "absolute";
  svgLine.style.left = "0";
  svgLine.style.top = "0";
  svgLine.style.width = "100%";
  svgLine.style.height = "100%";
  svgLine.style.pointerEvents = "none";
  svgLine.style.zIndex = -1;
  board.appendChild(svgLine);

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("stroke", "#333");
  line.setAttribute("stroke-width", "3");

  const rectElement = element.getBoundingClientRect();
  const rectBoard = board.getBoundingClientRect();
  const startX = rectElement.left + rectElement.width / 2 - rectBoard.left;
  const startY = rectElement.top + rectElement.height / 2 - rectBoard.top;
  const endX = x - rectBoard.left - input.offsetWidth / 2;
  const endY = y - 70 - rectBoard.top + input.offsetHeight;

  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", endX);
  line.setAttribute("y2", endY + 70);

  svgLine.appendChild(line);

  function saveText() {
    elementTexts.set(element, input.value);
    input.remove();
    svgLine.remove();
    document.removeEventListener("click", saveText);
  }

  setTimeout(() => {
    document.addEventListener("click", saveText);
  }, 0);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveText();
  });
}
function shortGoalBtn() {
  currentCursor = short;
}
function mediumGoalBtn() {
  currentCursor = medium;
}
function longGoalBtn() {
  currentCursor = long;
}
function removeBtn() {
  currentCursor = remove;
}
