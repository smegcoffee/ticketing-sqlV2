import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Menu,
    MenuHandler,
    MenuList,
    IconButton,
    MenuItem,
    Input
  } from "@material-tailwind/react";
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon, TrashIcon, PencilIcon, CheckCircleIcon, EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import axios from "@/api/axios";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import * as XLSX from 'xlsx';
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

  export function SetupAccounting() {

    const [accounting, setAccounting]=useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cardsData, setCardsData] = useState();
    const animatedComponents = makeAnimated();
    const [accountingValue, setAccountingValue] = useState(null);
    const [categoryValue, setBranchesValue] = useState([]);
    const [showButton, setShowButton] = useState(false);
    const [blist, setBlist] = useState([]);
    const [bInlist, setInBlist] = useState([]);
    const [data, setData] = useState([]);
    const [shouldTriggerApiCall, setShouldTriggerApiCall] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [category, setCategory] = useState([]);
    const [sortBy, setSortBy] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');


    const optionAccounting = accounting.map((item) => ({
        value: item.login_id,
        label: item.UserDetails.fname + ' ' + item.UserDetails.lname
      }));
     
      const optionBranch = blist.map((item) => ({
        value: item.id,
        label: item.group_code
      }));

      const handleAccountingChange = (value) => {
        setAccountingValue(value);
        checkIfAllSelectsHaveValue(value, categoryValue);
      };
    
      const handleBranchesChange = (value) => {
        setBranchesValue(value);
        checkIfAllSelectsHaveValue(accountingValue, value);
      };

      const checkIfAllSelectsHaveValue = (accounting, branches) => {
        const allSelectsHaveValue = !!accounting && branches.length > 0;
        setShowButton(allSelectsHaveValue);
      };


      const handleSaveAssign = async () => {

          const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, save it!",
          }).then(async(result) => {
            if (result.isConfirmed) {
              setShouldTriggerApiCall(true);
              try{
              Swal.fire({
                title: "Configuration Saved",
                html: `Assigning Category To <strong> Accounting ${accountingValue.label} </strong> Updated Successfully.`,
                icon: "success",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Done!",
              });
                await axios.post("/assignedAccounting", {
                  accountingID: accountingValue.value,
                  categoryID: categoryValue.map((category) => category.value),
                });
                const results = await axios.get('/getAssignedCategory');
                setInBlist(results.data);
                const response = await axios.get('/getAllCategoryGroup');
                setBlist(response.data);
                setAccountingValue(null);
                setBranchesValue([]);
                setShowButton(false)
              }catch (error) {
                if (error.response && error.response.status === 400) {
                  Swal.fire({
                      title: "Error",
                      text: "The request was invalid. Category already declared.",
                      icon: "error",
                      confirmButtonColor: "#d33",
                      confirmButtonText: "CLOSE",
                  });
                  } else {
                      console.error("An error occurred:", error);
                      // Handle other types of errors if needed
                  }
              }
            }
          })
      };
  
   
    useEffect(() =>{
      if (shouldTriggerApiCall) {
      const fetchAccounting = async () =>{
        try{
          const response = await axios.get('/getAllAccounting');
          const res = await axios.get('/getAssignedCategory');
          setAccounting(response.data);
          setIsLoading(true);
        }catch (error){ 
          console.log('Error fetching categories:', error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchAccounting();
    }else{
      const fetchAccounting = async () =>{
        try{
          const response = await axios.get('/getAllAccounting');
          setAccounting(response.data);
          setIsLoading(true);
        }catch (error){ 
          console.log('Error fetching categories:', error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchAccounting();
    }
    }, [shouldTriggerApiCall]);
    
    useEffect(() =>{
      const fetchInBList = async () =>{
        try{ 
          const response = await axios.get('/getAssignedCategory');
          setInBlist(response.data);
        }catch (error){ 
          console.log('Error fetching categories:', error);
        }
      }
      fetchInBList();
    }, []);

    useEffect(() =>{
        const fetchBList = async () =>{
          try{
            const response = await axios.get('/getAllCategoryGroup');
            setBlist(response.data);
            const res = await axios.get('/getAssignedCategory');
   
          }catch (error){ 
            console.log('Error fetching categories:', error);
          }
        }
        fetchBList();
      }, []);
      

// Update the data state with the table data when reports change
useEffect(() => {
  // Convert your reports data into the desired structure
  const formattedData = accounting.map((report, key) => [
    String(key + 1),
    report.UserDetails.fname + ' ' + report.UserDetails.lname,
    report.branch_code,
    // "View", // You can customize this column as needed
  ]);

  // Set the formatted data in the data state
  setData(formattedData);
}, [accounting]);


const handleDeleteClick = async (accountingName, branchesToDel) => {
  if(branchesToDel.length > 0){
  if (typeof branchesToDel) {
    // Split the comma-separated string into an array
    branchesToDel = branchesToDel.split(',').map(branch => branch.trim());
  }
  const { isConfirmed } = await Swal.fire({
    title: 'Confirm Deletion',
    text: `Do you wish to delete all categories assigned from this accounting?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, I want to delete!',
    cancelButtonText: 'Cancel',
  });

  if (isConfirmed) {
    try {
      await axios.delete('/assignedDeleteCategory', {
        data: { // Use the "data" property to send the request body
          accountingName: accountingName,
          categories: branchesToDel
        }
      });
      setShouldTriggerApiCall(true);

      Swal.fire({
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Done',
        title: 'Categories deleted successfully!',
      });
      const result = await axios.get('/getAssignedCategory');
      setInBlist(result.data);

      const response = await axios.get('/getAllCategoryGroup');
      setBlist(response.data);
      setAccountingValue(null);
      setBranchesValue([]);
      setShowButton(false)
    } catch (error) {
      // Handle errors if the request fails
      console.error('Error deleting branches:', error);

      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred while deleting the branches.',
      });
    }
  }
  }else{
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Already no categories assigned!',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Close'
    });
  }
};

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
    
  const sortedAccounting = [...accounting].sort((a, b) => {
    const nameA = a.UserDetails?.fname.toLowerCase() + " " + a.UserDetails?.lname.toLowerCase();
    const nameB = b.UserDetails?.fname.toLowerCase() + " " + b.UserDetails?.lname.toLowerCase();
    
    if (sortBy !== null) {
      if (sortBy.toLowerCase() === 'name') {
        if (sortDirection === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      }
    }
  });

    return (
      <div className="mt-12 flex flex-col gap-12">
         
        <Card className="-mt-7">
          <CardBody className="px-0 pt-0 pb-2">
          <div>
          <Typography variant="h6" color="gray" className="ml-4 pb-2 pt-2">
            Assign Category to Accounting
          </Typography>

          </div>
          <hr />
          <div className=" py-2 px-5 static">
            <div className="inline-block ... py-2 px-2 min-w-[230px]">
            <Select 
                placeholder = "Accounting"
                options={optionAccounting}
                onChange={handleAccountingChange}
                value={accountingValue}
               />
                </div>
            <div className="inline-block ... py-2 px-2 min-w-[230px]">
            <Select 
                placeholder = "Categories"
                closeMenuOnSelect={false}
                components={animatedComponents} 
                isMulti 
                options={optionBranch} 
                onChange={handleBranchesChange}
                value={categoryValue}
                />
                
                </div>
                <div className="inline-block ... py-2 px-2">
                {showButton && (
                    <button onClick={handleSaveAssign}>
                        <CheckCircleIcon className="text-blue-500 absolute h-9 w-9 -mt-[23px] checkCustom" />
                    </button>
                    )}
                </div>           
            </div>
          </CardBody>
        </Card>
        <Card className="-mt-7">
          
        </Card>
        <Card>
          <CardHeader variant="gradient" color="blue" className="mb-8 p-3">
            <Typography variant="h6" color="white">
              Accounting List
            </Typography>
          </CardHeader>
          
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
         
        
            <table className="w-full min-w-[640px] table-auto pr-5">
              <thead>
                <tr>
                  {["ID", "Name", "Assigned Categories", "Action"].map((el) => (
                    <th
                    key={el}
                    className={`border-b border-blue-gray-50 py-3 px-5 text-left cursor-pointer ${
                      el === "ID" || el === "Action" || el === "Assigned Categories" ? "cursor-default" : "hover:bg-gray-200"
                    }`}
                    onClick={el !== "ID" && el !== "Action" && el !== "Assigned Categories" ? () => handleSort(el) : undefined}
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
              {isSearching && (
                <tr>
                  <td colSpan="8" className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography className="text-xs font-normal text-blue-gray-500">
                      <center><b><i>Your search results will appear here...</i></b></center>
                    </Typography>
                  </td>
                </tr>
              )}
              {isLoading ? (
                  <tr className="loading">
                  <td colSpan="8" className="py-3 px-5 border-b border-blue-gray-50 loading">
                    &nbsp;
                  </td>
                </tr>
                ) : sortedAccounting.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-3 px-5 border-b border-blue-gray-50">
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        <center><b><i>No record found! .....</i></b></center>
                      </Typography>
                    </td>
                  </tr>
                  ) : (
                sortedAccounting.map(
                  (item, index) => {
                    const className = `py-3 px-5 ${
                      index === sortedAccounting.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;
                          // Filter bInlist to include only branches with a matching login_id
                        const matchedBranches = bInlist.filter(
                            (branch) => branch.login_id === item.login_id
                        );
                        
                        const branches = matchedBranches.map((branch) => branch.CategoryGroup.group_code).join(', ');
                        const branchesToDel = matchedBranches.map((branch) => branch.CategoryGroup.id).join(', ');
                    return (
                      <tr className="addbghover">
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <div>
                              <Typography className="text-xs font-normal text-blue-gray-500">
                                {index+1}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {item.UserDetails.fname + ' ' + item.UserDetails.lname}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal">
                            {branches && branches.length > 0 ? (
                              branches.split(', ').map((branch, i) => (
                                <span
                                  key={i}
                                  className="bg-blue-500 text-white px-2 py-1 rounded-md mr-2"
                                >
                                  {branch}
                                </span>
                              ))
                            ) : (
                              <span className="bg-gray-500 text-white px-2 py-1 rounded-md">
                                No categories assigned yet
                              </span>
                            )}
                          </Typography>
                        </td>

                        
                        <td className={className}>
                        <div className="flex items-center gap-2">
                        <button
                          className="text-black hover:nounderline p-1 transition-transform transform-gpu hover:scale-150"
                          onClick={() => handleDeleteClick(item.UserDetails.user_details_id, branchesToDel)}
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
          </CardBody>
        </Card>
                       
      </div>
    );
  }
  
  export default SetupAccounting;
  