const ctx = document.getElementById('myChart');
let myChart;

const healthCtx = document.getElementById('health');
let healthChart;

async function getAnalyticsData(userid) {
    const db = window.db;
    const { doc, setDoc, collection, addDoc, updateDoc, getDocs } = window.firestore;
    
    // Destroy existing chart instances if they exist
    if (myChart) {
        myChart.destroy();
    }
    if (healthChart) {
        healthChart.destroy();
    }

    // Retrieve sleep data from Firestore
    const sleepCollection = collection(
        doc(
            collection(db, "users"),
            userid
        ),
        "sleeps"
    );
    const querySnapshot = await getDocs(sleepCollection);
    const sleeps = [];
    querySnapshot.forEach((doc) => {
        sleeps.push(doc.data());
    });

    // Sort sleep data by wake timestamp
    sleeps.sort((a, b) => a.wake_timestamp - b.wake_timestamp);

    // Object to store sleep data by month
    const monthlyData = {};

    for (let i = 0; i < sleeps.length; i++) {
        const data = sleeps[i];
        if (data["wake_timestamp"] === undefined) {
            continue;
        }
        const startDate = new Date(data["sleep_timestamp"]);
        const endDate = new Date(data["wake_timestamp"]);

        const durationMs = endDate - startDate;
        const hours = durationMs / (1000 * 60 * 60);

        const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
        const monthKey = startDate.getFullYear() + '-' + month;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(hours);
    }

    // Get selected month from input element
    const selectedMonth = document.getElementById('selectedMonth').value;

    // Get data based on user selection
    let selectedData;
    if (selectedMonth) {
        selectedData = monthlyData[selectedMonth];
    } else {
        // Default to the first month's data if no selection is made
        selectedData = monthlyData[Object.keys(monthlyData)[0]];
    }

    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Categorize sleep health based on sleep duration
    const healthLabels = ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
    const healthData = [0, 0, 0, 0, 0,0,0,0]; // Initialize sleep health data


    selectedData.forEach(hours => {
      if (hours < 1) {
        // healthData[0]++; // Very Poor
    } else 
      if (hours < 5) {
          healthData[0]++; // Very Poor
      } else if (hours >= 5 && hours < 6) {
          healthData[1]++; // Poor
      } else if (hours >= 6 && hours < 7) {
          healthData[2]++; // Fair
      } else if (hours >= 7 && hours < 8) {
          healthData[3]++; // Good
      } else if (hours >= 8 && hours < 9) {
          healthData[4]++; // Excellent
      } else if (hours >= 9 && hours < 12) {
          healthData[5]++; // Oversleeping (5-8)
      } else if (hours >= 12 && hours < 15) {
          healthData[6]++; // Oversleeping (9-12)
      } else {
          healthData[7]++; // Oversleeping (12+)
      }
  });

    // Plot the polar area chart for sleep health
    healthChart = new Chart(healthCtx, {
        type: 'polarArea',
        data: {
            labels: healthLabels,
            datasets: [{
                label: 'Sleep Health',
                data: healthData,
                backgroundColor: [
                  'rgb(255, 87, 34)',   // Very Poor (Red)
                  'rgb(255, 152, 0)',   // Poor (Orange)
                  'rgb(234, 255, 49)',  // Fair (Yellow)
                  'rgb(143, 215, 60)',  // Good (Light Green)
                  'rgb(66, 237, 149)',  // Excellent (Green)
                  'rgb(3, 128, 244)',   // Oversleeping (5-8) (Blue)
                  'rgb(3, 43, 244)',    // Oversleeping (9-12) (Blue)
                  'rgb(107, 3, 244)'    // Oversleeping (12+) (Blue)
                ],
                borderColor: [
                    'rgba(255, 87, 34, 1)',
                    'rgba(255, 152, 0, 1)',
                    'rgba(234, 255, 49, 1)',
                    'rgba(143, 215, 60, 1)',
                    'rgba(66, 237, 149, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                r: {
                    suggestedMin: 0
                }
            }
        }
    });

    // Plot the bar chart for sleep duration
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const filledSelectedData = new Array(daysInMonth).fill(0);

    selectedData.forEach((value, index) => {
        filledSelectedData[index] = value;
    });

    const backgroundColors = filledSelectedData.map(hours => {
        if (hours >= 15) {
            return 'rgb(107, 3, 244)'; // Blue for oversleeping (more than 15 hours)
        } else if (hours >= 12) {
            return 'rgb(3, 43, 244)'; // Blue for oversleeping (more than 12 hours)
        } else if (hours >= 9) {
            return 'rgb(3, 128, 244)'; // Blue for oversleeping (more than 9 hours)
        } else if (hours >= 8) {
            return 'rgb(66, 237, 149)'; // Green for excellent sleep (8 hours or more)
        } else if (hours >= 7) {
            return 'rgb(143, 215, 60)'; // Light green for good sleep (7-8 hours)
        } else if (hours >= 6) {
            return 'rgb(234, 255, 49)'; // Yellow for fair sleep (6-7 hours)
        } else if (hours >= 5) {
            return 'rgb(255, 152, 0)'; // Orange for poor sleep (5-6 hours)
        } else {
            return 'rgb(255, 87, 34)'; // Red for very poor sleep (less than 5 hours)
        }
    });

    // Plot the bar chart for sleep duration
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sleep Hours',
                data: filledSelectedData,
                borderWidth: 1,
                borderColor: '#009de0',
                pointBackgroundColor: 'yellow',
                backgroundColor: backgroundColors
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
