import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

// Constants
const ADD_URL = "/createSupplier";

function AddSupplierModal({ isOpen, onClose, onCloseModal }) {
  if (!isOpen) return null;

  const initialCategoryState = {
    supplier: ""
  };

  //Add new Category
  const [newSupplier, setNewSupplier] = useState(initialCategoryState);
  const [loading, setLoading] = useState(false);

  const handleAddCategorySubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await axios.post(ADD_URL, newSupplier);
      setNewSupplier(initialCategoryState);
      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
      console.error("Error message:", error.message);
      toast.error("An error occurred while adding supplier.");
    } finally {
      setLoading(false); // Set loading state to false after the operation is complete
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewSupplier((prevNewCategory) => ({
      ...prevNewCategory,
      [name]: value,
    }));
  };

  return (
    <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black opacity-75 "></div>
      <div className="shadow-sky-200 relative z-10 h-[auto] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
          <Typography variant="h6" color="white">
            Add New Supplier
          </Typography>
        </CardHeader>

        {/* Close modal button */}
        <button
          className="absolute top-2 right-2 mt-6 rounded px-2 py-1 text-black"
          onClick={onCloseModal}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>

        <div className="h-[90%] p-2">
          <CardBody>
            <form
              onSubmit={handleAddCategorySubmit}
              className="m-auto flex flex-wrap justify-between text-sm"
            >
              <div className="w-full">
                <div className="-mx-2 flex flex-wrap border-x-2 border-y-2 p-2">
                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="supplier"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        name="supplier"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none"
                        value={newSupplier.supplier || ""}
                        onChange={handleChange}
                        placeholder="Supplier Name"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-end p-5 text-sm sm:w-full md:w-full lg:w-full xl:w-full ">
                  <button
                    type="submit"
                    className={`flex flex-col rounded-md bg-blue-500 px-4 py-1 font-medium text-white hover:bg-blue-600  ${
                      loading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    disabled={loading || newSupplier.supplier === ""}
                  >
                    {loading ? "Adding..." : "Add"}
                  </button>
                  <ToastContainer />
                </div>
              </div>
            </form>
          </CardBody>
        </div>
      </div>
    </div>
  );
}

export default AddSupplierModal;
