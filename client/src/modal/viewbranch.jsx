import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import {useState, useEffect} from "react";
import axios from "@/api/axios";

function ViewBranchModal({ isOpen, onClose, branchIdToView }) {

    const [showBranchData, setShowBranchData] = useState({});
  
    useEffect(() => {
      async function fetchBranchData() {
        try {
        
          const VIEW_URL = `/viewBranch/${branchIdToView}`;
          const response = await axios.get(VIEW_URL);
        
          setShowBranchData(response.data);
        } catch (error) {
          console.error("Error fetching branch data:", error);
        }
      }
  
      if (isOpen && branchIdToView) {
        fetchBranchData();
      }
    }, [isOpen, branchIdToView]);
  
   
    return (
       
        <div className="fixed inset-0 flex items-center justify-center z-50 opacity-96 ">
          <div className="absolute inset-0 bg-black opacity-75 "></div>
          <div className="bg-white p-1 z-10 w-full md:w-[80%] lg:w-[60%] max-w-3xl h-[auto] relative rounded-lg shadow shadow-sky-200">
                <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
                    <Typography variant="h6" color="white">
                    Branch Details
                    </Typography>
                </CardHeader>

                {/* Close modal button */}
                <button
                    className="text-black px-2 py-1 rounded absolute top-2 right-2 mt-6"
                    onClick={onClose}
                >
                    <i className="fa fa-times" aria-hidden="true"></i>
                </button>
                
                <div className='p-2 h-[90%]'>
                <CardBody>
                    <form className="flex flex-wrap justify-between m-auto">
                        <div className="w-full">
                            <div className="flex flex-wrap -mx-2 border-x-2 border-y-2 p-2">
                                    {/* Column 1 */}
                                        <div className="w-full md:w-1/3 p-2">
                                        <div className='p-2 w-full'>
                                            <label htmlFor="branch_name" className="block text-gray-700 mb-1 text-sm">Branch Name</label>
                                            <input
                                                type="text"
                                                id="branch_name"
                                                className="w-full border border-gray-500 rounded-sm  py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                                                value={showBranchData?.Branch?.b_name}
                                                readOnly
                                                />
                                        </div>
                                        </div>
                                    {/* Column 2 */}
                                    <div className="w-full md:w-1/3 p-2">
                                    <div className=' p-2 w-full'>
                                    <label htmlFor="branch_code" className="block text-gray-700 mb-1 text-sm">Branch Code</label>
                                        <input
                                            type="text"
                                            id="branch_code"
                                            className="w-full border border-gray-500 rounded-sm py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                                            value={showBranchData?.Branch?.b_code}
                                            readOnly 
                                        />  
                                    </div>
                                    </div>
                                    {/* Column 3 */}
                                    <div className="w-full md:w-1/3 p-2">
                                    <div className='p-2 w-full'>
                                    <label htmlFor="branch_category" className="block text-gray-700 mb-1 text-sm">Branch Category</label>
                                        <input
                                            type="text"
                                            id="branch_category"
                                            className="w-full border border-gray-500 rounded-sm py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                                            value={showBranchData?.Branch?.category}
                                            readOnly
                                        />                                            
                                    </div>
                                    </div>
                                    {/* Column 1 */}
                                    <div className="w-full md:w-[100%s] p-2">
                                    <div className=' p-2 w-full'>
                                    <label htmlFor="branch_address" className="block text-gray-700 mb-1 text-sm">Branch Address</label>
                                            <input
                                            type="text"
                                            id="branch_address"
                                            className="w-full border border-gray-500 rounded-sm py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                                            value={showBranchData?.b_address}
                                            readOnly
                                        /> 
                                    </div>
                                    </div>
                                    {/* Column 2 */}
                                    <div className="w-full md:w-1/2 p-2">
                                    <div className=' p-2 w-full'>

                                        <label htmlFor="email" className="block text-gray-700 mb-1 text-sm">Email</label>
                                    <input
                                        type="text"
                                        id="email"
                                        className="w-full border border-gray-500 rounded-sm  py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm "
                                        value={showBranchData?.b_email}
                                        readOnly 
                                    />       
                                    </div>
                                    </div>
                                    {/* Column 3 */}
                                    <div className="w-full md:w-1/2 p-2">
                                        <div className='p-2 w-full'>
                                        <label htmlFor="branch_contact" className="block text-gray-700 mb-1 text-sm ">Contact No.</label>
                                            <input
                                            type="contact"
                                            name="branch_contact"
                                            className="w-full border border-gray-500 rounded-sm  py-1 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-sm "
                                            value={showBranchData?.b_contact}
                                            readOnly
                                        />                                           
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </form>  
                </CardBody>
            </div>
        </div>
    </div>
       
    );
}

export default ViewBranchModal;