import axios from "@/api/axios";

async function fetchTopBranches() {
    const response = await axios.get('/getTopBranches');
    const branches = response.data;

    // Sort branches based on ticket count in descending order
    const sortedBranches = branches.sort((a, b) => b.count - a.count);

    // Take the top 5 branches
    const top5Branches = sortedBranches.slice(0, 5);

    return top5Branches.map((branch, index) => {
        let ticket = 'TICKET';

        if (branch.count > 1) {
            ticket = 'TICKETS';
        }

        return {
            id: index,
            b_code: branch.branch,
            total_tickets: [branch.count, ticket],
        };
    });
}

export const topBranch = fetchTopBranches(); // This will return a Promise

export default fetchTopBranches; // Export the function for use in other parts of your application
