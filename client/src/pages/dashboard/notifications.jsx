import React from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import { TicketIcon, ClockIcon } from "@heroicons/react/24/solid";

export function Notifications() {
  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            Today
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4">
          <div className="">
            <TicketIcon className="h-8 w-8 inline-block ...  text-green-500"/>
            <Typography className="ml-4 inline-block ... " color="blue-gray">
            <b>New Ticket</b> from DSMT
            </Typography>
            <div className="ml-4 inline-block ... float-right -mt-16" color="blue-gray">
              <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                    >
                    <ClockIcon className="h-3.5 w-3.5" /> 13 minutes ago
               </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            This Month
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4">
        <div className="">
            <TicketIcon className="h-8 w-8 inline-block ... text-blue-500"/>
            <Typography className="ml-4 inline-block ... " color="blue-gray">
            <b>New Ticket</b> from DSMT
            </Typography>
            <div className="ml-4 inline-block ... float-right -mt-16" color="blue-gray">
              <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                    >
                    <ClockIcon className="h-3.5 w-3.5" /> 13 minutes ago
               </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            Earlier
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4">
        <div className="">
            <TicketIcon className="h-8 w-8 inline-block ... "/>
            <Typography className="ml-4 inline-block ... " color="blue-gray">
            <b>New Ticket</b> from DSMT
            </Typography>
            <div className="ml-4 inline-block ... float-right -mt-16" color="blue-gray">
              <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                    >
                    <ClockIcon className="h-3.5 w-3.5" /> 13 minutes ago
               </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;
