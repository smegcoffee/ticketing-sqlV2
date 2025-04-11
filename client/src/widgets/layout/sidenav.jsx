import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import axios from "@/api/axios";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/context/authContext";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { Help } from "@/pages/dashboard";

export function Sidenav({ brandName, routes, userRole }) {
  const token = sessionStorage.getItem("token");
  const decoded = jwtDecode(token);
  const user_Role = decoded.role;
  userRole = user_Role;
  const [userData, setUserData] = useState({
    UserDetails: {},
    Branch: {},
    UserRole: {},
  });

  const usrLogin = localStorage.getItem("user");

  const [open, setOpen] = useState(0);
  const [openSubMenu, setOpenSubMenu] = useState("");

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const toggleSubMenu = (name) => {
    setOpenSubMenu(openSubMenu === name ? "" : name);
  };

  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;

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
  }, []);

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-blue-gray-800 to-blue-gray-900",
    white: "bg-white shadow-lg",
    transparent: "bg-transparent",
  };

  axios.defaults.withCredentials = true;

  // Import useAuth and get the logout function
  const { logout } = useAuth();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to Logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logged me out!",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] max-h-[100%] w-72 overflow-y-auto rounded-xl transition-transform duration-300 xl:translate-x-0`}
    >
      <div
        className={`relative border-b ${
          sidenavType === "dark" ? "border-white/20" : "border-blue-gray-50"
        }`}
      >
        <Link
          to="/dashboard/home"
          className="flex items-center gap-4 py-6 px-8"
        >
          <Avatar src={["/img/smct-logo.png"]} className="w-20" size="sm" />
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <Typography color={sidenavType === "dark" ? "white" : "blue-gray"}>
            <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
          </Typography>
        </IconButton>
      </div>
      <div className="m-4">
        {routes.map(({ layout, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {pages.map(({ icon, name, path, children }) => (
              <li key={name}>
                {children ? (
                  userRole === 1 && (
                    // Render a toggle button for sub-menu
                    <Button
                      variant="text"
                      color={sidenavType === "dark" ? "white" : "blue-gray"}
                      className={`flex items-center gap-4 px-4 capitalize ${
                        openSubMenu === name ? "activeMenuItem" : ""
                      }`}
                      fullWidth
                      onClick={() => toggleSubMenu(name)}
                    >
                      {icon}
                      <Typography
                        color={
                          sidenavType === "dark" ? "white" : "blue-gray-200"
                        }
                        className="font-medium capitalize"
                      >
                        {name}
                      </Typography>
                      <span className="ml-auto">
                        {openSubMenu === name ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </span>
                    </Button>
                  )
                ) : // Render a regular link for non-sub-menu items
                (userRole === 1 && !["Help"].includes(name)) ||
                  (userRole === 2 && !["Setup", "Help"].includes(name)) ||
                  (userRole !== 1 &&
                    userRole !== 2 &&
                    !["Setup"].includes(name)) ? (
                  <NavLink to={`/${layout}${path}`}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={
                          isActive
                            ? sidenavColor
                            : sidenavType === "dark"
                            ? "white"
                            : "blue-gray"
                        }
                        className={`flex items-center gap-4 px-4 capitalize ${
                          isActive ? "activeMenuItem" : ""
                        }`}
                        fullWidth
                      >
                        {icon}
                        <Typography
                          color="inherit"
                          className="font-medium capitalize"
                        >
                          {name}
                        </Typography>
                      </Button>
                    )}
                  </NavLink>
                ) : null}
                {openSubMenu === name && (
                  // Render sub-menu items when the toggle button is clicked
                  <ul className="ml-8">
                    {children.map(({ icon, name, path }) => (
                      <li key={name}>
                        <NavLink to={`/${layout}${path}`}>
                          {({ isActive }) => (
                            <Button
                              variant={isActive ? "gradient" : "text"}
                              color={
                                isActive
                                  ? sidenavColor
                                  : sidenavType === "dark"
                                  ? "white"
                                  : "blue-gray"
                              }
                              className="flex items-center gap-4 px-4 capitalize"
                              fullWidth
                            >
                              {icon}
                              <Typography
                                color="inherit"
                                className="font-medium capitalize"
                              >
                                {name}
                              </Typography>
                            </Button>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ))}

        <hr />
        <br />
        <li className="list-none">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 capitalize"
          >
            <ArrowLeftEndOnRectangleIcon className="h-5 w-5 text-white" />
            <Typography color="white" className="font-medium capitalize">
              Logout
            </Typography>
          </button>
        </li>
      </div>
      <center>
        <div className="mt-20">
          <Typography
            variant="small"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
            className="text-center"
          >
            FOR SQL ERROR REQUESTS
          </Typography>
        </div>
      </center>
      {/* Footer with User's Name */}
      {/* <center>
       <div className="mt-20">
        <Typography variant="small" color={sidenavType === "dark" ? "white" : "blue-gray"} className="text-center">
          My Role: {userData.UserRole.role_name}
          <br/>
          My Branch : {userData.Branches?.map(branch => branch.b_code).join(', ').toUpperCase()}
        </Typography>
      </div>
      </center> */}
    </aside>
  );
}

Sidenav.defaultProps = {
  brandName: "Ticketing System",
};

// Sidenav.propTypes = {
//   brandImg: PropTypes.string,
//   brandName: PropTypes.string,
//   routes: PropTypes.arrayOf(PropTypes.object).isRequired,
// };

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
