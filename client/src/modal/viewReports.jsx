import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "@/api/axios";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { EyeIcon } from "@heroicons/react/24/solid";
import Modal from "react-modal";
import { jwtDecode } from "jwt-decode";
import ViewTicketModal from "@/modal/viewTicket";
import JSZip from "jszip";

function ViewReportModal({
  isOpen,
  onClose,
  reportToView,
  startDate,
  endDate,
  returnedData,
}) {
  const token = sessionStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userRole = decoded.role;
  const [showReportData, setShowReportData] = useState([]);
  const [innerModalOpen, setInnerModalOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [isViewTicketModalOpen, setIsViewTicketModalOpen] = useState(false);
  const [showTicketToView, setShowTicketToView] = useState(false);
  const [displayTicket, setDisplayTicket] = useState();
  const [status, setStatus] = useState([]);
  const [ticketStat, setTicketStat] = useState(false);
  const [note, setNote] = useState(reportToView.TicketDetails?.td_note);
  const [ticketID, setTicketID] = useState(reportToView.ticket_id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const VIEW_URL = `/viewReports?bcode=${reportToView.branch_code}&category=${reportToView.category_shortcut}&counted=${reportToView.counted}&startDate=${startDate}&endDate=${endDate}`;

  const safeParseJSON = (str) => {
    try {
      // Trim whitespace and replace newlines with a space
      const cleanedStr = str.replace(/[\r\n]+/g, " ").trim();
      return JSON.parse(cleanedStr);
    } catch (e) {
      return [];
    }
  };

  const fetchReportData = async () => {
    try {
      const response = await axios.get(VIEW_URL);
      setShowReportData(response.data);
    } catch (error) {
      console.error("Error fetching branch data:", error);
    }
  };

  useEffect(() => {
    if (isOpen && reportToView) {
      fetchReportData();
    }
  }, [isOpen, reportToView]);

  const createFileFromUrl = async (fileUrl) => {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileUrl}: ${response.statusText}`);
    }
    const blob = await response.blob();
    const fileName = decodeURIComponent(fileUrl.split("/").pop());
    return new File([blob], fileName, { type: blob.type });
  };

  const handleDownload = (attachmentUrl) => {
    const zip = new JSZip();
    const fetchPromises = [];
    const supportFiles = JSON.parse(attachmentUrl);

    supportFiles.forEach((file) => {
      const fetchPromise = createFileFromUrl(`${axios.defaults.baseURL}/uploads/${file}`)
        .then((fileObject) => {
          zip.file(fileObject.name, fileObject);
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
        console.error("Error creating zip:", error);
      });
  };

  const ImageViewer = ({ imageUrls }) => {
    if (!innerModalOpen || !imageUrls) {
      return null;
    }

    return (
      <Modal
        isOpen={innerModalOpen}
        onRequestClose={() => {
          setInnerModalOpen(false);
          setSelectedAttachment(null);
        }}
        contentLabel="Inner Inner Image Modal"
        style={{
          overlay: {
            zIndex: 1000,
          },
          content: {
            zIndex: 1001,
            width: "40%",
            height: "90%",
            overflow: "auto",
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginBottom: "10px",
            marginTop: "2px",
          },
        }}
      >
        <div className="h-auto w-full">
          <button className="-ml-20" onClick={() => setInnerModalOpen(false)}>
            x
          </button>
          {Array.isArray(imageUrls) ? (
            <div style={{ maxHeight: "80vh", overflowY: "auto" }}>
              {imageUrls.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Attachment ${index + 1}`}
                  style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
              ))}
            </div>
          ) : (
            <img
              className="h-full w-full text-center"
              src={imageUrls}
              alt="Attachment"
            />
          )}
        </div>
      </Modal>
    );
  };

  const handleView = (attachmentUrl) => {
    const file = JSON.parse(attachmentUrl);
    const urlsArray = file.map((url) => url.trim());

    if (urlsArray.length > 0 && !innerModalOpen) {
      if (urlsArray.length === 1) {
        const trimmedUrl = `${axios.defaults.baseURL}/uploads/${urlsArray[0]}`;
        if (trimmedUrl.match(/\.(jpeg|jpg|gif|png)$/) != null) {
          setSelectedAttachment(trimmedUrl);
          setInnerModalOpen(true);
        } else {
          handleDownload(urlsArray[0]);
        }
      } else {
        const trimmedUrls = urlsArray.map((url) => `${axios.defaults.baseURL}/uploads/${url}`);
        setSelectedAttachment(trimmedUrls);
        setInnerModalOpen(true);
      }
    } else {
      console.error("Attachment URLs are empty or modal is already open.");
    }
  };

  const handleViewTicketClick = async (ticketId, status, displayTicket) => {
    setIsViewTicketModalOpen(true);
    setShowTicketToView(ticketId);
    setStatus(status);
    setDisplayTicket(displayTicket);
    setTicketStat(true);
  };
  const closeViewModal = () => {
    setIsViewTicketModalOpen(false);
  };

  const handleReturn = async (ticketID) => {
    try {
      await axios.put(`/returnToAutomation/${ticketID}`);
      onClose();
      returnedData(true);
    } catch (error) {
      console.error("Error returning to automation:", error);
    }
  };

  const updateCount = async (ticketID) => {
    try {
      await axios.put(`/updateCount/${ticketID}`);
      onClose();
      returnedData(true);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleEditNote = (ticketId, ticket_note) => {
    setTicketID(ticketId);
    setIsModalOpen(true);
    setNote(ticket_note);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleNoteChange = (event) => {
    setNote(event.target.value);
  };

  const handleSave = async () => {
    try {
      setIsModalOpen(false);
      await fetchReportData();
      await axios.put(`/updateNote/${ticketID}`, { note });
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <div
      id="viewmodal"
      className="opacity-96 fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black opacity-75"></div>
      <div className="max-w-screen-xxl shadow-sky-200 relative z-10 h-[90%] w-full rounded-lg bg-white p-1 shadow md:w-[100%] lg:w-[90%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
          <Typography variant="h6" color="white">
            Reports Data
          </Typography>
        </CardHeader>
        <button
          className="absolute top-2 right-2 mt-6 rounded px-2 py-1 text-black"
          onClick={onClose}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <CardBody>
          <div className="max-h-[520px] overflow-x-auto border">
            <table className="max-w-full">
              <thead>
                <tr>
                  {[
                    "Ticket Code",
                    "Transaction Date",
                    "Ticket Category",
                    "Reference Number",
                    "Purpose",
                    "From",
                    "To",
                    "Note",
                    "Branch",
                    "Requested By",
                    "Approved By Branch Head",
                    "Approved By Accounting",
                    "Approved By Accounting Staff",
                    "Attachments",
                    "Edited By",
                    "Date Edited",
                    userRole === 1 ? "Action" : "",
                  ].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {showReportData.length > 0 &&
                  showReportData.map((data, index) => {
                    const { ticket_id, status, displayTicket } = data;
                    return (
                      <tr key={index} className="text-[11px]">
                        <td className="border p-2">
                          <span
                            onClick={() =>
                              handleViewTicketClick(
                                ticket_id,
                                status,
                                displayTicket
                              )
                            }
                            style={{ color: "blue", cursor: "pointer" }}
                            title="View or Print"
                          >
                            <u>{data.ticket_code}</u>
                          </span>
                        </td>
                        <td className="border p-2">
                          {data.TicketDetails.ticket_transaction_date}
                        </td>
                        <td
                          className="border p-2"
                          style={{ minWidth: "200px" }}
                        >
                          {data.TicketDetails.Category.category_name}
                        </td>

                        <td
                          className="border p-2"
                          style={{ minWidth: "400px" }}
                        >
                          {data.TicketDetails.td_ref_number
                            .split(",")
                            .map((reference, i) => (
                              <div key={i}>{reference.trim()}</div>
                            ))}
                        </td>

                        <td
                          className="border p-2"
                          style={{ minWidth: "400px" }}
                        >
                          {safeParseJSON(data.TicketDetails.td_purpose).map(
                            (purpose, i) => (
                              <div key={i}>{purpose.trim()} </div>
                            )
                          )}
                        </td>

                        <td
                          className="border p-2"
                          style={{ minWidth: "300px" }}
                        >
                          {safeParseJSON(data.TicketDetails.td_from).map(
                            (from, i) => (
                              <div key={i}>{from.trim()}</div>
                            )
                          )}
                        </td>

                        <td
                          className="border p-2"
                          style={{ minWidth: "300px" }}
                        >
                          {safeParseJSON(data.TicketDetails.td_to).map(
                            (to, i) => (
                              <div key={i}>{to.trim()}</div>
                            )
                          )}
                        </td>

                        <td
                          className="border p-2"
                          style={{ minWidth: "150px" }}
                        >
                          {data.TicketDetails.td_note}
                        </td>
                        <td
                          className="border p-2"
                          style={{ minWidth: "150px" }}
                        >
                          {data.Branch.b_name}
                        </td>
                        <td
                          className="border p-2"
                          style={{
                            minWidth: "150px",
                            textTransform: "capitalize",
                          }}
                        >
                          {data.UserTicket?.UserDetails?.fname +
                            " " +
                            data.UserTicket?.UserDetails?.lname}
                        </td>
                        <td
                          className="border p-2"
                          style={{
                            minWidth: "150px",
                            textTransform: "capitalize",
                          }}
                        >
                          {data.approveHead
                            ? data.ApproveHead?.UserDetails?.fname +
                              " " +
                              data.ApproveHead?.UserDetails?.lname
                            : ""}
                        </td>
                        <td
                          className="border p-2"
                          style={{
                            minWidth: "150px",
                            textTransform: "capitalize",
                          }}
                        >
                          {data.approveAcctgStaff
                            ? data.ApproveAccountingStaff?.UserDetails?.fname +
                              " " +
                              data.ApproveAccountingStaff?.UserDetails?.lname
                            : ""}
                        </td>
                        <td
                          className="border p-2"
                          style={{
                            minWidth: "150px",
                            textTransform: "capitalize",
                          }}
                        >
                          {data.approveAcctgSup
                            ? data.ApproveAccountingHead?.UserDetails?.fname +
                              " " +
                              data.ApproveAccountingHead?.UserDetails?.lname
                            : ""}
                        </td>
                        <td className="border p-2">
                          {JSON.parse(data.TicketDetails.td_support).length >
                          0 ? (
                            <div className="flex justify-center">
                              <button
                                onClick={() => {
                                  handleView(data.TicketDetails.td_support);
                                }}
                              >
                                <EyeIcon
                                  className="h-5 w-5 text-blue-500"
                                  title="View Support"
                                />
                              </button>

                              <button
                                className="ml-2 rounded bg-blue-500 py-1 px-2 font-bold text-white hover:bg-blue-700"
                                style={{ fontSize: "5px" }}
                                onClick={() => {
                                  handleDownload(data.TicketDetails.td_support);
                                }}
                              >
                                <ArrowDownTrayIcon
                                  className="h-3 w-7 text-white"
                                  title="Download Support"
                                />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <span className="font-bold">No Support File</span>
                            </div>
                          )}
                        </td>
                        <td
                          className="border p-2"
                          style={{ textTransform: "capitalize" }}
                        >
                          {data.edited_by
                            ? data.Automation?.UserDetails?.fname +
                              " " +
                              data.Automation?.UserDetails?.lname
                            : null}
                        </td>
                        <td className="border p-2">
                          {data.TicketDetails.date_completed}
                        </td>
                        <td>
                          {userRole === 1 && (
                            <div class="flex justify-between gap-2">
                              <button
                                type="button"
                                title="Return To Automation"
                                className="w-40 rounded-lg bg-blue-600 py-1 px-2 text-sm font-semibold text-white shadow-lg transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                onClick={() => handleReturn(data.ticket_id)}
                              >
                                <span className="text-xs">
                                  Return To Automation
                                </span>
                              </button>
                              {data.isCounted === 0 ? (
                                <button
                                  type="button"
                                  title="Mark as not counted"
                                  className="w-40 rounded-lg bg-blue-600 py-1 px-2 text-sm font-semibold text-white shadow-lg transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                  onClick={() => updateCount(data.ticket_id)}
                                >
                                  <span className="text-xs">
                                    Mark as not counted
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  title="Mark as counted"
                                  className="w-40 rounded-lg bg-blue-600 py-1 px-2 text-sm font-semibold text-white shadow-lg transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                  onClick={() => updateCount(data.ticket_id)}
                                >
                                  <span className="text-xs">
                                    Mark as counted
                                  </span>
                                </button>
                              )}
                              <button
                                type="button"
                                title="Edit Note"
                                className="w-40 rounded-lg bg-blue-600 py-1 px-2 text-sm font-semibold text-white shadow-lg transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                onClick={() =>
                                  handleEditNote(
                                    data.ticket_id,
                                    data.TicketDetails.td_note
                                  )
                                }
                              >
                                <span className="text-xs">Edit Note</span>
                              </button>

                              {isModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
                                  <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                                    <h2 className="mb-4 text-xl font-semibold">
                                      Edit Note
                                    </h2>
                                    <textarea
                                      className="h-32 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Enter your note here..."
                                      value={note}
                                      onChange={handleNoteChange}
                                    />
                                    <div className="mt-4 flex justify-end">
                                      <button
                                        className="mr-2 rounded-lg bg-gray-400 py-1 px-3 text-sm font-semibold text-white hover:bg-gray-500"
                                        onClick={handleModalClose}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="rounded-lg bg-blue-600 py-1 px-3 text-sm font-semibold text-white hover:bg-blue-700"
                                        onClick={handleSave}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              {isViewTicketModalOpen && (
                <ViewTicketModal
                  isOpen={isViewTicketModalOpen}
                  onClose={closeViewModal}
                  ticketIdToView={showTicketToView}
                  displayTicket={displayTicket}
                  status={status}
                  ticketStat={ticketStat}
                />
              )}
            </table>
          </div>
        </CardBody>
        {selectedAttachment && <ImageViewer imageUrls={selectedAttachment} />}
      </div>
    </div>
  );
}

export default ViewReportModal;
