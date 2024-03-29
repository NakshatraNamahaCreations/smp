import React, { useState, useEffect } from "react";
import Header from "./Header";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/Form";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import "react-data-table-component-extensions/dist/index.css";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import { Card } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Row from "react-bootstrap/Row";
import "react-toastify/dist/ReactToastify.css";
import { CSVLink, CSVDownload } from "react-csv";
import * as XLSX from "xlsx"; // Import the xlsx library
import axios from "axios";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin

export default function Fabrication() {
  const ApiURL = process.env.REACT_APP_API_URL;
  const [recceData, setRecceData] = useState([]);
  const [fabricationStatus, setFabricationStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [deliverType, setDeliverType] = useState(null);
  const [selectddeliverType, setSelectedDeliverType] =
    useState("--Select All--");
  const [selectddeliverType1, setSelectedDeliverType1] = useState();
  const [selectAll, setSelectAll] = useState(false);
  const [rowsPerPage1, setRowsPerPage1] = useState(5);
  const [PrintData, setPrintData] = useState(null);
  const [selectedPrint, setSelectedPrint] = useState(false);
  const [moreoption1, setmoreoption1] = useState(false);
  const [selectedRecceItems1, setSelectedRecceItems1] = useState([]);
  const [RecceIndex, setRecceIndex] = useState(null);
  useEffect(() => {
    getAllRecce();
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

  const handleExportPDF = () => {
    if (!selectedRecceItems1 || selectedRecceItems1.length === 0) {
      alert("Please select at least one record to export");
      return;
    }

    if (!filteredData) {
      alert("No data available for export");
      return;
    }

    const pdf = new jsPDF();
    const tableColumn = [
      "SI.No",
      "BrandName",
      "Shop Name",
      "Contact",
      "State",
      "Address",
      "City",
      "Zone",
      "Date",
      "Status",
    ];

    let serialNumber = 0;

    const tableData = selectedRecceItems1.flatMap((outletidd) =>
      filteredData.flatMap((Ele) =>
        Ele?.outletName
          ?.filter(
            (outle) =>
              outle?._id === outletidd &&
              outle?.Designstatus?.includes("Completed") &&
              outle?.OutlateFabricationNeed?.includes("Yes")
          )
          ?.map((item) => ({
            siNo: ++serialNumber,
            BrandName: Ele.BrandName,
            shopName: item.ShopName,
            contact: item.OutletContactNumber,
            State: Ele.BrandState,
            address: item.OutletAddress,
            city: item.OutletCity,
            zone: item.OutletZone,
            date: item.createdAt
              ? new Date(item.createdAt).toISOString()?.slice(0, 10)
              : "",
            status: item.fabricationstatus,
          }))
      )
    );

    if (tableData.length === 0) {
      alert("No data available for the selected records");
      return;
    }

    pdf.autoTable({
      head: [tableColumn],
      body: tableData.map((item) => Object.values(item)),
      startY: 20,
      styles: {
        fontSize: 6,
      },
      columnStyles: {
        0: { cellWidth: 10 },
      },
      bodyStyles: { borderColor: "black", border: "1px solid black" },
    });

    pdf.save("Fabrication.pdf");
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
  const filteredData = filterDate(recceData);

  const handleFilterStartDateChange = (event) => {
    setFilterStartDate(event.target.value);
  };

  const handleFilterEndDateChange = (event) => {
    setFilterEndDate(event.target.value);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const config = {
        url: `/recce/recce/updatereccedata/${RecceIndex}/${PrintData._id}`,
        method: "put",
        baseURL: ApiURL,
        headers: { "Content-Type": "application/json" },
        data: {
          OutlateFabricationDeliveryType: deliverType,
          fabricationstatus: fabricationStatus,
        },
      };

      const res = await axios(config);

      if (res.status === 200) {
        alert("Successfully updated outlet");
        window.location.reload();
        console.log(res.data);
      } else {
        console.error("Received non-200 status code:", res.status);
      }
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      console.log(
        "Not able to update: " +
          (err.response ? err.response.data.message : err.message)
      );
    }
  };

  let serialNumber = 0;
  let rowsDisplayed = 0;

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage1(newRowsPerPage);
    serialNumber = 0;
    rowsDisplayed = 0;
  };
  const handleEdit = (selectedSNo, recceItem) => {
    setPrintData(selectedSNo);
    setSelectedPrint(true);
    setRecceIndex(recceItem._id);
  };

  const handleOutletSelectAllChange = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      const allOutletIds = filteredData.flatMap((item) =>
        item?.outletName.map((outlet) => outlet._id)
      );
      setSelectedRecceItems1(allOutletIds);
    } else {
      setSelectedRecceItems1([]);
    }

    setmoreoption1(!selectAll);
  };

  const handleOutletToggleSelect = (item, outletId) => {
    let updatedSelectedRecceItems;

    if (selectedRecceItems1.includes(outletId)) {
      updatedSelectedRecceItems = selectedRecceItems1?.filter(
        (id) => id !== outletId
      );
    } else {
      updatedSelectedRecceItems = [...selectedRecceItems1, outletId];
    }

    setSelectedRecceItems1(updatedSelectedRecceItems);
    setmoreoption1(updatedSelectedRecceItems.length > 0);
  };
  const [filteredData1, setfilteredData1] = useState([]);
  useEffect(() => {
    const filteredDataByStatus = filteredData?.map((recceItem) => {
      const filteredOutlets = recceItem?.outletName?.filter(
        (outlet) =>
          outlet?.OutlateFabricationDeliveryType === selectddeliverType
      );

      return { ...recceItem, outletName: filteredOutlets };
    });
    if (
      selectddeliverType === "--Select All--" ||
      selectddeliverType === null
    ) {
      setfilteredData1(filteredData);
    } else {
      setfilteredData1(filteredDataByStatus);
    }
  }, [filteredData, selectddeliverType]);
  const handleUpdateAllStatus = async () => {
    try {
      for (const recceid of filteredData) {
        for (const outlet of recceid?.outletName) {
          if (selectedRecceItems1?.includes(outlet?._id)) {
            const formdata = new FormData();

            if (
              selectddeliverType1 !== undefined &&
              selectddeliverType1 !== null
            ) {
              formdata.append(
                "OutlateFabricationDeliveryType",
                selectddeliverType1
              );
            }
            if (fabricationStatus !== undefined && fabricationStatus !== null) {
              formdata.append("fabricationstatus", fabricationStatus);
            }
            const config = {
              url: `/recce/recce/updatereccedata/${recceid?._id}/${outlet?._id}`,
              method: "put",
              baseURL: ApiURL,
              headers: { "Content-Type": "multipart/form-data" },
              data: formdata,
            };

            const res = await axios(config);

            if (res.status === 200) {
              alert("Successfully updated outlet");

              window.location.reload();
            } else {
              console.error("Received non-200 status code:", res.status);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      console.log(
        "Not able to update: " +
          (err.response ? err.response.data.message : err.message)
      );
    }
  };
  return (
    <>
      <Header />

      {!selectedPrint ? (
        <div className="row  m-auto containerPadding">
          <div className="row ">
            <Col className="col-md-1 mb-3">
              <Form.Control
                as="select"
                className="shadow-none p-2 bg-light rounded"
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
            </Col>
            <Col className="col-md-5">
              <div className="row">
                <div className="col-md-5 ">
                  <Form.Control
                    className="shadow-none p-2 bg-light rounded"
                    type="date"
                    value={filterStartDate}
                    onChange={handleFilterStartDateChange}
                  />
                </div>
                <div className="col-md-5 ">
                  <Form.Control
                    className="shadow-none p-2 bg-light rounded"
                    type="date"
                    value={filterEndDate}
                    onChange={handleFilterEndDateChange}
                  />
                </div>
                <div className="col-md-2 ">
                  <Button
                    className="shadow-none p-2  rounded"
                    onClick={handleClearDateFilters}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </Col>
            <Col className="col-md-2">
              <Button
                className="shadow-none p-2  rounded"
                onClick={handleExportPDF}
              >
                {" "}
                Download
              </Button>
            </Col>
            <Col className="col-md-3">
              <Form.Select
                value={selectddeliverType}
                className="shadow-none p-2 bg-light rounded"
                onChange={(e) => {
                  setSelectedDeliverType(e.target.value);
                }}
              >
                <option value="--Select All--">--Select All--</option>
                <option value="Direct Delivery">Direct Delivery</option>
                <option value="Go to installation">Go to installation</option>
              </Form.Select>{" "}
            </Col>
          </div>
          <div className="row mb-3">
            <Col className="col-md-3">
              <Form.Label>Fabrication Status </Form.Label>
              <Form.Select
                value={selectddeliverType1}
                className="shadow-none p-2 bg-light rounded"
                onChange={(e) => {
                  setSelectedDeliverType1(e.target.value);
                }}
              >
                <option value="--Select All--">--Select All--</option>
                <option value="Direct Delivery">Direct Delivery</option>
                <option value="Go to installation">Go to installation</option>
              </Form.Select>{" "}
            </Col>
            <div className="col-md-3">
              {" "}
              <Form.Label>Select Status </Form.Label>
              <Form.Select
                as="select"
                className="shadow-none bg-light rounded"
                value={fabricationStatus}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue !== "Choose...") {
                    setFabricationStatus(selectedValue);
                  }
                }}
              >
                <option>Choose...</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </div>
            <Button className="col-md-1 mt-4" onClick={handleUpdateAllStatus}>
              Save
            </Button>
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
                  <th className="th_s p-1">Partner Code</th>
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
                {filteredData1?.map((recceItem, index) =>
                  recceItem?.outletName.map((outlet, outletArray) => {
                    if (rowsDisplayed < rowsPerPage1) {
                      const pincodePattern = /\b\d{6}\b/;

                      let JobNob = 0;

                      filteredData1?.forEach((recceItem, recceIndex) => {
                        recceItem?.outletName?.forEach((item) => {
                          if (outlet._id === item._id) {
                            JobNob = recceIndex + 1;
                          }
                        });
                      });
                      const address = outlet?.OutletAddress;
                      const extractedPincode = address?.match(pincodePattern);

                      if (extractedPincode) {
                        outlet.OutletPincode = extractedPincode[0];
                      }

                      if (outlet?.OutlateFabricationNeed?.includes("Yes")) {
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
                            <td className="td_S p-1">{recceItem.BrandName}</td>
                            <td className="td_S p-1">{outlet?.ShopName}</td>
                            <td className="td_S p-1">{outlet?.ClientName}</td>
                            <td className="td_S p-1">{outlet?.PartnerCode}</td>
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
                              {outlet?.fabricationstatus}
                            </td>
                            {/* <td className="td_S p-1">
                              {outlet?.height}
                              {outlet?.unit}
                            </td>
                            <td className="td_S p-1">
                              {outlet?.width}
                              {outlet?.unit}
                            </td> */}
                            <td className="td_S p-2 text-nowrap text-center">
                              {outlet.updatedAt
                                ? new Date(outlet.updatedAt)
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
            <div className="col-md-1">
              <ArrowCircleLeftIcon
                onClick={(e) => setSelectedPrint(false)}
                style={{ color: "#068FFF" }}
              />{" "}
            </div>
          </div>
          <div className="col-md-6">
            <p>
              <span className="cl"> Shop Name:</span>
              <span>{PrintData.ShopName}</span>
            </p>
            <p>
              <span className="cl"> Partner Code:</span>
              <span> {PrintData.PartnerCode}</span>
            </p>
            <p>
              <span className="cl"> Category :</span>
              <span> {PrintData.Category}</span>
            </p>
            <p>
              <span className="cl">Outlet Pincode :</span>
              <span> {PrintData.OutletPincode}</span>
            </p>
            <p>
              <span className="cl"> Inshop :</span>
              <span>
                {PrintData.Inshop === "Y" || "y" ? PrintData.Inshop : "No"}
              </span>
            </p>
            <p>
              <span className="cl"> GSB :</span>
              <span>{PrintData.GSB === "Y" || "y" ? PrintData.GSB : "No"}</span>
            </p>
            <p>
              <span className="cl"> FLBoard :</span>
              <span>
                {PrintData.FLBoard === "Y" ? PrintData.FLBoard : "No"}
              </span>
            </p>
            <p>
              <span className="cl"> Hight:</span>
              <span>
                {PrintData.Height}
                {PrintData.unit}
              </span>
            </p>
            <p>
              <span className="cl"> Width :</span>
              <span>
                {PrintData.width}
                {PrintData.unit}
              </span>
            </p>
            <p>
              <span className="cl"> GST Number :</span>
              <span>{PrintData.GSTNumber}</span>
            </p>
          </div>

          <div className="col-md-6">
            <div className="row">
              <div className="col-md-6">
                {" "}
                <Form.Label>Type Of Delivery </Form.Label>
                <Form.Select
                  value={deliverType}
                  className="shadow-none p-3 mb-5 bg-light rounded"
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue !== "Choose...") {
                      setDeliverType(selectedValue);
                    }
                  }}
                >
                  <option>Choose...</option>
                  <option value="Direct Delivery">Direct Delivery</option>
                  <option value="Go to installation">Go to installation</option>
                </Form.Select>{" "}
              </div>
              <div className="col-md-6">
                {" "}
                <Form.Label>Fabrication Status </Form.Label>
                <Form.Select
                  as="select"
                  className="shadow-none p-3 mb-5 bg-light rounded"
                  value={fabricationStatus}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue !== "Choose...") {
                      setFabricationStatus(selectedValue);
                    }
                  }}
                >
                  <option>Choose...</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </div>
            </div>
          </div>
          <div className="row mt-3">
            <Button
              className="col-md-3 m-auto"
              onClick={(event) => handleUpdate(event, PrintData._id)}
            >
              Update
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
