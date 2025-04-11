import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditBranchModal({ isOpen, onClose, branchIdToEdit, onCloseModal }) {
  // Edit Branch Modal
  const [showBranchData, setShowBranchData] = useState({
    branch_name: "",
    branch_code: "",
    branch_category: "",
    branch_email: "",
    branch_address: "",
    branch_contact: "",
  });
  const [loading, setLoading] = useState(false);
  // Fetch branch data for editing
  useEffect(() => {
    async function fetchBranchToEdit() {
      try {
        const EDIT_URL = `/viewBranch/${branchIdToEdit}`; // Adjust the URL as needed
        const response = await axios.get(EDIT_URL);
        setShowBranchData(response.data);
      } catch (error) {
        console.error("Error in viewEditBranch:", error);
        throw error;
      }
    }

    if (isOpen && branchIdToEdit) {
      fetchBranchToEdit();
    }
  }, [isOpen, branchIdToEdit]);

  // Handle changes in the edit form
  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setShowBranchData((prevData) => ({
      ...prevData,
      [name]: value,
      Branch: {
        ...prevData.Branch,
        [name]: value,
      },
    }));
  };

  // Handle saving changes in the edit form
  const handleSaveChanges = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const EDIT_URL = `/updateBranch/${branchIdToEdit}`;
      await axios.put(EDIT_URL, {
        branch_name: showBranchData.Branch?.b_name,
        branch_code: showBranchData.Branch?.b_code,
        branch_category: showBranchData.Branch?.category,
        branch_email: showBranchData.b_email,
        branch_address: showBranchData.b_address,
        branch_contact: showBranchData.b_contact,
      });

      // const response = await axios.get("/getAllBranches");

      // updateBranches(response.data);

      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
    }finally {
      setLoading(false); // Set loading state to false after the operation is complete
    }
  };

  return (
    <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black opacity-75 "></div>
      <div className="shadow-sky-200 relative z-10 h-[auto] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
          <Typography variant="h6" color="white">
            Branch Details
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
              onSubmit={handleSaveChanges}
              className="m-auto flex flex-wrap justify-between"
            >
              <div className="w-full">
                <div className="-mx-2 flex flex-wrap border-x-2 border-y-2 p-2">
                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/3">
                    <div className="w-full p-2">
                      <label
                        htmlFor="b_name"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Branch Name
                      </label>
                      <input
                        type="text"
                        name="b_name"
                        className="focus:shadow-outline w-full rounded-sm border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none"
                        value={showBranchData.Branch?.b_name}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full p-2 md:w-1/3">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="b_code"
                        className="mb-1 block text-sm  text-gray-700 "
                      >
                        Branch Code
                      </label>
                      <input
                        type="text"
                        name="b_code"
                        className="focus:shadow-outline w-full rounded-sm border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none "
                        value={showBranchData.Branch?.b_code}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  {/* Column 3 */}
                  <div className="w-full p-2 md:w-1/3">
                    <div className="w-full p-2">
                      <label
                        htmlFor="category"
                        className="mb-1 block text-sm  text-gray-700 "
                      >
                        Branch Category
                      </label>
                      <input
                        type="text"
                        name="category"
                        className="focus:shadow-outline w-full rounded-sm border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none"
                        value={showBranchData.Branch?.category}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>

                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-[100%s]">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="b_address"
                        className="mb-1 block text-sm text-gray-700 "
                      >
                        Branch Address
                      </label>
                      <input
                        type="text"
                        name="b_address"
                        className="focus:shadow-outline w-full rounded-sm border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none "
                        value={showBranchData.b_address}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="b_email"
                        className="mb-1 block text-sm text-gray-700 "
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="b_email"
                        className="focus:shadow-outline w-full rounded-sm border  border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none "
                        value={showBranchData.b_email}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  {/* Column 3 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="b_contact"
                        className="mb-1 block text-sm text-gray-700 "
                      >
                        Contact No.
                      </label>
                      <input
                        type="tel"
                        name="b_contact"
                        className="focus:shadow-outline w-full rounded-sm border  border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none "
                        value={showBranchData.b_contact}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end w-full md:w-full sm:w-full lg:w-full xl:w-full p-5 text-sm ">
                  <button
                    type="submit"
                    className={`flex flex-col bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-1 rounded-md  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
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

export default EditBranchModal;
