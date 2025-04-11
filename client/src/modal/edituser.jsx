import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

function EditUserModal({ isOpen, onClose, close, updateUsers, userIdToEdit }) {
  const EDIT_URL = `/updateUser/${userIdToEdit}`;

  const [showUserData, setShowUserData] = useState({});
  const [userRoles, setUserRoles] = useState([]);
  const [branchCodes, setBranchCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState([]);
  const [selectedRole, setSelectedRole] = useState();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchUserToEdit() {
      try {
        const response = await axios.get(`/viewUser/${userIdToEdit}`);
        setShowUserData(response.data);
        const selectedCodesArray = response.data.blist_id.split(',').map(Number);
        setSelectedCode(selectedCodesArray);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("An error occurred while fetching user data.");
      }
    }

    if (isOpen && userIdToEdit) {
      fetchUserToEdit();
    }
  }, [isOpen, userIdToEdit]);

  useEffect(() => {
    async function fetchBranchCode() {
      try {
        const response = await axios.get("/getAllBranches");
        setBranchCodes(response.data);
      } catch (error) {
        console.error("Error fetching branch codes:", error);
      }
    }

    async function fetchUserRole() {
      try {
        const response = await axios.get("/getAllRoles");

        setUserRoles(response.data);
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    }

    fetchBranchCode();
    fetchUserRole();
  }, [isOpen, userIdToEdit]);

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setShowUserData((prevData) => ({
      ...prevData,
      [name]: value,
      UserDetails: {
        ...prevData.UserDetails,
        [name]: value,
      },
    }));
   
  };

  const handleUserRoleChange = (selectedOption) => {
    setSelectedRole(selectedOption.value);
    // setChangesMade(true);
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
  
      await axios.put(EDIT_URL, {
        firstname: showUserData?.UserDetails?.fname,
        lastname: showUserData?.UserDetails?.lname,
        contact: showUserData?.UserDetails?.user_contact,
        email: showUserData?.UserDetails?.user_email,
        username: showUserData?.username,
        branch_code: selectedCode,
        user_role: selectedRole,
        new_pass: newPass, 
        conf_pass: confirmPass,
      });
      
  
      // const userResponse = await axios.get("/getAllUsers");
  
      // updateUsers(userResponse.data);
      onClose();
      setIsLoading(false);
    } catch (error) {
      if (error.response.status === 400) {
        toast.error(error.response.data.message);
      }
      if (error.response.status === 409) {
        if(error.response.data.message === 'Email already exist!'){
          toast.error(error.response.data.message);
        }else if(error.response.data.message === 'Username already exist!'){
          toast.error(error.response.data.message);
        }
      }else if(error.response.status === 404){
        toast.error("Input field is required!");
      }
      console.error("Error saving changes:", error);
      console.error("Error message:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const options = branchCodes.map((code) => ({
    value: code.blist_id,
    label: code.Branch ? code.Branch.b_code.toUpperCase() : '',
  }));

  return (
    <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black opacity-75 "></div>
      <div className="shadow-sky-200 relative z-10 h-[85%] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
          <Typography variant="h6" color="white">
            User Details
          </Typography>
        </CardHeader>

        {/* Close modal button */}
        <button
          className="absolute top-2 right-2 mt-6 rounded px-2 py-1 text-black"
          onClick={close}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>

        <div className="h-[70%] p-2">
          <CardBody>
            <form
              onSubmit={handleSaveChanges}
              className="m-auto flex flex-wrap justify-between text-sm"
            >
              <div className="w-full">
                <div className="-mx-2 mb-1 flex flex-wrap border-x-2 border-y-2 p-2">
                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/2 -mb-4">
                    <div className="w-full p-2">
                      <label
                        htmlFor="fname"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        name="fname"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none "
                        value={showUserData?.UserDetails?.fname || ""}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full p-2 md:w-1/2 -mb-4">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="lname"
                        className="mb-1 block text-sm  text-gray-900 "
                      >
                        Last Name{" "}
                      </label>
                      <input
                        type="text"
                        name="lname"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none "
                        value={showUserData?.UserDetails?.lname || ""}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  {/* Column 1 */}
                  <div className="md:w-1/1 w-full p-2 -mb-4">
                    <div className="w-full p-2">
                      <label
                        htmlFor="user_email"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="user_email"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none "
                        value={showUserData?.UserDetails?.user_email || ""}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="w-full p-2 md:w-1/2 -mb-4">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="user_contact"
                        className="mb-1 block text-sm  text-gray-900 "
                      >
                        Contact
                      </label>
                      <input
                        type="tel"
                        name="user_contact"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none "
                        value={showUserData?.UserDetails?.user_contact || ""}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/2 -mb-4">
                    <div className="w-full p-2">
                      <label
                        htmlFor="username"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Username
                      </label>
                      <input
                        type="username"
                        name="username"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none "
                        value={showUserData?.username || ""}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="branch_code"
                        className="mb-1 block text-sm  text-gray-700 "
                      >
                        Branch Code
                      </label>
                      {/* <Select
                        className="w-full"
                        options={branchCodes.map((code) => ({
                          value: code.blist_id,
                          label: code.Branch?.b_code.toUpperCase(),
                        }))}
                        value={
                          selectedCode
                            ? selectedCode.label
                            : {
                                value: showUserData?.Branch?.blist_id,
                                label: showUserData?.Branch?.b_code,
                              }
                        }
                        onChange={handleBranchCodeChange}
                      /> */}
                      <Select
                        closeMenuOnSelect={true}
                        components={animatedComponents}
                        value={selectedCode.map(code => ({
                          value: code,
                          label: options.find(option => option.value === code)?.label
                        }))}
                        isMulti
                        options={options}
                        onChange={(selectedOptions) => setSelectedCode(selectedOptions.map(option => option.value))}
                        required
                      />
                    </div>
                  </div>
                  {/* Column 3 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="user_role"
                        className="mb-1 block text-sm  text-gray-900 "
                      >
                        User Role
                      </label>
                      {/* Add your dropdown element here */}
                      <Select
                        className="w-full"
                        options={userRoles.map((role) => ({
                          value: role.user_role_id,
                          label: role.role_name,
                        }))}
                        value={
                          selectedRole
                            ? selectedRole.label
                            : {
                                value: showUserData?.UserRole?.user_role_id,
                                label: showUserData?.UserRole?.role_name,
                              }
                        }
                        onChange={handleUserRoleChange}
                      />
                    </div>
                  </div>
                   {/* Column 2 */}
                 <div className="w-full md:w-1/2 p-2">
                        <div className=' p-2 w-full'>
                        <label htmlFor="new_password" className="block text-gray-900 mb-1  text-sm ">New Password</label>
                            <input
                                type="password"
                                name="new_password"
                                className="w-full border border-gray-500 rounded-md py-1 px-2 text-gray-900 focus:outline-none focus:shadow-outline text-sm"
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                            />  
                        </div>
                    </div>
                     {/* Column 1 */}
                     <div className="w-full md:w-1/2 p-2">
                    <div className='p-2 w-full'>
                        <label htmlFor="username" className="block text-gray-900 mb-1 text-sm">Confirm Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                className="w-full border border-gray-500 rounded-md py-1 px-2 text-gray-900 focus:outline-none focus:shadow-outline text-sm"
                                value={confirmPass}
                                onChange={(e) => setConfirmPass(e.target.value)}
                                                        
                                />
                        </div>
                    </div>
                </div> 

                
              </div>
              <div className="flex w-full justify-end p-2 sm:w-full md:w-full lg:w-full xl:w-full">
                <button
                  type="button"
                  className={`flex flex-col rounded-md bg-blue-500 px-4 py-1 font-medium text-white hover:bg-blue-600 ${
                    isLoading ? "pointer-events-none opacity-50" : ""
                  }`}
                  onClick={handleSaveChanges}
                 
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </CardBody>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
