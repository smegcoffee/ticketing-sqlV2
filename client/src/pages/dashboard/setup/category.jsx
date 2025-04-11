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
   import AddCategoryModal from "@/modal/addcategory";
   import ViewCategoryModal from "@/modal/viewcategory";
   import EditCategoryModal from "@/modal/editcategory";
   import Swal from 'sweetalert2';
   import 'sweetalert2/dist/sweetalert2.min.css';
   import { toast, ToastContainer } from "react-toastify";
   import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

  export function SetupCategory() {

    const [categories, setCategories]=useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cardsData, setCardsData] = useState();
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);
    //Add Category
    const [isModalOpen, setIsModalOpen] = useState(false);
    //View Category
    const [isViewCategoryOpen, setIsViewCategoryOpen]=useState(false);
    const [showCategoryIdToView, setShowCategoryIdToView]=useState(null);
    //Edit Category
    const [isEditCategoryOpen, setIsEditCategoryOpen]=useState(false);
    const [showCategoryIdToEdit, setShowCategoryIdToEdit] = useState(null);
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    
    let queryParams = `page=${page}&limit=${limit}&search=${searchValue}`;
   
    useEffect(() =>{
      const fetchCategories = async () =>{
        try{
          const response = await axios.get(`/getAllCategoriesTable?${queryParams}`);
          setCategories(response.data.rows);
          setTotalRecords(response.data.count);
          setIsLoading(true);
        }catch (error){
          console.log('Error fetching categories:', error);
        } finally {
          setIsLoading(false);
        }
      }
        fetchCategories();
    }, [searchValue, page, limit, isEditCategoryOpen, isModalOpen]);

    const isPreviousDisabled = page === 1;
    const isNextDisabled = page * limit >= totalRecords;

    //Add Category Modal

const closeModal = () => {
  setIsModalOpen(false);
};

const closeAddModal = () => {
  setIsModalOpen(false);
  toast.success('Category added successfully.');
};


const handleViewCategoryClick = (categoryID) =>{
  setIsViewCategoryOpen(true);
  setShowCategoryIdToView(categoryID);
}
const closeViewModal = () => {
  setIsViewCategoryOpen(false);
}


const handleEditCategoryClick = (categoryID) =>{
  setIsEditCategoryOpen(true);
  setShowCategoryIdToEdit(categoryID);
}

const closeEditModal = () =>{
  setIsEditCategoryOpen(false);
  toast.success("Changes saved successfully");
}

const closeEditModalX = () =>{
  setIsEditCategoryOpen(false);
}

//Delete Branch
const handleDeleteClick = async (categoryID) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Confirm Deletion',
    text: `Do you wish to delete this Category?`,
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
      const DEL_URL = `/deleteCategory/${categoryID}`;
      await axios.delete(DEL_URL);

      // Fetch the updated list of branches and set it in the state
      const response = await axios.get(`/getAllCategoriesTable?${queryParams}`);
      setCategories(response.data.rows);
      setTotalRecords(response.data.count);

      // Show a success message
      Swal.fire({
        icon: 'success',
        title: 'Category deleted successfully!',
      });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Handle conflict case (branch cannot be deleted)
        Swal.fire({
          icon: 'error',
          title: 'Conflict!',
          text: 'This Category cannot be deleted due to dependencies.',
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
    
  const sortedCategories = [...categories].sort((a, b) => {
    const aliasA = a.category_shortcut.toLowerCase();
    const aliasB = b.category_shortcut.toLowerCase();
    const categoryA = a.category_name.toLowerCase();
    const categoryB = b.category_name.toLowerCase();
    const approverA = a.CategoryGroup?.group_code.toLowerCase();
    const approverB = b.CategoryGroup?.group_code.toLowerCase();
    
    if (sortBy !== null) {
      if (sortBy.toLowerCase() === 'alias') {
        if (sortDirection === 'asc') {
          return aliasA.localeCompare(aliasB);
        } else {
          return aliasB.localeCompare(aliasA);
        }
      } else if (sortBy.toLowerCase() === 'category') {
        if (sortDirection === 'asc') {
          return categoryA.localeCompare(categoryB);
        } else {
          return categoryB.localeCompare(categoryA);
        }
      } else {
        if (sortDirection === 'asc') {
          return approverA.localeCompare(approverB);
        } else {
          return approverB.localeCompare(approverA);
        }
      }
    }
  });

    return (
      <div className="mt-12 flex flex-col gap-12">
         <div className="px-2 -mt-5">
              <Button className="flex items-center gap-1 py-2 px-3 bg-blue-500" onClick={() => setIsModalOpen(true)}>
              <PlusCircleIcon className="w-5" />
                Add Category
              </Button>
            </div>
            {isModalOpen && (
                <AddCategoryModal isOpen={isModalOpen} onClose={closeAddModal} onCloseModal={closeModal}/>
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
          <CardHeader variant="gradient" color="blue" className="mb-8 p-3">
            <Typography variant="h6" color="white">
              Category List
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
                  {["ID", "Alias", "Category", "Approver", "Action"].map((el) => (
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
                ) : sortedCategories.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-3 px-5 border-b border-blue-gray-50">
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        <center><b>No record found! ...</b></center>
                      </Typography>
                    </td>
                  </tr>
                  ) : (
                sortedCategories.map(
                  (item, index) => {
                    const className = `py-3 px-5 ${
                      index === sortedCategories.length - 1
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
                            {item.category_shortcut}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item.category_name} 
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item?.CategoryGroup?.group_code} 
                          </Typography>
                        </td>
                        
                        <td className={className}>
                        <div className="flex items-center gap-2">
                        {/* <button
                          className="text-black hover:nounderline"
                          onClick={() => handleViewCategoryClick(item.ticket_category_id)}
                        >
                         <EyeIcon className="w-4 h-4 text-blue-500" title="View"/>
                        </button> */}
                        <button
                          className="text-black hover:nounderline p-1 transition-transform transform-gpu hover:scale-150"
                          onClick={() =>handleEditCategoryClick(item.ticket_category_id)}
                        >
                           <PencilIcon className="w-4 h-4 text-green-500 p-1" title="Edit" />
                        </button>
                        <button
                          className="text-black hover:nounderline p-1 transition-transform transform-gpu hover:scale-150"
                          onClick={() => handleDeleteClick(item.ticket_category_id)}
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
        {isViewCategoryOpen && (
            <ViewCategoryModal isOpen={isViewCategoryOpen} onClose={closeViewModal} categoryIdToView={showCategoryIdToView}/>
        )}
         {isEditCategoryOpen && (
            <EditCategoryModal isOpen={isEditCategoryOpen} onClose={closeEditModal} onCloseModal={closeEditModalX} categoryIdToEdit={showCategoryIdToEdit}/>
        )}                  
      </div>
    );
  }
  
  export default SetupCategory;
  