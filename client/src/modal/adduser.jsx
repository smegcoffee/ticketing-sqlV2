import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

// Constants
const ADD_URL = "/register";

function AddUserModal({ isOpen, onClose, updateUsers, onCloseModal }) {
  if (!isOpen) return null;

  const initialUserState = {
    firstname: "",
    lastname: "",
    contact: "",
    email: "",
    username: "",
    password: "",
    user_role: "",
    branch_code: "",
  };

  const [newUser, setNewUser] = useState(initialUserState);
  const [loading, setLoading] = useState(false);
  //Dropdown
  const [userRoles, setUserRoles] = useState([]);
  const [branchCodes, setBranchCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleAddUserSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      newUser.branch_code = selectedCode;
      newUser.user_role = selectedRole;
      await axios.post(ADD_URL, newUser);
      
      // Reset the form
      setNewUser(initialUserState);
      
      // Fetch the updated user list
      // const userResponse = await axios.get("/getAllUsers");
      
      // updateUsers(userResponse.data);
      
      onClose();
    } catch (error) {
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
      setLoading(false); // Set loading state to false after the operation is complete
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewUser((prevNewUser) => ({
      ...prevNewUser,
      [name]: value,
    }));
  };

  //Function to Get branch and roles
  useEffect(() => {
    const fetchBranchCode = async () => {
      try {
        const response = await axios.get("/getAllBranches");
        setBranchCodes(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchUserRole = async () => {
      try {
        const response = await axios.get("/getAllRoles");

        setUserRoles(response.data);
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    };

    fetchBranchCode();
    fetchUserRole();
  }, []);

  //FUnction for change
  const handleUserRoleChange = (selectedOption) => {
    setSelectedRole(selectedOption.value);
  };

  const handleBranchCodeChange = (selectedOption) => {
    setSelectedCode(selectedOption.value);
  };

  return (
    <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black opacity-75 "></div>
      <div className="shadow-sky-200 relative z-10 h-[auto] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
          <Typography variant="h6" color="white">
            Add New User
          </Typography>
        </CardHeader>

        {/* Close modal button */}
        <button
          className="absolute top-2 right-2 mt-6 rounded px-2 py-1 text-black"
          onClick={onCloseModal}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <div className="h-[90%] p-2">
          <CardBody>
            <form
              onSubmit={handleAddUserSubmit}
              className="m-auto flex flex-wrap justify-between text-sm"
            >
              <div className="w-full">
                <div className="-mx-2 flex flex-wrap border-x-2 border-y-2 p-2">
                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="firstname"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstname"
                        className="focus:shadow-outline w-full rounded-md border  border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none "
                        value={newUser.firstname || ""}
                        onChange={handleChange}
                        placeholder="Firstname"
                        required
                      />
                    </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="lastname"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Last Name{" "}
                      </label>
                      <input
                        type="text"
                        name="lastname"
                        className="focus:shadow-outline w-full rounded-md border  border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none "
                        value={newUser.lastname || ""}
                        onChange={handleChange}
                        placeholder="Lastname"
                        required
                      />
                    </div>
                  </div>
                  {/* Column 1 */}
                  <div className="md:w-1/1 w-full p-2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="email"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="focus:shadow-outline w-full rounded-md border  border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none "
                        value={newUser.email || ""}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="w-full p-2 md:w-1/3">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="contact"
                        className="mb-1 block text-sm  text-gray-900 "
                      >
                        Contact
                      </label>
                      <input
                        type="tel"
                        name="contact"
                        className="focus:shadow-outline w-full rounded-md border  border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none "
                        value={newUser.contact || ""}
                        onChange={handleChange}
                        placeholder="Contact"
                      />
                    </div>
                  </div>
                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/3">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="branch_code"
                        className="mb-1 block text-sm text-gray-900 "
                      >
                        Branch Code
                      </label>
                      <Select
                        className="w-full"
                        options={branchCodes.map((code) => ({
                          value: code.blist_id,
                          label: code.Branch?.b_code,
                        }))}
                        placeholder="Select Branch Code"
                        value={selectedCode ? selectedCode.label : ""}
                        onChange={handleBranchCodeChange}
                      />
                    </div>
                  </div>
                  {/* Column 3 */}
                  <div className="w-full p-2 md:w-1/3">
                    <div className="w-full p-2">
                      <label
                        htmlFor="user_role"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        {selectedRole === "Area Manager" ? "CAS" : "User Role"}
                      </label>
                      <Select
                        className="w-full"
                        options={userRoles.map((role) => ({
                          value: role.user_role_id,
                          label: role.role_name,
                        }))}
                        placeholder="Select User Role"
                        value={selectedRole ? selectedRole.label : ""}
                        onChange={handleUserRoleChange}
                      />
                    </div>
                  </div>

                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/2">
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
                        className="focus:shadow-outline w-full rounded-md border  border-gray-500 py-1 px-2 text-sm text-gray-900 focus:outline-none"
                        value={newUser.username || ""}
                        onChange={handleChange}
                        placeholder="Username"
                        required
                      />
                    </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="password"
                        className="mb-1 block text-sm  text-gray-900 "
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="focus:shadow-outline w-full rounded-md border  border-gray-500 py-1 px-2 text-sm text-gray-700 focus:outline-none "
                        value={newUser.password || ""}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-end p-5 text-sm sm:w-full md:w-full lg:w-full xl:w-full ">
                <button
                  type="submit"
                  className={`flex flex-col rounded-md bg-blue-500 px-4 py-1 font-medium text-white hover:bg-blue-600  ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add"}
                </button>
                <ToastContainer />
              </div>
            </form>
          </CardBody>
        </div>
      </div>
    </div>
  );
}

export default AddUserModal;
