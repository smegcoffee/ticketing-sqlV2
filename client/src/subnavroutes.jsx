
import MyProfile from "./pages/dashboard/myprofile";

  export const subnavroutes = [
    {
      layout: "dashboard",
      pages: [
        {
          path: "/myprofile",
          element: <MyProfile />,
          
        },
   
  ],
     },
  ];
  
  export default subnavroutes;
  