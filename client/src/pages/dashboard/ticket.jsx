import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Button,
} from "@material-tailwind/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import axios from "@/api/axios";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import CreateTicket from "@/modal/createticket";
import "sweetalert2/dist/sweetalert2.min.css";
import Swal from "sweetalert2";
import ViewTicketModal from "@/modal/viewTicket";
import EditTicketModal from "@/modal/editTicket";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

export function Ticket() {
  const token = sessionStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userRole = decoded.role;
  const user_ID = decoded.userId;
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [branchCode, setBranchCode] = useState([]);
  const [selectedBranchCode, setSelectedBranchCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userID, setUserID] = useState();
  //Create Ticket
  const [isModalOpen, setIsModalOpen] = useState(false);
  //View Ticket Modal
  const [isViewTicketModalOpen, setIsViewTicketModalOpen] = useState(false);
  const [showTicketToView, setShowTicketToView] = useState(false);
  const [status, setStatus] = useState("");
  const [displayTicket, setDisplayTicket] = useState();
  //Edit Ticket Modal
  const [isEditTicketModalOpen, setIsEditTicketModalOpen] = useState(false);
  const [showEditTicket, setShowEditTicket] = useState(false);
  const [category, setCategory] = useState();
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [bInlist, setInBlist] = useState([]);

  let queryParams = `page=${page}&limit=${limit}`;

  useEffect(() => {
    const fetchTickets = async () => {
      if (selectedBranchCode) {
        queryParams += `${queryParams ? "&" : ""}bcode=${selectedBranchCode}`;
      }
      if (selectedCategory) {
        queryParams += `${
          queryParams ? "&" : ""
        }ticket_category=${selectedCategory}`;
      }
      try {
        const response = await axios.get(`/getAllTickets?${queryParams}`);
        setTickets(response.data.rows);
        setTotalRecords(response.data.count);
        setIsLoading(true);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get("/getAllCategories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching ticket categories:", error);
      }
    };

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("/getUserLoginInfo");
        setUserID(response.data.login_id);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    const fetchBranch = async () => {
      try {
        const response = await axios.get("/getAllBranches");
        setBranchCode(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    const fetchData = () => {
      fetchTickets();
    };

    fetchData();
    fetchUserInfo();
    fetchCategories();
    fetchBranch();

    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [
    page,
    limit,
    selectedBranchCode,
    selectedCategory,
    isModalOpen,
    isViewTicketModalOpen,
    isEditTicketModalOpen,
  ]);

  // useEffect(() => {
  //   const fetchInBList = async () => {
  //     try {
  //       const response = await axios.get(
  //         `/getAssignedCategoryGroup/${user_ID}`
  //       );
  //       setInBlist(response.data[0].group_code);
  //     } catch (error) {
  //       console.log("Error fetching categories:", error);
  //     }
  //   };
  //   fetchInBList();
  // }, []);

  useEffect(() => {
    const fetchInBList = async () => {
      try {
        const response = await axios.get(`/getAssignedCategoryGroup/${user_ID}`);
        // Safely handle response
        const groupCode = response.data?.[0]?.group_code || null;
        setInBlist(groupCode);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setInBlist(null);
      }
    };
    fetchInBList();
  }, [user_ID]);

  const isPreviousDisabled = page === 1;
  const isNextDisabled = page * limit >= totalRecords;

  const handleViewTicketClick = async (ticketId, status, displayTicket) => {
    const UPDATE_NOTIF_URL = `/updateNotif/${ticketId}`;

    if (userRole === 1 || userRole === 2) {
      await axios.put(UPDATE_NOTIF_URL, { notifID: 1 });
    } else if (userRole === 3) {
      await axios.put(UPDATE_NOTIF_URL, { notifID: 3 });
    } else if (userRole === 4) {
      await axios.put(UPDATE_NOTIF_URL, { notifID: 4 });
    } else if (userRole === 5) {
      await axios.put(UPDATE_NOTIF_URL, { notifID: 5 });
    } else if (userRole === 7) {
      await axios.put(UPDATE_NOTIF_URL, { notifID: 7 });
    } else if (userRole === 9) {
      await axios.put(UPDATE_NOTIF_URL, { notifID: 100 });
    }
    setIsViewTicketModalOpen(true);
    setShowTicketToView(ticketId);
    setStatus(status);
    setDisplayTicket(displayTicket);
  };

  const closeRejectModal = () => {
    setIsViewTicketModalOpen(false);
    toast.success("Ticket Rejected");
  };
  const closeEditedModal = () => {
    setIsViewTicketModalOpen(false);
    if (userRole === 1 || userRole === 2) {
      toast.success("Ticket was Edited");
    } else {
      toast.success("Ticket was Approved");
    }
  };
  const closeRedirectModal = () => {
    setIsViewTicketModalOpen(false);
    toast.success("Ticket moved to Automation");
  };
  const closeViewModal = () => {
    setIsViewTicketModalOpen(false);
  };

  const handleEditTicketClick = async (ticketId, categoryID) => {
    setCategory(categoryID);
    setIsEditTicketModalOpen(true);
    setShowEditTicket(ticketId);
  };

  const closeEditModal = () => {
    setIsEditTicketModalOpen(false);
    toast.success("Changes saved successfully.");
  };

  const handleDeleteClick = async (ticketId) => {
    const { isConfirmed } = await Swal.fire({
      title: "Confirm Deletion",
      text: `Are you sure you want to delete this Ticket?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (isConfirmed) {
      try {
        const DEL_URL = `/deleteTicket/${ticketId}`;
        await axios.put(DEL_URL);

        if (selectedBranchCode) {
          queryParams += `${queryParams ? "&" : ""}bcode=${selectedBranchCode}`;
        }
        if (selectedCategory) {
          queryParams += `${
            queryParams ? "&" : ""
          }ticket_category=${selectedCategory}`;
        }

        const response = await axios.get(`/getAllTickets?${queryParams}`);
        setTickets(response.data.rows);
        setTotalRecords(response.data.count);

        Swal.fire({
          icon: "success",
          title: "Ticket deleted successfully!",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Done",
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          Swal.fire({
            icon: "error",
            title: "Conflict!",
            text: "This ticket cannot be deleted due to dependencies.",
          });
        } else {
          console.error("Error deleting ticket:", error);
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: "An error occurred while deleting ticket.",
          });
        }
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setIsLoading(true);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    setIsLoading(true);
  };
  const closeCreateModal = () => {
    setIsModalOpen(false);
    toast.success("Ticket added successfully.");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditTicketModalOpen(false);
  };

  const handleBranchCodeChange = async (event) => {
    setSelectedBranchCode(event.value);
    setPage(1);
  };

  const branchCodes = (
    <Select
      options={[
        { label: "All", value: "" },
        ...branchCode.map((bcode) => ({
          label: `${bcode.Branch?.b_name} (${bcode.Branch?.b_code})`, // Display both name and code
          value: bcode.blist_id,
        })),
      ]}
      value={
        selectedBranchCode === ""
          ? selectedBranchCode.label
          : selectedBranchCode
          ? selectedBranchCode.value
          : ""
      }
      onChange={handleBranchCodeChange}
      isSearchable
      placeholder="Select Branch"
    />
  );

  const handleCategoryChange = async (event) => {
    setSelectedCategory(event.value);
    setPage(1);
  };
  const categoryType = (
    <Select
      options={[
        { label: "All", value: "" },
        ...categories.map((category) => ({
          label: `${category.category_name} <span style = "display: none;">(${category.category_shortcut})</span>`,
          value: category.ticket_category_id,
        })),
      ]}
      value={
        selectedCategory === ""
          ? selectedCategory.label
          : selectedCategory
          ? selectedCategory.label
          : ""
      }
      onChange={handleCategoryChange}
      isSearchable
      placeholder="Select Category"
      formatOptionLabel={({ label }) => (
        <div dangerouslySetInnerHTML={{ __html: label }} />
      )}
    />
  );

  const startNumber = (page - 1) * limit + 1;

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const categoryA = a.TicketDetails?.Category?.category_name.toLowerCase();
    const categoryB = b.TicketDetails?.Category?.category_name.toLowerCase();
    const codeA = a.ticket_code;
    const codeB = b.ticket_code;
    const requestedByA =
      a.UserTicket?.UserDetails?.fname.toLowerCase() +
      " " +
      a.UserTicket?.UserDetails?.lname.toLowerCase();
    const requestedByB =
      b.UserTicket?.UserDetails?.fname.toLowerCase() +
      " " +
      b.UserTicket?.UserDetails?.lname.toLowerCase();
    const automationA =
      a.AssignedTicket?.UserDetails?.fname.toLowerCase() +
      " " +
      a.UserTicket?.UserDetails?.lname.toLowerCase();
    const automationB =
      b.AssignedTicket?.UserDetails?.fname.toLowerCase() +
      " " +
      b.UserTicket?.UserDetails?.lname.toLowerCase();
    const datecreatedA = a.TicketDetails?.date_created.toLowerCase();
    const datecreatedB = b.TicketDetails?.date_created.toLowerCase();
    const transactiondateA =
      a.TicketDetails?.ticket_transaction_date.toLowerCase();
    const transactiondateB =
      b.TicketDetails?.ticket_transaction_date.toLowerCase();

    if (sortBy !== null) {
      if (sortBy.toLowerCase() === "ticket code") {
        if (sortDirection === "asc") {
          return codeA.localeCompare(codeB);
        } else {
          return codeB.localeCompare(codeA);
        }
      } else if (sortBy.toLowerCase() === "requested by") {
        if (sortDirection === "asc") {
          return requestedByA.localeCompare(requestedByB);
        } else {
          return requestedByB.localeCompare(requestedByA);
        }
      } else if (sortBy.toLowerCase() === "category") {
        if (sortDirection === "asc") {
          return categoryA.localeCompare(categoryB);
        } else {
          return categoryB.localeCompare(categoryA);
        }
      } else if (sortBy.toLowerCase() === "automation") {
        if (sortDirection === "asc") {
          return automationA.localeCompare(automationB);
        } else {
          return automationB.localeCompare(automationA);
        }
      } else if (sortBy.toLowerCase() === "date & time created") {
        if (sortDirection === "asc") {
          return datecreatedA.localeCompare(datecreatedB);
        } else {
          return datecreatedB.localeCompare(datecreatedA);
        }
      } else {
        if (sortDirection === "asc") {
          return transactiondateA.localeCompare(transactiondateB);
        } else {
          return transactiondateB.localeCompare(transactiondateA);
        }
      }
    }
  });

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {(userRole === 4 ||
        userRole === 5 ||
        (userRole === 7 && (bInlist === 3 || bInlist === 9 || bInlist === 10))) && (
        <div className="px-2">
          <Button
            className="-mb-7 flex items-center gap-1 bg-light-blue-600 py-2 px-3"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircleIcon className="w-5" />
            Create Ticket
          </Button>
        </div>
      )}

      {isModalOpen && (
        <CreateTicket
          isOpen={isModalOpen}
          onClose={closeCreateModal}
          onCloseModal={closeModal}
        />
      )}

      <Card>
        <CardBody className="px-0 pt-0 pb-2">
          <div>
            <Typography variant="h6" color="gray" className="ml-4 pb-1 pt-3">
              <p>Filter</p>
            </Typography>
          </div>
          <hr />
          <div className="flex items-center py-5 px-5 text-xs">
            {userRole === 1 || userRole === 2 || userRole === 9 ? (
              <div className="h-10 w-1/4 py-2 px-2 text-xs">{branchCodes}</div>
            ) : null}
            <div className="h-10 w-1/4 py-2 px-2 text-xs">{categoryType}</div>
          </div>
        </CardBody>
      </Card>
      <Card className="p-2">
        <CardHeader variant="gradient" color="blue" className="mb-8 p-4">
          <Typography variant="h6" color="white" className="text-sm">
            Tickets (Request for Edit)
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="pagination-controls mb-5 ml-5 w-60">
            Show
            <select
              className="ml-4 mb-1 rounded-lg border border-black py-2 px-3 text-sm"
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
            >
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>

          <div
            className="hideColorIndicator -mt-12"
            style={{ float: "right", display: "flex" }}
          >
            Color Indicator : &nbsp;
            <Chip
              variant="gradient"
              color={"yellow"}
              value="Branch Head"
              className="py-0.5 px-2 text-[11px] font-medium"
            />
            &nbsp;
            <Chip
              variant="gradient"
              color={"orange"}
              value="Accounting Staff"
              className="py-0.5 px-2 text-[11px] font-medium"
            />
            &nbsp;
            <Chip
              variant="gradient"
              color={"green"}
              value="Accounting Head"
              className="py-0.5 px-2 text-[11px] font-medium"
            />
            &nbsp;
            <Chip
              variant="gradient"
              color={"blue"}
              value="Automation Manager"
              className="py-0.5 px-2 text-[11px] font-medium"
            />
            &nbsp;
            <Chip
              variant="gradient"
              color={"gray"}
              value="Automation"
              className="py-0.5 px-2 text-[11px] font-medium"
            />
          </div>

          <table className="tbl_loading w-full min-w-[640px] table-auto">
            <thead>
              {userRole === 3 ? (
                <tr>
                  {[
                    "No.",
                    "Ticket Code",
                    "Requested By",
                    "category",
                    "automation",
                    "supplier",
                    "date & time created",
                    "Transaction Date",
                    "approved by",
                    "status",
                    "action",
                  ].map((el) => (
                    <th
                      key={el}
                      className={`cursor-pointer border-b border-blue-gray-50 py-3 px-5 text-left ${
                        el === "No." || el === "status" || el === "action"
                          ? "cursor-default"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={
                        el !== "No." && el !== "status" && el !== "action"
                          ? () => handleSort(el)
                          : undefined
                      }
                    >
                      <div className="flex items-center">
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase"
                        >
                          {el}
                        </Typography>
                        {sortBy === el &&
                          (sortDirection === "asc" ? (
                            <ArrowUpIcon className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                  ))}
                </tr>
              ) : userRole === 7 ? (
                <tr>
                  {[
                    "No.",
                    "Ticket Code",
                    "Requested By",
                    "category",
                    "automation",
                    "supplier",
                    "date & time created",
                    "Transaction Date",
                    "status",
                    "action",
                  ].map((el) => (
                    <th
                      key={el}
                      className={`cursor-pointer border-b border-blue-gray-50 py-3 px-5 text-left ${
                        el === "No." || el === "status" || el === "action"
                          ? "cursor-default"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={
                        el !== "No." && el !== "status" && el !== "action"
                          ? () => handleSort(el)
                          : undefined
                      }
                    >
                      <div className="flex items-center">
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase"
                        >
                          {el}
                        </Typography>
                        {sortBy === el &&
                          (sortDirection === "asc" ? (
                            <ArrowUpIcon className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                  ))}
                </tr>
              ) : userRole === 1 ? (
                <tr>
                  {[
                    "No.",
                    "Ticket Code",
                    "Requested By",
                    "category",
                    "automation",
                    "date & time created",
                    "Transaction Date",
                    "approved by",
                    "status",
                    "action",
                  ].map((el) => (
                    <th
                      key={el}
                      className={`cursor-pointer border-b border-blue-gray-50 py-3 px-5 text-left ${
                        el === "No." || el === "status" || el === "action"
                          ? "cursor-default"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={
                        el !== "No." && el !== "status" && el !== "action"
                          ? () => handleSort(el)
                          : undefined
                      }
                    >
                      <div className="flex items-center">
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase"
                        >
                          {el}
                        </Typography>
                        {sortBy === el &&
                          (sortDirection === "asc" ? (
                            <ArrowUpIcon className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                  ))}
                </tr>
              ) : userRole !== 2 ? (
                <tr>
                  {[
                    "No.",
                    "Ticket Code",
                    "Requested By",
                    "category",
                    "automation",
                    "date & time created",
                    "Transaction Date",
                    "status",
                    "action",
                  ].map((el) => (
                    <th
                      key={el}
                      className={`cursor-pointer border-b border-blue-gray-50 py-3 px-5 text-left ${
                        el === "No." || el === "status" || el === "action"
                          ? "cursor-default"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={
                        el !== "No." && el !== "status" && el !== "action"
                          ? () => handleSort(el)
                          : undefined
                      }
                    >
                      <div className="flex items-center">
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase"
                        >
                          {el}
                        </Typography>
                        {sortBy === el &&
                          (sortDirection === "asc" ? (
                            <ArrowUpIcon className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                  ))}
                </tr>
              ) : (
                <tr>
                  {[
                    "No.",
                    "Ticket Code",
                    "Requested By",
                    "category",
                    "date & time created",
                    "Transaction Date",
                    "approved by",
                    "status",
                    "action",
                  ].map((el) => (
                    <th
                      key={el}
                      className={`cursor-pointer border-b border-blue-gray-50 py-3 px-5 text-left ${
                        el === "No." || el === "status" || el === "action"
                          ? "cursor-default"
                          : "hover:bg-gray-200"
                      }`}
                      onClick={
                        el !== "No." && el !== "status" && el !== "action"
                          ? () => handleSort(el)
                          : undefined
                      }
                    >
                      <div className="flex items-center">
                        <Typography
                          variant="small"
                          className="text-[11px] font-bold uppercase"
                        >
                          {el}
                        </Typography>
                        {sortBy === el &&
                          (sortDirection === "asc" ? (
                            <ArrowUpIcon className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="loading">
                  <td
                    colSpan="10"
                    className="loading border-b border-blue-gray-50 py-3 px-5"
                  >
                    &nbsp;
                  </td>
                </tr>
              ) : !sortedTickets || sortedTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
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
                sortedTickets.map((item, key) => (
                  <tr key={key} className="hover:bg-gray-100">
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
                      <Typography className="text-xs font-normal text-blue-gray-600">
                        {item.ticket_code}
                      </Typography>
                    </td>
                    <td className="border-b border-blue-gray-50 py-3 px-5">
                      <Typography className="text-xs font-bold text-blue-gray-600">
                        {item.UserTicket?.UserDetails?.fname +
                          " " +
                          item.UserTicket?.UserDetails?.lname}
                      </Typography>
                      <Typography className="text-xs font-normal text-blue-gray-500">
                        Branch : {item.Branch?.b_code.toUpperCase()}
                      </Typography>
                    </td>
                    <td className="border-b border-blue-gray-50 py-3 px-5">
                      <Typography className="text-xs font-normal text-blue-gray-600">
                        {item.TicketDetails?.Category?.category_name}
                      </Typography>
                    </td>
                    {userRole === 3 || userRole === 7 ? (
                      <>
                        <td className="border-b border-blue-gray-50 py-3 px-5">
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item.assigned_person === null
                              ? "Automation Janice"
                              : `${item.AssignedTicket?.UserDetails?.fname} ${item.AssignedTicket?.UserDetails?.lname}`}
                          </Typography>
                        </td>
                        <td className="border-b border-blue-gray-50 py-3 px-5">
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item.TicketDetails?.Supplier?.supplier}
                          </Typography>
                        </td>
                      </>
                    ) : (
                      userRole !== 2 && (
                        <td className="border-b border-blue-gray-50 py-3 px-5">
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item.assigned_person === null
                              ? "Automation Janice"
                              : `${item.AssignedTicket?.UserDetails?.fname} ${item.AssignedTicket?.UserDetails?.lname}`}
                          </Typography>
                        </td>
                      )
                    )}
                    <td className="border-b border-blue-gray-50 py-3 px-5">
                      <Typography className="text-xs font-normal text-blue-gray-600">
                        {item.TicketDetails?.date_created +
                          " " +
                          item.TicketDetails?.time}
                      </Typography>
                    </td>
                    <td className="border-b border-blue-gray-50 py-3 px-5">
                      <Typography className="text-xs font-normal text-blue-gray-600">
                        {item.TicketDetails?.ticket_transaction_date}
                      </Typography>
                    </td>
                    {userRole === 3 ? (
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {item.approveAcctgStaff
                            ? item.ApproveAccountingStaff?.UserDetails?.fname +
                              " " +
                              item.ApproveAccountingStaff?.UserDetails?.lname
                            : null}
                        </Typography>
                      </td>
                    ) : (
                      (userRole === 2 || userRole === 1) && (
                        <td className="border-b border-blue-gray-50 py-3 px-5">
                          <Typography className="text-xs font-normal text-blue-gray-600">
                            {item.approveAcctgSup
                              ? item.ApproveAccountingHead?.UserDetails?.fname +
                                " " +
                                item.ApproveAccountingHead?.UserDetails?.lname
                              : null}
                          </Typography>
                        </td>
                      )
                    )}
                    <td className="border-b border-blue-gray-50 py-3 px-5">
                      <div className="flex items-center">
                        {/* <Chip
                          variant="gradient"
                          color={
                            item.status === "PENDING" &&
                            ((item.displayTicket >= 1 &&
                              item.displayTicket <= 6) ||
                              item.displayTicket === 20 ||
                              item.displayTicket === 30)
                              ? "green"
                              : item.status === "PENDING" &&
                                ((item.displayTicket >= 10 &&
                                  item.displayTicket <= 14) ||
                                  item.displayTicket === 21 ||
                                  item.displayTicket === 31)
                              ? "green"
                              : item.status === "PENDING" &&
                                item.displayTicket === 7
                              ? "yellow"
                              : item.status === "PENDING" &&
                                item.displayTicket === 8
                              ? "gray"
                              : item.status === "PENDING" && (item.displayTicket === 100 ) ? "blue"
                              : "red"
                          }
                          value={item.status}
                          className="py-0.5 px-2 text-[11px] font-medium"
                        /> */}
                        <Chip
                          variant="gradient"
                          color={
                            item.status === "PENDING" &&
                            ((item.displayTicket >= 1 &&
                              item.displayTicket <= 6) ||
                              item.displayTicket === 9 ||
                              item.displayTicket === 20 ||
                              item.displayTicket === 30)
                              ? "green"
                              : item.status === "PENDING" &&
                                ((item.displayTicket >= 10 &&
                                  item.displayTicket <= 14) ||
                                  item.displayTicket === 21 ||
                                  item.displayTicket === 31)
                              ? "orange"
                              : item.status === "PENDING" &&
                                item.displayTicket === 7
                              ? "yellow"
                              : item.status === "PENDING" &&
                                item.displayTicket === 100
                              ? "blue"
                              : item.status === "PENDING" &&
                                item.displayTicket === 8
                              ? "gray"
                              : "red"
                          }
                          value={item.status}
                          className="py-0.5 px-2 text-[11px] font-medium"
                        />
                      </div>
                    </td>
                    <td className="border-b border-blue-gray-50 py-3 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          className="hover:nounderline transform-gpu text-black transition-transform hover:scale-150"
                          onClick={() =>
                            handleViewTicketClick(
                              item.ticket_id,
                              item.status,
                              item.displayTicket
                            )
                          }
                        >
                          <EyeIcon
                            className="h-4 w-4 text-blue-500"
                            title="View Ticket"
                          />
                        </button>

                        {userRole === 1 || userRole === 9 ? (
                          <button
                            className="hover:nounderline transform-gpu p-1 text-black transition-transform hover:scale-150"
                            onClick={() =>
                              handleEditTicketClick(
                                item.ticket_id,
                                item.TicketDetails?.Category?.category_name
                              )
                            }
                          >
                            <PencilIcon
                              className="h-4 w-4 p-1 text-green-500"
                              title="Edit Ticket"
                            />
                          </button>
                        ) : userRole === 4 &&
                          item.UserTicket.login_id === userID &&
                          item.status === "REJECTED" ? (
                          <button
                            className="hover:nounderline transform-gpu p-1 text-black transition-transform hover:scale-150"
                            onClick={() =>
                              handleEditTicketClick(
                                item.ticket_id,
                                item.TicketDetails?.Category?.category_name
                              )
                            }
                          >
                            <PencilIcon
                              className="h-4 w-4 p-1 text-green-500"
                              title="Edit Ticket"
                            />
                          </button>
                        ) : (userRole === 5 &&
                            item.UserTicket.login_id === userID &&
                            item.status === "PENDING" &&
                            item.displayTicket === 7) ||
                          (userRole === 5 && item.status === "REJECTED") ? (
                          <button
                            className={
                              item.UserTicket.login_id === userID
                                ? "hover:nounderline transform-gpu p-1 text-black transition-transform hover:scale-150"
                                : "hover:nounderline cursor-not-allowed p-1 text-black"
                            }
                            onClick={() =>
                              handleEditTicketClick(
                                item.ticket_id,
                                item.TicketDetails?.Category?.category_name
                              )
                            }
                            disabled={item.UserTicket.login_id !== userID}
                          >
                            <PencilIcon
                              className="h-4 w-4 p-1 text-green-500"
                              title="Edit Ticket"
                            />
                          </button>
                        ) : userRole === 7 && item.status === "REJECTED" ? (
                          <button
                            className={
                              item.UserTicket.login_id === userID
                                ? "hover:nounderline transform-gpu p-1 text-black transition-transform hover:scale-150"
                                : "hover:nounderline cursor-not-allowed p-1 text-black"
                            }
                            onClick={() =>
                              handleEditTicketClick(
                                item.ticket_id,
                                item.TicketDetails?.Category?.category_name
                              )
                            }
                            disabled={item.UserTicket.login_id !== userID}
                          >
                            <PencilIcon
                              className="h-4 w-4 p-1 text-green-500"
                              title="Edit Ticket"
                            />
                          </button>
                        ) : (
                          <button
                            className="hover:nounderline cursor-not-allowed p-1 text-black"
                            disabled
                          >
                            <PencilIcon
                              className="h-4 w-4 p-1 text-green-500"
                              title="Edit Ticket"
                            />
                          </button>
                        )}
                        {userRole === 1 || userRole === 9 ? (
                          <button
                            className="hover:nounderline transform-gpu p-1 text-black transition-transform hover:scale-150"
                            onClick={() => handleDeleteClick(item.ticket_id)}
                          >
                            <TrashIcon
                              className="h-4 w-4 text-red-500"
                              title="Delete?"
                            />
                          </button>
                        ) : userRole === 4 ||
                          userRole === 5 ||
                          userRole === 7 ? (
                          <button
                            className={
                              item.UserTicket.login_id === userID && item.displayTicket !== 8
                                ? "hover:nounderline transform-gpu p-1 text-black transition-transform hover:scale-150"
                                : "hover:nounderline cursor-not-allowed p-1 text-black"
                            }
                            onClick={() => handleDeleteClick(item.ticket_id)}
                            disabled={item.UserTicket.login_id !== userID || item.displayTicket === 8}
                          >
                            <TrashIcon
                              className="h-4 w-4 text-red-500"
                              title="Delete?"
                            />
                          </button>
                        ) : (
                          <button
                            className="cursor-not-allowed p-1 text-black"
                            disabled
                          >
                            <TrashIcon
                              className="h-4 w-4 text-red-500"
                              title="Delete?"
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
              {[...Array(Math.ceil(totalRecords / limit)).keys()].map(
                (pageNum) => (
                  <option key={pageNum + 1} value={pageNum + 1}>
                    {pageNum + 1}
                  </option>
                )
              )}
            </select>
            <span className="text-xs">
              of {Math.ceil(totalRecords / limit)}
            </span>

            <button
              style={isNextDisabled ? { opacity: 0.5 } : {}}
              className="ml-2 rounded-md p-1"
              onClick={() => setPage(page + 1)}
              disabled={isNextDisabled}
            >
              <ChevronRightIcon className="h-5 w-5 text-blue-500" />
            </button>
            <ToastContainer />
          </div>
        </CardBody>
      </Card>

      {/* View Ticket */}
      {isViewTicketModalOpen && (
        <ViewTicketModal
          isOpen={isViewTicketModalOpen}
          onClose={closeViewModal}
          onCloseRedirect={closeRedirectModal}
          onCloseReject={closeRejectModal}
          onCloseEdit={closeEditedModal}
          ticketIdToView={showTicketToView}
          status={status}
          displayTicket={displayTicket}
        />
      )}
      {/* Edit Ticket */}
      {isEditTicketModalOpen && (
        <EditTicketModal
          isOpen={isEditTicketModalOpen}
          onClose={closeEditModal}
          ticketIdToEdit={showEditTicket}
          categoryID={category}
          onCloseModal={closeModal}
        />
      )}
      {/* <RocketChatLivechat/> */}
    </div>
  );
}

export default Ticket;
