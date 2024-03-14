
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;

  // Hide all tab content
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Deactivate all tab links
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the specific tab content and mark the button as active
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
  window.calendar.render()

  document.getElementById("welcomeTab").style.display = "none";
  if (tabName == "Tab2") {
    onRecordTab()
  }
}


document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    initialDate: '2024-02-07',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    selectable: true,
    dateClick: function (info) {
      console.log('clicked ' + info.dateStr);
    },
    events: [
      {
        title: 'All Day Event',
        start: '2024-03-14'
      },
      {
        title: 'Meeting',
        start: '2024-03-14T10:30:00',
        end: '2024-03-14T15:30:00'
      },
    ]
  });

  calendar.render();
  window.calendar = calendar
});

const d = new Date();
let time = d.getTime();

document.getElementById('currentDate').innerHTML = d.toDateString();



console.log("hi")

document.getElementById("recordSleep").addEventListener("click", async function () {
  const sleepDate = new Date();
  let timeContainer = document.getElementById("currentSleepTime")
  timeContainer.innerHTML = sleepDate.getHours() + ":" + sleepDate.getMinutes()

  const { doc, setDoc, collection } = window.firestore;
  const db = window.db
  // const userColRef = collection(db, "users")
  // const userDocRef = doc(userColRef, window.userid)
  // const sleepColRef = collection(userDocRef, "sleeps")
  // const sleepDocRef = doc(sleepColRef, )
  // console.log(sleepDocRef)
  await setDoc(
    doc(
      collection(
        doc(
          collection(db, "users"),
          window.userid
        ),
        "sleeps"
      ),
      d.toDateString()
    ), {
    sleep: sleepDate.getHours() + ":" + sleepDate.getMinutes(),
  });
  document.getElementById("currentWakeTime").innerHTML = ""
  console.log("sleep")
})

document.getElementById("recordWake").addEventListener("click", async function () {
  const sleepDate = new Date();
  let timeContainer = document.getElementById("currentWakeTime")
  timeContainer.innerHTML = sleepDate.getHours() + ":" + sleepDate.getMinutes()
  const { doc, setDoc, updateDoc, collection } = window.firestore


  await updateDoc(
    doc(
      collection(
        doc(
          collection(db, "users"),
          window.userid
        ),
        "sleeps"
      ),
      d.toDateString()
    ), {
    wake: sleepDate.getHours() + ":" + sleepDate.getMinutes()
  });

  console.log("wake")
})


async function onRecordTab() {
  const { doc, getDoc, setDoc, updateDoc, collection } = window.firestore
  const db = window.db
  const sleepDocRef = doc(
    collection(
      doc(
        collection(db, "users"),
        window.userid
      ),
      "sleeps"
    ),
    d.toDateString()
  )
  const docSnap = await getDoc(sleepDocRef)
  let data = null
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
    data = docSnap.data();
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
    return
  }
  let sleepContainer = document.getElementById("currentSleepTime")
  sleepContainer.innerHTML = data.sleep
  if(data.wake == undefined){
    return;
  }
  let wakeContainer = document.getElementById("currentWakeTime")
  wakeContainer.innerHTML = data.wake
}