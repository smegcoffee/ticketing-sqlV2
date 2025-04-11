import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const handleEmailChange = async (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:4071/api/ticketing-forgot-password",
        {
          user_email: email,
        }
      );
      if (response.data.status === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          confirmButtonColor: "#1e88e5",
          showCloseButton: true,
          confirmButtonText: "Ok",
          html: `${response.data.message}<br>You will be redirected to the Login page.<br>Thank you!`,
        }).then(function () {
          window.location = "/login";
        });
        setSuccess(response.data.message);
        setError("");
        setValidationErrors("");
      }
    } catch (error) {
      console.error("Error sending password reset link:", error);
      if (error.response && error.response.data) {
        setError(error.response.data.message);
        setValidationErrors(error.response.data.message || {});
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response.data.message,
          showCloseButton: true,
          confirmButtonColor: "#1e88e5",
          confirmButtonText: "Ok",
        });
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <img
        src="../img/forgot.png"
        className="absolute inset-0 z-0 h-full w-full object-cover"
        alt="Background"
      />
      <div className="absolute inset-0 z-0 h-full w-full bg-black/50" />
      <div className="container mx-auto p-4">
        {error && (
          <center>
            <Alert color="red">{error}</Alert>
          </center>
        )}
        {success && (
          <center>
            <Alert color="green">{success}</Alert>
          </center>
        )}
        <Card className="absolute top-2/4 left-2/4 w-full max-w-[24rem] -translate-y-2/4 -translate-x-2/4">
          <CardHeader
            variant="gradient"
            color="blue"
            className="mb-4 grid h-28 place-items-center"
          >
            <Typography variant="h3" color="white">
              Forgot Password
            </Typography>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardBody className="flex flex-col gap-4">
              <Input
                type="text"
                className="focus:border-blue-500"
                label="Email"
                size="lg"
                value={email}
                onChange={handleEmailChange}
                required={true}
              />
            </CardBody>
            <CardFooter className="pt-0">
              <Button
                type="submit"
                className="bg-blue-500"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Typography variant="small" className="mt-6 flex justify-center">
                <Link to="/auth/sign-in">
                  <Typography
                    as="span"
                    variant="small"
                    color="blue"
                    className="ml-1 font-bold"
                  >
                    Remembered your password? Sign In
                  </Typography>
                </Link>
              </Typography>
            </CardFooter>
          </form>
        </Card>
        <ToastContainer />
      </div>
    </>
  );
}

export default ForgotPassword;
