import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "@/api/axios";
import { useAuth } from "@/context/authContext";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Typography,
  Alert,
} from "@material-tailwind/react";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function SignIn() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { login } = useAuth();

  axios.defaults.withCredentials = true;

  function handleEmailChange(event) {
    setUsernameOrEmail(event.target.value);
  }
  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  const handleSignIn = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(usernameOrEmail, password);
      if (result.success) {
        toast.success("Successfully logged in!");
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          confirmButtonColor: "#1e88e5",
          text: "Invalid Credentials",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.log("error message is: ", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isRegistrationSuccess) {
      const timer = setTimeout(() => {
        setIsRegistrationSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isRegistrationSuccess]);

  const loader = () => {
    return (
      <>
        <Typography variant="h6" color="white">
          Loading please wait ......
        </Typography>
      </>
    );
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <>
      {isVisible && (
        <div className="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-w-4xl rounded-lg bg-white bg-opacity-60 p-6 backdrop-blur">
            <button
              className="absolute top-2 right-2 text-red-900 hover:text-gray-700"
              onClick={handleClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={4}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="mx-auto mb-4 max-w-xs rounded-2xl bg-red-400 py-3 pl-20 text-xl font-semibold text-white">
              *** UPDATE 1.2 ***
            </h2>
            <p className="text-black-700 font-extrabold italic">
              <span style={{ color: "red", fontSize: "25px" }}>
                * EDIT FUNCTION FOR REJECTED TICKETS: YOU CAN NOW EDIT AND
                RESUBMIT
              </span>
              <br />
              <span style={{ color: "red", fontSize: "25px" }}>
                * BRANCH HEAD: CAN NOW APPROVED MULTIPLE BRANCHES IN SINGLE
                ACCOUNT
              </span>
              <br />
              <i>NOTE: DON'T CREATE MORE THAN ONE ACCOUNT</i>
              <br />
              * USER EXPERIENCE IMPROVED
              <br />
              * SYSTEM UP AND RUNNING 24/7
              <br />
            </p>
          </div>
        </div>
      )}
      <img
        src="../img/smct-building.jpg"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
      <div className="container mx-auto p-4">
        {isRegistrationSuccess && (
          <center>
            <Alert color="red">
              Server is not running please wait for a moment. Thank you!
            </Alert>
          </center>
        )}
        <Card className="absolute top-2/4 left-2/4 w-full max-w-[24rem] -translate-y-2/4 -translate-x-2/4">
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              Sign In
            </Typography>
          </CardHeader>
          <form onSubmit={handleSignIn}>
            <CardBody className="flex flex-col gap-4">
              <Input
                type="text"
                className="focus:border-blue-500"
                label="Email"
                size="lg"
                value={usernameOrEmail}
                onChange={handleEmailChange}
                required={true}
              />
              <Input
                type="password"
                label="Password"
                size="lg"
                value={password}
                onChange={handlePasswordChange}
                required={true}
              />
              {/* <div className="-ml-2.5">
              <Checkbox label="Remember Me" />
            </div> */}
            </CardBody>
            <CardFooter className="pt-0">
              <Button
                type="submit"
                className="bg-blue-500"
                fullWidth
                onClick={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? loader() : "Sign In"}
              </Button>
              <Typography variant="small" className="mt-6 flex justify-center">
                Don't have an account?
                <Link to="/auth/sign-up">
                  <Typography
                    as="span"
                    variant="small"
                    color="blue"
                    className="ml-1 font-bold"
                  >
                    Sign up
                  </Typography>
                </Link>
              </Typography>
              {/* <div className="my-4 flex items-center justify-center">
                <div className="relative w-full max-w-xs">
                  <div className="flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <hr className="mr-2 flex-grow border-t border-gray-300" />
                      <span className="mx-2 flex-shrink text-sm text-gray-900">
                        <strong>OR</strong>
                      </span>
                      <hr className="ml-2 flex-grow border-t border-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
              <Typography variant="small" className="mt-6 flex justify-center">
                <Link to="/auth/forgot-password">
                  <Typography
                    as="span"
                    variant="small"
                    color="blue"
                    className="ml-1 font-bold"
                  >
                    Forgot your password?
                  </Typography>
                </Link>
              </Typography> */}
            </CardFooter>
          </form>
        </Card>
        <ToastContainer />
      </div>
    </>
  );
}

export default SignIn;
