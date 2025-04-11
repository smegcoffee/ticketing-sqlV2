import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import axios from "@/api/axios";
import AddUserModal from "@/modal/adduser";
import ViewUserModal from "@/modal/viewuser";
import EditUserModal from "@/modal/edituser";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { toast, ToastContainer } from "react-toastify";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

export function SetupUser() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cardsData, setCardsData] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  //Add New User
  const [isModalOpen, setIsModalOpen] = useState(false);
  //Edit uSER Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showUserIdToEdit, setShowUserIdToEdit] = useState(null);
  //View User
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showUserIdToView, setShowUserIdToView] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  let queryParams = `page=${page}&limit=${limit}&search=${searchValue}`;

  const updateUsers = (newUser) => {
    // Replace the existing branches array with the updated data
    setUsers(newUser); 
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/getAllUsersTable?${queryParams}`);
        setUsers(response.data.rows);
        setTotalRecords(response.data.count);
        setIsLoading(true);
      } catch (error) {
        console.log("Error fetching user", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [searchValue, page, limit, isModalOpen, isEditModalOpen]);

  const isPreviousDisabled = page === 1;
  const isNextDisabled = page * limit >= totalRecords;

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeAddModal = () => {
    setIsModalOpen(false);
    toast.success("User added successfully");
  };


  const handleViewUserClick = (categoryID) => {
    setIsViewModalOpen(true);

    setShowUserIdToView(categoryID);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
  };


  const handleEditUserClick = (categoryID) => {
    setIsEditModalOpen(true);
    setShowUserIdToEdit(categoryID);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    toast.success("User changes saved successfully");
  };

  const closedEditModal = () => {
    setIsEditModalOpen(false);
  };

  //Delete User
  const handleDeleteClick = async (userID) => {
    const { isConfirmed } = await Swal.fire({
      title: "Confirm Deletion",
      text: `Do you wish to delete this User?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (isConfirmed) {
      try {
        // Send a DELETE request to delete the branch
        const DEL_URL = `/deleteUser/${userID}`;
        await axios.delete(DEL_URL);

        // Fetch the updated list of branches and set it in the state
        const response = await axios.get(`/getAllUsersTable?${queryParams}`);
        setUsers(response.data.rows);
        setTotalRecords(response.data.count);

        // Show a success message
        Swal.fire({
          icon: "success",
          title: "User deleted successfully!",
          confirmButtonColor: "#3085d6",
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Handle conflict case (branch cannot be deleted)
          Swal.fire({
            icon: "error",
            title: "Conflict!",
            text: "This User cannot be deleted due to dependencies.",
          });
        } else {
          // Handle other errors
          console.error("Error deleting branch:", error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "An error occurred while deleting the User.",
          });
        }
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    setPage(1);
  };

  // Handle pagination controls
  const handlePageChange = (newPage) => {
    setPage(newPage);
    setIsLoading(true);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    setIsLoading(true);
  };

  const startNumber = (page - 1) * limit + 1;

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
    
  const sortedUser = [...users].sort((a, b) => {
    const fullNameA = a.UserDetails?.fname.toLowerCase() + " " + a.UserDetails?.lname.toLowerCase();
    const fullNameB = b.UserDetails?.fname.toLowerCase() + " " + b.UserDetails?.lname.toLowerCase();
    const branchCodeA = a.Branch?.b_code.toLowerCase();
    const branchCodeB = b.Branch?.b_code.toLowerCase();
    const emailA = a.UserDetails?.user_email.toLowerCase();
    const emailB = b.UserDetails?.user_email.toLowerCase();
    const roleA = a.UserRole?.role_name.toLowerCase();
    const roleB = b.UserRole?.role_name.toLowerCase();
    
    if (sortBy !== null) {
      if (sortBy.toLowerCase() === 'fullname') {
        if (sortDirection === 'asc') {
          return fullNameA.localeCompare(fullNameB);
        } else {
          return fullNameB.localeCompare(fullNameA);
        }
      } else if (sortBy.toLowerCase() === 'branch code') {
        if (sortDirection === 'asc') {
          return branchCodeA.localeCompare(branchCodeB);
        } else {
          return branchCodeB.localeCompare(branchCodeA);
        }
      } else if (sortBy.toLowerCase() === 'email') {
        if (sortDirection === 'asc') {
          return emailA.localeCompare(emailB);
        } else {
          return emailB.localeCompare(emailA);
        }
      } else {
        if (sortDirection === 'asc') {
          return roleA.localeCompare(roleB);
        } else {
          return roleB.localeCompare(roleA);
        }
      }
    }
  });

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <div className="-mb-8 py-2 px-2">
        <Button
          className="flex items-center gap-1 bg-blue-500 py-2 px-3"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5" />
          Add User
        </Button>
      </div>
      {/* Rest of your components */}
      {isModalOpen && (
        <AddUserModal
          updateUsers={updateUsers}
          isOpen={isModalOpen}
          onClose={closeAddModal}
          onCloseModal={closeModal}
        />
      )}
      <Card className="">
        <CardBody className="px-0 pt-0 pb-2">
          <Typography variant="h6" color="gray" className="ml-4 pb-2 pt-3">
            Filter
          </Typography>
          <div className="static py-2 px-5">
            <div className="... inline-block py-2 px-2">
              <input
                type="text"
                id="branchCode"
                name="branchCode"
                className="w-[400px] rounded border py-2 px-2"
                placeholder="Search...."
                value={searchValue}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-6 p-3">
          <Typography variant="h6" color="white">
            User List
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {/* Pagination and Limit Controls */}
          <div className="pagination-controls mb-5 w-60 ml-5">
            Show
            <select
              className="ml-4 mb-1 rounded-lg py-2 px-3 text-sm border border-black"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
            >
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              {/* Add more options as needed */}
            </select>
          </div>
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "ID",
                  "Fullname",
                  "Branch Code",
                  "Email",
                  "Role",
                  "Contact",
                  "Action",
                ].map((el) => (
                  <th
                  key={el}
                  className={`border-b border-blue-gray-50 py-3 px-5 text-left cursor-pointer ${
                    el === "ID" || el === "Action" || el === "Contact" ? "cursor-default" : "hover:bg-gray-200"
                  }`}
                  onClick={el !== "ID" && el !== "Action" && el !== "Contact" ? () => handleSort(el) : undefined}
                >
                  <div className="flex items-center">
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase"
                    >
                      {el}
                    </Typography>
                    {sortBy === el && (
                      sortDirection === "asc" ? (
                        <ArrowUpIcon className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                      )
                    )}
                  </div>
                </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="loading">
                  <td
                    colSpan="8"
                    className="loading border-b border-blue-gray-50 py-3 px-5"
                  >
                    &nbsp;
                  </td>
                </tr>
              ) : sortedUser.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="border-b border-blue-gray-50 py-3 px-5"
                  >
                    <Typography className="text-xs font-normal text-blue-gray-500">
                      <center>
                        <b>No record found! ...</b>
                      </center>
                    </Typography>
                  </td>
                </tr>
              ) : (
                sortedUser.map((item, key) => {
                  return (
                    <tr className="hover:bg-gray-100" key={key}>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <div className="flex items-center gap-4">
                          <div>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {startNumber + key}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {item.UserDetails?.fname} {item.UserDetails?.lname}
                        </Typography>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {item.branches.map((branch, index) => (
                            <span key={index}>{branch.toUpperCase()}{index !== item.branches.length - 1 && ', '}</span>
                          ))}
                        </Typography>
                      </td> 
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {item.UserDetails.user_email}
                        </Typography>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {item.UserRole.role_name}
                        </Typography>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {item.UserDetails.user_contact}
                        </Typography>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <div className="flex items-center gap-2">
                          <button
                            className="hover:nounderline text-black transition-transform transform-gpu hover:scale-150"
                            onClick={() => handleViewUserClick(item.login_id)}
                          >
                            <EyeIcon
                              className="h-4 w-4 text-blue-500"
                              title="View"
                            />
                          </button>
                          <button
                            className="hover:nounderline p-1 text-black transition-transform transform-gpu hover:scale-150"
                            onClick={() => handleEditUserClick(item.login_id)}
                          >
                            <PencilIcon
                              className="h-4 w-4 p-1 text-green-500"
                              title="Edit"
                            />
                          </button>
                          <button
                            className="hover:nounderline p-1 text-black transition-transform transform-gpu hover:scale-150"
                            onClick={() => handleDeleteClick(item.login_id)}
                          >
                            <TrashIcon
                              className="h-4 w-4 text-red-500"
                              title="Delete?"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="mt-2 flex items-center justify-end">
            <button
              style={isPreviousDisabled ? { opacity: 0.5 } : {}}
              className="ml-4 rounded-md p-1"
              onClick={() => setPage(page - 1)}
              disabled={isPreviousDisabled}
            >
              <ChevronLeftIcon className="h-5 w-5 text-blue-500" />
            </button>

            <span className="ml-2 mr-2 text-xs">Page</span>

            <select
              className="mr-2 rounded-md p-1 text-xs"
              value={page}
              onChange={(e) => handlePageChange(parseInt(e.target.value))}
              disabled={totalRecords === 0}
            >
              {[...Array(Math.ceil(totalRecords / limit)).keys()].map((pageNum) => (
                <option key={pageNum + 1} value={pageNum + 1}>
                  {pageNum + 1}
                </option>
              ))}
            </select>
            <span className="text-xs">of {Math.ceil(totalRecords / limit)}</span>

            <button
              style={isNextDisabled ? { opacity: 0.5 } : {}}
              className="ml-2 rounded-md p-1"
              onClick={() => setPage(page + 1)}
              disabled={isNextDisabled}
            >
              <ChevronRightIcon className="h-5 w-5 text-blue-500" />
            </button>
            <ToastContainer/>
          </div>
        </CardBody>
      </Card>
      {isViewModalOpen && (
        <ViewUserModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          userIdToView={showUserIdToView}
        />
      )}
      {isEditModalOpen && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          close={closedEditModal}
          userIdToEdit={showUserIdToEdit}
          updateUsers={updateUsers}
        />
      )}
    </div>
  );
}

export default SetupUser;
