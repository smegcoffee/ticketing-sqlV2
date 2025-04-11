import React, { useEffect, useState } from "react";
import {
  CardBody,
  CardHeader,
  Typography,
  Input,
  Button,
} from "@material-tailwind/react";
import axios from "@/api/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "sweetalert2/dist/sweetalert2.min.css";
import Swal from "sweetalert2";
import { useUser } from "../../context/userContext";

function MyProfile() {
  const { setUserProfile } = useUser();
  const [profileImage, setProfileImage] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [userData, setUserData] = useState({
    UserDetails: {},
    Branch: {},
    UserRole: {},
  });
  const [changePassButton, setChangePassButton] = useState("Change");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changeProfile, setChangeProfile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/getUserLoginInfo");
        setUserData(response.data);
        setProfileImage(response.data.UserDetails.profile_pic);
      } catch (error) {
        console.log("Error fetching user", error);
      }
    };
    fetchUserData();
  }, [isModalOpen, changeProfile]);

  const handleImageUpload = async (event) => {
    try {
      const formData = new FormData();
      formData.append("profileImage", event.target.files[0]);

      await axios.put("/uploadProfilePic", formData);
      toast.success("Profile picture updated");
      if (changeProfile === true) {
        setChangeProfile(false);
      } else {
        setChangeProfile(true);
      }
      const response = await axios.get("/getUserLoginInfo");
      const updatedProfileImage = response.data.UserDetails.profile_pic;
      setUserProfile((prevUserData) => ({
        ...prevUserData,
        profileImage: updatedProfileImage,
      }));
    } catch (error) {
      toast.error("Error updating profile picture");
    }
  };

  const handlePasswordChangeClick = () => {
    if (changePassButton === "Change") {
      setShowPasswordForm(true);
      setIsModalOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await axios.put("/changePass", {
      oldPass,
      newPass,
      confirmPass,
    });

    if (response.data.message === "Success") {
      toast.success("Password changed");
      setChangePassButton("Change");
      setShowPasswordForm(false);
    } else {
      toast.error(response.data.message);
    }
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setUserData((prevUser) => ({
      UserDetails: {
        ...prevUser.UserDetails,
        [name]: value,
      },
    }));
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();

    Swal.fire({
      title: "Save changes?",
      html: '<span style = "font-size:12px;">Please review before saving, thank you!</span>',
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, proceed!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const EDIT_URL = `/editUserDetails`;
          const response = await axios.put(EDIT_URL, {
            firstname: userData.UserDetails?.fname,
            lastname: userData.UserDetails?.lname,
            contact: userData.UserDetails?.user_contact,
            email: userData.UserDetails?.user_email,
          });
          localStorage.setItem("user", userData.UserDetails?.fname);
          toast.success(response.data.message);
          closeModal();
        } catch (error) {
          console.error("Error saving changes:", error);
          console.error("Error message:", error.message);
          toast.error("An error occurred while saving user changes.");
        }
      }
    });
  };

  const closeModal = async () => {
    setIsModalOpen(false);
  };

  return (
    <div className="mt-14">
      <CardHeader variant="gradient" color="blue" className="mb-3 p-4">
        <Typography variant="h6" color="white">
          My Profile
        </Typography>
      </CardHeader>
      <CardBody>
        <div className="flex justify-center">
          <div className="shadow-sky-200 relative z-10 flex h-[80%] w-[100%] justify-items-center rounded-lg bg-white p-1 shadow">
            <div className="ml-9 mr-10 p-9">
              {profileImage ? (
                <img
                  src={`${axios.defaults.baseURL}/uploads/${profileImage}`}
                  alt="Profile"
                  className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <img
                  src={`${axios.defaults.baseURL}/uploads/Windows_10_Default_Profile_Picture.svg.png`}
                  alt="Profile"
                  className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                />
              )}
              <label
                htmlFor="profileImage"
                className="mb-7 flex cursor-pointer justify-center text-sm text-blue-500"
              >
                Upload Profile
                <input
                  type="file"
                  id="profileImage"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
              <div>
                <Typography className="mb-3 flex justify-center text-lg">
                  <p className="font-bold">
                    {" "}
                    {userData.UserDetails.fname} {userData.UserDetails.lname}{" "}
                  </p>{" "}
                </Typography>
              </div>
              {/* </div> */}
              <div className="mb-2 mt-3 grid justify-self-center">
                {changePassButton === "Change" && (
                  <Button
                    onClick={handlePasswordChangeClick}
                    color="blue"
                    block
                    className="rounded-md p-2"
                  >
                    Change Password
                  </Button>
                )}
              </div>
              <div className="p-2">
                <Typography className="mb-2 font-extrabold">
                  User Information
                </Typography>

                {/* {console.log((userData.Branches).map(branch => branch.b_name))} */}
                <div class="flex flex-col">
                  <p className="mb-3 flex">
                    <span className="font-bold">Branch:</span>
                    <span className="ml-1 flex flex-wrap gap-2">
                      {userData.Branches?.length > 0
                        ? userData.Branches.map((branch, index) => (
                            <span
                              key={index}
                              className="border border-gray-400 bg-gray-200 p-2 rounded-full"
                            >
                              {branch.b_name}
                            </span>
                          ))
                        : "No branches assigned"}
                    </span>
                  </p>

                  <div class="flex items-center">
                    <p class="mb-3 font-bold">Email:</p>
                    <p class="ml-3 -mt-3">{userData.UserDetails?.user_email}</p>
                  </div>
                  <div class="flex items-center">
                    <p class="font-bold">Contact:</p>
                    <p class="ml-3">{userData.UserDetails?.user_contact}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid justify-self-center text-center">
                <Button
                  type="submit"
                  color="blue"
                  className="mb-3 rounded-md p-2"
                  onClick={() => {
                    setIsModalOpen(true);
                    setShowPasswordForm(false);
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
            {showPasswordForm && (
              <div className="mt-5 w-full border-x border-y p-4">
                <CardHeader
                  variant="gradient"
                  color="blue"
                  className="mb-11 p-3"
                >
                  <Typography variant="h6" color="white">
                    RESET PASSWORD
                  </Typography>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <Input
                      type="password"
                      name="oldPassword"
                      label="Old Password"
                      onChange={(pass) => setOldPass(pass.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      type="password"
                      name="newPassword"
                      label="New Password"
                      onChange={(pass) => setNewPass(pass.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      type="password"
                      name="confirmNewPassword"
                      label="Confirm New Password"
                      onChange={(pass) => setConfirmPass(pass.target.value)}
                    />
                  </div>
                  <div className="flex justify-end text-center">
                    <Button
                      type="submit"
                      color="blue"
                      className="rounded-md p-2"
                    >
                      Reset Password
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {isModalOpen && (
              <div className="mt-8 w-full border-x border-y p-4">
                <CardHeader
                  variant="gradient"
                  color="blue"
                  className="mb-2 p-3"
                >
                  <Typography variant="h6" color="white">
                    EDIT PROFILE
                  </Typography>
                </CardHeader>
                <button
                  className="absolute top-2 right-2 mt-6 rounded px-2 py-1 text-black"
                  onClick={closeModal}
                >
                  <i className="fa fa-times" aria-hidden="true"></i>
                </button>

                <div className="h-[90%] p-2">
                  <CardBody>
                    <form
                      onSubmit={handleSaveChanges}
                      className="m-auto flex flex-wrap justify-between text-sm"
                    >
                      <div className="w-full p-2 md:w-1/2">
                        <div className="w-full p-2">
                          <label
                            htmlFor="fname"
                            className="mb-1 block text-xs text-gray-700"
                          >
                            First Name
                          </label>
                          <input
                            type="text"
                            name="fname"
                            className="focus:shadow-outline  w-full rounded-md border border-gray-600 py-3 px-2 text-xs text-gray-700 focus:outline-none"
                            maxLength={30}
                            value={userData.UserDetails?.fname || ""}
                            onChange={handleEditInputChange}
                          />
                        </div>
                      </div>
                      <div className="w-full p-2 md:w-1/2">
                        <div className=" w-full p-2">
                          <label
                            htmlFor="lname"
                            className="mb-1 block text-xs  text-gray-700 "
                          >
                            Last Name{" "}
                          </label>
                          <input
                            type="text"
                            name="lname"
                            className="focus:shadow-outline  w-full rounded-md border border-gray-600 py-3 px-2 text-xs text-gray-700 focus:outline-none "
                            value={userData.UserDetails?.lname || ""}
                            onChange={handleEditInputChange}
                          />
                        </div>
                      </div>
                      <div className="w-full p-2 md:w-1/2">
                        <div className="w-full p-2">
                          <label
                            htmlFor="user_email"
                            className="mb-1 block text-xs text-gray-700"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            name="user_email"
                            className="focus:shadow-outline mb-5 w-full rounded-md border border-gray-600 py-3 px-2 text-xs text-gray-700 focus:outline-none "
                            value={userData.UserDetails?.user_email || ""}
                            onChange={handleEditInputChange}
                          />
                        </div>
                      </div>
                      <div className="w-full p-2 md:w-1/2">
                        <div className=" w-full p-2">
                          <label
                            htmlFor="user_contact"
                            className="mb-1 block text-xs  text-gray-700 "
                          >
                            Contact
                          </label>
                          <input
                            type="tel"
                            name="user_contact"
                            className="focus:shadow-outline  w-full rounded-md border border-gray-600 py-3 px-2 text-xs text-gray-700 focus:outline-none "
                            value={userData.UserDetails?.user_contact || ""}
                            onChange={handleEditInputChange}
                          />
                        </div>
                      </div>

                      <div className="flex w-full justify-end p-5 sm:w-full md:w-full lg:w-full xl:w-full">
                        <button
                          type="submit"
                          className="flex flex-col rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
                          onSubmit={handleSaveChanges}
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </CardBody>
                </div>
              </div>
            )}
          </div>
        </div>
        <ToastContainer />
      </CardBody>
    </div>
  );
}

export default MyProfile;
