
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
  document.getElementById(tabName).style.display = "inherit";
  if (tabName == "Tab2") {
    document.getElementById(tabName).style.display = "flex";

  }
  evt.currentTarget.className += " active";
  window.calendar.render()

  document.getElementById("welcomeTab").style.display = "none";
  if (tabName == "Tab2") {
    onRecordTab()
  }
}

const reRender = () => {
  setTimeout(async () => {
    const { doc, setDoc, collection, addDoc, updateDoc, getDocs } = window.firestore;
    var sleepCollection = collection(
      doc(
        collection(db, "users"),
        window.userid
      ),
      "sleeps"
    )
    const querySnapshot = await getDocs(sleepCollection);
    const sleeps = []
    const events = []
    querySnapshot.forEach((doc) => {
      sleeps.push(doc.data())
    });

    for (let i = 0; i < sleeps.length; i++) {
      const data = sleeps[i]
      const title = "Sleep";
      const startDate = new Date(data["sleep_timestamp"])
      const endDate = new Date(data["wake_timestamp"])
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      const durationMs = endDate - startDate;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
      const durationString = `${hours} hours ${minutes} minutes ${seconds} seconds`;
      const titleWithDuration = `${title} (${durationString})`;

      const formattedDate = `${startDate.getHours()}:${startDate.getMinutes()} (${startDate.getMonth() + 1}/${startDate.getDate()})`;
      const formattedDateEnd = `${endDate.getHours()}:${endDate.getMinutes()} (${endDate.getMonth() + 1}/${endDate.getDate()})`;

      events.push({
        title: titleWithDuration,
        start: start,
        end: end,
        startDate: formattedDate,
        endDate: formattedDateEnd,
        duration: durationString
      });
    }
    window.calendar.removeAllEvents();
    events.forEach(event => {
      window.calendar.addEvent(event);
    });
    const recordContainer = document.getElementById("sleep-list");
    events.forEach(event => {
      const evtContainer = document.createElement("div");
      evtContainer.innerHTML = `
      <div>
        <span>Start: <span><span>${event.startDate}</span>
        </div>
        <div>
        <span>End: <span><span>${event.endDate}</span>
        </div>
        <div>
        <span>Duration: <span><span>${event.duration}</span>
        </div>
      `
      evtContainer.classList.add("sleep_record");
      recordContainer.appendChild(evtContainer);
    });
    window.calendar.render();
  }, 1000)
}


document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');



  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridDay',
    initialDate: Date.now(),
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    selectable: true,
    dateClick: function (info) {
      calendar.changeView('timeGridDay', info.dateStr);
    },
    events: [
    ]
  });

  calendar.render();
  window.calendar = calendar

  setTimeout(async () => {
    const { doc, setDoc, collection, addDoc, updateDoc, getDocs } = window.firestore;
    var sleepCollection = collection(
      doc(
        collection(db, "users"),
        window.userid
      ),
      "sleeps"
    )
    const querySnapshot = await getDocs(sleepCollection);
    const sleeps = []
    const events = []
    querySnapshot.forEach((doc) => {
      sleeps.push(doc.data())
    });
    sleeps.sort((a, b) => b.wake_timestamp - a.wake_timestamp);

    for (let i = 0; i < sleeps.length; i++) {
      const data = sleeps[i]
      const title = "Sleep";
      const startDate = new Date(data["sleep_timestamp"])
      const endDate = new Date(data["wake_timestamp"])

      const start = startDate.toISOString();
      const end = endDate.toISOString();

      const durationMs = endDate - startDate;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
      const durationString = `${hours} hours ${minutes} minutes ${seconds} seconds`;
      const titleWithDuration = `${title} (${durationString})`;

      const formattedDate = `${startDate.getHours()}:${startDate.getMinutes()} (${startDate.getMonth() + 1}/${startDate.getDate()})`;
      const formattedDateEnd = `${endDate.getHours()}:${endDate.getMinutes()} (${endDate.getMonth() + 1}/${endDate.getDate()})`;

      events.push({
        title: titleWithDuration,
        start: start,
        end: end,
        startDate: formattedDate,
        endDate: formattedDateEnd,
        duration: durationString
      });
    }
    events.forEach(event => {
      calendar.addEvent(event);
    });
    const recordContainer = document.getElementById("sleep-list");
    events.forEach(event => {
      const evtContainer = document.createElement("div");
      evtContainer.innerHTML = `
      <div>
        <span>Start: <span><span>${event.startDate}</span>
        </div>
        <div>
        <span>End: <span><span>${event.endDate}</span>
        </div>
        <div>
        <span>Duration: <span><span>${event.duration}</span>
        </div>
      `
      evtContainer.classList.add("sleep_record");
      recordContainer.appendChild(evtContainer);
    });
    getAnalyticsData(window.userid)
  }, 1000)
});

const d = new Date();
let time = d.getTime();

// document.getElementById('currentDate').innerHTML = d.toDateString();




document.getElementById("recordSleep").addEventListener("click", async function () {
  const sleepDate = new Date();
  let timeContainer = document.getElementById("currentSleepTime")
  timeContainer.innerHTML = sleepDate.getHours() + ":" + sleepDate.getMinutes()

  const { doc, setDoc, collection, addDoc, updateDoc } = window.firestore;
  const db = window.db
  const result = await addDoc(
    collection(
      doc(
        collection(db, "users"),
        window.userid
      ),
      "sleeps"
    ),
    {
      sleep: sleepDate.getHours() + ":" + sleepDate.getMinutes(),
      sleep_timestamp: sleepDate.getTime()
    });
  await updateDoc(doc(
    collection(db, "users"),
    window.userid
  ),
    {
      current_id: result.id
    }
  )
  document.getElementById("currentWakeTime").innerHTML = ""
})

document.getElementById("recordWake").addEventListener("click", async function () {
  const sleepDate = new Date();
  let timeContainer = document.getElementById("currentWakeTime")
  timeContainer.innerHTML = sleepDate.getHours() + ":" + sleepDate.getMinutes()
  const { doc, setDoc, updateDoc, collection, getDoc } = window.firestore

  const userDoc = doc(
    collection(db, "users"),
    window.userid
  )

  const userSnap = await getDoc(userDoc)
  const userData = userSnap.data()
  const id = userData.current_id

  await updateDoc(
    doc(
      collection(
        doc(
          collection(db, "users"),
          window.userid
        ),
        "sleeps"
      ),
      id
    ), {
    wake: sleepDate.getHours() + ":" + sleepDate.getMinutes(),
    wake_timestamp: sleepDate.getTime()
  });

  reRender()
})


async function onRecordTab() {
  const { doc, getDoc, setDoc, updateDoc, collection } = window.firestore
  const db = window.db

  const userDoc = doc(
    collection(db, "users"),
    window.userid
  )

  const userSnap = await getDoc(userDoc)
  const userData = userSnap.data()
  const id = userData.current_id

  const sleepDocRef = doc(
    collection(
      doc(
        collection(db, "users"),
        window.userid
      ),
      "sleeps"
    ),
    id
  )
  const docSnap = await getDoc(sleepDocRef)
  let data = null
  if (docSnap.exists()) {
    data = docSnap.data();
  } else {
    // docSnap.data() will be undefined in this case
    return
  }
  let sleepContainer = document.getElementById("currentSleepTime")
  sleepContainer.innerHTML = data.sleep
  if (data.wake == undefined) {
    return;
  }
  let wakeContainer = document.getElementById("currentWakeTime")
  wakeContainer.innerHTML = data.wake
}