import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";

function EditCategoryModal({
  isOpen,
  onClose,
  onCloseModal,
  categoryIdToEdit
}) {
  const [showCategoryData, setShowCategoryData] = useState({
    category_name: "",
    category_shortcut: "",
  });
  const [changesMade, setChangesMade] = useState(false);
  const [categoryGroup, setCategoryGroup] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState();
  const [loading, setLoading] = useState(false);

  //Fetch Category Data
  useEffect(() => {
    async function fetchCategoryData() {
      try {
        const EDIT_URL = `/viewCategory/${categoryIdToEdit}`;
        const response = await axios.get(EDIT_URL);
        setShowCategoryData(response.data);
      } catch (error) {
        console.error("Error in viewEditBranch:", error);
        throw error;
      }
    }

    async function fetchGroupCategory() {
      try {
        const response = await axios.get("/getAllCategoryGroup");
        setCategoryGroup(response.data);
      } catch (error) {
        console.error("Error fetching branch codes:", error);
      }
    }

    if (isOpen && categoryIdToEdit) {
      fetchCategoryData();
    }

    fetchGroupCategory();
  }, [isOpen, categoryIdToEdit]);

  //Handle Changes
  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setShowCategoryData((prevData) => ({
      ...prevData, //to create a copy prev data
      [name]: value,
    }));
    setChangesMade(true);
  };

  //Handle save changes
  const handleSaveChanges = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const EDIT_URL = `/updateCategory/${categoryIdToEdit}`;
      await axios.put(EDIT_URL, {
        category_name: showCategoryData.category_name,
        category_shortcut: showCategoryData.category_shortcut,
        group_code: selectedGroup
      });

      // const response = await axios.get("/getAllCategoriesTable");
      // updateCategories(response.data);
      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setLoading(false); // Set loading state to false after the operation is complete
    }
  };

  const handleGroupChange = (selectedOption) => {
    setSelectedGroup(selectedOption.value);
    setChangesMade(true);
  };

  return (
    <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black opacity-75 "></div>
      <div className="shadow-sky-200 relative z-10 h-[auto] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-2">
          <Typography variant="h6" color="white">
            Category Details
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
              className="m-auto flex flex-wrap justify-between text-sm"
            >
              <div className="w-full">
                <div className="-mx-2 flex flex-wrap border-x-2 border-y-2 p-2">
                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="b_name"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Category Name
                      </label>
                      <input
                        type="text"
                        name="category_name"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none"
                        value={showCategoryData.category_name}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="b_code"
                        className="mb-1 block text-sm  text-gray-900 "
                      >
                        Category Shorcut
                      </label>
                      <input
                        type="text"
                        name="category_shortcut"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none "
                        value={showCategoryData.category_shortcut}
                        onChange={handleEditInputChange}
                      />
                    </div>
                  </div>
                  <div className="w-full p-2 md:w-1/2">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="branch_code"
                        className="mb-1 block text-sm  text-gray-700 "
                      >
                        Category Group
                      </label>
                      <Select
                        className="w-full"
                        options={categoryGroup.map((group) => ({
                          value: group.id,
                          label: group.group_code,
                        }))}
                        value={ 
                          selectedGroup
                            ? selectedGroup.label
                            : {
                                value: showCategoryData?.CategoryGroup?.id,
                                label: showCategoryData?.CategoryGroup?.group_code,
                              }
                        }
                        onChange={handleGroupChange}
                      />
                    </div>
                  </div>
                </div>
              </div> 

              <div className="flex w-full justify-end p-5 text-sm sm:w-full md:w-full lg:w-full xl:w-full ">
                <button
                  type="submit"
                  className={`flex flex-col rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600  ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <ToastContainer />
              </div>
            </form>
          </CardBody>
        </div>
      </div>
    </div>
  );
}

export default EditCategoryModal;
