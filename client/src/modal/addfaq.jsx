import React, { useState } from "react";
import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import axios from "@/api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';




function AddFaqModal({ isOpen, onClose, updateAutomationFaqs, updateBranchFaqs }) {

const ADD_URL = '/createHelp';
const GET_ALL_AUTOMATION = '/getAllAutomationHelp';
const GET_ALL_BRANCH = '/getAllBranchHelp';
const [newFaq, setNewFaq] = useState([]);
const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  //initialize data
  const initialFaqState = {
    question: "" || 'N/A',
    answer: "" || 'N/A',
    role: '' || 'N/A',
};

  //Submit FUnction
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      toast.success('Faq added successfully.'); 
      const response = await axios.post(ADD_URL, newFaq);
      setNewFaq([initialFaqState]);

      
      const faqsResponse = await axios.get(GET_ALL_AUTOMATION);
      updateAutomationFaqs(faqsResponse.data.rows);
      
      const branchresponse = await axios.get(GET_ALL_BRANCH);
      updateBranchFaqs(branchresponse.data.rows);

      onClose();
    } catch (error) {
      console.error('Error saving changes:', error);
    }finally {
      setLoading(false); // Set loading state to false after the operation is complete
    }
  };

  const handleChange = (event) => {
  
    const { name, value } = event.target;
    setNewFaq((prevNewFaq) => ({
      ...prevNewFaq,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 opacity-96">
      <div className="absolute inset-0 bg-black opacity-75"></div>
      <div className="bg-white p-1 z-10 w-full md:w-[80%] lg:w-[60%] max-w-3xl h-[auto] relative rounded-lg shadow shadow-sky-200">
        <CardHeader variant="gradient" color="blue" className="mb-2 p-3">
          <Typography variant="h6" color="white">
            Add New Faq
          </Typography>
        </CardHeader>
        <button
          className="text-black px-2 py-1 rounded absolute top-2 right-2 mt-6"
          onClick={onClose}
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>

        <div className='p-2 h-[90%]'>
          <CardBody>
            <form onSubmit={handleFormSubmit} className="flex flex-wrap justify-between m-auto text-sm -mt-7">
             
              <div className="w-full md:w-1/1 p-2 -mb-2">
                <div className=' p-2 w-full'>
                  <label htmlFor="question" className="block text-gray-700 mb-1 text-xs">Question</label>
                  <textarea
                    type="text"
                    name="question"
                    className="w-full border border-gray-600 rounded-md py-9 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                    value={newFaq.question}
                    onChange={handleChange}
                    placeholder='Question'
                    required
                  />
                </div>
              </div>
              <div className="w-full md:w-1/1 p-2 -mb-2">
                <div className=' p-2 w-full'>
                  <label htmlFor="answer" className="block text-gray-700 mb-1 text-xs">Answer</label>
                  <textarea
                    type="text"
                    name="answer"
                    className="w-full border border-gray-600 rounded-md py-11 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                    value={newFaq.answer}
                    onChange={handleChange}
                    placeholder='Answer'
                    required
                  />
                </div>
              </div>
              <div className="w-full p-2">
                <div className=' p-2 w-full'>
                  <label htmlFor="userGuide" className="block text-gray-700 mb-1 text-xs">User Guide</label>
                  <select
                    name="role"
                    className="w-full border border-gray-600 rounded-lg py-3 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                    value={newFaq.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="Select">Select User Guide</option>
                    <option value={2}>Automation</option>
                    <option value={5}>Branch</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end w-full md:w-full sm:w-full lg:w-full xl:w-full p-5 text-sm ">
                        <button
                          type="submit"
                          className={`flex flex-col bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={loading}
                        >
                          {loading ? 'Adding...' : 'Add'}
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

export default AddFaqModal;
