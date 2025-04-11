import React from "react";
import {
  CardHeader,
  CardBody,
  Typography,
  Checkbox,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "sweetalert2/dist/sweetalert2.min.css";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function ViewTicketModal({
  isOpen,
  onClose,
  ticketIdToView,
  status,
  displayTicket,
  onCloseRedirect,
  onCloseReject,
  onCloseEdit,
}) {
  const token = sessionStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userRole = decoded.role;
  const [showTicketData, setShowTicketData] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [isCheckboxChecked2, setIsCheckboxChecked2] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [note, setNote] = useState();
  const [supportFiles, setSupportFiles] = useState([]);
  const noteDisableRole = [4, 5, 6, 8];
  const noteDisabled = noteDisableRole.includes(userRole);

  const safeParseJSON = (str) => {
    try {
      // Trim whitespace and replace newlines with a space
      const cleanedStr = str.replace(/[\r\n]+/g, ' ').trim();
      return JSON.parse(cleanedStr);
    } catch (e) {
      return [];
    }
  };
  
  useEffect(() => {
    async function fetchTicketData() {
      try {
        const VIEW_URL = `/viewTicket/${ticketIdToView}`;
        const response = await axios.get(VIEW_URL);
        setShowTicketData(response.data);
        const supportFilesData = JSON.parse(
          response.data?.TicketDetails?.td_support
        );
        const files = supportFilesData.map((fileUrl) => ({
          name: decodeURIComponent(fileUrl.split("/").pop()),
          url: `${axios.defaults.baseURL}/uploads/${encodeURIComponent(fileUrl)}`,
        }));

        setSupportFiles(files);
      } catch (error) {
        console.error("Error fetching ticket data:", error);
      }
    }

    if (isOpen && ticketIdToView) {
      fetchTicketData();
    }
  }, [isOpen, ticketIdToView]);

  const generatePrintContent = () => {
    const reqBy =
      showTicketData?.UserTicket?.UserDetails?.fname +
      " " +
      showTicketData?.UserTicket?.UserDetails?.lname +
      " @ " +
      showTicketData?.TicketDetails?.date_created +
      " " + 
      showTicketData?.TicketDetails?.time;

    const reqByHead = showTicketData?.ApproveHead?.UserDetails?.fname;
    const resreqByHead = reqByHead
    ? `${reqByHead} ${showTicketData?.ApproveHead?.UserDetails?.lname}${
        showTicketData?.appTBranchHead ? ` @ ${showTicketData.appTBranchHead}` : ""
      }`
    : "";

    const appByStaff =
      showTicketData?.ApproveAccountingStaff?.UserDetails?.fname;
      const resappByStaff = appByStaff
      ? `${appByStaff} ${showTicketData?.ApproveAccountingStaff?.UserDetails?.lname}${
          showTicketData?.appTAccStaff ? ` @ ${showTicketData.appTAccStaff}` : ""
        }`
      : "";

    const appBySup = showTicketData?.ApproveAccountingHead?.UserDetails?.fname;
    const resappBySup = appBySup
    ? `${appBySup} ${showTicketData?.ApproveAccountingHead?.UserDetails?.lname}${
        showTicketData?.appTAccHead ? ` @ ${showTicketData.appTAccHead}` : ""
      }`
    : "";
    const appByAutm = showTicketData?.AutomationHead?.UserDetails?.fname;
    const resappByAutm = appByAutm
    ? `${appByAutm} ${showTicketData?.AutomationHead?.UserDetails?.lname}${
        showTicketData?.appTAutomationHead ? ` @ ${showTicketData.appTAutomationHead}` : ""
      }`
    : "";

    const editedBy = showTicketData?.Automation?.UserDetails?.fname;
    const resEditedBy = editedBy
    ? `${editedBy} ${showTicketData?.Automation?.UserDetails?.lname}${
        showTicketData?.appTEdited ? ` @ ${showTicketData.appTEdited}` : ""
      }`
    : "";
    
    const values = [resreqByHead, resappByStaff, resappBySup].filter(
      (value) => value !== ""
    );
    const resNoted = [resreqByHead].filter(
      (value) => value !== ""
    );
    const resChecked = [resappByStaff].filter(
      (value) => value !== ""
    );
    const resReview = [resappBySup].filter(
      (value) => value !== ""
    );
    const resApproved = [resappByAutm].filter(
      (value) => value !== ""
    );
    const resEditedBys = [resEditedBy].filter(
      (value) => value !== ""
    );

    const columnWidth = `${100 / values.length}%`;

    const dateCreated = new Date(showTicketData?.TicketDetails?.date_created);
    const formattedDate = dateCreated.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const transDate = new Date(
      showTicketData?.TicketDetails?.ticket_transaction_date
    );
    const formattedTransDate = transDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const fontStyle =
      "font-family: Arial, sans-serif; font-size: 10px; font-style: italic;"; // Example font style
    const content = `
  <style>
    .font-style {
      ${fontStyle}
    }
    .bordered-table {
      border-collapse: collapse;
      width: 100%;
    }
    .bordered-table th, .bordered-table td {
      border: 1px solid black;
      padding: 8px;
    }
    .dotted-line {
      width: 100%;
      border-top: 1px dotted black; /* Use border instead of background gradient */
      margin-top: 10px; /* Adjust margin as needed */
    }
    @media print {
      .dotted-line {
          border-top: 1px dotted black; /* Ensure dotted line is visible when printing */
      }
    }
  </style>
      <div style="display: flex; justify-content: space-between;">
        <p>Ticket Code: ${showTicketData?.ticket_code}</p>
        <p style="text-align: center;"><b>${showTicketData?.branch_name}</b></p>
        <p class = "font-style" style="text-align: right;">Date: ${formattedDate}</p>
      </div>
      <p class = "font-style">Subject: For Edit</p>
      <table class="bordered-table font-style">
        <thead>
          <tr>
            <th>Transaction Date</th>
            <th>Category</th>
            <th>Reference Number</th>
            <th>Purpose</th>
            <th>From</th>
            <th>To</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${formattedTransDate}</td>
            <td>${showTicketData?.TicketDetails?.Category.category_name}</td>
            <td>${showTicketData?.TicketDetails?.td_ref_number}</td>
            <td>${purposes
              .map(
                (purpose, index) =>
                  `<li style = 'list-style:none;' key=${index}>${purpose}</li>`
              )
              .join("")}</td>
            <td>${froms
              .map(
                (froms, index) =>
                  `<li style = "list-style:none;" key=${index}>${froms}</li>`
              )
              .join("")}</td>
            <td>${tos
              .map(
                (tos, index) =>
                  `<li style = 'list-style:none;' key=${index}>${tos}</li>`
              )
              .join("")}</td>
          </tr>
        </tbody>
      </table>
      <br/>
      <span class = "font-style">Note(s): ${
        showTicketData?.TicketDetails?.td_note || "N/A"
      }</span>
      <br/>
      <br/>
      <br/>
      <div><center><p class = "font-style"><i> * * * Nothing Follows * * * </i></center></div>
      <div class="dotted-line"></div>
      
      <div class = "font-style">
        Requested by: ${reqBy}
        <br/>
        
        ${resNoted.length > 0 ? `<div style="display: flex;">Noted by: ${resNoted.join(" / ")}</div>` : ""}
        ${resReview.length > 0 ? `<div style="display: flex;">Checked by: ${resChecked.join(" / ")}</div>` : ""}
        ${resReview.length > 0 ? `<div style="display: flex;">Reviewed by: ${resReview.join(" / ")}</div>` : ""}
        ${resApproved.length > 0 ? `<div style="display: flex;">Approved by: ${resApproved.join(" / ")}</div>` : ""}
        ${resEditedBys.length > 0 ? `<div style="display: flex;">Edited by: ${resEditedBys.join(" / ")}</div>` : ""}
      </div>
    `;
    return content;
  };

  const handlePrint = () => {
    const printContent = generatePrintContent();
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket Print</title>
          <style>
            @media print {
              /* Hide header */
              header {
                display: none !important;
              }
              /* Hide footer */
              footer {
                display: none !important;
              }
              /* Add any other print-specific styles here */
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    const closePrintWindow = () => {
      printWindow.close();
    };
    window.addEventListener("afterprint", closePrintWindow);

    setTimeout(closePrintWindow, 1);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      setLoadingApprove(true);
      const UPDATE_STATUS_URL = `/updateTicketStatus/${ticketIdToView}`;

      const response = await axios.put(UPDATE_STATUS_URL, {
        note: showTicketData?.TicketDetails?.td_note,
        status: "APPROVED",
      });

      if (response.status === 200) {
        onCloseEdit();
      } else {
        toast.error("Error");
      }
    } catch (error) {
      console.error("Error approving ticket:", error);
      toast.error("An error occurred while approving the ticket");
    } finally {
      setLoadingApprove(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    const confirmation = await Swal.fire({
      title: "Reject Ticket for Revision",
      text: "Are you sure you want to reject this ticket for revision?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject it",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#0222f2",
      confirmButtonColor: "#d33",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setLoading(true);
      const UPDATE_STATUS_URL = `/updateTicketStatus/${ticketIdToView}`;

      const response = await axios.put(UPDATE_STATUS_URL, {
        note: showTicketData?.TicketDetails?.td_note,
        status: "REJECTED",
      });

      if (response.status === 200) {
        onCloseReject();
      } else {
        toast.error("Error");
      }
    } catch (error) {
      console.error("Error rejecting ticket:", error);
      toast.error("An error occurred while rejecting the ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = async (e) => {
    e.preventDefault();
    try {
      setLoadingDone(true);
      const UPDATE_STATUS_URL = `/updateTicketStatus/${ticketIdToView}`;
  
      const response = await axios.put(UPDATE_STATUS_URL, {
        note: showTicketData.TicketDetails?.td_note,
        status: "EDITED",
        isCheckboxChecked,
      });
  
      if (response.status === 200) {
        if (typeof onCloseEdit === 'function') {
          onCloseEdit(); // Safely call
        } else {
          onClose(); // Fallback
        }
      }
    } catch (error) {
      toast.error("Error updating ticket");
    } finally {
      setLoadingDone(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoadingSave(true);
      const UPDATE_STATUS_URL = `/updateApprovalStatus/${ticketIdToView}`;

      const response = await axios.put(UPDATE_STATUS_URL);

      if (response.status === 200) {
        onCloseRedirect();
      } else {
        toast.error("Error");
      }
    } catch (error) {
      console.error("Error changing approval status:", error);
      toast.error("An error occurred while changing approval status");
    } finally {
      setLoadingSave(false);
    }
  };

  const purposes = safeParseJSON(
    showTicketData?.TicketDetails?.td_purpose
  );
  const froms = safeParseJSON(showTicketData?.TicketDetails?.td_from);
  const tos = safeParseJSON(showTicketData?.TicketDetails?.td_to);

  const maxIndex = Math.max(purposes.length, froms.length, tos.length);

  const renderFieldsForIndex = (index) => (
    <div key={index} className="mt-2 w-full">
      <div className="w-full p-2">
        <label
          htmlFor={`purpose_${index}`}
          className="mb-1 block text-sm text-gray-900"
        >
          Purpose
        </label>
        <textarea
          type="text"
          id={`purpose_${index}`}
          className="focus:shadow-outline md:w-300 flex w-full rounded-md border border-gray-300 py-1 px-3 text-sm text-gray-900 focus:outline-none"
          value={purposes[index]}
          disabled
        />
      </div>
      <div className="flex w-full">
        <div className="w-1/2 p-2">
          <label
            htmlFor={`from_${index}`}
            className="mb-1 block text-sm text-gray-900"
          >
            From
          </label>
          <textarea
            type="text"
            id={`from_${index}`}
            className="focus:shadow-outline w-full rounded-md border border-gray-300 py-1 px-3 text-sm text-gray-900 focus:outline-none"
            value={froms[index]}
            disabled
          />
        </div>
        <div className="w-1/2 p-2">
          <label
            htmlFor={`to_${index}`}
            className="mb-1 block text-sm text-gray-900"
          >
            To
          </label>
          <textarea
            type="text"
            id={`to_${index}`}
            className="focus:shadow-outline w-full rounded-md border border-gray-300 py-1 px-3 text-sm text-gray-900 focus:outline-none"
            value={tos[index]}
            disabled
          />
        </div>
      </div>
    </div>
  );

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setShowTicketData((prevData) => ({
      ...prevData,
      [name]: value,
      Category: {
        ...prevData.Category,
        [name]: value,
      },
      TicketDetails: {
        ...prevData.TicketDetails,
        [name]: value,
      },
    }));
  };

  const handleCheckboxChange = (e, checkboxNumber) => {
    if (checkboxNumber === 1) {
      setIsCheckboxChecked(e.target.checked);
    } else if (checkboxNumber === 2) {
      setIsCheckboxChecked2(e.target.checked);
      setShowButton(e.target.checked);
    } else if (checkboxNumber === 3) {
      setIsCheckboxChecked3(e.target.checked);
    }
  };

  const handleDownloadAll = (e) => {
    e.preventDefault();
    const zip = new JSZip();

    const fetchPromises = [];

    supportFiles.forEach((file) => {
      const fetchPromise = fetch(file.url)
        .then((response) => response.blob())
        .then((blob) => {
          zip.file(file.name, blob);
        })
        .catch((error) => {
          console.error("Error fetching file:", error);
        });

      fetchPromises.push(fetchPromise);
    });

    Promise.all(fetchPromises)
      .then(() => {
        zip.generateAsync({ type: "blob" }).then((content) => {
          saveAs(content, "support_files.zip");
        });
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
      });
  };

  const getFileExtension = (filename) => {
    return filename.split(".").pop().toLowerCase();
  };

  const isImageFile = (filename) => {
    const imageExtensions = [
      "jpeg",
      "jpg",
      "png",
      "bmp",
      "gif",
      "tiff",
      "webp",
      "jfif",
      "svg",
    ];
    return imageExtensions.includes(getFileExtension(filename));
  };

  return (
    <div>
      {/*View Modal */}
      <div className="h-14 max-h-screen overflow-y-auto">
        <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center ">
          <div className="absolute inset-0 bg-black opacity-75 "></div>
          <div className="shadow-sky-200 relative z-10 h-[95%] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
            <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
              <Typography variant="h6" color="white">
                Ticket Code: {showTicketData?.ticket_code}
              </Typography>
              <Typography
                variant="h6"
                color="white"
                style={{ right: 20, marginTop: -25, position: "absolute" }}
                onClick={handlePrint}
              >
                {/* <PrinterIcon title="Print Ticket" className="h-7 w-7 -mt-7"/> */}
                <span
                  style={{
                    border: "2px solid white",
                    paddingBottom: 1,
                    paddingTop: 1,
                    paddingLeft: 15,
                    paddingRight: 15,
                    borderRadius: 8,
                    transition: "background-color 0.3s", // Add transition for smoother effect
                    cursor: "pointer", // Change cursor on hover
                  }}
                  // Apply hover effect
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "white";
                    e.target.style.color = "#1e88e5";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "";
                    e.target.style.color = "white";
                  }}
                >
                  Print
                </span>
              </Typography>
            </CardHeader>
            {/* Close modal button */}
            <button
              className="absolute top-2 right-2 mt-6 rounded px-2 py-1 text-black"
              onClick={onClose}
            >
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>
            <div className="max-h-[80vh] overflow-y-auto p-2">
              <CardBody>
                <form className="m-auto flex w-full flex-wrap justify-between text-sm">
                  <div className="mb-5 w-full border-x-2 border-y-2 p-2">
                    <div className="-mx-2 flex flex-wrap ">
                      <div className="w-full p-2 md:w-1/2">
                        <div className="w-full p-2">
                          <label
                            htmlFor="date"
                            className="mb-1 block text-sm text-gray-900"
                          >
                            Transaction Date
                          </label>
                          <input
                            type="text"
                            id="date"
                            className="focus:shadow-outline w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none"
                            value={
                              showTicketData?.TicketDetails
                                ?.ticket_transaction_date || ""
                            }
                            disabled
                          />
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="w-full p-2 md:w-1/2">
                        <div className="w-full p-2">
                          <label
                            htmlFor="date"
                            className="mb-1 block text-sm text-gray-900 "
                          >
                            Ticket Category
                          </label>
                          <input
                            type="text"
                            id="category"
                            className="focus:shadow-outline w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none "
                            value={
                              showTicketData?.TicketDetails?.Category
                                ?.category_name || ""
                            }
                            disabled
                          />
                        </div>
                      </div>

                      {showTicketData?.TicketDetails?.Category?.group_code ===
                        3 && (
                        <div className="w-full p-2 md:w-1/2">
                          <div className="w-full p-2">
                            <label
                              htmlFor="date"
                              className="mb-1 block text-sm  text-gray-900 "
                            >
                              Supplier
                            </label>
                            <input
                              type="text"
                              id="reference"
                              className="focus:shadow-outline w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none  "
                              value={
                                showTicketData?.TicketDetails?.Supplier
                                  ?.supplier
                              }
                              disabled
                            />
                          </div>
                        </div>
                      )}

                      <div className="w-full p-2 md:w-1/2">
                        <div className="w-full p-2">
                          <label
                            htmlFor="date"
                            className="mb-1 block text-sm  text-gray-900 "
                          >
                            Reference Number
                          </label>
                          <input
                            type="text"
                            id="reference"
                            className="focus:shadow-outline w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none  "
                            value={
                              showTicketData?.TicketDetails?.td_ref_number || ""
                            }
                            disabled
                          />
                        </div>
                      </div>

                      {Array.from({ length: maxIndex }).map((_, index) =>
                        renderFieldsForIndex(index)
                      )}

                      <div className="-mt-3 w-full p-2">
                        <div className="mt-2 w-full p-2">
                          <label
                            htmlFor="td_note "
                            className="mb-1 block text-sm text-gray-900"
                          >
                            Note
                          </label>
                          <textarea
                            type="textarea"
                            placeholder="ADD NOTE HERE"
                            name="td_note"
                            className="focus:shadow-outline h-16 w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none"
                            value={showTicketData?.TicketDetails?.td_note}
                            onChange={handleEditInputChange}
                            disabled={noteDisabled}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <label
                    htmlFor="supportFile"
                    className="mb-1 block text-sm text-gray-900"
                  >
                    Support (Files)
                  </label>
                  <div className="mb-4 flex w-full flex-row border-x-2 border-y-2">
                    <div className="mt-2 w-full p-2">
                      {supportFiles.length > 0 ? (
                        <ul
                          style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            display: "flex",
                            flexWrap: "wrap",
                          }}
                        >
                          {supportFiles.map((file, index) => (
                            <li key={index} className="relative mr-4 mb-4">
                              {isImageFile(file.name) ? (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="image-link"
                                >
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="image-thumbnail mr-2"
                                    style={{
                                      maxHeight: "100px",
                                      maxWidth: "100px",
                                      borderRadius: "5px",
                                      minHeight: "100px",
                                      minWidth: "100px",
                                    }}
                                  />
                                  <div className="filename">{file.name}</div>
                                </a>
                              ) : (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={file.name}
                                  className="text-blue-500 hover:underline"
                                  title={file.name}
                                >
                                  <div className="file-icon">
                                    {getFileExtension(file.name) === "xlsx" ||
                                    getFileExtension(file.name) === "xls" ? (
                                      <i className="far fa-file-excel"></i>
                                    ) : getFileExtension(file.name) ===
                                        "docx" ||
                                      getFileExtension(file.name) === "doc" ? (
                                      <i className="far fa-file-word"></i>
                                    ) : getFileExtension(file.name) ===
                                      "pdf" ? (
                                      <i className="far fa-file-pdf"></i>
                                    ) : (
                                      <i className="far fa-file-alt"></i>
                                    )}
                                  </div>
                                  <div className="filename">{file.name}</div>
                                </a>
                              )}
                            </li>
                          ))}
                          <button
                            onClick={handleDownloadAll}
                            className="mt-4 rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "60px",
                              marginTop: "30px",
                            }}
                          >
                            Download All as Zip
                          </button>
                        </ul>
                      ) : (
                        <span className="text-gray-500">
                          No support files available
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 mb-4 w-full border-x-2 border-y-2 p-2">
                    <div className="-mx-2 flex flex-wrap ">
                      <div className="flex-col md:w-1/2">
                        <div className="w-full p-2">
                          <label
                            htmlFor="code"
                            className="mb-1 block text-sm text-gray-900"
                          >
                            Branch
                          </label>
                          <input
                            type="text"
                            id="code"
                            className="focus:shadow-outline w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none"
                            value={showTicketData?.branch_name || ""}
                            disabled
                          />
                        </div>
                      </div>
                      {(userRole === 1 ||
                        userRole === 2 ||
                        userRole === 3 ||
                        userRole === 4) && (
                        <div className="flex-col md:w-1/2">
                          <div className=" w-full p-2">
                            <label
                              htmlFor="requested"
                              className="mb-1 block text-sm text-gray-900"
                            >
                              Requested by
                            </label>
                            <input
                              type="text"
                              id="requested"
                              className="focus:shadow-outline w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none "
                              value={
                                showTicketData?.UserTicket?.UserDetails?.fname +
                                " " +
                                showTicketData?.UserTicket?.UserDetails?.lname
                              }
                              disabled
                            />
                          </div>
                        </div>
                      )}
                      {(userRole === 1 ||
                        userRole === 3 ||
                        userRole === 4 ||
                        userRole === 5) &&
                        showTicketData?.approveHead != null && (
                          <div className="flex-col md:w-1/2">
                            <div className="w-full p-2">
                              <label
                                htmlFor="assigned"
                                className="mb-1 block text-sm text-gray-900"
                              >
                                Approved by Branch Head
                              </label>
                              <input
                                type="text"
                                name="assigned"
                                className="focus:shadow-outline w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none "
                                value={
                                  showTicketData?.ApproveHead?.UserDetails
                                    ?.fname +
                                    " " +
                                    showTicketData?.ApproveHead?.UserDetails
                                      ?.lname || ""
                                }
                                disabled
                              />
                            </div>
                          </div>
                        )}
                      {(userRole === 1 ||
                        userRole === 3 ||
                        userRole === 4 ||
                        userRole === 5) &&
                        showTicketData?.approveAcctgSup != null && (
                          <div className="flex-col md:w-1/2">
                            <div className="w-full p-2">
                              <label
                                htmlFor="assigned"
                                className="mb-1 block text-sm text-gray-900"
                              >
                                Approved By Accounting
                              </label>
                              <input
                                type="text"
                                name="assigned"
                                className="focus:shadow-outline w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none "
                                value={
                                  showTicketData?.ApproveAccountingHead
                                    ?.UserDetails?.fname +
                                    " " +
                                    showTicketData?.ApproveAccountingHead
                                      ?.UserDetails?.lname || ""
                                }
                                disabled
                              />
                            </div>
                          </div>
                        )}

                      {userRole !== 2 && (
                        <div className="flex-col md:w-1/2">
                          <div className="w-full p-2">
                            <label
                              htmlFor="assigned"
                              className="mb-1 block text-sm text-gray-900"
                            >
                              Assigned to
                            </label>
                            <input
                              type="text"
                              name="assigned"
                              className="focus:shadow-outline w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none "
                              value={
                                showTicketData?.AssignedTicket?.UserDetails
                                  ?.fname +
                                  " " +
                                  showTicketData?.AssignedTicket?.UserDetails
                                    ?.lname || ""
                              }
                              disabled
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex w-full flex-row justify-between">
                    {(userRole === 3 &&
                      status === "PENDING" &&
                      ((displayTicket >= 1 && displayTicket <= 6) ||
                        displayTicket === 9 ||
                        displayTicket === 20 ||
                        displayTicket === 30)) ||
                    (userRole === 7 &&
                      status === "PENDING" &&
                      ((displayTicket >= 12 && displayTicket <= 14) ||
                        displayTicket === 10 ||
                        displayTicket === 21 ||
                        displayTicket === 31)) ||
                    (userRole === 4 &&
                      status === "PENDING" &&
                      displayTicket === 7) ? (
                      <div className="ml-auto flex-col">
                        {loading ? (
                          <span className="h-10 rounded-md bg-red-200 px-3 py-1 font-medium text-white">
                            Please Wait...
                          </span>
                        ) : (
                          <button
                            className="h-10 rounded-md bg-red-500 px-3 py-1 text-white"
                            onClick={handleReject}
                          >
                            Revise
                            <ToastContainer />
                          </button>
                        )}

                        {loadingApprove ? (
                          <span className="h-10 rounded-md bg-green-200 px-3 py-1 font-medium text-white">
                            Please Wait...
                          </span>
                        ) : (
                          <button
                            className="ml-3 h-10 rounded-md bg-green-500 px-5 py-1 text-white"
                            onClick={handleApprove}
                          >
                            Approve
                            <ToastContainer />
                          </button>
                        )}
                      </div>
                    ) : null}

                    <div className="flex-col">
                      {(userRole === 1 || userRole === 2) && (
                        <div>
                          <Checkbox
                            label="Not Counted?"
                            className="checked:border-green-500 checked:bg-green-500"
                            checked={isCheckboxChecked}
                            title="Check if not counted"
                            onChange={(e) => handleCheckboxChange(e, 1)}
                          />
                        </div>
                      )}

                      {userRole === 1 && (
                        <div>
                          <Checkbox
                            label="Redirect to Automation"
                            className="checked:border-green-500 checked:bg-green-500"
                            checked={isCheckboxChecked2}
                            title="Check if you want the ticket move to Automation"
                            onChange={(e) => handleCheckboxChange(e, 2)}
                          />
                          {showButton && (
                            <>
                              {loadingSave ? (
                                <span className="h-10 rounded-md bg-green-300 px-3 py-1 font-medium text-white">
                                  Please Wait...
                                </span>
                              ) : (
                                <button
                                  className="ml-3 h-10 rounded-md bg-blue-500 px-5 py-1 text-white"
                                  onClick={handleSave}
                                  style={{ marginLeft: "20px" }}
                                >
                                  Save
                                  <ToastContainer />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      {(userRole === 1 || userRole === 2 || userRole === 9) && (
                        <>
                          {loading ? (
                            <span className="h-10 rounded-md bg-red-200 px-3 py-1 font-medium text-white">
                              Please Wait...
                            </span>
                          ) : (
                            <>
                              <button
                                className="h-10 rounded-md bg-red-500 px-3 py-1 text-white"
                                onClick={handleReject}
                              >
                                Revise
                                <ToastContainer />
                              </button>
                            </>
                          )}

                          {loadingDone ? (
                            <span className="h-10 rounded-md bg-blue-200 px-3 py-1 font-medium text-white">
                              Please Wait...
                            </span>
                          ) : (
                            <>
                              {(userRole === 1 || userRole === 2) ? (
                                 <button
                                 className="ml-3 h-10 rounded-md bg-blue-500 px-5 py-1 text-white" onClick={handleDone}>
                                 Edited
                                 <ToastContainer />
                               </button>
                              ) : (

                                <>
                                  {(userRole === 9 && displayTicket === 100) ? (
                                    <button
                                      className="ml-3 h-10 rounded-md bg-blue-500 px-5 py-1 text-white"
                                      onClick={handleApprove}
                                    >
                                      Approve
                                      <ToastContainer />
                                    </button>
                                  ) : (
                                    <>
                                      {(userRole === 9 && displayTicket === 8) ? (
                                        <button
                                          className="ml-3 h-10 rounded-md bg-green-200 px-5 py-1 text-white"
                                          style={{ cursor: "not-allowed" }}
                                          disabled
                                        >
                                          Approved
                                          <ToastContainer />
                                        </button>
                                      ) : (
                                        <></>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </>
                           
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </CardBody>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
