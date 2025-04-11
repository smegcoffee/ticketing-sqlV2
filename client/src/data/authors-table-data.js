// import axios from "@/api/axios";

// export let ticketTableData = [];

// export async function fetchTicketData() {
//   try {
//     const response = await axios.get('/getAllTickets');
//     const ticketData = ([response.data]);

//     ticketTableData = ticketData.map((ticket, index) => ({
//       id: String(index + 1),
//       b_code: ticket.Branch?.b_code,
//       req_by: ticket.UserTicket?.UserDetails?.fname +" " + ticket.UserTicket?.UserDetails?.lname,
//       category: ticket.Category?.category_name,
//       assigned: [ticket.AssignedTicket?.UserDetails?.fname , ticket.AssignedTicket?.UserDetails?.lname],
//       date_created: [ticket.TicketDetails?.date_created , ticket.TicketDetails?.time_created],
//       date_trans: ticket.TicketDetails?.ticket_transaction_date,
//       status: ticket.status,
//     }));

//     console.log(ticketTableData); 

//   } catch (error) {
//      console.error('Error fetching ticket data:', error);
//   }
// }
// // Initially fetch the data
// fetchTicketData();

// // Export the updated reportsTableData
// export default ticketTableData;

