const ctx = document.getElementById('myChart');

  

async function getAnalyticsData(userid) {
console.log("Hello world")
    const db = window.db
    const { doc, setDoc, collection, addDoc, updateDoc, getDocs } = window.firestore;
    var sleepCollection = collection(
        doc(
          collection(db, "users"),
          userid
        ),
        "sleeps"
      )
    const querySnapshot = await getDocs(sleepCollection);
    const sleeps = []
    querySnapshot.forEach((doc) => {
      sleeps.push(doc.data())
    });
    console.log(sleeps)
    sleeps.sort((a, b) => a.wake_timestamp - b.wake_timestamp);

    const events = []
    const sleep_hours = []
    const labels = []
    for (let i = 0; i < sleeps.length; i++) {
        const data = sleeps[i]
        const title = "Sleep";
        if(data["wake_timestamp"] == undefined){
            continue;
          }
        const startDate = new Date(data["sleep_timestamp"])
        const endDate = new Date(data["wake_timestamp"])
  
        const start = startDate.toISOString();
        const end = endDate.toISOString();
  
        const durationMs = endDate - startDate;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
        const durationString = `${hours} hours ${minutes} minutes ${seconds} seconds`;
        
        const total_hours = hours + minutes/60 + seconds/60/60;
        sleep_hours.push(total_hours)
        labels.push(i+1);
      }
      console.log(sleep_hours)
      console.log("Hello world")

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Sleep Hours',
            data: sleep_hours,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
}

