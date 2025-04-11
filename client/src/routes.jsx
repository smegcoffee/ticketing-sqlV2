import {
  HomeIcon,
  TableCellsIcon,
  BellIcon,
  LifebuoyIcon,
  UserPlusIcon,
  TicketIcon,
  CommandLineIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/solid";
import { Home, Ticket, Reports, Notifications, SetupSupplier, Setupbranch, SetupCategory, SetupUser, SetupAutomation, Help, SetupAccounting, SetupCAS, SetupAreaManager } from "@/pages/dashboard";
// import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        role: [1, 2],
        element: <Home />,
        
      },
      {
        icon: <TicketIcon {...icon} />,
        name: "Ticket",
        path: "/ticket",
        role: [1, 2],
        element: <Ticket />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "reports",
        path: "/reports",
        role: [1],
        element: <Reports />,
      },
      // {
      //   icon: <BellIcon {...icon} />,
      //   name: "notifactions",
      //   path: "/notifactions",
      //   role: [1],
      //   element: <Notifications />,
      // },
      {
        icon: <CommandLineIcon {...icon} />,
        name: "Setup",
        role: [1],
        children:[
          {
            icon: <BuildingStorefrontIcon {...icon} />,
            name: "Branch",
            path: "/setup/branch",
            element: <Setupbranch />,
          },
          {
            icon: <ClipboardDocumentIcon {...icon} />,
            name: "Category",
            path: "/setup/category",
            element: <SetupCategory />,
          },
          {
            icon: <ClipboardDocumentIcon {...icon} />,
            name: "Supplier",
            path: "/setup/supplier",
            element: <SetupSupplier />,
          },
          {
            icon: <UserPlusIcon {...icon} />,
            name: "User",
            path: "/setup/user",
            element: <SetupUser />,
          },
          {
            icon: <UserPlusIcon {...icon} />,
            name: "Automation",
            path: "/setup/automation",
            element: <SetupAutomation />,
          },
          {
            icon: <UserPlusIcon {...icon} />,
            name: "Accounting",
            path: "/setup/accounting",
            element: <SetupAccounting />,
          },
          {
            icon: <UserPlusIcon {...icon} />,
            name: "CAS",
            path: "/setup/cas",
            element: <SetupCAS/>,
          },{
            icon: <UserPlusIcon {...icon} />,
            name: "Area Manager",
            path: "/setup/areamanager",
            element: <SetupAreaManager/>,
          }
        ]
      },
      {
        icon: <LifebuoyIcon {...icon} />,
        name: "Help",
        path: "/help",
        role: [1, 2],
        element: <Help />,
      },
    ],
  },
];

export default routes;
