import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { PlusCircleIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import AddFaqModal from "@/modal/addfaq";
import axios from "@/api/axios";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import EditFaqModal from "@/modal/editModal";
import { jwtDecode } from "jwt-decode";

function Help() {
  const token = sessionStorage.getItem("token");
  const decoded = jwtDecode(token);
  const userRole = decoded.role;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserGuide, setSelectedUserGuide] = useState("Automation"); // Set a default value
  const [automationFaqs, setAutomationFaqs] = useState([]);
  const [branchFaqs, setBranchFaqs] = useState([]);

  const updateAutomationFaqs = (newFaq) => {
    setAutomationFaqs(newFaq);
  }

  const updateBranchFaqs = (newFaq) => {
    setBranchFaqs(newFaq);
  }


  useEffect(() => {
    const fetchHelp = async () => {
      try {
        const automationResponse = await axios.get('/getAllAutomationHelp');
        const branchResponse = await axios.get('/getAllBranchHelp'); 
      
        setAutomationFaqs(automationResponse.data.rows);
        setBranchFaqs(branchResponse.data.rows);
      } catch (error) {
        console.error('Error fetching help', error);
      }
    };

    fetchHelp();
  }, []);

  const handleDeleteClick = async (helpID) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Confirm Deletion',
      text: `Do you wish to delete this FAQ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (isConfirmed) {
      try {
        // Send a DELETE request to delete the FAQ
        const DEL_URL = `/deleteHelp/${helpID}`;
        await axios.delete(DEL_URL);

        // Fetch the updated list of FAQs and set it in the state
        const automationResponse = await axios.get('/getAllAutomationHelp');
        setAutomationFaqs(automationResponse.data.rows);

        const branchResponse = await axios.get('/getAllBranchHelp');
        setBranchFaqs(branchResponse.data.rows);

        // Show a success message
        Swal.fire({
          icon: 'success',
          title: 'FAQ deleted successfully!',
        });
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Handle conflict case (FAQ cannot be deleted)
          Swal.fire({
            icon: 'error',
            title: 'Conflict!',
            text: 'This FAQ cannot be deleted due to dependencies.',
          });
        } else {
          // Handle other errors
          console.error('Error deleting FAQ:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An error occurred while deleting the FAQ.',
          });
        }
      }
    }
  };

  //Edit Faq
  const [isFaqEditOpen, setIsFaqEditOpen] = useState(false);
  const [showFaqIdToEdit, setShowFaqIdToEdit] = useState (null);

  const handleEditFaq = (helpID) =>{
    setIsFaqEditOpen(true);
    setShowFaqIdToEdit(helpID);

  }

  const [open, setOpen] = useState(0);
 
  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <div className="mt-12 flex flex-col gap-12">
      {/* {userRole === 1 && (
        <div className="px-2">
          <Button
            className="flex items-center gap-2 py-3 px-5 bg-blue-500"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircleIcon className="w-5" />
            Add FAQ
          </Button>
        </div>
      )} */}
      {/* {isModalOpen && (
        <AddFaqModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          updateAutomationFaqs={updateAutomationFaqs}
          updateBranchFaqs={updateBranchFaqs}
        />
      )}
{(userRole === 1) && (
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-3">
          <Typography variant="h6" color="white">
            FAQs
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <select
            value={selectedUserGuide}
            onChange={(e) => setSelectedUserGuide(e.target.value)}
            className="block w-[90%] ml-9 p-2 pl-8 pr-4 mb-11 border rounded-md border-gray-300 appearance-none focus:outline-none focus:border-blue-500"
          >
            <option value="Automation">Automation</option>
            <option value="Branch">Branch</option>
          </select>

          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["ID", "Question", "Answer", "Action"].map((el) => (
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
              </tr> */}
            {/* </thead> */}
            {/* <tbody>
              {selectedUserGuide === 'Automation' ? (
                automationFaqs.map((item, index) => {
                  const className = `py-3 px-5 ${
                    index === automationFaqs.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`

                  return (
                    <tr key={item.id}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {index + 1}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {item.question}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {item.answer}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-black hover:nounderline p-1"
                            onClick={() => handleEditFaq(item.id)} // You need to define handleEditCategoryClick function
                          >
                            <PencilIcon className="w-5 h-5 text-blue-500 p-1" />
                          </button>
                          <button
                            className="text-black hover:nounderline p-1"
                            onClick={() => handleDeleteClick(item.id)}
                          >
                            <TrashIcon className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                branchFaqs.map((item, index) => {
                  const className = `py-3 px-5 ${
                    index === branchFaqs.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`

                  return (
                    <tr key={item.id}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {index + 1}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {item.question}
                        </Typography>
                      </td>
                      <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-600" >
                          {item.answer.includes('<ul>') || item.answer.includes('<ol>') ? (
                            <div dangerouslySetInnerHTML={{ __html:item.answer}}></div>
                          ):(
                            <p>{item.answer}</p>
                          )}
                      </Typography>
                    
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <button
                            className="text-black hover:nounderline p-1"
                            onClick={() => handleEditFaq(item.id)} 
                          >
                            <PencilIcon className="w-4 h-4 text-green-500 p-1" title="Edit" />
                          </button>
                          <button
                            className="text-black hover:nounderline p-1"
                            onClick={() => handleDeleteClick(item.id)}
                          >
                           <TrashIcon className="w-4 h-4 text-red-500 wiggle-on-hover" title="Delete?" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody> */}
          {/* </table>
        </CardBody>
      </Card>
    )}
      {isFaqEditOpen && (
        <EditFaqModal
          isOpen={isFaqEditOpen}
          onClose={() => setIsFaqEditOpen(false)}
          faqIdToEdit={showFaqIdToEdit}  
          updateAutomationFaqs={updateAutomationFaqs}
          updateBranchFaqs={updateBranchFaqs}
        />
      )} */}

    
 {/* Accordion For FAQS BRANCH */}

  {/* {(userRole === 2) && (
        <div className="mt-20 mb-96">
          <CardHeader variant="gradient" color="blue" className="mb-8 p-3">
            <Typography variant="h6" color="white">
              FAQs
            </Typography>
          </CardHeader>
          {selectedUserGuide === "Automation" ? (
            automationFaqs.map((item, index) => (
              <Accordion
                key={item.id}
                open={open === index + 1}
                className="mb-2 rounded-lg border border-blue-gray-100 px-4 w-[70%] ml-48"
              >
                <AccordionHeader
                  onClick={() => handleOpen(index + 1)}
                  className={`border-b-0 transition-colors ${
                    open === index + 1 ? "text-blue-500 hover:!text-blue-700" : ""
                  }`}
                >
                  {item.question}
                </AccordionHeader>
                <AccordionBody className="pt-0 text-base font-normal">
                  {item.answer}
                </AccordionBody>
              </Accordion>
            ))
          ) : (
            branchFaqs.map((item, index) => (
              <Accordion
                key={item.id}
                open={open === index + 1}
                className="mb-2 rounded-lg border border-blue-gray-100 px-4 w-[70%] ml-48"
              >
                <AccordionHeader
                  onClick={() => handleOpen(index + 1)}
                  className={`border-b-0 transition-colors ${
                    open === index + 1 ? "text-blue-500 hover:!text-blue-700" : ""
                  }`}
                >
                  {item.question}
                </AccordionHeader>
                <AccordionBody className="pt-0 text-base font-normal">
                  {item.answer}
                </AccordionBody>
              </Accordion>
            ))
          )}
        </div>
      )} */}

      {/* Accordion For FAQS BRANCH */}

      {(userRole === 4 || userRole === 5) && (
          <div className="mt-10 mb-96 ">
            <CardHeader variant="gradient" color="blue" className="mb-8 p-3">
              <Typography variant="h6" color="white">
                FAQs
              </Typography>
            </CardHeader>

            <div className="grid justify-self-center -mt-10">
            <div className="justify-self-center shadow-sky-200 relative z-10 h-[95%] w-full max-w-5xl rounded-lg bg-white p-1 shadow md:w-[100%] lg:w-[100%] mt-10">
              <CardBody>
              <Typography variant="h6" className="mb-4 ml-6 border-3d">
                How to create a ticket?
              </Typography>
              <div className="video-container flex justify-center">
                <iframe
                  title="How to create a ticket?"
                  src="https://drive.google.com/file/d/1Fwk66KLs1F-rEHycHgoRQafxaaXuGCzA/preview"
                  width="640"
                  height="380"
                  allow="autoplay"
                ></iframe>
              </div>
              </CardBody>
             
            </div>
            <div className="justify-self-center shadow-sky-200 relative z-10 h-[95%] w-full max-w-5xl  rounded-lg bg-white p-1 shadow md:w-[100%] lg:w-[100%] mt-10">
              <CardBody>
              <Typography variant="h6" className="mb-4 ml-6 border-3d">
                How to approve a ticket?
              </Typography>
              <div className="video-container flex justify-center border-3d">
                <iframe
                  title="How to create a ticket?"
                  src="https://drive.google.com/file/d/1UsM-nknzmPtoJd327FJNJBQabncIzgWU/preview"
                  width="640"
                  height="380"
                  allow="autoplay"
                ></iframe>
              </div>
              </CardBody>
            </div>
          </div>
          </div>
        )}



  
     
     
    </div>
  );
}

export { Help };
