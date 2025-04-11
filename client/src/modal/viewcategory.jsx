import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import {useState, useEffect} from "react";
import axios from "@/api/axios";

function ViewCategoryModal({ isOpen, onClose, categoryIdToView }) {

    const [showCategoryData, setShowCategoryData] = useState({});
  
    useEffect(() => {
      async function fetchBranchData() {
        try {
          const VIEW_URL = `/viewCategory/${categoryIdToView}`; 
          const response = await axios.get(VIEW_URL);
        
          setShowCategoryData(response.data);
        } catch (error) {
          console.error("Error fetching branch data:", error);
        }
      }
  
      if (isOpen && categoryIdToView) {
        fetchBranchData();
      }
    }, [isOpen, categoryIdToView]);
  
   
    return (
       
        <div className="fixed inset-0 flex items-center justify-center z-50 opacity-96 ">
          <div className="absolute inset-0 bg-black opacity-75 "></div>
            <div className="bg-white p-1 z-10 w-full md:w-[80%] lg:w-[60%] max-w-3xl h-[auto] relative rounded-lg shadow shadow-sky-200">
                <CardHeader variant="gradient" color="blue" className="mb-2 p-2">
                  <Typography variant="h6" color="white">
                  Category Details
                  </Typography>
                </CardHeader>

                {/* Close modal button */}
                <button
                    className="text-black px-2 py-1 rounded absolute top-2 right-2 mt-6"
                    onClick={onClose}
                     >
                    <i className="fa fa-times" aria-hidden="true"></i>
                </button>

                <div className='p-2 h-[90%]'>
                <CardBody>
                <form className="flex flex-wrap justify-between m-auto">        
                <div className="w-full">
                  <div className="flex flex-wrap -mx-2 border-x-2 border-y-2 p-2">             
                  {/* Column 1 */}
                  <div className="w-full md:w-1/2 p-2">
                      <div className='p-2 w-full'>
                      <label htmlFor="b_name" className="block text-gray-900 mb-1 text-sm">Category Name</label>
                          <input
                              type="text"
                              name="b_name"
                              className="w-full border border-gray-500 rounded-md py-1 px-3 text-gray-900 focus:outline-none focus:shadow-outline text-sm"
                              value={showCategoryData.category_name}
                              readOnly
                              />
                      </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full md:w-1/2 p-2">
                      <div className=' p-2 w-full'>
                      <label htmlFor="b_code" className="block text-gray-900 mb-1  text-sm ">Category Shortcut</label>
                          <input
                              type="text"
                              name="b_code"
                              className="w-full border border-gray-500 rounded-md py-1 px-3 text-gray-900 focus:outline-none focus:shadow-outline text-sm "
                              value={showCategoryData.category_shortcut}
                              readOnly
                          />  
                     
                  </div>
                  </div>
                  </div>
                  </div> 
                </form>
              </CardBody>
            </div>
          </div>
     </div>
    
    );
}

export default ViewCategoryModal;