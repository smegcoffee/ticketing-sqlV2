// import axios from "@/api/axios";
// import { BanknotesIcon, UserPlusIcon, UserIcon, ChartBarIcon } from "@heroicons/react/24/solid";
// import { jwtDecode } from "jwt-decode";

// const token = sessionStorage.getItem("token");
// let userRole = null;

// if (token) {
//   const decoded = jwtDecode(token);
//   userRole = decoded.role;
// }


// const fetchTokenAndUserRole = async () => {
//   const token = sessionStorage.getItem("token");
//   let userRole = null;

//   if (token) {
//     const decoded = jwtDecode(token);
//     userRole = decoded.role;
//   }

//   return userRole;
// };



// initializeStatistics();

// export 

// // axios.get('/userCount')
// //   .then(response => {
// //     // Assuming your API returns the total user count in the response
// //     const totalUsers = response.data.totalUsers;
// //     // Update the "Total Users" value in statisticsCardsData
// //     statisticsCardsData[3].value = `Total: ${totalUsers}`;
// //   })
// //   .catch(error => {
// //     console.error("Error fetching user count:", error);
// //   });

// // axios.get('/ticketCompletedCount')
// //   .then(response => {
// //     const totalTicketsThisMonth = response.data.ticketsThisMonth;
// //     const percentage = response.data.percentageThanLastMonth;
// //     const day = response.data.day;
// //     statisticsCardsData[0].value = `Total: ${totalTicketsThisMonth}`;
// //     if (percentage > 0){
// //       statisticsCardsData[0].footer.value = `+${percentage}%`;
// //       statisticsCardsData[0].footer.color = 'text-red-500';
// //     } else {
// //       statisticsCardsData[0].footer.value = `${percentage}%`;
// //       statisticsCardsData[0].footer.color = 'text-green-500';
// //     }
// //   })
// //   .catch(error => {
// //     console.error("Error fetching user count:", error);
// //   });

// // axios.get('/ticketTodayYesterdayCount')
// //   .then(response => {
// //     const ticketThisDay = response.data.ticketsThisDay;
// //     const percentage = response.data.percentageThanYesterday;
// //     const day = response.data.day;
// //     statisticsCardsData[1].value = `Total: ${ticketThisDay}`;
    // if (percentage > 0) {
    //   statisticsCardsData[1].footer.value = `+${percentage}%`;
    //   statisticsCardsData[1].footer.color = 'text-red-500';
    // } else {
    //   statisticsCardsData[1].footer.value = `${percentage}%`;
    //   statisticsCardsData[1].footer.color = 'text-green-500';
    // }

// //     if (day === 6) {
// //       statisticsCardsData[1].footer.label = 'than last day';
// //     } else {
// //       statisticsCardsData[1].footer.label = 'than yesterday';
// //     }
// //   });

// // axios.get('/ticketPendingCount')
// //   .then(response => {
// //     const ticketThisDay = response.data;
// //     statisticsCardsData[2].value = `Total: ${ticketThisDay}`;
// //   });

// export default statisticsCardsData;
