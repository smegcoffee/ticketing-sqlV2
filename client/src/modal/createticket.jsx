import React, { useState, useEffect, useRef } from "react";
import {
  CardBody,
  CardHeader,
  Typography,
  Button,
} from "@material-tailwind/react";
import Select from "react-select";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { jwtDecode } from "jwt-decode";

const ADD_URL = "/createTicket";
const GET_ALL_URL = "/getAllTickets";

function CreateTicket({ isOpen, onClose, onCloseModal }) {
  if (!isOpen) return null;

  const initialFieldState = {
    purpose: "",
    from: "",
    to: "",
  };

  const initialTicketState = {
    date: null,
    reference_number: "",
    additionalFields: [initialFieldState],
  };

  const token = sessionStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userRole = decoded.role;
  const [newTicket, setNewTicket] = useState(initialTicketState);
  const [category, setCategory] = useState([]);
  const [userBranches, setUserBranches] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState();
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedFile, setSelectedFile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branchCode, setBranchCode] = useState([]);

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
  };

  const handleChange = (event, index) => {
    const { name, value } = event.target;
    const updatedFields = [...newTicket.additionalFields];
    updatedFields[index] = {
      ...updatedFields[index],
      [name]: value,
    };
    setNewTicket((prevState) => ({
      ...prevState,
      [name]: value,
      additionalFields: updatedFields,
    }));
  };

  const addFields = () => {
    setNewTicket((prevState) => ({
      ...prevState,
      additionalFields: [
        ...prevState.additionalFields,
        { ...initialFieldState },
      ],
    }));
  };

  const removeField = (index) => {
    if (newTicket.additionalFields.length === 1) {
      return;
    }

    const updatedFields = [...newTicket.additionalFields];
    updatedFields.splice(index, 1);
    setNewTicket((prevState) => ({
      ...prevState,
      additionalFields: updatedFields,
    }));
  };

  const handleAddTicketSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
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
          data.append("support", renamedFile);
        }
      }

      if (selectedCategory?.label.includes("Supplier")) {
        data.append("supplier", selectedSupplier.value);
      }
      data.append("category", selectedCategory.value);
      data.append("date", newTicket.date);
      data.append("reference_number", newTicket.reference_number);
      data.append("branch_id", selectedBranch.value);

      for (let i = 0; i < newTicket.additionalFields.length; i++) {
        data.append("purpose", newTicket.additionalFields[i].purpose);
        data.append("from", newTicket.additionalFields[i].from);
        data.append("to", newTicket.additionalFields[i].to);
      }

      await axios.post(ADD_URL, data);

      onClose();
      setNewTicket(initialTicketState);
      setLoading(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      console.error("Error message:", error.message);
      toast.error("An error occurred while creating ticket.");
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

    async function fetchUserBranches() {
      try {
        const response = await axios.get("/getUserLoginInfo");
        setUserBranches(response.data.Branches);
        setSelectedBranch({
          value: response.data.Branches[0].blist_id,
          label: response.data.Branches[0].b_code.toUpperCase(),
        });
      } catch (error) {
        console.error("Error fetching branch codes:", error);
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

    fetchCategory();
    fetchSupplier();
    fetchUserBranches();
    fetchBranches();
  }, []);

  const currentDate = new Date().toISOString().split("T")[0];

  const handleFileChange = (e) => {
    const files = e.target.files;
    setSelectedFile([...selectedFile, ...files]);
  };

  const getFileExtension = (filename) => {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFile];
    updatedFiles.splice(index, 1);
    setSelectedFile(updatedFiles);
  };

  return (
    <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-75"></div>
      <div className="shadow-sky-200 relative z-10 h-[auto] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
          <Typography variant="h6" color="white">
            New Ticket
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
              className="m-auto flex w-full flex-wrap justify-between text-xs"
              onSubmit={handleAddTicketSubmit}
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
                              : userBranches.length > 1
                              ? userBranches.map((bcode) => ({
                                  value: bcode.blist_id,
                                  label: `${bcode.b_code.toUpperCase()} <span style="display: none;">${
                                    bcode.b_name
                                  }</span>`,
                                }))
                              : []
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
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        placeholder="Transaction Date"
                        className="focus:shadow-outline h-10 w-full rounded-sm border border-gray-500 py-2 px-3 text-sm text-gray-900 focus:outline-none"
                        value={newTicket.date}
                        onChange={handleChange}
                        max={currentDate}
                        required
                      />
                    </div>
                  </div>

                  <div className="w-full p-1 md:w-1/2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="category_name"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Ticket Category
                      </label>
                      <Select
                        options={category.map((bcode) => ({
                          value: bcode.category_name,
                          label: `${bcode.category_name} <span style="display: none;">${bcode.category_shortcut}</span>`,
                        }))}
                        placeholder="Select Category"
                        className="h-8 w-full text-sm"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
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
                          className="h-8 w-full text-sm"
                          value={selectedSupplier}
                          onChange={(selectedOption) =>
                            setSelectedSupplier(selectedOption)
                          }
                          required
                        />
                      </div>
                    </div>
                  )}
                  {selectedCategory && (
                    <div className="w-full p-1 md:w-1/2">
                      <div className="w-full p-2">
                        <label
                          htmlFor="td_ref_number"
                          className="mb-1 block text-sm text-gray-900"
                        >
                          {selectedCategory?.label.includes("Receiving Report")
                            ? "RR Number"
                            : selectedCategory?.label.includes("Sales Invoice")
                            ? "SI Number"
                            : selectedCategory?.label.includes("Sales Return")
                            ? "SR Number"
                            : selectedCategory?.label.includes(
                                "Official Receipt"
                              )
                            ? "OR Number"
                            : selectedCategory?.label.includes(
                                "Collection Receipt"
                              )
                            ? "CR Number"
                            : selectedCategory?.label.includes(
                                "Cash Voucher" || "Check Voucher"
                              )
                            ? "CV Number"
                            : selectedCategory?.label.includes("PDC Voucher")
                            ? "PDC Number"
                            : selectedCategory?.label.includes("Daily")
                            ? "DCPR Number"
                            : selectedCategory?.label.includes("Merchandise")
                            ? "MT Number"
                            : selectedCategory?.label.includes(
                                "Product Inquiry"
                              )
                            ? "Product Inquiry Number"
                            : selectedCategory?.label.includes(
                                "Stock Adjustment"
                              )
                            ? "Stock Adjustment Number"
                            : selectedCategory?.label.includes("Complimentary")
                            ? "Complimentary Number"
                            : selectedCategory?.label.includes("Defective Unit")
                            ? "Defective Unit Number"
                            : selectedCategory?.label.includes(
                                "Installment Inquiry"
                              )
                            ? "Installment Inquiry Number"
                            : selectedCategory?.label.includes("Setup")
                            ? "Setup Number"
                            : selectedCategory?.label.includes("Other Branch")
                            ? "Customer Ref. ID"
                            : selectedCategory?.label.includes(
                                "Journal Voucher"
                              )
                            ? "JV Number"
                            : selectedCategory?.label.includes("A/R")
                            ? "A/R Number"
                            : selectedCategory?.label.includes(
                                "Installment Redemption"
                              )
                            ? "Installment Redemption Number"
                            : selectedCategory?.label.includes(
                                "Request Stock Delivery"
                              )
                            ? "Request Number"
                            : selectedCategory?.label.includes("Expense Payee")
                            ? "Payee Number"
                            : "Reference Number"}
                        </label>
                        <input
                          type="text"
                          name="reference_number"
                          placeholder={
                            selectedCategory?.label.includes("Receiving Report")
                              ? "RR Number"
                              : selectedCategory?.label.includes(
                                  "Sales Invoice"
                                )
                              ? "SI Number"
                              : selectedCategory?.label.includes("Sales Return")
                              ? "SR Number"
                              : selectedCategory?.label.includes(
                                  "Official Receipt"
                                )
                              ? "OR Number"
                              : selectedCategory?.label.includes(
                                  "Collection Receipt"
                                )
                              ? "CR Number"
                              : selectedCategory?.label.includes(
                                  "Cash Voucher" || "Check Voucher"
                                )
                              ? "CV Number"
                              : selectedCategory?.label.includes("PDC Voucher")
                              ? "PDC Number"
                              : selectedCategory?.label.includes("Daily")
                              ? "DCPR Number"
                              : selectedCategory?.label.includes("Merchandise")
                              ? "MT Number"
                              : selectedCategory?.label.includes(
                                  "Product Inquiry"
                                )
                              ? "Product Inquiry Number"
                              : selectedCategory?.label.includes(
                                  "Stock Adjustment"
                                )
                              ? "Stock Adjustment Number"
                              : selectedCategory?.label.includes(
                                  "Complimentary"
                                )
                              ? "Complimentary Number"
                              : selectedCategory?.label.includes(
                                  "Defective Unit"
                                )
                              ? "Defective Unit Number"
                              : selectedCategory?.label.includes(
                                  "Installment Inquiry"
                                )
                              ? "Installment Inquiry Number"
                              : selectedCategory?.label.includes("Setup")
                              ? "Setup Number"
                              : selectedCategory?.label.includes("Other Branch")
                              ? "Customer Ref. ID"
                              : selectedCategory?.label.includes(
                                  "Journal Voucher"
                                )
                              ? "JV Number"
                              : selectedCategory?.label.includes("A/R")
                              ? "A/R Number"
                              : selectedCategory?.label.includes(
                                  "Installment Redemption"
                                )
                              ? "Installment Redemption Number"
                              : selectedCategory?.label.includes(
                                  "Request Stock Delivery"
                                )
                              ? "Request Number"
                              : selectedCategory?.label.includes(
                                  "Expense Payee"
                                )
                              ? "Payee Number"
                              : "Reference Number"
                          }
                          className="focus:shadow-outline h-10 w-full rounded-sm border border-gray-500 py-2 px-3 text-sm text-gray-900 focus:outline-none"
                          value={newTicket.reference_number}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {newTicket.additionalFields.map((field, index) => (
                  <div key={index} className="-mx-2 flex flex-wrap">
                    <div className="-mt-3 w-full p-3">
                      <label
                        htmlFor={`td_purpose`}
                        className="mb-1 block text-sm text-gray-900 "
                      >
                        Purpose
                      </label>
                      <textarea
                        type="text"
                        name={`purpose`}
                        placeholder="Purpose"
                        className="focus:shadow-outline h-16 w-full rounded-sm  border border-gray-500 py-2 px-3 text-sm text-gray-900 focus:outline-none "
                        value={newTicket.additionalFields[index].purpose}
                        onChange={(e) => handleChange(e, index)}
                        required={index === 0}
                      />
                    </div>
                    <div className="-mt-3 w-full p-1 md:w-1/2">
                      <div className="w-full p-2">
                        <label
                          htmlFor={`td_from`}
                          className="mb-1 block text-sm text-gray-900 "
                        >
                          From
                        </label>
                        <textarea
                          type="text"
                          name={`from`}
                          placeholder="From"
                          className="focus:shadow-outline h-10 w-full rounded-sm border border-gray-500 py-2 px-3 text-sm text-gray-900 focus:outline-none "
                          value={newTicket.additionalFields[index].from}
                          onChange={(e) => handleChange(e, index)}
                        />
                      </div>
                    </div>
                    <div className="-mt-3 w-full p-1 md:w-1/2">
                      <div className=" w-full p-2">
                        <label
                          htmlFor={`td_to`}
                          className="mb-1 block text-sm text-gray-900"
                        >
                          To
                        </label>
                        <textarea
                          type="text"
                          name={`to`}
                          placeholder="To"
                          className="focus:shadow-outline h-10 w-full rounded-sm border border-gray-500 py-2 px-3 text-sm text-gray-700 focus:outline-none"
                          value={newTicket.additionalFields[index].to}
                          onChange={(e) => handleChange(e, index)}
                        />
                      </div>
                    </div>
                    {index !== 0 && (
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

                <div className="mb-9 mt-3 flex justify-end">
                  <Button
                    onClick={addFields}
                    className="-mb-7 flex items-center gap-1 bg-light-blue-600 py-2 px-3"
                  >
                    <PlusCircleIcon className="w-5" />
                    ADD FIELDS
                  </Button>
                </div>

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
                              <div
                                className="remove-icon"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <i className="fas fa-times"></i>
                              </div>
                            </div>
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
                                ) : getFileExtension(file.name) === "docx" ||
                                  getFileExtension(file.name) === "doc" ? (
                                  <i className="far fa-file-word"></i>
                                ) : getFileExtension(file.name) === "pdf" ? (
                                  <i className="far fa-file-pdf"></i>
                                ) : (
                                  <i className="far fa-file-alt"></i>
                                )}
                              </div>
                              <div
                                className="remove-icon"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <i className="fas fa-times"></i>
                              </div>
                            </a>
                          )}
                          <div className="filename">{file.name}</div>
                        </li>
                      ))}
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
                    </ul>
                  </div>
                </div>
              </div>

              <div
                className="flex w-full justify-end p-5 text-sm sm:w-full md:w-full lg:w-full xl:w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex flex-col rounded-md bg-gray-500 px-4 py-2 font-medium text-white">
                    Please Wait...
                  </span>
                ) : (
                  <button
                    type="submit"
                    className="flex flex-col rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
                  >
                    Create Ticket
                  </button>
                )}
              </div>
            </form>
          </CardBody>
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
