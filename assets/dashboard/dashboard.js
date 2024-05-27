const resetList = () => {
  const recordContainer = document.getElementById("sleep-list");
  const loader = document.getElementsByClassName("loader")[0];
  loader.style.display = "block";

  // Clear all child elements except the loader
  Array.from(recordContainer.children).forEach(child => {
    if (child !== loader) {
      recordContainer.removeChild(child);
    }
  });

  return { recordContainer, loader };
};

const reRender = () => {
  setTimeout(async () => {
    window.calendar.removeAllEvents();
    await loadAndDisplayRecords();
    window.calendar.render();
  }, 1000);
};

const getEventFormat = (data) => {
  const startDate = new Date(data["sleep_timestamp"]);
  const endDate = new Date(data["wake_timestamp"]);

  const { durationString, titleWithDuration } = getDurationInfo(startDate, endDate);

  return {
    title: titleWithDuration,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    startDate: formatDateTime(startDate),
    endDate: formatDateTime(endDate),
    duration: durationString,
    id: data["id"]
  };
};

const formatDateTime = (date) => {
  return `${date.getHours()}:${date.getMinutes()} (${date.getMonth() + 1}/${date.getDate()})`;
};

const getDurationInfo = (startDate, endDate) => {
  const durationMs = endDate - startDate;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
  const durationString = `${hours} hours ${minutes} minutes ${seconds} seconds`;
  const titleWithDuration = `Sleep (${durationString})`;
  return { durationString, titleWithDuration };
};


document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridDay',
    initialDate: Date.now(),
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay,list'
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
    setDefaultMonth();
    await loadAndDisplayRecords();
    getAnalyticsData(window.userid)
    document.getElementById('selectedMonth').addEventListener('change', function () {
      const selectedMonth = this.value;
      getAnalyticsData(window.userid);
    });
  }, 1000)
});

const setDefaultMonth = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  document.getElementById('selectedMonth').value = `${currentYear}-${currentMonth}`;
};

const loadAndDisplayRecords = async () => {
  const { recordContainer, loader } = resetList();
  const { doc, collection, getDocs, query, orderBy } = window.firestore;
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
      console.log(data);
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
};

const renderRecordContainer = (event, recordContainer) => {
  const evtContainer = document.createElement("div");
  evtContainer.classList.add("sleep_record");
  evtContainer.style.position = "relative";
  evtContainer.innerHTML = `
    <div>Start: <span>${event.startDate}</span></div>
    <div>End: <span>${event.endDate}</span></div>
    <div>Duration: <span>${event.duration}</span></div>
    <div style="position: absolute; top: 0; right: 0; height: 20px; width: 50%; display: flex; justify-content: space-evenly">
      <button onclick="showEditModal()">Edit</button>
      <button onclick="confirmDelete()">Delete</button>
    </div>
  `;
  evtContainer.addEventListener("click", () => {
    window.selectedRecord = event;
  });
  recordContainer.appendChild(evtContainer);
};

const showEditModal = () => {
  const modal = document.getElementById("edit-modal");
  modal.style.display = "flex";
  const sleepInput = document.getElementById("sleep_time_input");
  const wakeInput = document.getElementById("wake_time_input");
  const sleepDateInput = document.getElementById("sleep_date_input");
  const wakeDateInput = document.getElementById("wake_date_input");

  setTimeout(() => {
    const record = window.selectedRecord;
    console.log(record)
    const formatTime = (time) => {
      return time.padStart(2, '0');
    };

    const sleepHour = record.startDate.split(" ")[0].split(":")
    const  wakeHour =record.endDate.split(" ")[0].split(":")
    sleepInput.value = formatTime(sleepHour[0]) + ":" + formatTime(sleepHour[1]);;
    wakeInput.value = formatTime(wakeHour[0]) + ":" + formatTime(wakeHour[1]);;

    const startDate = new Date(record.start);
    const endDate = new Date(record.end);

    sleepDateInput.value = startDate.toISOString().split("T")[0];
    wakeDateInput.value = endDate.toISOString().split("T")[0];

    const sleepTime = sleepInput.value.split(":");
    const wakeTime = wakeInput.value.split(":");

    const formattedSleepTime = formatTime(sleepTime[0]) + ":" + formatTime(sleepTime[1]);
    const formattedWakeTime = formatTime(wakeTime[0]) + ":" + formatTime(wakeTime[1]);


    // Assuming sleepInput and wakeInput are meant to hold formatted time strings
    sleepInput.value = formattedSleepTime;
    wakeInput.value = formattedWakeTime;
  }, 1000);
};

const closeEditModal = () => {
  document.getElementById("edit-modal").style.display = "none";
};

// Function to save the edited record
const saveEdit = async () => {
  const sleepInput = document.getElementById("sleep_time_input").value;
  const wakeInput = document.getElementById("wake_time_input").value;
  const sleepDateInput = document.getElementById("sleep_date_input").value;
  const wakeDateInput = document.getElementById("wake_date_input").value;

  const startDate = new Date(`${sleepDateInput}T${sleepInput}:00`);
  const endDate = new Date(`${wakeDateInput}T${wakeInput}:00`);

  const { doc, updateDoc, collection } = window.firestore;
  const db = window.db;

  await updateDoc(doc(collection(doc(collection(db, "users"), window.userid), "sleeps"), window.selectedRecord.id), {
    sleep_timestamp: startDate.getTime(),
    wake_timestamp: endDate.getTime(),
    sleep: sleepInput,
    wake: wakeInput
  });

  closeEditModal();
  reRender();
  getAnalyticsData(window.userid);
};

document.getElementById("recordSleep").addEventListener("click", async () => {
  const sleepDate = new Date();
  document.getElementById("currentSleepTime").innerHTML = `${sleepDate.getHours()}:${sleepDate.getMinutes()}`;

  const { addDoc, collection, doc, updateDoc } = window.firestore;
  const db = window.db;
  const result = await addDoc(collection(doc(collection(db, "users"), window.userid), "sleeps"), {
    sleep: `${sleepDate.getHours()}:${sleepDate.getMinutes()}`,
    sleep_timestamp: sleepDate.getTime()
  });

  await updateDoc(doc(collection(db, "users"), window.userid), { current_id: result.id });
  document.getElementById("currentWakeTime").innerHTML = "";
});

document.getElementById("recordWake").addEventListener("click", async () => {
  const sleepDate = new Date();
  document.getElementById("currentWakeTime").innerHTML = `${sleepDate.getHours()}:${sleepDate.getMinutes()}`;

  const { doc, updateDoc, collection, getDoc } = window.firestore;
  const db = window.db;
  const userDoc = doc(collection(db, "users"), window.userid);
  const userSnap = await getDoc(userDoc);
  const id = userSnap.data().current_id;

  await updateDoc(doc(collection(doc(collection(db, "users"), window.userid), "sleeps"), id), {
    wake: `${sleepDate.getHours()}:${sleepDate.getMinutes()}`,
    wake_timestamp: sleepDate.getTime()
  });

  setTimeout(reRender, 1000);
});



// Function to confirm deletion
const confirmDelete = async () => {
  const confirmation = confirm("Are you sure you want to delete this record?");
  if (confirmation) {
    await deleteRecord();
    closeEditModal();
    reRender();
    getAnalyticsData(window.userid);
  }
};

// Function to delete the record
const deleteRecord = async () => {
  const { doc, deleteDoc, collection } = window.firestore;
  const db = window.db;

  await deleteDoc(doc(collection(doc(collection(db, "users"), window.userid), "sleeps"), window.selectedRecord.id));
};