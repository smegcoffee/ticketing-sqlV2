import { CardBody, CardHeader, Typography } from "@material-tailwind/react";
import {useState, useEffect} from "react";
import axios from "@/api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function EditFaqModal({ isOpen, onClose, updateAutomationFaqs, updateBranchFaqs, faqIdToEdit }) {


    const[showFaqData, setShowFaqData]= useState([]);
    const [changesMade, setChangesMade] = useState(false);
    const [loading, setLoading] = useState(false);
   //Fetch Data for edit
   useEffect(() =>{
    async function fetchFaqToEdit() {
        try {
        
          const EDIT_URL = `/viewHelp/${faqIdToEdit}`;
          const response = await axios.get(EDIT_URL);
        
          setShowFaqData(response.data);
        } catch (error) {
          console.error("Error in Edit Faq:", error);
          throw error;
        }
      }
  
      if(isOpen && faqIdToEdit) {
        fetchFaqToEdit();
  }
  },[isOpen, faqIdToEdit]);

  const handleEditInputChange = (event) =>{
    const {name,value}= event.target;
    setShowFaqData((prevData) => ({
      ...prevData, //to create a copy prev data
      [name]: value,
    }));
    setChangesMade(true);
  };


  const handleSaveChanges = async (event) => {
    event.preventDefault();
    try{
      setLoading(true);
      toast.success('Changes Saved Successfully');
      const EDIT_FAQ_URL = `/editHelp/ ${faqIdToEdit}`;
      await axios.put(EDIT_FAQ_URL, {
        question: showFaqData.question,
        answer: showFaqData.answer,
        role: showFaqData.role
      });

      const automationResponse = await axios.get('/getAllAutomationHelp');
        const branchResponse = await axios.get('/getAllBranchHelp'); 
      
        updateAutomationFaqs(automationResponse.data.rows);
        updateBranchFaqs(branchResponse.data.rows);

        onClose();
      } catch (error) {
        console.error('Error fetching help', error);
      }finally {
        setLoading(false); // Set loading state to false after the operation is complete
      }

};


    return (      
        <div className="fixed inset-0 flex items-center justify-center z-50 opacity-96 ">
            <div className="absolute inset-0 bg-black opacity-75 "></div>
            <div className="bg-white p-1 z-10 w-full md:w-[80%] lg:w-[60%] max-w-3xl h-[auto] relative rounded-lg shadow shadow-sky-200">
            <CardHeader variant="gradient" color="blue" className="mb-2 p-2">
                <Typography variant="h6" color="white">
                 Edit Faqs Details
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
                <form onSubmit={handleSaveChanges} className="flex flex-wrap justify-between m-auto text-sm">
                <div className="w-full">
                  <div className="flex flex-wrap -mx-2 border-x-2 border-y-2 p-2">             
                  {/* Column 1 */}
                  <div className="w-full p-2">
                      <div className='p-2 w-full'>
                      <label htmlFor="b_name" className="block text-gray-900 mb-1 text-sm">Question</label>
                          <input
                              type="text"
                              name="question"
                              className="w-full border border-gray-500 rounded-md py-11 px-3 text-gray-900 focus:outline-none focus:shadow-outline text-sm"
                              value={showFaqData.question}
                              onChange={handleEditInputChange}
                              />
                      </div>
                  </div>
                  {/* Column 2 */}
                  <div className="w-full p-2">
                      <div className=' p-2 w-full'>
                      <label htmlFor="b_code" className="block text-gray-900 mb-1  text-sm ">Answer</label>
                          <input
                              type="text"
                              name="answer"
                              className="w-full border border-gray-500 rounded-md py-11 px-3 text-gray-900 focus:outline-none focus:shadow-outline text-sm "
                              value={showFaqData.answer}
                              onChange={handleEditInputChange}
                          />  
                     
                  </div>
                  </div>
            
                  <div className="w-full p-2">
                <div className=' p-2 w-full'>
                  <label htmlFor="userGuide" className="block text-gray-700 mb-1 text-xs">User Guide</label>
                  <select
                    name="role"
                
                    className="w-full border border-gray-500 rounded-lg py-3 px-3 text-gray-700 focus:outline-none focus:shadow-outline text-xs"
                    value={showFaqData.role}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value=''>Select User Guide</option>
                    <option value={2}>Automation</option>
                    <option value={5}>Branch</option>
                  </select>
                </div>
              </div>
                  </div>
                  </div> 
               
                  <div className="flex justify-end w-full md:w-full sm:w-full lg:w-full xl:w-full p-5 text-sm ">
                  <button
                    type="submit"
                    className={`flex flex-col bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
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

export default EditFaqModal;