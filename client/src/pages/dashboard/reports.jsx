import React, { useState, useEffect } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import Select from "react-select";
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
} from "@material-tailwind/react";
import makeAnimated from "react-select/animated";
import axios from "@/api/axios";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import * as XLSX from "xlsx";
import ReactModal from "react-modal";
import { jwtDecode } from "jwt-decode";
import ViewReportModal from "@/modal/viewReports";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { eachDayOfInterval } from "date-fns/esm";

export function Reports() {
  const [value, setValue] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const animatedComponents = makeAnimated();

  const token = sessionStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userRole = decoded.role;
  const [selectedBranchCode, setSelectedBranchCode] = useState(""); // Initialize with "All"
  const [selectedCategory, setSelectedCategory] = useState(""); // Initialize with "All"
  const [selectedBranchCategory, setSelectedBranchCategory] = useState(""); // Initialize with "All"
  const [categories, setCategories] = useState([]);
  const [branch, setBranchType] = useState([]);
  const [branchCode, setBranchCode] = useState([]);
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [returnedData, setReturnedData] = useState(false);

  //View Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showReportToView, setShowReportToView] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);

      let queryParams = `page=${page}&limit=${limit}`;
      if (selectedBranchCode) {
        queryParams += `&bcode=${selectedBranchCode}`;
      }
      if (selectedBranchCategory) {
        queryParams += `&branch_category=${selectedBranchCategory}`;
      }
      if (selectedCategory) {
        queryParams += `&ticket_category=${selectedCategory}`;
      }
      if (value) {
        queryParams += `&startDate=${value.startDate}&endDate=${value.endDate}`;
      }

      try {
        const response = await axios.get(`/getAllCompleted?${queryParams}`);
        setReports(response.data.data);
        setTotalRecords(response.data.count);
      } catch (error) {
        console.error("Error fetching reports:", error);
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

    const fetchBranch = async () => {
      try {
        const response = await axios.get("/getAllBranches");
        setBranchCode(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    const fetchType = async () => {
      try {
        const response = await axios.get("/getAllBranchCategories");
        setBranchType(response.data);
      } catch (error) {
        console.error("Error fetching branch categories:", error);
      }
    };

    fetchReports();
    setReturnedData(false);
    Promise.all([fetchCategories(), fetchBranch(), fetchType()]);
  }, [
    selectedBranchCode,
    selectedCategory,
    selectedBranchCategory,
    value,
    page,
    limit,
    returnedData,
  ]);

  const isPreviousDisabled = page === 1;
  const isNextDisabled = page * limit >= totalRecords;

  // Handle for Date filter
  const handleValueChange = (selectedDates) => {
    setValue({
      startDate: new Date(selectedDates.startDate),
      endDate: new Date(selectedDates.endDate),
    });
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
          label: `${bcode.Branch?.b_name} (${bcode.Branch?.b_code})`,
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
      placeholder="Select Branch Code"
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

  const handleBranchCategoryChange = async (event) => {
    setSelectedBranchCategory(event.value);
    setPage(1);
  };

  const branchType = (
    <Select
      options={[
        { label: "All", value: "" },
        ...branch.map((type) => ({
          label: type,
          value: type,
        })),
      ]}
      value={
        selectedBranchCategory === ""
          ? selectedBranchCategory.label // Display 'All' if selectedBranchCategory is empty string
          : selectedBranchCategory
          ? selectedBranchCategory.label
          : "" // Display selected label if it's not empty
      }
      onChange={handleBranchCategoryChange}
      isSearchable
      placeholder="Select Branch Type"
    />
  );

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

  const START_DATE = new Date(value.startDate);
  const END_DATE = new Date(value.endDate);
  const StartDate = START_DATE.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const EndDate = END_DATE.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const capitalizeFirstLetter = (str) => {
    if (!str) return str; // Handle empty strings
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const exportAllToExcel = async () => {
    try {
      let queryParams = `page=${page}&limit=${limit}`;
      if (selectedBranchCode) {
        queryParams += `${queryParams ? "&" : ""}bcode=${selectedBranchCode}`;
      }

      if (selectedBranchCategory) {
        queryParams += `${
          queryParams ? "&" : ""
        }branch_category=${selectedBranchCategory}`;
      }

      if (selectedCategory) {
        queryParams += `${
          queryParams ? "&" : ""
        }ticket_category=${selectedCategory}`;
      }

      if (selectedBranchCategory) {
        queryParams += `${
          queryParams ? "&" : ""
        }branch_category=${selectedBranchCategory}`;
      }

      if (value) {
        queryParams += `${queryParams ? "&" : ""}startDate=${
          value.startDate
        }&endDate=${value.endDate}`;
      }

      const detailedReports = queryParams
        ? await axios.get(`/getReports?${queryParams}`)
        : await axios.get("/getReports");

      // Filter detailedReports based on your conditions (blist_id, ticket_category_id, etc.)
      // Filter detailedReports based on your conditions (blist_id, ticket_category_id, etc.)
      const filteredReports = detailedReports.data.rows.filter((report) => {
        // Example condition, modify as per your needs
        return (
          (!selectedBranchCode ||
            report.Branch?.blist_id === selectedBranchCode ||
            selectedBranchCode === "") &&
          (!selectedCategory ||
            report.TicketDetails?.Category?.ticket_category_id ===
              selectedCategory ||
            selectedCategory === "")
        );
      });

      const safeParseJSON = (str) => {
        try {
          // Trim whitespace and replace newlines with a space
          const cleanedStr = str.replace(/[\r\n]+/g, " ").trim();
          return JSON.parse(cleanedStr);
        } catch (e) {
          return [];
        }
      };

      const report = filteredReports.flatMap((detailedReport) => {
        const purposes = safeParseJSON(
          detailedReport.TicketDetails?.td_purpose
        );
        const froms = safeParseJSON(detailedReport.TicketDetails?.td_from);
        const tos = safeParseJSON(detailedReport.TicketDetails?.td_to);

        const maxRows = Math.max(purposes.length, froms.length, tos.length, 1);

        const rows = Array.from({ length: maxRows }).map((_, index) => {
          const isFirstRow = index === 0;

          const data = {
            "Ticket Code": isFirstRow ? detailedReport.ticket_code : "",
            "Transaction Date": isFirstRow
              ? detailedReport.TicketDetails?.ticket_transaction_date
              : "",
            "Category": isFirstRow
              ? detailedReport.TicketDetails?.Category?.category_name
              : "",
            "Reference Number": isFirstRow
              ? detailedReport.TicketDetails?.td_ref_number
              : "",
            "Purpose": purposes[index],
            "From": froms[index],
            "To": tos[index],
            "Note": isFirstRow ? detailedReport.TicketDetails?.td_note : "",
            "Branch": isFirstRow ? detailedReport.Branch?.b_name : "",
            "Requested By": isFirstRow
              ? detailedReport.login_id
                ? capitalizeFirstLetter(detailedReport.UserTicket?.UserDetails?.fname) +
                  " " +
                  capitalizeFirstLetter(detailedReport.UserTicket?.UserDetails?.lname)
                : ""
              : "",
            "Approve By BM/BS": isFirstRow
              ? detailedReport.approveHead
                ? capitalizeFirstLetter(detailedReport.ApproveHead?.UserDetails?.fname) +
                  " " +
                  capitalizeFirstLetter(detailedReport.ApproveHead?.UserDetails?.lname)
                : ""
              : "",
            "Approve By Acctg. Staff": isFirstRow
              ? detailedReport.approveAcctgStaff
                ? capitalizeFirstLetter(detailedReport.ApproveAccountingStaff?.UserDetails?.fname) +
                  " " +
                  capitalizeFirstLetter(detailedReport.ApproveAccountingStaff?.UserDetails?.lname)
                : ""
              : "",
            "Approve By Accounting Head": isFirstRow
              ? detailedReport.approveAcctgSup
                ? capitalizeFirstLetter(detailedReport.ApproveAccountingHead?.UserDetails?.fname) +
                  " " +
                  capitalizeFirstLetter(detailedReport.ApproveAccountingHead?.UserDetails?.lname)
                : ""
              : "",
            "Edited By": isFirstRow
              ? capitalizeFirstLetter(detailedReport.Automation?.UserDetails?.fname) +
                " " +
                capitalizeFirstLetter(detailedReport.Automation?.UserDetails?.lname)
              : "",
            "Date Edited": isFirstRow
              ? detailedReport.TicketDetails?.date_completed
              : "",
            "Counted?": isFirstRow
              ? detailedReport.isCounted === 0
                ? "YES"
                : "NO"
              : "",
          };

          return data;
        });

        return rows;
      });

      const branchTotals = {};

      report.forEach((item) => {
        const branchName = item["Branch"];
        const countedValue = item["Counted?"];

        if (!branchTotals[branchName]) {
          branchTotals[branchName] = { count: 0 };
        }

        if (countedValue === "YES") {
          branchTotals[branchName].count++;
        }
      });

      const reportHeaders = [
        "Ticket Code",
        "Transaction Date",
        "Category",
        "Reference Number",
        "Purpose",
        "From",
        "To",
        "Note",
        "Branch",
        "Requested By",
        "Approve By BM/BS",
        "Approve By Acctg. Staff",
        "Approve By Accounting Head",
        "Edited By",
        "Date Edited",
        "Counted?",
      ];
      const totalRows = [
        reportHeaders,
        ...report.map((item, key) => [
          item["Ticket Code"],
          item["Transaction Date"],
          item["Category"],
          item["Reference Number"],
          item["Purpose"],
          item["From"],
          item["To"],
          item["Note"],
          item["Branch"],
          item["Requested By"],
          item["Approve By BM/BS"],
          item["Approve By Acctg. Staff"],
          item["Approve By Accounting Head"],
          item["Edited By"],
          item["Date Edited"],
          item["Counted?"],
        ]),
        [],
        ["", "", "Total: "],
      ];

      Object.keys(branchTotals).forEach((branchName, index) => {
        totalRows.push(["", "", "", branchName, branchTotals[branchName].count]);
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(totalRows);

      const colWidths = totalRows[0].map((_, colIndex) => {
        const headerName = totalRows[0][colIndex];

        if (["Purpose", "From", "To", "Note"].includes(headerName)) {
          return { wch: 50 };
        }

        if (["Ticket Code", "Transaction Date"].includes(headerName)) {
          return { wch: 10 };
        }

        if (["Reference Number"].includes(headerName)) {
          return { wch: 20 };
        }

        const maxContentLength = Math.max(
          ...totalRows.map((row) =>
            row[colIndex] ? row[colIndex].toString().length : 0
          )
        );
        return { wch: maxContentLength + 2 };
      });

      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `${StartDate} to ${EndDate} Report.xlsx`);
    } catch (error) {
      console.error("Error exporting reports:", error);
    }
  };

  const handleViewReportClick = (report, event) => {
    event.preventDefault();
    setIsViewModalOpen(true);
    setShowReportToView(report);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
    const branchtypeA = a.branch_category.toLowerCase();
    const branchtypeB = b.branch_category.toLowerCase();
    const branchcodeA = a.branch_code.toLowerCase();
    const branchcodeB = b.branch_code.toLowerCase();
    const categoryA = a.category_name.toLowerCase();
    const categoryB = b.category_name.toLowerCase();
    const countA = parseInt(a.ticket_count);
    const countB = parseInt(b.ticket_count);

    if (sortBy !== null) {
      if (sortBy.toLowerCase() === "branch type") {
        if (sortDirection === "asc") {
          return branchtypeA.localeCompare(branchtypeB);
        } else {
          return branchtypeB.localeCompare(branchtypeA);
        }
      } else if (sortBy.toLowerCase() === "branch code") {
        if (sortDirection === "asc") {
          return branchcodeA.localeCompare(branchcodeB);
        } else {
          return branchcodeB.localeCompare(branchcodeA);
        }
      } else if (sortBy.toLowerCase() === "particulars") {
        if (sortDirection === "asc") {
          return categoryA.localeCompare(categoryB);
        } else {
          return categoryB.localeCompare(categoryA);
        }
      } else if (sortBy.toLowerCase() === "counts") {
        if (sortDirection === "asc") {
          return countA - countB;
        } else {
          return countB - countA;
        }
      }
    }
  });

  const startNumber = (page - 1) * limit + 1;

  return (
    <div className="mt-5 mb-8 flex flex-col gap-10">
      <Card className="">
        <CardBody className="px-0 pt-0 pb-2">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" color="gray" className="ml-4 pb-1 pt-3">
              Filter
            </Typography>
          </div>
          <hr />
          <div className="flex items-center justify-between py-5 px-5 text-xs">
            {userRole === 4 || userRole === 5 ? (
              <>
                <div className="h-10 w-64 py-2 px-2 text-xs">
                  {categoryType}
                </div>
              </>
            ) : (
              <>
                <div className="h-10 w-64 py-2 px-2 text-xs">{branchCodes}</div>
                <div className="h-10 w-64 py-2 px-2 text-xs">
                  {categoryType}
                </div>
                <div className="h-10 w-64 py-2 px-2 text-xs">{branchType}</div>
              </>
            )}
            <div className="py-1 px-2 text-xs">
              <label className="block text-sm">Select Date</label>
              <div className="w-64 rounded-sm border-x border-y text-xs">
                <Datepicker
                  className="text-xs"
                  value={value}
                  onChange={handleValueChange}
                  placeholder="Select a date"
                  showShortcuts={true}
                  maxDate={new Date()}
                  popoverDirection="down"
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-4 p-3">
          <Typography variant="h6" color="white">
            Reports
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {/* Pagination and Limit Controls */}
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
              {/* Add more options as needed */}
            </select>
          </div>
          <Menu placement="left-right">
            <MenuHandler className="float-right -mt-[40px] mr-[25px]">
              <IconButton size="sm" variant="text" color="blue-gray">
                <EllipsisVerticalIcon
                  strokeWidth={3}
                  fill="currenColor"
                  className="h-6 w-6"
                />
              </IconButton>
            </MenuHandler>
            <MenuList>
              {/* <MenuItem onClick={exportToExcel}>Export Tally</MenuItem> */}
              <MenuItem onClick={exportAllToExcel}>Export</MenuItem>
            </MenuList>
          </Menu>
          <table className="tbl_loading w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "ID",
                  "Branch Type",
                  "Branch Code",
                  "Particulars",
                  "Counts",
                  "Action",
                ].map((el) => (
                  <th
                    key={el}
                    className={`cursor-pointer border-b border-blue-gray-50 py-3 px-5 text-left ${
                      el === "ID" || el === "Action"
                        ? "cursor-default"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={
                      el !== "ID" && el !== "Action"
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
              ) : !sortedReports || sortedReports.length === 0 ? (
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
                sortedReports.map((report, key) => {
                  const rowClassName =
                    report.counted === 1 ? "bg-red-100 hover:bg-red-100" : "";
                  return (
                    <tr
                      key={key}
                      className={`hover:bg-gray-100 ${rowClassName}`}
                    >
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <div className="flex items-center gap-2">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {startNumber + key}
                          </Typography>
                        </div>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <div className="flex items-center gap-2">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {report.branch_category}
                          </Typography>
                        </div>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <div>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="text-xs font-semibold text-blue-gray-500"
                          >
                            {report.branch_code.toUpperCase()}
                          </Typography>
                          <Typography className="font-sm text-xs text-blue-gray-500">
                            {report.branch_name}
                          </Typography>
                        </div>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {report.category_shortcut}
                        </Typography>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {report.category_name}
                        </Typography>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {report.ticket_count}
                        </Typography>
                      </td>
                      <td className="border-b border-blue-gray-50 py-3 px-5">
                        <Typography
                          as="a"
                          href="#"
                          className="text-xs font-normal text-blue-gray-600"
                          // onClick={() => openModal(report)}
                          // onClick={() => alert("Please wait a moment! Thank you.")}
                          onClick={() => handleViewReportClick(report, event)}
                        >
                          <span className="rounded-full bg-cyan-400 px-4 py-2 text-white">
                            View
                          </span>
                        </Typography>
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
          </div>
        </CardBody>
      </Card>

      {isViewModalOpen && (
        <ViewReportModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          reportToView={showReportToView}
          startDate={value.startDate}
          endDate={value.endDate}
          returnedData={setReturnedData}
        />
      )}

      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="View Report Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust overlay background color and opacity as needed
          },
          content: {
            maxWidth: "50%",
            margin: "auto",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)", // Optional: Add a box shadow for a better look
          },
        }}
      >
        <div>
          <table>
            <tr>
              <td>No.</td>
              <td>Ticket Code</td>
              <td></td>
              <td></td>
            </tr>
            {Array.isArray(selectedReport) &&
              selectedReport.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <div className="flex items-center gap-4">
                      <div>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {index + 1}
                        </Typography>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    <Typography className="text-xs font-normal text-blue-gray-600">
                      {item.item?.TicketDetails?.date_created}
                    </Typography>
                  </td>
                  <td className="border-b border-blue-gray-50 py-3 px-5">
                    {/* Add additional columns as needed */}
                  </td>
                </tr>
              ))}
          </table>
        </div>

        <button
          style={{
            padding: 10,
            backgroundColor: "#359bef",
            color: "white",
            borderRadius: 10,
            marginBottom: "0px",
            float: "right",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          Close
        </button>
      </ReactModal>
    </div>
  );
}

export default Reports;
