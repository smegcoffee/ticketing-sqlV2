import {
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import "sweetalert2/dist/sweetalert2.min.css";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { jwtDecode } from "jwt-decode";

export default function EditTicketModal({
  isOpen,
  onClose,
  ticketIdToEdit,
  onCloseModal,
}) {
  const token = sessionStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userRole = decoded.role;
  const [showTicketData, setShowTicketData] = useState({});
  const [category, setCategory] = useState([]);
  const [automationUsers, setAutomationUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [loading, setLoading] = useState(false);
  const [supportFiles, setSupportFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();
  const [supplier, setSupplier] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [setupNumberError, setSetupNumberError] = useState(false);
  const [branchCode, setBranchCode] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState();
  const [userBranches, setUserBranches] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [froms, setFroms] = useState([]);
  const [tos, setTos] = useState([]);
  const disableRole = [1, 2, 3, 6, 8];
  const addFieldRole = [4, 5, 7];
  const displayForThisRole = addFieldRole.includes(userRole);
  const isDisabled = disableRole.includes(userRole);

  const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  const handleRemoveFile = async (index) => {
    const updatedFiles = [...selectedFile];
    updatedFiles.splice(index, 1);
    setSelectedFile(updatedFiles);
  };

  const dateNow = new Date();
  const currentMonth = dateNow.getMonth();
  const currentYear = dateNow.getFullYear();

  const safeParseJSON = (str) => {
    try {
      // Trim whitespace and replace newlines with a space
      const cleanedStr = str.replace(/[\r\n]+/g, ' ').trim();
      return JSON.parse(cleanedStr);
    } catch (e) {
      return [];
    }
  };

  const lastmonth = new Date(dateNow);
  lastmonth.setMonth(lastmonth.getMonth() - 1);
  lastmonth.setDate(1);
  lastmonth.setDate(lastmonth.getDate() - 1);

  const lastMonth = new Date(currentYear, currentMonth - 1, 11);
  const lastMonthDate = Math.min(11, lastMonth.getDate());

  // Set the date to the last month on or before the 10th
  const newDate = new Date(currentYear, currentMonth - 1, lastMonthDate)
    .toISOString()
    .split("T")[0];
  const lastDate = new Date(
    currentYear,
    lastMonth.getMonth(),
    lastmonth.getDate() + 1
  )
    .toISOString()
    .split("T")[0];

  const handleRemoveDatabaseFile = async (index) => {
    const updatedSupport = [...supportFiles];
    const fileToRemove = updatedSupport[index].file;

    if (index < updatedSupport.length) {
      const updatedSupportFiles = updatedSupport.filter((_, i) => i !== index);
      setSupportFiles(updatedSupportFiles);

      // Track the file to be deleted
      setFilesToDelete((prevFiles) => [...prevFiles, fileToRemove.name]);

      try {
        if (!ticketIdToEdit) {
          throw new Error("Ticket ID is missing.");
        }

        // Update the support files in the database
        await axios.patch(`/updateSupport/${ticketIdToEdit}`, {
          td_support: updatedSupportFiles.map((file) => file.file.name), // Assuming you want to keep file names in the array
        });
      } catch (error) {
        console.error("Error updating td_support:", error);
        setSupportFiles(updatedSupport);
      }
    }
  };

  useEffect(() => {
    async function fetchTicketData() {
      try {
        const EDIT_URL = `/viewTicket/${ticketIdToEdit}`;
        const response = await axios.get(EDIT_URL);

        setShowTicketData(response.data);

        const supportFilesData = JSON.parse(
          response.data?.TicketDetails?.td_support
        );

        const createFileFromUrl = async (fileUrl) => {
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const fileName = decodeURIComponent(fileUrl.split("/").pop());
          return new File([blob], fileName, { type: blob.type });
        };

        const files = await Promise.all(
          supportFilesData.map(async (fileUrl) => {
            const file = await createFileFromUrl(`${axios.defaults.baseURL}/uploads/${fileUrl}`);
            return {
              file,
              url: `${axios.defaults.baseURL}/uploads/${fileUrl}`,
            };
          })
        );

        const initialPurposes = safeParseJSON(
          response.data?.TicketDetails?.td_purpose
        );
        const initialFroms = safeParseJSON(
          response.data?.TicketDetails?.td_from
        );
        const initialTos = safeParseJSON(response.data?.TicketDetails?.td_to);

        setPurposes(initialPurposes);
        setFroms(initialFroms);
        setTos(initialTos);

        setSupportFiles(files);
        setSelectedBranch({
          value: response.data.Branch?.blist_id,
          label: response.data.Branch?.b_code.toUpperCase(),
        });
        setSelectedCategory({
          value: response.data.TicketDetails?.Category?.ticket_category_id,
          label: response.data.TicketDetails?.Category?.category_name,
        });
        setSelectedSupplier({
          value: response.data.TicketDetails?.Supplier?.id,
          label: response.data.TicketDetails?.Supplier?.supplier,
        });
      } catch (error) {
        console.error("Error in viewEditBranch:", error);
        throw error;
      }
    }

    async function fetchBranches() {
      try {
        const response = await axios.get("/getAllBranches");
        setBranchCode(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    }

    if (isOpen && ticketIdToEdit) {
      fetchTicketData();
      fetchBranches();
    }
  }, [isOpen, ticketIdToEdit]);

  const handleEditInputChange = (event, field, index) => {
    const { name, value } = event.target;

    if (field === "ticket_transaction_date" || field === "td_ref_number") {
      setShowTicketData((prevData) => ({
        ...prevData,
        TicketDetails: {
          ...prevData.TicketDetails,
          [field]: value,
        },
      }));
    } else {
      const updatedPurposes = [...purposes];
      const updatedFroms = [...froms];
      const updatedTos = [...tos];

      switch (field) {
        case "purpose":
          updatedPurposes[index] = value;
          break;
        case "from":
          updatedFroms[index] = value;
          break;
        case "to":
          updatedTos[index] = value;
          break;
        default:
          break;
      }

      setShowTicketData((prevData) => ({
        ...prevData,
        TicketDetails: {
          ...prevData.TicketDetails,
          td_purpose: JSON.stringify(updatedPurposes),
          td_from: JSON.stringify(updatedFroms),
          td_to: JSON.stringify(updatedTos),
        },
      }));
    }
  };

  const addFields = () => {
    setPurposes([...purposes, ""]);
    setFroms([...froms, ""]);
    setTos([...tos, ""]);
  };

  const removeField = (index) => {
    setPurposes(purposes.filter((_, i) => i !== index));
    setFroms(froms.filter((_, i) => i !== index));
    setTos(tos.filter((_, i) => i !== index));
  };

  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await axios.get("/getAllCategories");
        setCategory(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    async function fetchUserBranches() {
      try {
        const response = await axios.get("/getUserLoginInfo");
        setUserBranches(response.data.Branches);
      } catch (error) {
        console.error("Error fetching branch codes:", error);
      }
    }

    fetchUserBranches();
    fetchCategory();
  }, []);

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };
  const handleSupplierChange = (selectedOption) => {
    setSelectedSupplier(selectedOption);
  };

  useEffect(() => {
    fetchAutomationUsers();
  }, []);

  const fetchAutomationUsers = async () => {
    try {
      const response = await axios.get("/getAllAutomation");
      setAutomationUsers(response.data);
    } catch (error) {
      console.error("Error fetching automation users:", error);
      throw error;
    }
  };

  const handleUserChange = (selectedOption) => {
    setSelectedUser(selectedOption);
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (selectedCategory) {
      if (
        selectedSupplier.value === undefined &&
        selectedCategory.label.includes("Supplier")
      ) {
        setSetupNumberError(true);
        toast.error("Please select a supplier.");
        setLoading(false);
        return; // Exit the function early
      }
    }

    try {
      if (userRole === 1) {
        const SAVE_URL = `/assignedAutomation/${ticketIdToEdit}`;
        await axios.put(SAVE_URL, { userID: selectedUser.value });
      } else {
        const data = new FormData();

        const sup_file = supportFiles.length;
        if (sup_file !== 0) {
          supportFiles.forEach((file) => {
            data.append("td_support", file.file);
          });
        }

        if (selectedFile) {
          const formatFileName = (file) => {
            const { name, type } = file;
            const dotIndex = name.lastIndexOf(".");
            const baseName = name.substring(0, dotIndex);
            const extension = name.substring(dotIndex + 1);
            const currentDate = new Date();
            const formattedDate = currentDate
              .toISOString()
              .replace(/[-:]/g, "")
              .split(".")[0];
            const fileName = `${baseName}_${formattedDate}.${extension}`;
            return fileName;
          };

          for (let i = 0; i < selectedFile.length; i++) {
            const renamedFile = new File(
              [selectedFile[i]],
              formatFileName(selectedFile[i]),
              {
                type: selectedFile[i].type,
              }
            );
            data.append("td_support", renamedFile);
          }
        }

        if (selectedCategory?.label.includes("Supplier")) {
          data.append("supplier", selectedSupplier.value);
        }
        data.append("branchID", selectedBranch.value);
        data.append("status", "PENDING");
        data.append("category", selectedCategory.value);
        data.append(
          "date",
          showTicketData.TicketDetails?.ticket_transaction_date
        );
        data.append(
          "reference_number",
          showTicketData.TicketDetails?.td_ref_number
        );

        for (let i = 0; i < maxIndex; i++) {
          data.append("purpose", purposes[i] || "");
          data.append("from", froms[i] || "");
          data.append("to", tos[i] || "");
        }

        const UPDATE_URL = `/updateTicket/${ticketIdToEdit}`;
        const filesToDeleteString = encodeURIComponent(
          JSON.stringify(filesToDelete)
        );

        await axios.put(
          `${UPDATE_URL}?filesToDelete=${filesToDeleteString}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setSetupNumberError(false);
      }

      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
      console.error("Error message:", error.message);
      toast.error("An error occurred while saving changes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await axios.get("/getAllCategories");
        setCategory(response.data);
      } catch (error) {
        console.error("Error fetching branch codes:", error);
      }
    }

    async function fetchSupplier() {
      try {
        const response = await axios.get("/getAllSupplier");
        setSupplier(response.data);
      } catch (error) {
        console.error("Error fetching branch codes:", error);
      }
    }

    fetchCategory();
    fetchSupplier();
  }, []);

  const currentDate = new Date().toISOString().split("T")[0];
  const maxIndex = Math.max(purposes.length, froms.length, tos.length);

  const handleFileChange = (e) => {
    const files = e.target.files;
    setSelectedFile([...selectedFile, ...files]);
  };

  return (
    <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-75"></div>
      <div className="shadow-sky-200 relative z-10 h-[auto] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
          <Typography variant="h6" color="white">
            Edit Ticket
          </Typography>
        </CardHeader>
        <button
          className="absolute top-2 right-2 mt-6 rounded px-2 py-1 text-black"
          onClick={onCloseModal}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <div className="max-h-[80vh] overflow-y-auto p-2">
          <CardBody>
            <form
              onSubmit={handleSaveChanges}
              className="m-auto flex w-full flex-wrap justify-between text-sm"
            >
              <div className="w-full border-x-2 border-y-2 p-2">
                <div className="-mx-2 flex flex-wrap">
                  {(userBranches.length > 1 || userRole === 7) && (
                    <div className="w-full p-1 md:w-1/2">
                      <div className="w-full p-2">
                        <label
                          htmlFor="category_name"
                          className="mb-1 block text-sm text-gray-900"
                        >
                          Ticket for what Branch?
                        </label>
                        <Select
                          options={
                            userRole === 7
                              ? branchCode.map((bcode) => ({
                                  value: bcode.blist_id,
                                  label: `${bcode.Branch?.b_code.toUpperCase()} <span style="display: none;">${
                                    bcode.Branch?.b_name
                                  }</span>`,
                                }))
                              : userBranches.map((bcode) => ({
                                  value: bcode.blist_id,
                                  label: `${bcode.b_code.toUpperCase()} <span style="display: none;">${
                                    bcode.b_name
                                  }</span>`,
                                }))
                          }
                          placeholder="Select Branch"
                          className="h-8 w-full text-sm"
                          value={selectedBranch}
                          onChange={(selectedOption) =>
                            setSelectedBranch(selectedOption)
                          }
                          required
                          formatOptionLabel={(option) => (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: option.label,
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}
                  <div className="w-full p-1 md:w-1/2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="ticket_transaction_date"
                        className="mb-1 block text-sm text-gray-700"
                      >
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        name="ticket_transaction_date"
                        className="focus:shadow-outline h-10 w-full rounded-sm border border-gray-500 py-2 px-3 text-sm text-gray-900 focus:outline-none"
                        value={
                          showTicketData?.TicketDetails?.ticket_transaction_date
                        }
                        onChange={(e) =>
                          handleEditInputChange(e, "ticket_transaction_date")
                        }
                        max={currentDate}
                        disabled={isDisabled}
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="w-full p-1 md:w-1/2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="ticket_transaction_date"
                        className="mb-1 block text-sm text-gray-700"
                      >
                        Ticket Category
                      </label>
                      <Select
                        options={category.map((bcode) => ({
                          value: bcode.category_name,
                          label: `${bcode.category_name} <span style="display: none;">${bcode.category_shortcut}</span>`,
                        }))}
                        className="h-10 w-full rounded-sm border-gray-500 text-sm text-gray-900 focus:outline-none"
                        onChange={handleCategoryChange}
                        value={selectedCategory}
                        // required
                        formatOptionLabel={(option) => (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: option.label,
                            }}
                          />
                        )}
                        isDisabled={isDisabled}
                      />
                    </div>
                  </div>

                  {selectedCategory?.label.includes("Supplier") && (
                    <div className="w-full p-1 md:w-1/2">
                      <div className="w-full p-2">
                        <label
                          htmlFor="supplier"
                          className="mb-1 block text-sm text-gray-900"
                        >
                          Supplier
                        </label>
                        <Select
                          options={supplier.map((supplier) => ({
                            value: supplier.id,
                            label: supplier.supplier,
                          }))}
                          placeholder="Select Supplier"
                          className={`h-8 w-full text-sm ${
                            selectedSupplier.value === undefined &&
                            setupNumberError
                              ? "border-red-500"
                              : "border-gray-500"
                          }`}
                          value={selectedSupplier}
                          onChange={handleSupplierChange}
                          required
                          isDisabled={isDisabled}
                        />
                        {selectedSupplier.value === undefined &&
                          setupNumberError && (
                            <p className="mt-1 text-xs text-red-500">
                              Supplier is required
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                  {selectedCategory && (
                    <div className="w-full p-1 md:w-1/2">
                      <div className="w-full p-2">
                        <label
                          htmlFor="ticket_transaction_date"
                          className="mb-1 block text-sm text-gray-700"
                        >
                          {selectedCategory.label.includes("Receiving Report")
                            ? "RR Number"
                            : selectedCategory.label.includes("Sales Invoice")
                            ? "SI Number"
                            : selectedCategory.label.includes("Sales Return")
                            ? "SR Number"
                            : selectedCategory.label.includes(
                                "Official Receipt"
                              )
                            ? "OR Number"
                            : selectedCategory.label.includes(
                                "Collection Receipt"
                              )
                            ? "CR Number"
                            : selectedCategory.label.includes("Check Voucher")
                            ? "CV Number"
                            : selectedCategory.label.includes("Cash Voucher")
                            ? "CV Number"
                            : selectedCategory.label.includes("PDC Voucher")
                            ? "PDC Number"
                            : selectedCategory.label.includes("Daily")
                            ? "DCPR Number"
                            : selectedCategory.label.includes("Merchandise")
                            ? "MT Number"
                            : selectedCategory.label.includes("Product Inquiry")
                            ? "Product Inquiry Number"
                            : selectedCategory.label.includes(
                                "Stock Adjustment"
                              )
                            ? "Stock Adjustment Number"
                            : selectedCategory.label.includes("Complimentary")
                            ? "Complimentary Number"
                            : selectedCategory.label.includes("Defective Unit")
                            ? "Defective Unit Number"
                            : selectedCategory.label.includes(
                                "Installment Inquiry"
                              )
                            ? "Installment Inquiry Number"
                            : selectedCategory.label.includes("Setup")
                            ? "Setup Number"
                            : selectedCategory.label.includes("Other Branch")
                            ? "Customer Ref. ID"
                            : selectedCategory.label.includes("Journal Voucher")
                            ? "JV Number"
                            : selectedCategory.label.includes("A/R")
                            ? "A/R Number"
                            : selectedCategory.label.includes(
                                "Installment Redemption"
                              )
                            ? "Installment Redemption Number"
                            : selectedCategory.label.includes(
                                "Request Stock Delivery"
                              )
                            ? "Request Number"
                            : selectedCategory.label.includes("Expense Payee")
                            ? "Payee Number"
                            : "Reference Number"}
                        </label>
                        <input
                          required
                          type="text"
                          name="reference_number"
                          placeholder={
                            selectedCategory.label.includes("Receiving Report")
                              ? "RR Number"
                              : selectedCategory.label.includes("Sales Invoice")
                              ? "SI Number"
                              : selectedCategory.label.includes("Sales Return")
                              ? "SR Number"
                              : selectedCategory.label.includes(
                                  "Official Receipt"
                                )
                              ? "OR Number"
                              : selectedCategory.label.includes(
                                  "Collection Receipt"
                                )
                              ? "CR Number"
                              : selectedCategory.label.includes("Check Voucher")
                              ? "CV Number"
                              : selectedCategory.label.includes("Cash Voucher")
                              ? "CV Number"
                              : selectedCategory.label.includes("PDC Voucher")
                              ? "PDC Number"
                              : selectedCategory.label.includes("Daily")
                              ? "DCPR Number"
                              : selectedCategory.label.includes("Merchandise")
                              ? "MT Number"
                              : selectedCategory.label.includes(
                                  "Product Inquiry"
                                )
                              ? "Product Inquiry Number"
                              : selectedCategory.label.includes(
                                  "Stock Adjustment"
                                )
                              ? "Stock Adjustment Number"
                              : selectedCategory.label.includes("Complimentary")
                              ? "Complimentary Number"
                              : selectedCategory.label.includes(
                                  "Defective Unit"
                                )
                              ? "Defective Unit Number"
                              : selectedCategory.label.includes(
                                  "Installment Inquiry"
                                )
                              ? "Installment Inquiry Number"
                              : selectedCategory.label.includes("Setup")
                              ? "Setup Number"
                              : selectedCategory.label.includes("Other Branch")
                              ? "Customer Ref. ID"
                              : selectedCategory.label.includes(
                                  "Journal Voucher"
                                )
                              ? "JV Number"
                              : selectedCategory.label.includes("A/R")
                              ? "A/R Number"
                              : selectedCategory.label.includes(
                                  "Installment Redemption"
                                )
                              ? "Installment Redemption Number"
                              : selectedCategory.label.includes(
                                  "Request Stock Delivery"
                                )
                              ? "Request Number"
                              : selectedCategory.label.includes("Expense Payee")
                              ? "Payee Number"
                              : "Reference Number"
                          }
                          className="focus:shadow-outline h-10 w-full rounded-sm border border-gray-500 py-2 px-3 text-sm text-gray-900 focus:outline-none"
                          value={showTicketData?.TicketDetails?.td_ref_number}
                          onChange={(e) =>
                            handleEditInputChange(e, "td_ref_number")
                          }
                          disabled={isDisabled}
                        />
                      </div>
                    </div>
                  )}

                  <div className="w-full px-2">
                    {purposes.map((purpose, index) => (
                      <div key={index} className="-mx-2 flex flex-wrap">
                        <div className="w-full p-2">
                          <label className="mb-1 block text-sm text-gray-900">
                            Purpose
                          </label>
                          <textarea
                            className="focus:shadow-outline md:w-300 flex w-full rounded-md border border-gray-300 py-1 px-3 text-sm text-gray-900 focus:outline-none"
                            placeholder="Purpose"
                            value={purpose}
                            onChange={(e) => {
                              const newPurposes = [...purposes];
                              newPurposes[index] = e.target.value;
                              setPurposes(newPurposes);
                            }}
                            disabled={isDisabled}
                          />
                        </div>

                        <div className="-mt-3 w-full p-1 md:w-1/2">
                          <div className="w-full p-2">
                            <label className="mb-1 block text-sm text-gray-900">
                              From
                            </label>
                            <textarea
                              className="focus:shadow-outline h-10 w-full rounded-sm border border-gray-500 py-2 px-3 text-sm text-gray-900 focus:outline-none"
                              placeholder="From"
                              value={froms[index]}
                              onChange={(e) => {
                                const newFroms = [...froms];
                                newFroms[index] = e.target.value;
                                setFroms(newFroms);
                              }}
                              disabled={isDisabled}
                            />
                          </div>
                        </div>

                        <div className="-mt-3 w-full p-1 md:w-1/2">
                          <div className="w-full p-2">
                            <label className="mb-1 block text-sm text-gray-900">
                              To
                            </label>
                            <textarea
                              className="focus:shadow-outline h-10 w-full rounded-sm border border-gray-500 py-2 px-3 text-sm text-gray-700 focus:outline-none"
                              placeholder="To"
                              value={tos[index]}
                              onChange={(e) => {
                                const newTos = [...tos];
                                newTos[index] = e.target.value;
                                setTos(newTos);
                              }}
                              disabled={isDisabled}
                            />
                          </div>
                        </div>
                        {index !== 0 && displayForThisRole && (
                          <div className="-mt-3 w-full p-1 md:w-1/2">
                            <div className="ml-80 flex w-full justify-end p-2 text-sm text-red-800">
                              <button
                                type="button"
                                onClick={() => removeField(index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {displayForThisRole && (
                      <div className="mb-9 mt-3 flex justify-end">
                        <Button
                          onClick={addFields}
                          className="-mb-7 flex items-center gap-1 bg-light-blue-600 py-2 px-3"
                        >
                          <PlusCircleIcon className="w-5" />
                          ADD FIELDS
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="-mt-3 w-full p-2 md:w-full">
                    <div className="mt-2 w-full p-2">
                      <label
                        htmlFor="td_note "
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Note
                      </label>
                      <textarea
                        type="textarea"
                        placeholder="NOTE"
                        name="td_note"
                        className="focus:shadow-outline h-16 w-full rounded-xl border border-gray-300 py-2 px-3 text-sm text-gray-900 focus:outline-none"
                        value={showTicketData?.TicketDetails?.td_note}
                        onChange={handleEditInputChange}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="-mt-3 w-full p-2 md:w-full">
                    <div className="w-full p-1 md:w-full">
                      <label
                        htmlFor="td_support"
                        className="mb-1 block text-xs text-gray-900"
                      >
                        Support (Files)
                      </label>
                      <div className="relative flex items-center">
                        <ul
                          style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            display: "flex",
                            flexWrap: "wrap",
                          }}
                        >
                          {/* Display files from the database */}
                          {supportFiles.map((file, index) => (
                            <li key={index} className="relative mr-4 mb-4">
                              {getFileExtension(file.file.name) === "png" ||
                              getFileExtension(file.file.name) === "jpeg" ||
                              getFileExtension(file.file.name) === "jpg" ? (
                                <div className="image-container relative">
                                  <img
                                    src={file.url}
                                    alt={file.file.name}
                                    className="image-thumbnail"
                                    style={{
                                      maxHeight: "100px",
                                      maxWidth: "100px",
                                      borderRadius: "5px",
                                      minHeight: "100px",
                                      minWidth: "100px",
                                    }}
                                  />
                                  {displayForThisRole && (
                                    <div
                                      className="remove-icon"
                                      onClick={() =>
                                        handleRemoveDatabaseFile(index)
                                      }
                                    >
                                      <i className="fas fa-times"></i>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="file-icon text-blue-500 hover:underline">
                                    {/* Use appropriate icons for different file types */}
                                    {getFileExtension(file.file.name) ===
                                      "xlsx" ||
                                    getFileExtension(file.file.name) ===
                                      "xls" ? (
                                      <i className="far fa-file-excel"></i>
                                    ) : getFileExtension(file.file.name) ===
                                        "docx" ||
                                      getFileExtension(file.file.name) ===
                                        "doc" ? (
                                      <i className="far fa-file-word"></i>
                                    ) : getFileExtension(file.file.name) ===
                                      "pdf" ? (
                                      <i className="far fa-file-pdf"></i>
                                    ) : (
                                      <i className="far fa-file-alt"></i>
                                    )}
                                  </div>
                                  {displayForThisRole && (
                                    <div
                                      className="remove-icon"
                                      onClick={() =>
                                        handleRemoveDatabaseFile(index)
                                      }
                                    >
                                      <i className="fas fa-times"></i>
                                    </div>
                                  )}
                                </>
                              )}
                              <div className="filename">{file.file.name}</div>
                            </li>
                          ))}

                          {/* Display selected files */}
                          {selectedFile.map((file, index) => (
                            <li key={index} className="relative mr-4 mb-4">
                              {file.type.startsWith("image/") ? (
                                <div className="image-container relative">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="image-thumbnail"
                                    style={{
                                      maxHeight: "100px",
                                      maxWidth: "100px",
                                      borderRadius: "5px",
                                      minHeight: "100px",
                                      minWidth: "100px",
                                    }}
                                  />
                                  {displayForThisRole && (
                                    <div
                                      className="remove-icon"
                                      onClick={() => handleRemoveFile(index)}
                                    >
                                      <i className="fas fa-times"></i>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="file-icon text-blue-500 hover:underline">
                                    {/* Use appropriate icons for different file types */}
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
                                  {displayForThisRole && (
                                    <div
                                      className="remove-icon"
                                      onClick={() => handleRemoveFile(index)}
                                    >
                                      <i className="fas fa-times"></i>
                                    </div>
                                  )}
                                </>
                              )}
                              <div className="filename">{file.name}</div>
                            </li>
                          ))}
                          {isDisabled &&
                            supportFiles.length === 0 &&
                            selectedFile.length === 0 && (
                              <span className="text-gray-500">
                                No support files available
                              </span>
                            )}
                          {displayForThisRole && (
                            <label
                              htmlFor="td_support"
                              className="ml-2 flex cursor-pointer items-center justify-center rounded-sm border border-gray-500 px-3 py-2 text-xl text-gray-700"
                              style={{
                                maxHeight: "100px",
                                maxWidth: "100px",
                                borderRadius: "5px",
                                minHeight: "100px",
                                minWidth: "100px",
                                fontSize: "50px",
                              }}
                            >
                              <input
                                type="file"
                                id="td_support"
                                onChange={handleFileChange}
                                multiple={true}
                                hidden
                              />
                              <i className="fas fa-plus"></i>
                            </label>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex w-full flex-row">
                  {/* Column 1 */}
                  {(userRole === 1 || userRole === 2 || userRole === 3) && (
                    <div className="w-full p-2 md:w-1/2">
                      <div className="w-full p-2">
                        <label
                          htmlFor="code"
                          className="mb-1 block text-sm text-gray-700"
                        >
                          Branch Code
                        </label>
                        <input
                          type="text"
                          id="code"
                          className="focus:shadow-outline w-full rounded-sm border py-1 px-3 text-sm text-gray-700 focus:outline-none"
                          value={showTicketData?.branch_name || ""}
                          readOnly
                        />
                      </div>
                    </div>
                  )}
                  {/* Column 2 */}
                  {(userRole === 1 || userRole === 2 || userRole === 3) && (
                    <div className="w-full p-2 md:w-1/2">
                      <div className=" w-full p-2">
                        <label
                          htmlFor="requested"
                          className="mb-1 block text-sm text-gray-700 "
                        >
                          Requested by
                        </label>
                        <input
                          type="text"
                          id="requested"
                          className="focus:shadow-outline w-full rounded-sm  border py-1 px-3 text-sm text-gray-700 focus:outline-none "
                          value={
                            showTicketData?.UserTicket?.UserDetails?.fname +
                            " " +
                            showTicketData?.UserTicket?.UserDetails?.lname
                          }
                          readOnly
                        />
                      </div>
                    </div>
                  )}

                  {/* Column 3 */}
                  {userRole === 1 && (
                    <div className="w-1/3 p-2">
                      <label
                        htmlFor="assigned"
                        className="mb-1 block text-sm text-gray-700"
                      >
                        Assigned to
                      </label>
                      <Select
                        id="assigned"
                        className="w-full"
                        options={automationUsers.map((user) => ({
                          value: user.login_id,
                          label:
                            user.UserDetails?.fname +
                            " " +
                            user.UserDetails?.lname,
                        }))}
                        value={
                          selectedUser
                            ? {
                                value: selectedUser.value,
                                label: selectedUser.label,
                              }
                            : {
                                value: showTicketData?.AssignedTicket?.login_id,
                                label:
                                  showTicketData?.AssignedTicket?.UserDetails
                                    ?.fname +
                                  " " +
                                  showTicketData?.AssignedTicket?.UserDetails
                                    ?.lname,
                              }
                        }
                        onChange={handleUserChange}
                        isSearchable
                        menuPlacement="top"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex w-full justify-end p-5 sm:w-full md:w-full lg:w-full xl:w-full">
                {loading ? (
                  <span className="flex flex-col rounded-md bg-blue-200 px-4 py-2 font-medium text-white">
                    Saving changes...
                  </span>
                ) : (
                  <button
                    type="button"
                    className="flex flex-col rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
                    onClick={handleSaveChanges}
                    disabled={!selectedUser && userRole === 1}
                  >
                    Save Changes
                  </button>
                )}
                <ToastContainer />
              </div>
            </form>
          </CardBody>
        </div>
      </div>
    </div>
  );
}
