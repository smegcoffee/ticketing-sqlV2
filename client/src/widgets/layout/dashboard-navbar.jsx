import { useLocation, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  Navbar,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Button,
  Badge,
} from "@material-tailwind/react";
import {
  Cog6ToothIcon,
  BellIcon,
  Bars3Icon,
  TicketIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { useAuth } from "@/context/authContext";
import axios from "@/api/axios";
import { formatDistanceToNow } from "date-fns";
// import { notifTableData } from "@/data";
// import { fetchInfoData }  from "@/data/notif-data"
import ViewTicketModal from "@/modal/viewTicket";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useUser } from "@/context/userContext";

export function DashboardNavbar() {
  const { userProfile } = useUser();
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const { logout } = useAuth();
  const [notifBadge, setNotifBadge] = useState([]);
  const [isViewTicketModalOpen, setIsViewTicketModalOpen] = useState(false);
  const [showTicketToView, setShowTicketToView] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profileImage, setProfileImage] = useState();
  const [displayTicket, setDisplayTicket] = useState();
  const [user_Role, setUser_Role] = useState();
  const [notifTableData, setNotifTableData] = useState([]);
  const [status, setStatus] = useState([]);
  const [notif, setNotif] = useState(false);
  const navigate = useNavigate();
  const handleSeeAll = () => {
    return navigate("/dashboard/ticket");
  };
  const handleHelp = () => {
    return navigate("/dashboard/help");
  };
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

  const handleSwitchToNetSuite = () => {
    Swal.fire({
      title: "Are you sure you want to Switch?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, switch to Netsuite!",
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading indicator
        Swal.fire({
          title: "Switching...",
          text: "Please wait while we log you out.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
  
        logout().then(() => {
          window.location.href = "https://ticketing-netsuite.smctgroup.ph";
        });
      }
    });
  };
  
  

  const updateDocumentTitle = () => {
    if (notificationCount > 0) {
      document.title = `(${notificationCount}) Ticketing System`;
    } else {
      document.title = `Ticketing System`;
    }
  };

  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const res = await axios.get("/getUserLoginInfo");
        const userRole = res.data.UserRole.user_role_id;
        setProfileImage(res.data.UserDetails.profile_pic);
        // setProfileImage(res.data.UserDetails.profile_pic);
        setUser_Role(userRole);
        // console.log(displayAccountingManager);
        const response = await axios.get("/getAllNotifs");
        const accountingNotif = await axios.get("/getAssignedCategories");
        // console.log(accountingNotif.data)
        // console.log("accountingNotif", accountingNotif.data[0].group_code)
        // console.log('user : ' , res.data);
        // console.log('response : ' , response.data.filter(item => item.notifHead === 3));
        // console.log('response : ' , response.data);
        let count = 0;
        if (userRole === 1) {
          count = response.data.filter(
            (item) =>
              (item.notifAdmin === 1 || item.notifAdmin === 2) &&
              item.status === "PENDING"
          ).length;
        } else if (userRole === 2) {
          const response = await axios.get("/getAllNotifs");
          count = response.data.filter(
            (branch) =>
              (branch.notifAutomation === 1 ||
                branch.notifAutomation === 2 ||
                branch.notifAutomation === 3) &&
              branch.assigned_person === res.data.login_id &&
              branch.status === "PENDING"
          ).length;
        } else if (userRole === 4) {
          count = response.data.filter(
            (item) =>
              (item.notifHead === 1 ||
                item.notifHead === 2 ||
                item.notifHead === 3 ||
                item.notifHead === 4 ||
                item.notifHead === 5) &&
              item.UserTicket.Branch.b_code === res.data.Branch.b_code &&
              (item.status === "PENDING" ||
                item.status === "EDITED" ||
                item.status === "REJECTED")
          ).length;
        } else if (userRole === 5) {
          count = response.data.filter(
            (item) =>
              (item.notifStaff === 1 ||
                item.notifStaff === 2 ||
                item.notifStaff === 3 ||
                item.notifStaff === 4 ||
                item.notifStaff === 5 ||
                item.notifStaff === 6) &&
              item.UserTicket.Branch.b_code === res.data.Branch.b_code &&
              (item.status === "PENDING" ||
                item.status === "REJECTED" ||
                item.status === "EDITED")
          ).length;
        } else if (userRole === 7 && accountingNotif.data[0].group_code === 3) {
          count = response.data.filter(
            (item) =>
              item.notifAccounting === 13 &&
              accountingNotif.data[0].group_code ===
                item.TicketDetails.Category.group_code &&
              res.data.login_id === accountingNotif.data[0].login_id &&
              item.displayTicket === 13 &&
              item.status === "PENDING"
          ).length;
        } else if (userRole === 7 && accountingNotif.data[0].group_code === 4) {
          count = response.data.filter(
            (item) =>
              item.notifAccounting === 14 &&
              accountingNotif.data[0].group_code ===
                item.TicketDetails.Category.group_code &&
              res.data.login_id === accountingNotif.data[0].login_id &&
              item.displayTicket === 14 &&
              item.status === "PENDING"
          ).length;
        } else if (userRole === 3 && accountingNotif.data[0].group_code === 3) {
          count = response.data.filter(
            (item) =>
              item.notifAccounting === 3 &&
              accountingNotif.data[0].group_code ===
                item.TicketDetails.Category.group_code &&
              res.data.login_id === accountingNotif.data[0].login_id &&
              item.displayTicket === 3 &&
              item.status === "PENDING"
          ).length;
        } else if (userRole === 3 && accountingNotif.data[0].group_code === 4) {
          count = response.data.filter(
            (item) =>
              item.notifAccounting === 4 &&
              accountingNotif.data[0].group_code ===
                item.TicketDetails.Category.group_code &&
              res.data.login_id === accountingNotif.data[0].login_id &&
              item.displayTicket === 4 &&
              item.status === "PENDING"
          ).length;
        }else if (userRole === 9) {
          count = response.data.filter(
            (item) =>
              (item.notifAUTM === 1) &&
              item.status === "PENDING"
          ).length;
        }
        setNotifBadge(count);

        //  console.log("notif count", count);
        //  console.log("login 1", res.data);
        //  console.log("login 2", accountingNotif.data);
        //  console.log("ticket details", response.data);
        let filteredData = [];
        if (userRole === 1) {
          filteredData = response.data.filter(
            (item) =>
              (item.notifAdmin === 1 || item.notifAdmin === 2) &&
              item.status === "PENDING"
          );
        } else if (userRole === 9) {
          filteredData = response.data.filter(
            (item) =>
              (item.notifAUTM === 1) &&
              item.status === "PENDING"
          );
        } else if (userRole === 2) {
          const response = await axios.get("/getAllNotifs");
          filteredData = response.data.filter(
            (branch) =>
              (branch.notifAutomation === 1 ||
                branch.notifAutomation === 2 ||
                branch.notifAutomation === 3) &&
              branch.assigned_person === res.data.login_id &&
              branch.status === "PENDING"
          );
        } else if (userRole === 4) {
          filteredData = response.data.filter(
            (item) =>
              (item.notifHead === 1 ||
                item.notifHead === 2 ||
                item.notifHead === 3 ||
                item.notifHead === 4 ||
                item.notifHead === 5) &&
              item.UserTicket.Branch.b_code === res.data.Branch.b_code &&
              (item.status === "PENDING" ||
                item.status === "REJECTED" ||
                item.status === "EDITED")
          );
        } else if (userRole === 5) {
          filteredData = response.data.filter(
            (item) =>
              (item.notifStaff === 1 ||
                item.notifStaff === 2 ||
                item.notifStaff === 3 ||
                item.notifStaff === 4 ||
                item.notifStaff === 5 ||
                item.notifStaff === 6) &&
              item.UserTicket.Branch.b_code === res.data.Branch.b_code &&
              (item.status === "PENDING" ||
                item.status === "REJECTED" ||
                item.status === "EDITED")
          );
        } else if (userRole === 7 && accountingNotif.data[0].group_code === 3) {
          filteredData = response.data.filter(
            (item) =>
              item.notifAccounting === 13 &&
              accountingNotif.data[0].group_code ===
                item.TicketDetails.Category.group_code &&
              res.data.login_id === accountingNotif.data[0].login_id &&
              item.displayTicket === 13 &&
              item.status === "PENDING"
          );
        } else if (userRole === 7 && accountingNotif.data[0].group_code === 4) {
          filteredData = response.data.filter(
            (item) =>
              item.notifAccounting === 14 &&
              accountingNotif.data[0].group_code ===
                item.TicketDetails.Category.group_code &&
              res.data.login_id === accountingNotif.data[0].login_id &&
              item.displayTicket === 14 &&
              item.status === "PENDING"
          );
        } else if (userRole === 3 && accountingNotif.data[0].group_code === 3) {
          filteredData = response.data.filter(
            (item) =>
              item.notifAccounting === 3 &&
              accountingNotif.data[0].group_code ===
                item.TicketDetails.Category.group_code &&
              res.data.login_id === accountingNotif.data[0].login_id &&
              item.displayTicket === 3 &&
              item.status === "PENDING"
          );
        } else if (userRole === 3 && accountingNotif.data[0].group_code === 4) {
          filteredData = response.data.filter(
            (item) =>
              item.notifAccounting === 4 &&
              accountingNotif.data[0].group_code ===
                item.TicketDetails.Category.group_code &&
              res.data.login_id === accountingNotif.data[0].login_id &&
              item.displayTicket === 4 &&
              item.status === "PENDING"
          );
        }
        // console.log("filteredData", accountingNotif.data)
        // console.log("filteredData2", res.data)
        // console.log("filteredData2", response.data.filter(item => item.TicketDetails.Category.group_code === 2))
        const updatedNotifTableData = filteredData.map((info, index) => ({
          id: String(index + 1),
          ticket_id: info.ticket_id || "N/A",
          b_code: info.branch_name || "N/A",
          // b_name: info.UserTicket.Branch.b_code || 'N/A',
          timeTicketCreateds: info.TicketDetails.time || "N/A",
          dateTicketCreateds:
            info.TicketDetails.ticket_transaction_date || "N/A",
          notifStaff: info.notifStaff || "N/A",
          notifHead: info.notifHead || "N/A",
          notifAdmin: info.notifAdmin || "N/A",
          status: info.status || "N/A",
          fname: info.UserTicket.UserDetails.fname || "N/A",
          displayTicket: info.displayTicket || "N/A",
        }));

        // Sort the updated data
        updatedNotifTableData.sort((a, b) => {
          const dateA = new Date(b.dateTicketCreateds);
          const dateB = new Date(a.dateTicketCreateds);
          return dateA - dateB;
        });
        updatedNotifTableData.sort((a, b) => {
          const dateA = new Date(b.dateTicketCreateds);
          const dateB = new Date(a.dateTicketCreateds);
          return dateA - dateB;
        });

        setNotificationCount(count);
        setNotifTableData(updatedNotifTableData);
        // console.log("data", [notifTableData]);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };
    fetchNotif();

    // const intervalId = setInterval(fetchNotif, 30000);

    // return () => clearInterval(intervalId);
  }, [notif]);

  useEffect(() => {
    // Update the document title whenever the notification count changes
    updateDocumentTitle();
  }, [notificationCount]);

  // Periodically fetch the notification count (e.g., every 30 seconds)
  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     fetchNotif();
  //   }, 30000);
  //   return () => clearInterval(intervalId);
  // }, []);

  const badgeComponent =
    notifBadge > 0 ? (
      <Badge content={notifBadge} className="badgeIndex">
        <BellIcon className="bellss h-5 w-5 text-blue-gray-500" />
      </Badge>
    ) : (
      <BellIcon className="h-5 w-5 text-blue-gray-500" />
    );

  const handleViewTicketClick = async (ticketId, status, displayTicket) => {
    setNotif(true);
    try {
      const UPDATE_NOTIF_URL = `/updateNotif/${ticketId}`;

      if (user_Role === 1 || user_Role === 2) {
        await axios.put(UPDATE_NOTIF_URL, { notifID: 1 });
      } else if (user_Role === 3) {
        await axios.put(UPDATE_NOTIF_URL, { notifID: 3 });
      } else if (user_Role === 4) {
        await axios.put(UPDATE_NOTIF_URL, { notifID: 4 });
      } else if (user_Role === 5) {
        await axios.put(UPDATE_NOTIF_URL, { notifID: 5 });
      } else if (user_Role === 7) {
        await axios.put(UPDATE_NOTIF_URL, { notifID: 7 });
      } else if (user_Role === 9) {
        await axios.put(UPDATE_NOTIF_URL, { notifID: 100 });
      }
      setIsViewTicketModalOpen(true);
      setShowTicketToView(ticketId);
      setStatus(status);
      setDisplayTicket(displayTicket);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setNotif(false);
    }
  };

  const closeViewModal = () => {
    setIsViewTicketModalOpen(false);
  };

  return (
    <>
      <Navbar
        color={fixedNavbar ? "white" : "transparent"}
        className={`rounded-xl transition-all ${
          fixedNavbar
            ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
            : "px-0 py-1"
        }`}
        fullWidth
        blurred={fixedNavbar}
      >
        <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
          <div className="capitalize">
            <Typography variant="h6" color="blue-gray">
              {page}
            </Typography>
          </div>
          <div className="flex items-center">
            <Tooltip content="Menu">
              <IconButton
                variant="text"
                color="blue-gray"
                className="grid xl:hidden"
                onClick={() => setOpenSidenav(dispatch, !openSidenav)}
              >
                <Bars3Icon
                  strokeWidth={3}
                  className="h-6 w-6 text-blue-gray-500"
                />
              </IconButton>
            </Tooltip>
            <Menu>
              <Tooltip content="Switch to NetSuite">
                {/* <MenuHandler className="mr-2"> */}
                  <Button
                    style={{ backgroundColor: "#2C7BE5", padding: "5px 10px", marginRight: "10px" }}
                    onClick={handleSwitchToNetSuite}
                  >
                    <Typography variant="small" color="white">
                      <strong>Switch to NetSuite</strong>
                    </Typography>
                  </Button>
                {/* </MenuHandler> */}
              </Tooltip>
            </Menu>
            <Menu>
              <Tooltip content="Profile">
                <MenuHandler>
                  {userProfile.profileImage !== "" ? (
                    <Avatar
                      variant="circular"
                      alt="Profile"
                      className="h-10 w-10 cursor-pointer"
                      src={`${axios.defaults.baseURL}/uploads/${userProfile.profileImage}`}
                    />
                  ) : profileImage === null ? (
                    <Avatar
                      variant="circular"
                      alt="Profile"
                      className="h-10 w-10 cursor-pointer"
                      src={`${axios.defaults.baseURL}/uploads/Windows_10_Default_Profile_Picture.svg.png`}
                    />
                  ) : (
                    <Avatar
                      variant="circular"
                      alt="Profile"
                      className="h-10 w-10 cursor-pointer"
                      src={`${axios.defaults.baseURL}/uploads/${profileImage}`}
                    />
                  )}
                </MenuHandler>
              </Tooltip>

              <MenuList>
                <Link to="/dashboard/myprofile">
                  <MenuItem className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <Typography variant="small" className="font-normal">
                      My Profile
                    </Typography>
                  </MenuItem>
                </Link>

                {/* <MenuItem className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3"
                    />
                  </svg>
                  <Typography variant="small" className="font-normal">
                    <span className="absolute">Inbox</span> <p className="flex text-deep-orange-400 -skew-y-12 -ml-3 -mt-1" >(Coming Soon)</p>
                  </Typography>
                </MenuItem> */}
                <Link to="/dashboard/help">
                  <MenuItem
                    className="flex items-center gap-2"
                    onClick={handleHelp}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796a3.765 3.765 0 00-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 01-1.388.88m2.268-2.268l4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l-3.448-4.138m3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-1.388-.88 3.737 3.737 0 01-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 01-1.652-1.306 9.027 9.027 0 01-1.306-1.652m0 0l4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976a3.765 3.765 0 010-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 011.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 00-1.652 1.306A9.025 9.025 0 004.33 7.288"
                      />
                    </svg>
                    <Typography variant="small" className="font-normal">
                      Help
                    </Typography>
                  </MenuItem>
                </Link>
                <hr className="my-2 border-blue-gray-50" />
                <MenuItem
                  className="flex items-center gap-2 "
                  onClick={handleLogout}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                    />
                  </svg>
                  <Typography variant="small" className="font-normal">
                    Sign Out
                  </Typography>
                </MenuItem>
              </MenuList>
            </Menu>

            <Tooltip content="Settings">
              <IconButton
                variant="text"
                color="blue-gray"
                onClick={() => setOpenConfigurator(dispatch, true)}
              >
                <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </Tooltip>
            <Menu>
              <Tooltip content="Notifications">
                <MenuHandler>
                  <IconButton
                    variant="text"
                    color="blue-gray"
                    className="bellss"
                  >
                    {badgeComponent}
                  </IconButton>
                </MenuHandler>
              </Tooltip>
              <MenuList className="w-max border-0">
                {Array.isArray(notifTableData) &&
                  notifTableData.slice(0, 5).map((item) => {
                    const {
                      id,
                      timeTicketCreateds,
                      dateTicketCreateds,
                      ticket_id,
                      status,
                      notifStaff,
                      notifAccounting,
                      notifHead,
                      fname,
                      b_code,
                      displayTicket,
                    } = item;

                    if (user_Role === 1 || user_Role === 2) {
                      return (
                        <MenuItem
                          onClick={() =>
                            handleViewTicketClick(
                              ticket_id,
                              status,
                              displayTicket
                            )
                          }
                          className="flex items-center gap-3"
                          key={id}
                        >
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                            <TicketIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <Typography
                              variant="small"
                              color={"green"}
                              className="mb-1 font-normal"
                            >
                              <strong>New Ticket from {b_code}</strong>
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="flex items-center gap-1 text-xs font-normal opacity-60"
                            >
                              <ClockIcon className="h-3.5 w-3.5" />{" "}
                              {dateTicketCreateds} {timeTicketCreateds}
                            </Typography>
                          </div>
                        </MenuItem>
                      );
                    } else if (user_Role === 3) {
                      return (
                        <MenuItem
                          onClick={() =>
                            handleViewTicketClick(
                              ticket_id,
                              status,
                              displayTicket
                            )
                          }
                          className="flex items-center gap-3"
                          key={id}
                        >
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                            <TicketIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <Typography
                              variant="small"
                              color={"gray"}
                              className="mb-1 font-normal"
                            >
                              <strong>New Ticket from {b_code}</strong>
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="flex items-center gap-1 text-xs font-normal opacity-60"
                            >
                              <ClockIcon className="h-3.5 w-3.5" />{" "}
                              {dateTicketCreateds} {timeTicketCreateds}
                            </Typography>
                          </div>
                        </MenuItem>
                      );
                    } else if (user_Role === 7) {
                      return (
                        <MenuItem
                          onClick={() =>
                            handleViewTicketClick(
                              ticket_id,
                              status,
                              displayTicket
                            )
                          }
                          className="flex items-center gap-3"
                          key={id}
                        >
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                            <TicketIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <Typography
                              variant="small"
                              color={"green"}
                              className="mb-1 font-normal"
                            >
                              <strong>New Ticket from {b_code}</strong>
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="flex items-center gap-1 text-xs font-normal opacity-60"
                            >
                              <ClockIcon className="h-3.5 w-3.5" />{" "}
                              {dateTicketCreateds} {timeTicketCreateds}
                            </Typography>
                          </div>
                        </MenuItem>
                      );
                    } else if (user_Role === 5) {
                      let textColor = "blue-gray";
                      let txtMsg = "";

                      if (status === "REJECTED" && notifStaff === 2) {
                        textColor = "red";
                        txtMsg = "Ticket was rejected by Branch Head";
                      } else if (status === "REJECTED" && notifStaff === 3) {
                        textColor = "red";
                        txtMsg = "Ticket was rejected by Accounting";
                      } else if (status === "REJECTED" && notifStaff === 4) {
                        textColor = "red";
                        txtMsg = "Ticket was rejected by Automation";
                      } else if (status === "PENDING" && notifStaff === 1) {
                        textColor = "green";
                        txtMsg = "Ticket was Approved by Branch Head";
                      } else if (status === "EDITED" && notifStaff === 5) {
                        textColor = "blue";
                        txtMsg = "Ticket was Edited";
                      } else if (status === "PENDING" && notifStaff === 6) {
                        textColor = "blue";
                        txtMsg = "Ticket was Approved by Accounting";
                      }

                      return (
                        <MenuItem
                          onClick={() =>
                            handleViewTicketClick(
                              ticket_id,
                              status,
                              displayTicket
                            )
                          }
                          className="flex items-center gap-3"
                          key={id}
                        >
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                            <TicketIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <Typography
                              variant="small"
                              color={textColor}
                              className="mb-1 font-normal"
                            >
                              <strong>{txtMsg}</strong>
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="flex items-center gap-1 text-xs font-normal opacity-60"
                            >
                              <ClockIcon className="h-3.5 w-3.5" />{" "}
                              {dateTicketCreateds} {timeTicketCreateds}
                            </Typography>
                          </div>
                        </MenuItem>
                      );
                    } else if (user_Role === 4) {
                      let textColor = "blue-gray";
                      let txtMsg = "";

                      if (status === "PENDING" && notifHead === 1) {
                        textColor = "green";
                        txtMsg = "New Ticket from " + fname;
                      } else if (status === "REJECTED" && notifHead === 2) {
                        textColor = "red";
                        txtMsg = "Ticket was rejected by Accounting";
                      } else if (status === "REJECTED" && notifHead === 3) {
                        textColor = "red";
                        txtMsg = "Ticket was rejected by Automation";
                      } else if (status === "EDITED" && notifHead === 4) {
                        textColor = "blue";
                        txtMsg = "Ticket was Edited";
                      } else if (status === "PENDING" && notifHead === 5) {
                        textColor = "blue";
                        txtMsg = "Ticket was approved by Accounting";
                      }
                      return (
                        <MenuItem
                          onClick={() =>
                            handleViewTicketClick(
                              ticket_id,
                              status,
                              displayTicket
                            )
                          }
                          className="flex items-center gap-3"
                          key={id}
                        >
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                            <TicketIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <Typography
                              variant="small"
                              color={textColor}
                              className="mb-1 font-normal"
                            >
                              <strong>{txtMsg}</strong>
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="flex items-center gap-1 text-xs font-normal opacity-60"
                            >
                              <ClockIcon className="h-3.5 w-3.5" />{" "}
                              {dateTicketCreateds} {timeTicketCreateds}
                            </Typography>
                          </div>
                        </MenuItem>
                      );
                    } else if (user_Role === 9) {
                      return (
                        <MenuItem
                          onClick={() =>
                            handleViewTicketClick(
                              ticket_id,
                              status,
                              displayTicket
                            )
                          }
                          className="flex items-center gap-3"
                          key={id}
                        >
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                            <TicketIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <Typography
                              variant="small"
                              color={"blue"}
                              className="mb-1 font-normal"
                            >
                              <strong>New Ticket from {b_code}</strong>
                            </Typography>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="flex items-center gap-1 text-xs font-normal opacity-60"
                            >
                              <ClockIcon className="h-3.5 w-3.5" />{" "}
                              {dateTicketCreateds} {timeTicketCreateds}
                            </Typography>
                          </div>
                        </MenuItem>
                      );
                    } else {
                      // Handle unexpected user roles here
                      return null;
                    }
                  })}

                <MenuItem onClick={handleSeeAll}>
                  <hr />
                  <center>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mt-3 text-xs font-normal opacity-70 "
                    >
                      See All
                    </Typography>
                  </center>
                </MenuItem>
              </MenuList>
            </Menu>
            {/* View Ticket */}
            {isViewTicketModalOpen && (
              <ViewTicketModal
                isOpen={isViewTicketModalOpen}
                onClose={closeViewModal}
                ticketIdToView={showTicketToView}
                displayTicket={displayTicket}
                status={status}
              />
            )}
          </div>
        </div>
      </Navbar>

      <div></div>
    </>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
