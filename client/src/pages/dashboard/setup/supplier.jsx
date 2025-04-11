import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Select,
    Option,
    Button,
  } from "@material-tailwind/react";
   import { ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon, EyeIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
   import { useEffect, useState } from "react";
   import axios from "@/api/axios";
   import AddSupplierModal from "@/modal/addsupplier";
   import ViewSupplierModal from "@/modal/viewsupplier";
   import EditSupplierModal from "@/modal/editsupplier";
   import Swal from 'sweetalert2';
   import 'sweetalert2/dist/sweetalert2.min.css';
   import { toast, ToastContainer } from "react-toastify";
   import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

  export function SetupSupplier() {

    const [supplier, setSupplier]=useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cardsData, setCardsData] = useState();
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    //Add Category
    const [isModalOpen, setIsModalOpen] = useState(false);
    //View Category
    const [isViewSupplierOpen, setIsViewSupplierOpen]=useState(false);
    const [showSupplierIdToView, setShowSupplierIdToView]=useState(null);
    //Edit Category
    const [isEditSupplierOpen, setIsEditSupplierOpen]=useState(false);
    const [showSupplierIdToEdit, setShowSupplierIdToEdit] = useState(null);
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    
    let queryParams = `page=${page}&limit=${limit}&search=${searchValue}`;
   
    useEffect(() =>{
      const fetchSupplier = async () =>{
        try{
          const response = await axios.get(`/getAllSupplierTable?${queryParams}`);
          setSupplier(response.data.rows);
          setTotalRecords(response.data.count);
          setIsLoading(true);
        }catch (error){
          console.log('Error fetching categories:', error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchSupplier();
    }, [searchValue, page, limit, isEditSupplierOpen, isModalOpen]);

    const isPreviousDisabled = page === 1;
    const isNextDisabled = page * limit >= totalRecords;

    //Add Category Modal

const closeModal = () => {
  setIsModalOpen(false);
};

const closeAddModal = () => {
  setIsModalOpen(false);
  toast.success('Supplier added successfully.');
};


const handleViewCategoryClick = (supplierID) =>{
  setIsViewSupplierOpen(true);
  setShowSupplierIdToView(supplierID);
}
const closeViewModal = () => {
  setIsViewSupplierOpen(false);
}


const handleEditCategoryClick = (supplierID) =>{
  setIsEditSupplierOpen(true);
  setShowSupplierIdToEdit(supplierID);
}

const closeEditModal = () =>{
  setIsEditSupplierOpen(false);
  toast.success("Changes saved successfully");
}

const closeEditModalX = () =>{
  setIsEditSupplierOpen(false);
}

//Delete Branch
const handleDeleteClick = async (supplierID) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Confirm Deletion',
    text: `Do you wish to delete this Supplier?`,
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
      const DEL_URL = `/deleteSupplier/${supplierID}`;
      await axios.delete(DEL_URL);

      // Fetch the updated list of branches and set it in the state
      const response = await axios.get(`/getAllSupplierTable?${queryParams}`);
      setSupplier(response.data.rows);
      setTotalRecords(response.data.count);

      // Show a success message
      Swal.fire({
        icon: 'success',
        title: 'Supplier deleted successfully!',
      });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Handle conflict case (branch cannot be deleted)
        Swal.fire({
          icon: 'error',
          title: 'Conflict!',
          text: 'This Supplier cannot be deleted due to dependencies.',
        });
      } else {
        // Handle other errors
        console.error('Error deleting supplier:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'An error occurred while deleting the supplier.',
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
    
  const sortedSupplier = [...supplier].sort((a, b) => {
    const supplierA = a.supplier.toLowerCase();
    const supplierB = b.supplier.toLowerCase();
    
    if (sortBy !== null) {
      if (sortBy.toLowerCase() === 'supplier') {
        if (sortDirection === 'asc') {
          return supplierA.localeCompare(supplierB);
        } else {
          return supplierB.localeCompare(supplierA);
        }
      }
    }
  });

    return (
      <div className="mt-12 flex flex-col gap-12">
         <div className="px-2 -mt-5">
              <Button className="flex items-center gap-1 py-2 px-3 bg-blue-500" onClick={() => setIsModalOpen(true)}>
              <PlusCircleIcon className="w-5" />
                Add Supplier
              </Button>
            </div>
            {isModalOpen && (
                <AddSupplierModal isOpen={isModalOpen} onClose={closeAddModal} onCloseModal={closeModal}/>
              )}
        <Card className="-mt-7">
          <CardBody className="px-0 pt-0 pb-2">
          <Typography variant="h6" color="gray" className="ml-4 pb-2 pt-2">
            Filter
          </Typography>
          <div className="py-2 px-5 static">
            <div className="inline-block ... py-2 px-2">
            <input
              type="text"
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
          <CardHeader variant="gradient" color="blue" className="mb-8 p-3">
            <Typography variant="h6" color="white">
              Supplier List
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
                  {["ID", "Supplier", "Action"].map((el) => (
                    <th
                    key={el}
                    className={`border-b border-blue-gray-50 py-3 px-5 text-left cursor-pointer ${
                      el === "ID" || el === "Action" ? "cursor-default" : "hover:bg-gray-200"
                    }`}
                    onClick={el !== "ID" && el !== "Action" ? () => handleSort(el) : undefined}
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
                ) : sortedSupplier.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-3 px-5 border-b border-blue-gray-50">
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        <center><b>No record found! ...</b></center>
                      </Typography>
                    </td>
                  </tr>
                  ) : (
                sortedSupplier.map(
                  (item, index) => {
                    const className = `py-3 px-5 ${
                      index === sortedSupplier.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;
  
                    return (
                      <tr className="hover:bg-gray-100">
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <div>
                              <Typography className="text-xs font-normal text-blue-gray-500">
                                {startNumber + index}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {item.supplier}
                          </Typography>
                        </td>
                        <td className={className}>
                        <div className="flex items-center gap-2">
                        {/* <button
                          className="text-black hover:nounderline"
                          onClick={() => handleViewCategoryClick(item.id)}
                        >
                         <EyeIcon className="w-4 h-4 text-blue-500" title="View"/>
                        </button> */}
                        <button
                          className="text-black hover:nounderline p-1 transition-transform transform-gpu hover:scale-150"
                          onClick={() =>handleEditCategoryClick(item.id)}
                        >
                           <PencilIcon className="w-4 h-4 text-green-500 p-1" title="Edit" />
                        </button>
                        <button
                          className="text-black hover:nounderline p-1 transition-transform transform-gpu hover:scale-150"
                          onClick={() => handleDeleteClick(item.id)}
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
        {isViewSupplierOpen && (
            <ViewSupplierModal isOpen={isViewSupplierOpen} onClose={closeViewModal} supplierID={showSupplierIdToView}/>
        )}
         {isEditSupplierOpen && (
            <EditSupplierModal isOpen={isEditSupplierOpen} onClose={closeEditModal} onCloseModal={closeEditModalX} supplierID={showSupplierIdToEdit}/>
        )}
      </div>
    );
  }
  
  export default SetupSupplier;
  