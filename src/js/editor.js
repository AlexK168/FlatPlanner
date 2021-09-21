import { getDatabase, ref, set, push, onValue } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';
import { getAuth, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

const auth = getAuth();
const db = getDatabase();

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let param = new URLSearchParams(window.location.search);
let projectId = param.get("projectId");
let uid;

onAuthStateChanged(auth, (user) => {
    if(user) uid = user.uid;
    canvas.loadFromDb();
});

let idCounter = 0;
const imageMap = {
    // furniture:
    "bed": "url('../res/bed.png')",
    "table": "url('../res/table.png')",
    "chair": "url('../res/chair.png')",
    "fridge": "url('../res/fridge.png')",
    "dishwasher": "url('../res/dishwasher.png')",
    "couch": "url('../res/couch.png')",
    "cupboard": "url('../res/cupboard.png')",
    "wardrobe": "url('../res/wardrobe.png')",
    "tv": "url('../res/TV.png')",
    "oven": "url('../res/oven.png')",

    // walls:
    "wall-hor": "url('../res/wall-hor.png')",
    "wall-ver": "url('../res/wall-ver.png')"
}

const sizesMap = {
    // furniture:
    "bed":{
        "width":"96px",
        "height":"120px"
     },
    "chair":{
        "width":"35px",
        "height":"24px"
     },
    "fridge":{
        "width":"43px",
        "height":"36px"
     },
    "dishwasher":{
        "width":"48px",
        "height":"36px"
     },
    "table":{
        "width":"75px",
        "height":"42px"
     },
     "couch":{
        "width":"97px",
        "height":"54px"
     },
     "cupboard":{
        "width":"43px",
        "height":"36px"
     },
     "wardrobe":{
        "width":"54px",
        "height":"35px"
     },
     "tv":{
        "width":"80px",
        "height":"13px"
     },
     "oven":{
        "width":"37px",
        "height":"36px"
     },
     // walls:
     "wall-hor":{
        "width":"60px",
        "height":"5px"
     },
     "wall-ver":{
        "width":"5px",
        "height":"60px"
     },
}

async function f() {

}

class Canvas {
    constructor() {
        this.element = document.getElementById('canvas');
        this.objectCollection = [];     
    }
    
    placeObject(canvasObject) {
        if(canvasObject.isOutsideCanvas() || canvasObject.isOverlappingWalls()) return;
        this.element.appendChild(canvasObject.element);
        this.objectCollection[canvasObject.element.id] = canvasObject;
    }

    getDataSnapshot() {
        let today = new Date();
        let time = today.getHours() + ":" + today.getMinutes() + ' - ' + today.getDate() + ', ' + monthNames[today.getMonth()] + ', ' + today.getFullYear();
        let name;
        while(!(name = prompt("Enter the room's name:"))){}
        let objArr = [];
        for (let o of this.objectCollection) {
            objArr.push({
                id: o.id,
                x: o.element.style.left,
                y: o.element.style.top
            });
        }
        let result = {
            width: this.element.offsetWidth - 10 + 'px',
            height: this.element.offsetHeight - 10 + 'px',
            time: time,
            name: name,
            objects: objArr
        };
        return result;
    }

    loadFromDb() {
        setSaveEventListener();
        if (!projectId) return;
        
        setSaveEventListener();
        const projectRef = ref(db, 'projects/' + uid + '/' + projectId);
        onValue(projectRef, (snapshot) => {
            const data = snapshot.val();
            this.setHeight(data.height);
            this.setWidth(data.width);
            let objects = data.objects;
            if (!objects) return;
            for (let o of objects) {
                let newObj = o.id.includes("wall") ? new Wall(o.id, o.x, o.y) : new Furniture(o.id, o.x, o.y);
                this.placeObject(newObj);
            }
        });  
    }

    setWidth(newWidth) {this.element.style.width = newWidth;}
    setHeight(newHeight) {this.element.style.height = newHeight;}
}

class Icon {
    constructor(element) {
        this.element = element;
        this.element.style.position = "fixed";
    }

    moveTo(newX, newY) {
        if (newY > document.documentElement.clientHeight || newY < 0) {
            return false;
        }

        if(newX < 0 || newX > document.documentElement.clientWidth - this.element.offsetWidth) {
            return true;
        }
        this.element.style.left = newX + 'px';
        this.element.style.top = newY + 'px';
        return false;
    }
}

class CanvasObject {
    constructor(id, x, y) {
        this.id = id;
        this.canvas = canvas;
        this.element = document.createElement("div");
        this.element.id = idCounter++;
        this.element.style.width = sizesMap[id].width;
        this.element.style.height = sizesMap[id].height;
        this.element.style.position = "absolute";
        this.element.style.left = x;
        this.element.style.top = y;
        this.element.style.cursor = "pointer";
    }

    isOutsideCanvas() {
        let canvasRect = this.canvas.element.getBoundingClientRect();
        let left = +this.element.style.left.replace(/px$/, '');
        let top = +this.element.style.top.replace(/px$/, '');
        let right = left + +this.element.style.width.replace(/px$/, '');
        let bottom = top + +this.element.style.height.replace(/px$/, '');

        if (left < 0 ||
            right > canvasRect.width - 10 ||
            bottom > canvasRect.height - 10 ||
            top < 0) return true;
        return false;  
    }

    isOverLappingObject(obj) {
        let wallRect = obj.getBoundingClientRect();
        let canvasRect = canvas.element.getBoundingClientRect();

        let left = +this.element.style.left.replace(/px$/, '');
        let top = +this.element.style.top.replace(/px$/, '');
        let right = left + +this.element.style.width.replace(/px$/, '');
        let bottom = top + +this.element.style.height.replace(/px$/, '');

        let overlap = !(wallRect.right - canvasRect.left - 5 < left || 
            wallRect.left - canvasRect.left - 5> right || 
            wallRect.bottom - canvasRect.top - 5< top || 
            wallRect.top - canvasRect.top - 5> bottom)

        return overlap; 
    }

    isOverlappingWalls() {
        let canvas = this.canvas.element;
        let children = canvas.childNodes;
        let walls = [];
        for (let wall of children) {
            if(wall.id == this.element.id || wall.className != "wall") continue;
            walls.push(wall);
        }
        if (walls.length == 0) return false;

        for (let wall of walls) {
            if (this.isOverLappingObject(wall)) return true;
        }

        return false;   
    }

    moveTo(x, y) {
        let tempX = this.element.style.left;
        let tempY = this.element.style.top;
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        if (this.isOutsideCanvas() || this.isOverlappingWalls()) {
            this.element.style.left = tempX;
            this.element.style.top = tempY;
            return false;
        }

        return true;
    }    

    remove() {
        this.element.remove();
    }
}

class Wall extends CanvasObject {
    constructor(id, x, y) {
        super(id, x, y);
        this.element.className = "wall";
        this.element.style.backgroundColor = "black";
    }
}

class Furniture extends CanvasObject {
    constructor(id, x, y) {
        super(id, x, y);
        this.element.style.backgroundSize = "cover";
        this.element.className = "furniture";
        this.element.style.backgroundImage = imageMap[id];
    }
}

let canvas = new Canvas();

let toolBar = document.getElementsByClassName('toolbar')[0];
//--- editing dimensions functionality---//
let lengthInput = document.getElementById('length-input')
let widthInput = document.getElementById('width-input')

function onDimensionInputChange(event) {
    let inputElement = event.target;
    let inputNum = Number.parseFloat(inputElement.value || "0");
    inputElement.value = inputNum < 1 ? 1 : (inputNum > 10 ? 10 : inputNum);
    let scaledValue = 60 * inputElement.value;
    if (inputElement.id.includes("width")) {
        canvas.setWidth(scaledValue + 'px');
        } else {
        canvas.setHeight(scaledValue + 'px');
    }
}
  
function unfocusIfCanvasHasChild(event) {
    if (canvas.element.hasChildNodes()) event.target.blur();
}
  
lengthInput.addEventListener('change', onDimensionInputChange);
widthInput.addEventListener('change', onDimensionInputChange);
lengthInput.addEventListener('focus', unfocusIfCanvasHasChild);
widthInput.addEventListener('focus', unfocusIfCanvasHasChild);
//--^ editing dimensions functionality ^--//

//--- drag and drop functionality ---//
let isDragging = false;
document.addEventListener('mousedown', function(event) {
    let icon = event.target.closest('.draggable');
    let furniture = event.target.closest('.furniture');
    let wall = event.target.closest('.wall');

    let dragElement = icon || furniture || wall;
    if (!dragElement) return;

    let dragObject;

    if (icon) {
        let clone = dragElement.cloneNode(true);
        dragElement.after(clone);
        dragObject = new Icon(icon);
    } else {
        dragObject = canvas.objectCollection[dragElement.id];
    }

    event.preventDefault();
    dragElement.ondragstart = function() {
        return false;
    };
    let shiftX, shiftY;

    startDrag(dragElement, event.clientX, event.clientY);

    function onMouseUp(event) {
        if (icon) {
            finishIconDrag(dragElement);
        } else {
            finishFurnDrag();
        }
    };
    
    function onMouseMove(event) {
        if (icon) {
            moveIconAt(event.clientX, event.clientY);
        } else {
            moveFurnAt(event.clientX, event.clientY);
        }
    }

    function startDrag(element, clientX, clientY) {
        if(isDragging) {
          return;
        }
    
        isDragging = true;
        lengthInput.blur();
        widthInput.blur();

        document.addEventListener('mousemove', onMouseMove);
        element.addEventListener('mouseup', onMouseUp);
    
        shiftX = clientX - element.getBoundingClientRect().left;
        shiftY = clientY - element.getBoundingClientRect().top;

        if (icon) {
            moveIconAt(clientX, clientY);
            shiftY += toolBar.scrollTop;
            shiftX += toolBar.scrollLeft;
        } else {
            shiftX += 5;
            shiftY += 5;
            moveFurnAt(clientX, clientY);
        }
    }

    function finishIconDrag(icon) {
        let iconRect = icon.getBoundingClientRect();

        if(!isDragging) {
            return;
        }
    
        isDragging = false;

        let id = dragElement.id;
        let newX = iconRect.left + icon.offsetWidth / 2 - sizesMap[id].width.replace(/px$/, '') / 2 - 5 - canvas.element.getBoundingClientRect().left + 'px';
        let newY = iconRect.top + icon.offsetHeight / 2 - sizesMap[id].height.replace(/px$/, '') / 2 - 16 - canvas.element.getBoundingClientRect().top + 'px';

        let newCanvasObject = dragElement.id.includes("wall") ? new Wall(id, newX, newY) : new Furniture(id, newX, newY);

        canvas.placeObject(newCanvasObject);
    
        icon.remove();
    
        document.removeEventListener('mousemove', onMouseMove);
        dragElement.removeEventListener('mouseup', onMouseUp);
    }
    
    function finishFurnDrag() {
        if(!isDragging) {
            return;
        }
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        dragElement.removeEventListener('mouseup', onMouseUp);
    }
    
    function moveIconAt(clientX, clientY) {
        let newX = clientX - shiftX;
        let newY = clientY - shiftY;
        if (dragObject.moveTo(newX, newY)) {
            finishIconDrag(icon);
        }
    }
    
    function moveFurnAt(clientX, clientY) {
        let newX = clientX - shiftX - canvas.element.getBoundingClientRect().left; 
        let newY = clientY - shiftY - canvas.element.getBoundingClientRect().top;
        dragObject.moveTo(newX, newY);
    }

});
//--^ drag and drop functionality ^--//

//--- saving functionality ---//

let saveButton = document.getElementById('save-btn');

function setSaveEventListener() {
    saveButton.onclick = function() {
        if (!projectId) {
            const projectsRef = ref(db, 'projects/' + uid);
            const newProjectRef = push(projectsRef);
            set(newProjectRef, canvas.getDataSnapshot());
            alert("Saved");
            return;
        }
        set(ref(db, 'projects/' + uid + '/' + projectId), canvas.getDataSnapshot());
        alert("Saved");
    }
}

//--^ saving functionality ^--//

let homeButton = document.getElementById('home-btn');
homeButton.onclick = function() {
    window.location.replace("./projects.html");
}