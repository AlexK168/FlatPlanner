import { getAuth, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getDatabase, ref, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

const auth = getAuth();
const db = getDatabase();

let projectsList = document.getElementById('projects-list');

function onDelete(uid, projectId) {
    if(!confirm("Are you sure?")) return;
    const projectRef = ref(db, 'projects/' + uid + '/' + projectId);
    remove(projectRef);
    location.reload();
}

onAuthStateChanged(auth, (user) => {
    if (user) {
      const userProjectsRef = ref(db, 'projects/' + user.uid);
      onValue(userProjectsRef, (snapshot) => {
        const data = snapshot.val();
          for (let o in data) {
            let time = data[o].time;
            let name = data[o].name;
            let newRecord = document.createElement('li');
            projectsList.appendChild(newRecord);
            let param = new URLSearchParams();
            param.append("projectId", o);
            let link = './editor.html?' + param.toString();
            newRecord.innerHTML = `<li><div class='info'><a href=${link}>${name}</a><time>${time}</time>` +
            `<div class='btn-group'><button id=${o}>Delete</button></div></div><div class='img'>` +
            "<img src='../res/living-room-plan.png'></div></li>";
            let deleteButton = document.getElementById(o);
            deleteButton.onclick = function() {
              onDelete(user.uid, o);
            };
          }

      });
    } else {
        window.location.replace("login.html");
    }
});

let newProjectButton = document.getElementById("create-project-btn");
newProjectButton.onclick = function(event) {
    window.location.replace("editor.html");
}