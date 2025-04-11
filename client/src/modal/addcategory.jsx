import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

// Constants
const ADD_URL = "/createCategory";
const GET_ALL_URL = "/getAllCategories";

function AddCategoryModal({ isOpen, onClose, onCloseModal }) {
  if (!isOpen) return null;

  const initialCategoryState = {
    category_name: "",
    category_shortcut: "",
    group_code: null
  };

  //Add new Category
  const [newCategory, setNewCategory] = useState(initialCategoryState);
  const [loading, setLoading] = useState(false);
  const [categoryGroup, setCategoryGroup] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState();

  useEffect(() => {

    async function fetchGroupCategory() {

      try {
        const response = await axios.get("/getAllCategoryGroup");
        setCategoryGroup(response.data);
      } catch (error) {
        console.error("Error fetching branch codes:", error);
      }
    }

    fetchGroupCategory();
  }, [isOpen]);

  const handleAddCategorySubmit = async (event) => {
    event.preventDefault();
    try {
      // if (!newCategory.category_name || !newCategory.category_shortcut) {
      //   toast.error('Please fill in all fields.');
      //   return;
      // }
      newCategory.group_code = selectedGroup;
      setLoading(true);
      await axios.post(ADD_URL, newCategory);

      setNewCategory(initialCategoryState);

      // const categoryResponse = await axios.get(GET_ALL_URL);
      // updateCategories(categoryResponse.data);

      onClose();
    } catch (error) {
      console.error("Error saving changes:", error);
      console.error("Error message:", error.message);
      toast.error("An error occurred while adding the category.");
    } finally {
      setLoading(false); // Set loading state to false after the operation is complete
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewCategory((prevNewCategory) => ({
      ...prevNewCategory,
      [name]: value,
    }));
  };

  const handleGroupChange = (selectedOption) => {
    setSelectedGroup(selectedOption.value);
  };

  return (
    <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black opacity-75 "></div>
      <div className="shadow-sky-200 relative z-10 h-[auto] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
          <Typography variant="h6" color="white">
            Add New Category
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
                        htmlFor="category_name"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Category Name
                      </label>
                      <input
                        type="text"
                        name="category_name"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none"
                        value={newCategory.category_name || ""}
                        onChange={handleChange}
                        placeholder="Category Name"
                        required
                      />
                    </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="category_shortcut"
                        className="mb-1 block text-sm  text-gray-900 "
                      >
                        Category Shortcut
                      </label>
                      <input
                        type="text"
                        name="category_shortcut"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none "
                        value={newCategory.category_shortcut || ""}
                        onChange={handleChange}
                        placeholder="Category Shortcut"
                        required
                      />
                    </div>
                  </div>

                  <div className="w-full p-2 md:w-1/2">
                    <div className=" w-full p-2">
                      <label
                        htmlFor="branch_code"
                        className="mb-1 block text-sm  text-gray-700 "
                      >
                        Category Code
                      </label>
                      <Select
                        className="w-full"
                        options={categoryGroup.map((group) => ({
                          value: group.id,
                          label: group.group_code,
                        }))}
                        onChange={handleGroupChange}
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
                    disabled={loading}
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

export default AddCategoryModal;
