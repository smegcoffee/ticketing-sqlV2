import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import { IconButton, Typography, Avatar, Card, CardBody, CardHeader} from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import subnavroutes from "@/subnavroutes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import MyProfile from "@/pages/dashboard/myprofile";
import { topBranch } from "@/data";

// import { StatisticsCard } from "@/widgets/cards";
export function Dashboard() {
  const userRole = parseInt(sessionStorage.getItem("userRole"), 10);
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const top_b = topBranch;

  return (
    <>
    <div className="min-h-screen bg-blue-gray-50/50">
      
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar
         routes={subnavroutes}
       /> 
       <center>
       <div className="mb-4  max-w-[30%] mt-8">
          {top_b.length >= 5 ? (
            <Card>
              <CardHeader>
                <Typography className="bg-blue-500 text-white font-bold py-2">
                  TOP BRANCHES THIS MONTH
                </Typography>
              </CardHeader>
              <CardBody>
                <div className="news">
                  <ul className="scrollLeft">
                    {top_b.map(({ b_code, total_tickets }, index) => {
                      return (
                        <li key={b_code}>
                          <a href="#">{b_code} - {total_tickets[0]} {total_tickets[1]}</a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>
       </center>
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
        <Routes>
            {routes.map(({ layout, pages }) => {
              if (layout === "dashboard") {
                return pages.map(({ path, element, children }) => {
                  if (children && children.length > 0) {
                    // Render child routes within a nested Routes component
                    return (
                      <Route exact path={path} element={element}>
                          {children.map((childRoute) => (
                            <Route
                              key={childRoute.path}
                              path={childRoute.path}
                              element={childRoute.element}
                            />
                          ))}
                      </Route>
                    );
                  } else {
                    // Render regular routes without children
                    return <Route exact path={path} element={element} />;
                  }
                });
              }
              return null;
            })}
        </Routes>
        <Routes>
        {subnavroutes.map(({ layout, pages }) => {
              if (layout === "dashboard") {
                return pages.map(({ path, element, children }) => {
                  if (children && children.length > 0) {
                    // Render child routes within a nested Routes component
                    return (
                      <Route exact path={path} element={element}>
                          {children.map((childRoute) => (
                            <Route
                              key={childRoute.path}
                              path={childRoute.path}
                              element={childRoute.element}
                            />
                          ))}
                      </Route>
                    );
                  } else {
                    // Render regular routes without children
                    return <Route exact path={path} element={element} />;
                  }
                });
              }
              return null;
            })}
        </Routes>

        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
    </>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
