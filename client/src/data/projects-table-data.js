import axios from '@/api/axios';

// Define an empty initial state for reportsTableData
export let projectsTableData = [];

// Function to fetch data from the server and update reportsTableData
export async function fetchAutomation() {
  try {
    const response = await axios.get('/getAutomationData');
    const automationDataFromDatabase = response.data.automation;
    const data = response.data.data;

    projectsTableData = automationDataFromDatabase.map((automation, index) => {
      let profile = automation.UserDetails.profile_pic;

      if (automation.UserDetails.profile_pic === null) {
        profile = 'Windows_10_Default_Profile_Picture.svg.png';
      }

      return {
        img: `${axios.defaults.baseURL}/uploads/${profile}`,
        name: automation.UserDetails.fname + ' ' + automation.UserDetails.lname,
        mostEdited: data[index].mostUsedCategory.category,
        ticketsThisMonth: data[index].ticketsThisMonth,
        lastMonthPercentage: data[index].roundedPercentage,
        result: `${data[index].result}`
      }
    });
  } catch (error) {
    console.error('Error fetching branch data:', error);
  }
}

// Initially fetch the data
fetchAutomation();

// Export the updated reportsTableData
export default projectsTableData;