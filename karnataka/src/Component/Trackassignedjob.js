import React, { useState, useEffect } from "react";
import Header from "./Header";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import "react-data-table-component-extensions/dist/index.css";

import "react-toastify/dist/ReactToastify.css";

import axios from "axios";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";

import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Trackassignedjob() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const [recceData, setRecceData] = useState([]);
  const [searchshopName, setSearchshopName] = useState("");
  const [searcharea, setSearcharea] = useState("");
  const [searchcity, setSearchcity] = useState("");
  const [searchcontactNumber, setSearchcontactNumber] = useState("");
  const [searchpincode, setSearchpincode] = useState("");
  const [searchzone, setSearchzone] = useState("");
  const [searchdate, setSearchDate] = useState("");

  const [searchVendorName, setSearchVendorName] = useState("");
  const [searchSINO, setSearchSINO] = useState("");
  const [selectAction, setselectAction] = useState(false);
  const [displayedData, setDisplayedData] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [SearchCategory, setSearchCategory] = useState("");
  const [CategoryData, setCategoryData] = useState(null);
  const [vendordata, setVendorData] = useState(null);
  const [getreccedata, setgetreccedata] = useState("");
  const [SelecteddesignIndex, setSelectedDesignIndex] = useState(false);
  const [SearchclientName, setSearchclientName] = useState("");
  const [searchdatastatus, setSearchdatastatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [selectAll, setSelectAll] = useState(false);
  const [selectedRecceItems1, setSelectedRecceItems1] = useState([]);

  const [OutletDoneData, setOutletDoneData] = useState([]);
  useEffect(() => {
    getAllRecce();
    getAllOutlets();
  }, []);

  const getAllRecce = async () => {
    try {
      const res = await axios.get(`${ApiURL}/recce/recce/getallrecce`);
      if (res.status === 200) {
        let filtered = res.data.RecceData?.filter(
          (rece) => rece.BrandState === "karnataka"
        );
        setRecceData(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const filteredClients = () => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = Math.min(startIndex + rowsPerPage, recceData.length);
      const dataToDisplay = recceData.slice(startIndex, endIndex);
      setDisplayedData(dataToDisplay);
    };
    filteredClients();
  }, [recceData, rowsPerPage]);

  const getAllOutlets = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getalloutlets`);
      if (res.status === 200) {
        setOutletDoneData(res?.data?.outletData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleClearDateFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const filterDate = (data) => {
    return data?.filter((item) => {
      const createdAtDate = moment(item.createdAt, "YYYY-MM-DD");
      const startDate = filterStartDate
        ? moment(filterStartDate, "YYYY-MM-DD")
        : null;
      const endDate = filterEndDate
        ? moment(filterEndDate, "YYYY-MM-DD")
        : null;

      if (startDate && !createdAtDate.isSameOrAfter(startDate)) {
        return false;
      }

      if (endDate && !createdAtDate.isSameOrBefore(endDate)) {
        return false;
      }

      return true;
    });
  };
  const filteredData = filterDate(displayedData);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let outletDoneid = OutletDoneData?.filter(
    (fp) => fp?.outletShopId === getreccedata?._id
  );

  const createdAt = outletDoneid[0]?.createdAt;
  let day = "";
  let monthName = "";
  let year = "";

  if (createdAt) {
    const date = new Date(createdAt);
    day = date.getDate();
    const monthNumber = date.getMonth();
    monthName = monthNames[monthNumber];
    year = date.getFullYear();
  }

  const handleFilterStartDateChange = (event) => {
    setFilterStartDate(event.target.value);
  };

  const handleFilterEndDateChange = (event) => {
    setFilterEndDate(event.target.value);
  };

  let serialNumber = 0;
  let rowsDisplayed = 0;
  const [rowsPerPage1, setRowsPerPage1] = useState(5);
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage1(newRowsPerPage);
    serialNumber = 0;
    rowsDisplayed = 0;
  };

  const handleOutletSelectAllChange = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      const allOutletIds = filteredData?.flatMap((item) =>
        item?.outletName?.map((outlet) => outlet._id)
      );
      setSelectedRecceItems1(allOutletIds);
    } else {
      setSelectedRecceItems1([]);
    }
  };

  const handleOutletToggleSelect = (item, outletId) => {
    let updatedSelectedRecceItems;

    if (selectedRecceItems1?.includes(outletId)) {
      updatedSelectedRecceItems = selectedRecceItems1?.filter(
        (id) => id !== outletId
      );
    } else {
      updatedSelectedRecceItems = [...selectedRecceItems1, outletId];
    }

    setSelectedRecceItems1(updatedSelectedRecceItems);
    // setmoreoption1(updatedSelectedRecceItems.length > 0);
  };

  const [data1, setdata1] = useState(rowsPerPage1);
  useEffect(() => {
    setdata1(rowsDisplayed);
  }, [rowsPerPage1, data1]);
  let outletName = 0;

  filteredData?.forEach((Ele) => {
    if (Ele?.outletName) {
      outletName += Ele?.outletName?.length;
    }
  });

  const handleEdit = (item) => {
    setgetreccedata(item);
    setSelectedDesignIndex(true);
  };
  const [StoreStatus, setStoreStatus] = useState();

  useEffect(() => {
    let JobStatus1 = OutletDoneData?.filter(
      (fp) => fp.outletShopId === getreccedata._id
    );

    let jobSts = JobStatus1[0]?.jobStatus === true ? "Completed" : "Pending";
    if (getreccedata.RecceStatus === "Cancelled") {
      setStoreStatus(getreccedata.RecceStatus);
    } else {
      setStoreStatus(jobSts);
    }
  }, [getreccedata, OutletDoneData]);

  return (
    <>
      <Header />

      {!SelecteddesignIndex ? (
        <div className="row  m-auto containerPadding">
          <div className="row mb-4">
            <div className="col-md-3 ">
              <div className="col-md-8  mb-2">
                <span>{data1}</span> of <span>{outletName}</span>
              </div>
              <Form.Control
                className="col-md-10"
                as="select"
                value={rowsPerPage1}
                onChange={handleRowsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={80}>80</option>
                <option value={100}>100</option>
                <option value={140}>140</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={600}>600</option>
                <option value={700}>700</option>
                <option value={1000}>1000</option>
                <option value={1500}>1500</option>
                <option value={10000}>10000</option>
              </Form.Control>
            </div>

            <div className="col-md-6 float-end">
              <div className="row">
                <label className="col-md-5   mb-2">Start Date:</label>
                <label className="col-md-6  mb-2">End Date:</label>
                <div className="col-md-5 ">
                  <Form.Control
                    type="date"
                    value={filterStartDate}
                    onChange={handleFilterStartDateChange}
                  />
                </div>
                <div className="col-md-5 ">
                  <Form.Control
                    type="date"
                    value={filterEndDate}
                    onChange={handleFilterEndDateChange}
                  />
                </div>
                <div className="col-md-2 ">
                  <Button onClick={handleClearDateFilters}>Clear</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <table className="t-p">
              <thead className="t-c">
                <tr>
                  <th className="th_s ">
                    <input
                      type="checkbox"
                      style={{
                        width: "15px",
                        height: "15px",
                        marginRight: "5px",
                      }}
                      checked={selectAll}
                      onChange={handleOutletSelectAllChange}
                    />
                  </th>
                  <th className="th_s p-1">SI.No</th>
                  <th className="th_s p-1">Job.No</th>
                  <th className="th_s p-1">Brand </th>
                  <th className="th_s p-1">Shop Name</th>
                  <th className="th_s p-1">Client Name</th>
                  <th className="th_s p-1">State</th>
                  <th className="th_s p-1">Contact Number</th>
                  <th className="th_s p-1">Zone</th>
                  <th className="th_s p-1">Pincode</th>
                  <th className="th_s p-1">City</th>
                  <th className="th_s p-1">FL Board</th>
                  <th className="th_s p-1">GSB</th>
                  <th className="th_s p-1">Inshop</th>
                  <th className="th_s p-1">Status</th>

                  <th className="th_s p-1">Date</th>
                  <th className="th_s p-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((recceItem, index) =>
                  recceItem?.outletName?.map((outlet, outletArray) => {
                    if (rowsDisplayed < rowsPerPage1) {
                      const pincodePattern = /\b\d{6}\b/;

                      let JobNob = 0;

                      filteredData?.forEach((recceItem, recceIndex) => {
                        recceItem?.outletName?.forEach((item) => {
                          if (outlet._id === item._id) {
                            JobNob = recceIndex + 1;
                          }
                        });
                      });
                      const address = outlet?.OutletAddress;
                      const extractedPincode = address?.match(pincodePattern);

                      let JobStatus;

                      if (outlet.vendor !== null) {
                        JobStatus = OutletDoneData?.filter(
                          (fp) => fp.outletShopId === outlet._id
                        );

                        JobStatus =
                          JobStatus[0]?.jobStatus === true
                            ? "Completed"
                            : "Pending";
                      }
                      if (extractedPincode) {
                        outlet.OutletPincode = extractedPincode[0];
                      }

                      serialNumber++;
                      rowsDisplayed++;
                      return (
                        <tr className="tr_C" key={serialNumber}>
                          <td className="td_S p-1">
                            <input
                              style={{
                                width: "15px",
                                height: "15px",
                                marginRight: "5px",
                              }}
                              type="checkbox"
                              checked={selectedRecceItems1.includes(
                                outlet?._id
                              )}
                              onChange={() =>
                                handleOutletToggleSelect(
                                  recceItem.BrandId,
                                  outlet?._id
                                )
                              }
                            />
                          </td>
                          <td className="td_S p-1">{serialNumber}</td>
                          <td className="td_S p-1">Job{JobNob}</td>
                          <td className="td_S p-1">{recceItem?.BrandName}</td>
                          <td className="td_S p-1">{outlet?.ShopName}</td>
                          <td className="td_S p-1">{outlet?.ClientName}</td>
                          <td className="td_S p-1">{outlet?.State}</td>
                          <td className="td_S p-1">
                            {outlet?.OutletContactNumber}
                          </td>

                          <td className="td_S p-1">{outlet?.OutletZone}</td>
                          <td className="td_S p-1">
                            {extractedPincode ? extractedPincode[0] : ""}
                          </td>
                          <td className="td_S p-1">{outlet?.OutletCity}</td>
                          <td className="td_S p-1">{outlet?.FLBoard}</td>
                          <td className="td_S p-1">{outlet?.GSB}</td>
                          <td className="td_S p-1">{outlet?.Inshop}</td>
                          <td className="td_S p-1">
                            <p className="p-0 m-0">
                              {" "}
                              <span style={{ color: "green" }}>Recce</span>{" "}
                              {outlet.RecceStatus === "Cancelled"
                                ? outlet.RecceStatus
                                : JobStatus}
                            </p>
                            <p className="p-0 m-0">
                              <span style={{ color: "green" }}>Design</span>{" "}
                              {outlet.Designstatus}
                            </p>{" "}
                            <p className="p-0 m-0">
                              {" "}
                              <span style={{ color: "green" }}>
                                Printing
                              </span>{" "}
                              {outlet.printingStatus}
                            </p>
                            <p className="p-0 m-0">
                              <span style={{ color: "green" }}>
                                Fabricationn
                              </span>{" "}
                              {outlet.fabricationstatus}
                            </p>{" "}
                            <p className="p-0 m-0">
                              <span style={{ color: "green" }}>
                                Installation
                              </span>{" "}
                              {outlet.installationSTatus}
                            </p>
                          </td>

                          <td className="td_S p-2 text-nowrap text-center">
                            {recceItem.createdAt
                              ? new Date(recceItem.createdAt)
                                  ?.toISOString()
                                  ?.slice(0, 10)
                              : ""}
                          </td>
                          <td className="td_S ">
                            <span
                              variant="info "
                              onClick={() => {
                                handleEdit(outlet, recceItem);
                              }}
                              style={{
                                cursor: "pointer",
                                color: "skyblue",
                              }}
                            >
                              view
                            </span>
                          </td>
                        </tr>
                      );
                    }
                    return null;
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="row  m-auto containerPadding">
          <div className="row">
            {" "}
            <div className="row">
              <div className="col-md-1">
                <ArrowCircleLeftIcon
                  onClick={(e) => setSelectedDesignIndex(null)}
                  style={{ color: "#068FFF" }}
                />{" "}
              </div>
            </div>
          </div>
          <div className="row"></div>
          <div className="col-md-8">
            <p>
              <span className="me-3 clr">Shop Name:</span>
              <span className="me-3 ">{getreccedata.ShopName}</span>
            </p>

            <p>
              <span className="me-3 clr">Phone:</span>
              <span className="me-3 ">{getreccedata.ContactNumber}</span>
            </p>
            <p className="col-md-8">
              <span className="me-3 clr">Address :</span>
              <span>{getreccedata.Area} </span>
              <span>{getreccedata.City} </span>
              <span> {getreccedata.Zone}</span>
              <span> {getreccedata.Pincode}</span>
            </p>
          </div>
          {StoreStatus === "Pending" ? (
            <div className="row">
              <div className="row d-flex">
                <div className="col-md-1 ">
                  <PanoramaFishEyeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </PanoramaFishEyeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Recee</p>
                  <p>
                    <span className="me-2"> Recee job is {StoreStatus} </span>
                    <span className="me-2">
                      {getreccedata.createdAt
                        ? new Date(getreccedata.createdAt)
                            ?.toISOString()
                            ?.slice(0, 10)
                        : ""}
                    </span>
                    <span>{monthName}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {StoreStatus === "Completed" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <CheckCircleIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </CheckCircleIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Recce</p>
                  <p>
                    Recce {StoreStatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Pending" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <PanoramaFishEyeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </PanoramaFishEyeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Design</p>
                  <p>
                    Design is {getreccedata.Designstatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Processing" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <DonutLargeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </DonutLargeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Design</p>
                  <p>
                    Design in {getreccedata.Designstatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <CheckCircleIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </CheckCircleIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Design</p>
                  <p>
                    Design {getreccedata.Designstatus} on
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" &&
          getreccedata.printingStatus === "Pending" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <PanoramaFishEyeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </PanoramaFishEyeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Printing</p>
                  <p>
                    Printing is {getreccedata.printingStatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" &&
          getreccedata.printingStatus === "Processing" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <DonutLargeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </DonutLargeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Printing</p>
                  <p>
                    Printing in {getreccedata.printingStatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" &&
          getreccedata.printingStatus === "Completed" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <CheckCircleIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </CheckCircleIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Printing</p>
                  <p>
                    Printing {getreccedata.printingStatus} on
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" &&
          getreccedata.printingStatus === "Completed" &&
          getreccedata.fabricationstatus === "Pending" ? (
            <div className="row">
              <div className="row d-flex">
                <div className="col-md-1 ">
                  <PanoramaFishEyeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </PanoramaFishEyeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Fabrication</p>
                  <p>
                    <span className="me-2">
                      {" "}
                      Fabrication job is {getreccedata.fabricationstatus}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" &&
          getreccedata.printingStatus === "Completed" &&
          getreccedata.fabricationstatus === "Processing" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <DonutLargeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </DonutLargeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Fabrication</p>
                  <p>
                    Fabrication in {getreccedata.fabricationstatus} fabrication
                    process has started on date
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" &&
          getreccedata.printingStatus === "Completed" &&
          getreccedata.fabricationstatus === "Completed" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <DonutLargeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </DonutLargeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Fabrication</p>
                  <p>
                    Fabrication job {getreccedata.fabricationstatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" &&
          getreccedata.printingStatus === "Completed" &&
          getreccedata.fabricationstatus === "Completed" &&
          getreccedata.installationSTatus === "Pending" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <PanoramaFishEyeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </PanoramaFishEyeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Installation</p>
                  <p>
                    Installation job {getreccedata.installationSTatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" &&
          getreccedata.printingStatus === "Completed" &&
          getreccedata.fabricationstatus === "Completed" &&
          getreccedata.installationSTatus === "Processing" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <DonutLargeIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </DonutLargeIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Installation</p>
                  <p>
                    Installation job {getreccedata.installationSTatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Completed" &&
          getreccedata.Designstatus === "Completed" &&
          getreccedata.printingStatus === "Completed" &&
          getreccedata.fabricationstatus === "Completed" &&
          getreccedata.installationSTatus === "Processing" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-1 ">
                  <CheckCircleIcon
                    className="clr2"
                    style={{
                      fontSize: "35px",
                      position: "relative",
                      bottom: "10%",
                    }}
                  >
                    <img
                      className="clr2"
                      width={"10px"}
                      height={"12px"}
                      alt=""
                      src="../Assests/blue-loading-fotor-20230711105926.png"
                      style={{
                        fontSize: "35px",
                        position: "relative",
                        bottom: "10%",
                      }}
                    />
                  </CheckCircleIcon>
                  <p
                    className="track-line track-line1"
                    style={{ position: "relative", bottom: "11%" }}
                  ></p>
                </div>{" "}
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Installation</p>
                  <p>
                    Installation job {getreccedata.installationSTatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {StoreStatus === "Cancelled" ? (
            <div className="row">
              <div
                className="row d-flex"
                style={{ position: "relative", top: "0%" }}
              >
                <div className="col-md-3">
                  {" "}
                  <p className="clr">Recce</p>
                  <p>
                    Recce {StoreStatus}
                    <span className="me-2"> {day}</span>
                    <span>{monthName}</span> <span>{year}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
