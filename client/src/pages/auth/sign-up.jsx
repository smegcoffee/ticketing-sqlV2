import { Link } from "react-router-dom";
import axios from "@/api/axios";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Spinner } from "@material-tailwind/react";
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";



export function SignUp() {
  
  const [isEmailError, setIsEmailError] = useState(false);
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFormatError, setEmailFormatError] = useState(false);

  
  const custLabel = { className: "w-full md:w-3/4"};
  const custLabel2 = { className: [`w-full md:w-3/4 md:ml-4 ${isEmailError ? 'input-error2' : ''}`]};
  //const custLabel2 = { className: "w-full md:w-3/4 md:ml-4"};

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [branch_code, setBranchCode] = useState([]);
  const [user_role, setUserRole] = useState("");
  const [selectedCode, setSelectedCode] = useState(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  
  const validateEmailFormat = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  useEffect(() => {
    const fetchBranchCode = async () => {
        try {
         
            const response = await axios.get('/getAllBranches');
            setBranchCode(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    fetchBranchCode();
    
}, []);


const handleBranchCodeChange = (selectedOption) => {
  setSelectedCode(selectedOption.value);

};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  if (!validateEmailFormat(email)) {
    setEmailFormatError(true);
    setIsLoading(false);
    return;
  }

  if (password !== confirmPassword) {
    setPasswordMismatch(true);
    setIsLoading(false);
    return;
  }

    try {
      const response = await axios.post("/register", {
        firstname, // Use the state or variables where you store user input
        lastname,
        contact,
        email,
        username,
        password,
        branch_code: selectedCode,
        user_role,
      });

      // Handle the response, e.g., show a success message to the user.
      setIsEmailError(false);
      setIsUsernameError(false);
      setIsRegistrationSuccess(true); // Set this to true
      Swal.fire({
        icon: 'success',
        title: 'You are now registered!',
        confirmButtonColor: '#1e88e5',
        confirmButtonText: 'Done',
        html: "You will be redirected to Sign-in Page<br> Thank you!"
      }).then(function() {
        window.location = "auth/sign-in";
      });
      setEmailFormatError(false);
    } catch (error) {
      if (error.response.status === 409) {
        if(error.response.data.message === 'Email already exist!'){
          setIsEmailError(true);
          setIsUsernameError(false);
          setIsEmailError(error.response.data.message);
        }else if(error.response.data.message === 'Username already exist!'){
          setIsUsernameError(true);
          setIsEmailError(false);
          setIsUsernameError(error.response.data.message);
        } else {
          setIsEmailError(true);
          setIsUsernameError(true);
        }
      }else if(error.response.status === 404){
        toast.error("Input field is required!");
      }
      else {
        setIsEmailError(true);
        setIsUsernameError(true);
      }
    }
    finally {
      // Step 4: Enable the button and set loading to false after registration is complete
      setIsLoading(false);
    }
  }; 

  const loader = () => {
    return (<><Typography variant="h6" color="white">
    Loading please wait ......
  </Typography></>);
  }

  return (
    <>
      <img
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29ycG9yYXRlJTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
      <div className="container mx-auto p-4">
        <Card className="absolute top-2/4 left-2/4 w-full max-w-[25rem] -translate-y-2/4 -translate-x-2/4">
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              Sign Up
            </Typography>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="w-full">
            <div className="flex flex-wrap">
                <div className="pt-3 w-full md:w-1/2">
                  <Input
                    label="First Name"
                    labelProps={custLabel}
                    size="lg"
                    className="w-full md:w-40"
                    onChange={(e) => setFirstname(e.target.value)}
                    value={firstname}
                    required
                  />
                </div>
                <div className="pt-3 w-full md:w-1/2">
                  <Input
                    label="Last Name"
                    labelProps={custLabel2}
                    size="lg"
                    className="w-full md:w-[90%]"
                    onChange={(e) => setLastname(e.target.value)}
                    value={lastname}
                  />
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="pt-3 w-full md:w-1/2">
                    <Input label="Contact Number" labelProps = {custLabel} size="lg" className="w-full md:w-40" onChange={(e) => setContact(e.target.value)} value={contact}/>
                </div>
                <div className="pt-3 w-full md:w-1/2">
                <Input
                  label="Email"
                  labelProps={custLabel2}
                  size="lg"
                  className={`w-full md:w-[90%] ${
                    (isEmailError || emailFormatError) ? 'input-error' : ''
                  }`}
                  onChange={(e) => {setEmail(e.target.value); setIsEmailError(false); setEmailFormatError('');}}
                  value={email}
                />
                      {(isEmailError || emailFormatError) && (
                  <div className="text-red-500 text-xs mt-1 md:ml-5 md:w-[200px]">
                    {emailFormatError
                      ? 'Invalid email format'
                      : isEmailError
                      ? isEmailError
                      : ''}
                  </div>
                )}
                </div>
              </div>
            </div>
            
            <Select
              options={branch_code.map((code) => ({
              value: code.blist_id,
              label: code.Branch?.b_code.toUpperCase(),
              }))}
              placeholder="Select Branch Code"
              value={selectedCode ? selectedCode.value: null}
              onChange={handleBranchCodeChange}
            />

            {/* <Input type="text" label="Select Branch Code" size="lg" onChange={(e) => setBranchCode(e.target.value)} value={branch_code} /> */}
            {/* <Input type="text" label="Select Branch Code" size="lg" onChange={(e) => setBranchCode(e.target.value)} value={branch_code} /> */}
            <Input type="text" label="Username" size="lg" className={` ${isUsernameError ? 'input-error' : ''}`} onChange={(e) => setUsername(e.target.value)} value={username} />
            {isUsernameError && (
                    <div className="text-red-500 text-xs -mt-3">{isUsernameError}</div>
                  )}
            <Input
              type="password"
              label="Password"
              size="lg"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <Input
              type="password"
              label="Confirm Password"
              size="lg"
              className={` ${
                (passwordMismatch) ? 'input-error' : ''
              }`}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordMismatch(false);
              }}
              value={confirmPassword}
            />
            {passwordMismatch && (
              <div className="text-red-500 text-xs mt-1">
                Passwords do not match.
              </div>
            )}
            {/* <div className="-ml-2.5">
              <Checkbox label="I agree the Terms and Conditions" />
            </div> */}
          </CardBody>
          <CardFooter className="pt-0">
            <Button className="bg-blue-500" onClick={handleSubmit} fullWidth disabled={isLoading || passwordMismatch}>
            {isLoading ? loader() : "Sign Up"}
            </Button>
            <Typography variant="small" className="mt-6 flex justify-center">
              Already have an account?
              <Link to="/auth/sign-in">
                <Typography
                  as="span"
                  variant="small"
                  color="blue"
                  className="ml-1 font-bold"
                >
                  Sign in
                </Typography>
              </Link>
            </Typography>
          </CardFooter>
        </Card>
        <ToastContainer/>
      </div>
    </>
  );
}

export default SignUp;
