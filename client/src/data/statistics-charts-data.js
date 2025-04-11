// import { chartsConfig } from "@/configs";
// import axios from "@/api/axios";


// let websiteViewsChart = {
//   type: "bar",
//   height: 220,
//   series: [
//     {
//       name: "Ticket(s)",
//       data: [],
//     },
//   ],
//   options: {
//     ...chartsConfig,
//     colors: "#fff",
//     plotOptions: {
//       bar: {
//         columnWidth: "16%",
//         borderRadius: 5,
//       },
//     },
//     xaxis: {
//       ...chartsConfig.xaxis,
//       categories: ["M", "T", "W", "T" , "F", "S", "S"],
//     },
//   },
// };

// axios.get('/getTicketThisWeek')
//   .then(response => {
//     // Update the data in the chart
//     websiteViewsChart.series[0].data = response.data.map(item => item.count);
//     const total = response.data.reduce((acc, entry) => acc + entry.count, 0);

//     if (total === 0) {
//       statisticsChartsData[0].description = `No Completed Ticket This Week`;
//     } else if (total > 1) {
//       statisticsChartsData[0].description = `${total} Completed Tickets This Week`;
//     } else {
//       statisticsChartsData[0].description = `${total} Completed Ticket This Week`;
//     }
//   })
//   .catch(error => {
//     console.error("Error fetching user count:", error);
//   });



// let dailySalesChart = {
//   type: "line",
//   height: 220,
//   series: [
//     {
//       name: "Ticket(s)",
//       data: [],
//     },
//   ],
//   options: {
//     ...chartsConfig,
//     colors: ["#fff"],
//     stroke: {
//       lineCap: "round",
//     },
//     markers: {
//       size: 5,
//     },
//     xaxis: {
//       ...chartsConfig.xaxis,
//       categories: [
//         "Jan",
//         "Feb",
//         "Mar",
//         "Apr",
//         "May",
//         "Jun",
//         "Jul",
//         "Aug",
//         "Sep",
//         "Oct",
//         "Nov",
//         "Dec"
//       ],
//     },
//   },
// };


// axios.get('/getTicketThisYear')
//   .then(response => {
//     // Update the data in the chart
//     dailySalesChart.series[0].data = response.data.map(item => item.count);
//     const total = response.data.reduce((acc, entry) => acc + entry.count, 0);
    
//     if (total === 0) {
//       statisticsChartsData[1].description = `No Completed Ticket This Year`;
//     } else if (total > 1) {
//       statisticsChartsData[1].description = `${total} Completed Tickets This Year`;
//     } else {
//       statisticsChartsData[1].description = `${total} Completed Ticket This Year`;
//     }
//   })
//   .catch(error => {
//     console.error("Error fetching user count:", error);
//   });


// let completedTasksChart = {
//   ...dailySalesChart,
//   series: [
//     {
//       name: "Ticket(s)",
//       data: [],
//     },
//   ],
// };

// axios.get('/getTicketLastYear')
//   .then(response => {
//     // Update the data in the chart
//     completedTasksChart.series[0].data = response.data.map(item => item.count);
//     const total = response.data.reduce((acc, entry) => acc + entry.count, 0);
    
//     if (total === 0) {
//       statisticsChartsData[2].description = `No Completed Ticket Last Year`;
//     } else if (total > 1) {
//       statisticsChartsData[2].description = `${total} Completed Tickets Last Year`;
//     } else {
//       statisticsChartsData[2].description = `${total} Completed Ticket Last Year`;
//     }
//   })
//   .catch(error => {
//     console.error("Error fetching user count:", error);
//   });

// export let statisticsChartsData = [
//   {
//     color: "blue",
//     title: "This Week",
//     description: '',
//     chart: websiteViewsChart,
//   },
//   {
//     color: "pink",
//     title: "This Year",
//     description: '',
//     chart: dailySalesChart,
//   },
//   {
//     color: "green",
//     title: "Last Year",
//     description: '',
//     chart: completedTasksChart,
//   },
// ];

// export default statisticsChartsData;
