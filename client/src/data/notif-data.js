import axios from "@/api/axios";
import { useEffect } from "react";
import { formatDistanceToNow } from 'date-fns';

// Initialize notifTableData as an empty array
let notifTableData = [];

export async function fetchInfoData() {
  try {
    const response = await axios.get('/getAllNotifs');
    const responseData = response.data; 
    
    // Filter out items where notif is not equal to 0
    const filteredData = responseData.filter(info => info.notif !== 0);
    
    if (Array.isArray(filteredData) && filteredData.length > 0) {
      // Assuming the data structure matches your expectations, adjust this as needed
      notifTableData = filteredData.map((info, index) => ({
        id: String(index + 1),
        ticket_id: info.ticket_id  || 'N/A',
        b_code: info.AssignedTicket.Branch.b_code || 'N/A', // Safely access properties
        timeTicketCreateds: info.TicketDetails.time || 'N/A',
        dateTicketCreateds: info.TicketDetails.ticket_transaction_date || 'N/A'
      })); 
      notifTableData.sort((a, b) => {
        const dateA = new Date(b.dateTicketCreateds);
        const dateB = new Date(a.dateTicketCreateds);
        return dateA - dateB;
      });
    } else {
      console.error('Empty or unexpected response data:', responseData);
    }
  } catch (error) {
    console.error('Error fetching ticket data:', error);
  }

    // Periodically fetch the notification count (e.g., every 30 seconds)
    useEffect(() => {
      const intervalId = setInterval(() => {
        fetchInfoData();
      }, 30000); // Adjust the polling interval as needed
  
      // Cleanup the interval on unmount
      return () => clearInterval(intervalId);
    }, []);
}

// Call fetchInfoData to initially fetch the data
fetchInfoData();

// Export the notifTableData variable (not the array itself)
export { notifTableData };
