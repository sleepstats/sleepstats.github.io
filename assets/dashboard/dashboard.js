const resetList = () => {
  const recordContainer = document.getElementById("sleep-list");
  const loader = document.getElementsByClassName("loader")[0];
  loader.style.display = "block";
  while (recordContainer.firstChild) {
    const child = recordContainer.firstChild;
    if (child !== loader) {
      recordContainer.removeChild(child);
    } else {
      break;
    }
  }
  return { recordContainer, loader }
}

const reRender = () => {
  setTimeout(async () => {
    await loadAndDisplayRecords();
    window.calendar.removeAllEvents();
    window.calendar.render();
  }, 1000)
}

const getEventFormat = (data) => {
  const startDate = new Date(data["sleep_timestamp"])
      const endDate = new Date(data["wake_timestamp"])

      const start = startDate.toISOString();
      const end = endDate.toISOString();

      const { durationString, titleWithDuration } = getDurationInfo(startDate, endDate);

      const formattedDate = `${startDate.getHours()}:${startDate.getMinutes()} (${startDate.getMonth() + 1}/${startDate.getDate()})`;
      const formattedDateEnd = `${endDate.getHours()}:${endDate.getMinutes()} (${endDate.getMonth() + 1}/${endDate.getDate()})`;
      const result = {
        title: titleWithDuration,
        start: start,
        end: end,
        startDate: formattedDate,
        endDate: formattedDateEnd,
        duration: durationString,
        id: data["id"]
      }
      return result;
}

const getDurationInfo = (startDate, endDate) => {
  const title = "Sleep";
  const durationMs = endDate - startDate;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
  const durationString = `${hours} hours ${minutes} minutes ${seconds} seconds`;
  const titleWithDuration = `${title} (${durationString})`;
  return { durationString, titleWithDuration }
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
    await loadAndDisplayRecords();
    getAnalyticsData(window.userid)
  }, 1000)
});

const loadAndDisplayRecords = async () => {
  const { recordContainer, loader } = resetList();
  const { doc, collection, getDocs,query, orderBy } = window.firestore;
  var sleepCollection = collection(
    doc(
      collection(db, "users"),
      window.userid
    ),
    "sleeps"
  )
  const sortedQuery = query(sleepCollection, orderBy("sleep_timestamp"));
  const querySnapshot = await getDocs(sortedQuery);

  const sleeps = []
  const events = []

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id;
    sleeps.push(data)
  });
  sleeps.sort((a, b) => b.wake_timestamp - a.wake_timestamp);

  for (let i = 0; i < sleeps.length; i++) {
    const data = sleeps[i]
    if (data["wake_timestamp"] == undefined) {
      continue;
    }
    const event = getEventFormat(data);
    events.push(event);
  }

  events.forEach(event => {
    calendar.addEvent(event);
  });

  events.forEach(event => {
    renderRecordContainer(event, recordContainer)
  });

  loader.style.display = "none";
}

const renderRecordContainer = (evt, rcdContainer) => {
  const evtContainer = document.createElement("div");
  evtContainer.addEventListener("click", () => {
    window.selectedRecord = evt;
  });
  evtContainer.innerHTML = `
  <div>
    <span>Start: <span><span>${evt.startDate}</span>
    </div>
    <div>
    <span>End: <span><span>${evt.endDate}</span>
    </div>
    <div>
    <span>Duration: <span><span>${evt.duration}</span>
    </div>
    <div style="position: absolute; top: 0; right: 0; height: 20px; width: 50%; display:flex; justify-content: space-evenly">
      <button onclick="showEditModal()">Edit</button>
      <button>Delete</button>
    </div>
  `

  evtContainer.style.position = "relative"
  evtContainer.classList.add("sleep_record");
  rcdContainer.appendChild(evtContainer);

}

const showEditModal = () => {
  const modal = document.getElementById("edit-modal")
  modal.style.display = "flex";
  const sleepInput = document.getElementById("sleep_time_input")
  const wakeInput = document.getElementById("wake_time_input")
  const sleepDateInput = document.getElementById("sleep_date_input")
  const wakeDateInput = document.getElementById("wake_date_input")
  setTimeout(() => {
    const record = window.selectedRecord;
    sleepInput.value = record.startDate.split(" ")[0];
    wakeInput.value = record.endDate.split(" ")[0];

    // Convert start and end dates to Date objects
    const startDate = new Date(record.start);
    const endDate = new Date(record.end);

    // Format dates as YYYY-MM-DD for input values
    const startDateFormat = startDate.toISOString().split("T")[0];
    const endDateFormat = endDate.toISOString().split("T")[0];
    sleepDateInput.value = startDateFormat;
    wakeDateInput.value = endDateFormat;

    // Parse hours and minutes from input values
    const sleepTime = sleepInput.value.split(":");
    const wakeTime = wakeInput.value.split(":");

    // Set hours and minutes to date objects
    startDate.setHours(parseInt(sleepTime[0], 10), parseInt(sleepTime[1], 10), 0, 0);
    endDate.setHours(parseInt(wakeTime[0], 10), parseInt(wakeTime[1], 10), 0, 0);
  }, 1000);
}
const closeEditModal = () => {
  const modal = document.getElementById("edit-modal")
  modal.style.display = "none";
}

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