import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import axios from "@/api/axios";

function ViewSupplierModal({ isOpen, onClose, supplierID }) {
  const [showSupplierData, setShowSupplierData] = useState({});

  useEffect(() => {
    async function fetchSupplier() {
      try {
        const VIEW_URL = `/viewSupplier/${supplierID}`;
        const response = await axios.get(VIEW_URL);

        setShowSupplierData(response.data);
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    }

    if (isOpen && supplierID) {
      fetchSupplier();
    }
  }, [isOpen, supplierID]);

  return (
    <div className="opacity-96 fixed inset-0 z-50 flex items-center justify-center ">
      <div className="absolute inset-0 bg-black opacity-75 "></div>
      <div className="shadow-sky-200 relative z-10 h-[auto] w-full max-w-3xl rounded-lg bg-white p-1 shadow md:w-[80%] lg:w-[60%]">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-2">
          <Typography variant="h6" color="white">
            Supplier Details
          </Typography>
        </CardHeader>

        {/* Close modal button */}
        <button
          className="absolute top-2 right-2 mt-6 rounded px-2 py-1 text-black"
          onClick={onClose}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>

        <div className="h-[90%] p-2">
          <CardBody>
            <form className="m-auto flex flex-wrap justify-between">
              <div className="w-full">
                <div className="-mx-2 flex flex-wrap border-x-2 border-y-2 p-2">
                  {/* Column 1 */}
                  <div className="w-full p-2 md:w-1/2">
                    <div className="w-full p-2">
                      <label
                        htmlFor="b_name"
                        className="mb-1 block text-sm text-gray-900"
                      >
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        name="b_name"
                        className="focus:shadow-outline w-full rounded-md border border-gray-500 py-1 px-3 text-sm text-gray-900 focus:outline-none"
                        value={showSupplierData.supplier}
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

export default ViewSupplierModal;
