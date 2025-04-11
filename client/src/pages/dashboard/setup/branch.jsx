import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
  } from "@material-tailwind/react";
   import { ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon, EyeIcon,TrashIcon, PencilIcon} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import axios from "@/api/axios";
import AddBranchModal from "@/modal/addbranch";
import ViewBranchModal from '@/modal/viewbranch'; 
import EditBranchModal from "@/modal/editbranch";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Select, Option } from "@material-tailwind/react";
import { toast, ToastContainer } from "react-toastify";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";


  
export function Setupbranch() {

const[branches, setBranches]=useState([]);
const [isLoading, setIsLoading] = useState(true);
const [cardsData, setCardsData] = useState();
const [searchValue, setSearchValue] = useState('');
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(20);
const [totalRecords, setTotalRecords] = useState(0);
//Add branch Modal
const [isModalOpen, setIsModalOpen] = useState(false);
//View Modal
const [isViewModalOpen, setIsViewModalOpen] = useState(false);
const[showBranchIdToView, setShowBranchIdToView]=useState(null);
//Edit Branch Modal
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const[showBranchIdToEdit, setShowBranchIdToEdit]=useState(null);
const [sortBy, setSortBy] = useState(null);
const [sortDirection, setSortDirection] = useState('asc');

let queryParams = `page=${page}&limit=${limit}&search=${searchValue}`;


useEffect(() => {
  const fetchBranches = async () => {
    try {
      const response = await axios.get(`/getAllBranchesTable?${queryParams}`);
      setBranches(response.data.rows);
      setTotalRecords(response.data.count);
      setIsLoading(true);
    } catch (error) {
      console.error('Error fetching branch:', error);
    } finally {
      setIsLoading(false);
    }
  };
  fetchBranches();
}, [searchValue, page, limit, isEditModalOpen, isModalOpen]);

  const isPreviousDisabled = page === 1;
  const isNextDisabled = page * limit >= totalRecords;



const closeModal = () => {
  setIsModalOpen(false);
};

const closeAddModal = () => {
  setIsModalOpen(false);
  toast.success('Branch added successfully.');
};


const handleViewBranchClick = (branchID) => {
  setIsViewModalOpen(true);
  setShowBranchIdToView(branchID);
};

const closeViewModal = () => {
  setIsViewModalOpen(false);
};


const handleEditBranchClick =(branchID) =>{
  setIsEditModalOpen(true);
  setShowBranchIdToEdit(branchID);
}

const closeEditModal = () => {
  setIsEditModalOpen(false);
  toast.success("Changes saved successfully.");
};

const closeModalEdit = () => {
  setIsEditModalOpen(false);
};

//Delete Branch
const handleDeleteClick = async (branchID) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Confirm Deletion',
    text: `Do you wish to delete this Branch?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
  });

  if (isConfirmed) {
    try {
      // Send a DELETE request to delete the branch
      const DEL_URL = `/deleteBranch/${branchID}`;
      await axios.delete(DEL_URL);

      // Fetch the updated list of branches and set it in the state
      const response = await axios.get(`/getAllBranchesTable?${queryParams}`);
      setBranches(response.data.rows);
      setTotalRecords(response.data.count);

      // Show a success message
      Swal.fire({
        icon: 'success',
        title: 'Branch deleted successfully!',
      });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Handle conflict case (branch cannot be deleted)
        Swal.fire({
          icon: 'error',
          title: 'Conflict!',
          text: 'This branch cannot be deleted due to dependencies.',
        });
      } else {
        // Handle other errors
        console.error('Error deleting branch:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'An error occurred while deleting the branch.',
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
    
  const sortedBranches = [...branches].sort((a, b) => {
    const bcodeA = a.Branch?.b_code.toLowerCase();
    const bcodeB = b.Branch?.b_code.toLowerCase();
    const typeA = a.Branch?.category.toLowerCase();
    const typeB = b.Branch?.category.toLowerCase();
    const addressA = a.b_address.toLowerCase();
    const addressB = b.b_address.toLowerCase();
    
    if (sortBy !== null) {
      if (sortBy.toLowerCase() === 'branch') {
        if (sortDirection === 'asc') {
          return bcodeA.localeCompare(bcodeB);
        } else {
          return bcodeB.localeCompare(bcodeA);
        }
      } else if (sortBy.toLowerCase() === 'type') {
        if (sortDirection === 'asc') {
          return typeA.localeCompare(typeB);
        } else {
          return typeB.localeCompare(typeA);
        }
      } else {
        if (sortDirection === 'asc') {
          return addressA.localeCompare(addressB);
        } else {
          return addressB.localeCompare(addressA);
        }
      }
    }
  });

    return (
      <div className="mt-12 mb-8 flex flex-col gap-12">
      <div className="px-2">
        <Button className="flex items-center gap-1 py-2 px-3 bg-blue-500" onClick={() => setIsModalOpen(true)}>
          <PlusCircleIcon className="w-5" />
          Add Branch
        </Button>
      </div>
      {/* Rest of your components */}
      {isModalOpen && (
        <AddBranchModal isOpen={isModalOpen} onClose={closeAddModal} onCloseModal={closeModal} />
      )}

        <Card className="-mt-9">
          <CardBody className="px-0 pt-0 pb-2">
            <Typography variant="h6" color="gray" className ="ml-4 pb-2 pt-2">
              Filter
            </Typography>
          <div className="py-2 px-5 static">
            <div className="inline-block ... py-2 px-2">
            <input
              type="text"
              id="branchCode"
              name="branchCode"
              className="border rounded py-2 px-2 w-[400px]"
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
              Branch List
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
                  {["ID", "Branch", "Type", "Addess", "Contact", "Action"].map((el) => (
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
                  <td colSpan="8" className="py-3 px-5 border-b border-blue-gray-50 loading">
                    &nbsp;
                  </td>
                </tr>
                ) : sortedBranches === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-3 px-5 border-b border-blue-gray-50">
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        <center><b>No record found! ...</b></center>
                      </Typography>
                    </td>
                  </tr>
                  ) : (
                sortedBranches.map(
                  (item, key) => {
                    const className = `py-3 px-5 ${
                      key === sortedBranches.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr className="hover:bg-gray-100" key={key}>
                      <td className={className}>
                          <div className="flex items-center gap-4">
                            <div>
                              <Typography className="text-xs font-normal text-blue-gray-500">
                                {startNumber + key}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {item.Branch?.b_name}
                          </Typography>
                          <Typography className="text-xs font-bold text-blue-gray-600">
                            {item.Branch?.b_code.toUpperCase()} 
                          </Typography>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item.Branch?.category} 
                          </Typography>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item.b_address}
                          </Typography>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item.b_email}
                          </Typography>
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item.b_contact}
                          </Typography>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                      <div className="flex items-center gap-2">
                        {/* <button
                          className="text-black hover:nounderline"
                          onClick={() => handleViewBranchClick(item.blist_id)}
                        >
                          <EyeIcon className="w-4 h-4 text-blue-500" title="View"/>
                        </button> */}
                        <button
                          className="text-black hover:nounderline p-1 transition-transform transform-gpu hover:scale-150"
                          onClick={() =>handleEditBranchClick(item.blist_id)}
                        >
                          <PencilIcon className="w-4 h-4 text-green-500 p-1" title="Edit" />
                        </button>
                        <button
                          className="text-black hover:nounderline p-1 transition-transform transform-gpu hover:scale-150"
                          onClick={() => handleDeleteClick(item.blist_id)}
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" title="Delete?" />
                        </button>
                      </div>
                    </td>
                      </tr>
                    );
                  }
                  )
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
              <ViewBranchModal isOpen={isViewModalOpen} onClose={closeViewModal} branchIdToView={showBranchIdToView}/>
            )}

        {isEditModalOpen && (
              <EditBranchModal isOpen={isEditModalOpen} onClose={closeEditModal} branchIdToEdit={showBranchIdToEdit} onCloseModal={closeModalEdit} />
            )}
              
      </div>
    );
  }
  export default Setupbranch;
  