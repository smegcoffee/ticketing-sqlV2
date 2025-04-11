import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "@/api/axios";
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
import { jwtDecode } from "jwt-decode";

export function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [data, setData] = useState("");
  const navigate = useNavigate();

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setNewPasswordConfirmation(event.target.value);
  };

  useEffect(() => {
    const fetchUserLogin = async () => {
      try {
        const res = await axios.get("/getUserLoginInfo");
        setUserId(res.data.login_id);
        setData(res.data);
      } catch (error) {
        console.error("Backend response: ", error);
      }
    };

    fetchUserLogin();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:4071/api/change-new-password/${userId}`,
        {
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        }
      );

      if (response.data.status === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your password has been reset successfully. You can now login again",
          confirmButtonColor: "#1e88e5",
        }).then(() => {
          sessionStorage.setItem("token", response.data.access_token);
          localStorage.setItem("token", response.data.access_token);
          navigate("/auth/sign-in");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.message,
          confirmButtonColor: "#1e88e5",
        });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response.data.message);
      setError(
        error.response.data.errors?.new_password || error.response.data.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative flex min-h-screen items-center justify-center bg-gray-100">
        <img
          src="../img/setup.png"
          alt="Background"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 z-0 bg-black/50" />
        <div className="relative z-10 w-full max-w-md p-4">
          <Card className="w-full">
            <CardHeader
              variant="gradient"
              color="blue"
              className="mb-4 grid h-28 place-items-center"
            >
              <Typography variant="h3" color="white">
                Setup New Password
              </Typography>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardBody className="flex flex-col gap-4">
                <Input
                  type="password"
                  label="New Password"
                  size="lg"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  required
                />
                <Input
                  type="password"
                  label="Confirm Password"
                  size="lg"
                  value={newPasswordConfirmation}
                  onChange={handleConfirmPasswordChange}
                  required
                />
                {error && (
                  <Alert color="red" className="mt-4">
                    {error}
                  </Alert>
                )}
              </CardBody>
              <CardFooter className="pt-0">
                <Button
                  type="submit"
                  className="bg-blue-500"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Reset Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
          <ToastContainer />
        </div>
      </div>
    </>
  );
}

export default ResetPassword;
