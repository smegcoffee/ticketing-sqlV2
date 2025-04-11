 import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import {useState, useEffect} from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaceSmileIcon } from "@heroicons/react/24/solid";

// Constants
const ADD_URL = '/createBranch';
const GET_ALL_URL = '/getAllBranches';

function AddBranchModal({ isOpen, onClose, onCloseModal}) {



    if (!isOpen) return null;

    const initialBranchState = {
      branch_name: '',
      branch_code: '',
      branch_category: null,
      branch_email: null,
      branch_address: null,
      branch_contact: null,
    };
    const [newBranch, setNewBranch] = useState(initialBranchState);
    const [loading, setLoading] = useState(false);
 
  // Add Branch Modal
  const handleAddBranchSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      // Check if a branch with the same branch_code already exists
      const existingBranch = await axios.get(GET_ALL_URL);
      if (existingBranch.data.some(branch => branch.branch_code === newBranch.branch_code)) {
        toast.error('Branch with the same branch code already exists.');
        return;
      }
  
      // Check if a branch with the same branch_name already exists
      if (existingBranch.data.some(branch => branch.branch_name === newBranch.branch_name)) {
        toast.error('Branch with the same branch name already exists.');
        return;
      }
  
      const response = await axios.post(ADD_URL, newBranch);
  
      // Reset the form and show a success toast
      setNewBranch(initialBranchState);
  
      // Fetch all branches again and update the list
      // const branchesResponse = await axios.get(GET_ALL_URL);
      // updateBranches(branchesResponse.data);
  
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
      console.error('Error message:', error.message);
      console.error('Response data:', error.response?.data);
      toast.error('Error saving changes. Please try again.');
    }finally {
      setLoading(false); // Set loading state to false after the operation is complete
    }
  };
  
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewBranch((prevNewBranch) => ({
      ...prevNewBranch,
      [name]: value,
    }));
  };
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 opacity-96 ">
        <div className="absolute inset-0 bg-black opacity-75 "></div>
        <div className="bg-white p-1 z-10 w-full md:w-[80%] lg:w-[60%] max-w-3xl h-[auto] relative rounded-lg shadow shadow-sky-200">
            <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
                <Typography variant="h6" color="white">
                 Add New Branch
                </Typography>
            </CardHeader>
                
            {/* Close modal button */}
            <button
                className="text-black px-2 py-1 rounded absolute top-2 right-2 mt-6"
                onClick={onCloseModal}
                >
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
                
            <div className='p-2 h-[90%]'>
              <CardBody>
                <form onSubmit={handleAddBranchSubmit} className="flex flex-wrap justify-between m-auto text-sm">
                <div className="w-full">
                  <div className="flex flex-wrap -mx-2  border-x-2 border-y-2 p-2 mb-2 ">
                  {/* Column 1 */}
                  <div className="w-full md:w-1/3 p-2 ">
                    <div className='p-2 w-full '>
                        <label htmlFor="branch_name" className="block text-gray-900 mb-1 text-sm">Branch Name</label>
                        <input
                            type="text"
                            name="branch_name"
                            className="w-full border border-gray-500 rounded-md py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                            value={newBranch?.branch_name}
                            onChange={handleChange}
                            placeholder='Branch Name'
                            required
                        />
                    </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full md:w-1/3 p-2">
                      <div className=' p-2 w-full'>
                          <label htmlFor="branch_code" className="block text-gray-700 mb-1 text-sm">Branch Code</label>
                          <input
                              type="text"
                              name="branch_code"
                              className="w-full border border-gray-500 rounded-md py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                              value={newBranch?.branch_code}
                              onChange={handleChange}
                              placeholder='Branch Code'
                              required
                          />
                      </div>
                  </div>
                  {/* Column 3 */}
                  <div className="w-full md:w-1/3 p-2">
                      <div className='p-2 w-full'>
                          <label htmlFor="branch_category" className="block text-gray-700 mb-1 text-sm">Branch Category</label>
                          <input
                              type="text"
                              name="branch_category"
                              className="w-full border border-gray-500 rounded-md py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                              value={newBranch.branch_category}
                              onChange={handleChange}
                              placeholder='Category'
                          />
                      </div>
                  </div>
                         {/* Column 1 */}
                  <div className="w-full md:w-[100%s] p-2">
                        <div className=' p-2 w-full'>
                          <label htmlFor="branch_address" className="block text-gray-700 mb-1 text-sm">Branch Address</label>
                            <input
                              type="text"
                              name="branch_address"
                              className="w-full border border-gray-500 rounded-md  py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                              value={newBranch.branch_address}
                              onChange={handleChange}
                              placeholder='Address'
                          /> 
                        </div>
                    </div>
                 {/* Column 2 */}
                  <div className="w-full md:w-1/2 p-2"> 
                    <div className=' p-2 w-full'>
                    
                        <label htmlFor="branch_email" className="block text-gray-700 mb-1 text-sm">Email</label>
                      <input
                          type="email"
                          name="branch_email"
                          className="w-full border border-gray-500 rounded-md  py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                          value={newBranch.branch_email}
                          onChange={handleChange}
                          placeholder='Email'
                      />        
                    </div>
                  </div>
                  {/* Column 3 */}
                  <div className="w-full md:w-1/2 p-2">
                    <div className='p-2 w-full'>
                    <label htmlFor="branch_contact" className="block text-gray-700 mb-1 text-sm">Contact No.</label>
                        <input
                          type="tel"
                          name="branch_contact"
                          className="w-full border border-gray-500 rounded-md py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                          value={newBranch.branch_contact}
                          onChange={handleChange}
                          placeholder='Contact'
                      />                                           
                    </div>
                  </div>
                  </div>
                        <div className="flex justify-end w-full md:w-full sm:w-full lg:w-full xl:w-full p-5 text-sm ">
                        <button
                          type="submit"
                          className={`flex flex-col bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={loading}
                        >
                          {loading ? 'Adding...' : 'Add'}
                        </button>
                            <ToastContainer />
                        </div>
                        </div>
                  
                </form>
            </CardBody>
          </div>
        </div>      
      </div>
       
    );                                            
}

export default AddBranchModal;