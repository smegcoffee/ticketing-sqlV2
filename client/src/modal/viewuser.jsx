import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import {useState, useEffect} from "react";
import axios from "@/api/axios";

function ViewUserModal({ isOpen, onClose, userIdToView }) {

    const [showUserData, setShowUserData] = useState({});
  
    useEffect(() => {
      async function fetchUserData() {
        try {
          const VIEW_URL = `/viewUser/${userIdToView}`; 
          const response = await axios.get(VIEW_URL);
          setShowUserData(response.data);
        } catch (error) {
          console.error("Error fetching branch data:", error);
        }
      }
  
      if (isOpen && userIdToView) {
        fetchUserData();
      }
    }, [isOpen, userIdToView]);
  
   
    return (
       
        <div className="fixed inset-0 flex items-center justify-center z-50 opacity-96 ">
            <div className="absolute inset-0 bg-black opacity-75 "></div>
            <div className="bg-white p-1 z-10 w-full md:w-[80%] lg:w-[60%] max-w-3xl h-[auto] relative rounded-lg shadow shadow-sky-200">
            <CardHeader variant="gradient" color="blue" className="p-3">
                <Typography variant="h6" color="white">
                 User Details
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
                    <div className="w-full h-full">
                        <div className="flex flex-wrap -mx-2  h-full">
                            {/* Column 1 */}
                            <div className="w-full md:w-1/2 p-2">
                                    <div className='p-2 w-full'>
                                    <label htmlFor="fname" className="block text-gray-900 mb-1 text-sm">First Name</label>
                                        <input
                                            type="text"
                                            id="fname"
                                            className="w-full border border-gray-500 rounded-md py-1 px-2 text-gray-900 focus:outline-none focus:shadow-outline text-sm "
                                            value={showUserData?.UserDetails?.fname || ''}
                                            readOnly
                                            />
                                    </div>
                                </div>
                                {/* Column 2 */}
                                <div className="w-full md:w-1/2 p-2">
                                    <div className=' p-2 w-full'>
                                    <label htmlFor="lastname" className="block text-gray-900 mb-1  text-xs ">Last Name </label>
                                        <input
                                            type="text"
                                            name="lastname"
                                            className="w-full border border-gray-500 rounded-md py-1 px-2 text-gray-900 focus:outline-none focus:shadow-outline text-sm "
                                            value={showUserData?.UserDetails?.lname}
                                            readOnly
                                        />          
                                    </div>
                                </div>
                                
                                    {/* Column 1 */}
                                <div className="w-full md:w-1/2 p-2">
                                <div className='p-2 w-full'>
                                    <label htmlFor="email" className="block text-gray-900 mb-1 text-sm">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full border border-gray-500 rounded-md py-1 px-2 text-gray-900 focus:outline-none focus:shadow-outline text-sm "
                                        value={showUserData?.UserDetails?.user_email}
                                        readOnly
                                        />
                                </div>
                                </div>
                                {/* Column 1 */}
                                <div className="w-full md:w-1/2 p-2">
                                    <div className='p-2 w-full'>
                                    <label htmlFor="username" className="block text-gray-900 mb-1 text-sm">Username</label>
                                        <input
                                            type="username"
                                            name="username"
                                            className="w-full border border-gray-500 rounded-md py-1 px-2 text-gray-900 focus:outline-none focus:shadow-outline text-sm "
                                            value={showUserData?.username}
                                            readOnly
                                        
                                            />
                                    </div>
                                </div>
                                
                                {/* Column 2 */}
                                <div className="w-full md:w-1/2 p-2">
                                    <div className=' p-2 w-full'>
                                    <label htmlFor="contact" className="block text-gray-900 mb-1 text-sm">Contact</label>
                                        <input
                                            type="tel"
                                            name="contact"
                                            className="w-full border border-gray-500 rounded-md py-1 px-2 text-gray-900 focus:outline-none focus:shadow-outline text-sm "
                                            value={showUserData?.UserDetails?.user_contact}
                                            readOnly
                                        />  
                                    </div>
                                </div>
                                {/* Column 1 */}
                                <div className="w-full md:w-1/4 p-2">
                                    <div className=' p-2 w-full'>
                                    <label htmlFor="branch_code" className="block text-gray-900 mb-1 text-sm">Branch Code</label>
                                        <input
                                            type="text"
                                            name="branch_code"
                                            className="w-full border border-gray-500 rounded-md py-1 px-2 text-gray-900 focus:outline-none focus:shadow-outline text-sm"
                                            value={showUserData?.Branch?.b_code}
                                            readOnly
                                        />  
                                    </div>
                                </div>
                                {/* Column 3 */}
                                <div className="w-full md:w-1/4 p-2">
                                    <div className='p-2 w-full'>
                                    <label htmlFor="user_role" className="block text-gray-900 mb-1  text-sm">User Role </label>
                                        <input
                                            type="text"
                                            name="user_role"
                                            className="w-full border border-gray-500 rounded-md py-1 px-2 text-gray-900 focus:outline-none focus:shadow-outline text-sm"
                                            value={showUserData?.UserRole?.role_name}
                                            readOnly
                                        />                                            
                                    </div>
                                </div>
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

export default ViewUserModal;