import { React, useEffect, useState } from "react";
import CategoryIcon from "@mui/icons-material/Category";
import DesignServicesIcon from "@mui/icons-material/DesignServices";
import PrintIcon from "@mui/icons-material/Print";
import BuildIcon from "@mui/icons-material/Build";
import Button from "react-bootstrap/Button";
import Header from "./Header";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import BarChartIcon from "@mui/icons-material/BarChart";
import moment from "moment";
import axios from "axios";
import RunningWithErrorsIcon from "@mui/icons-material/RunningWithErrors";
// import { SpinnerCircular } from "spinners-react";
import Form from "react-bootstrap/Form";

const StatusColor = {
  Pending: { backgroundColor: "#F4E869" },
  Completed: { backgroundColor: "#B0D9B1" },
  Cancelled: { backgroundColor: "#E06469" },
};
export default function Overview() {
  const ApiURL = process.env.REACT_APP_API_URL;
  // const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const [RecceData, setRecceData] = useState([]);
  const [totalRecce, setTotalRecce] = useState(null);
  const [totalDesign, setTotalDesign] = useState(null);
  const [totalPrinting, setTotalPrinting] = useState(null);
  const [totalfabrication, setTotalFabrication] = useState(null);
  const [totalInstalation, setTotalInstalation] = useState(null);
  const [totalAddClients, setTotalAddClients] = useState(null);
  const [totalVendorData, setTotalVendorData] = useState(null);
  const [rowsPerPage1, setRowsPerPage1] = useState(5);
  const [totalRunningJob, setTotalRunningJob] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [selctedStatus, setSelectedStatus] = useState("--Select All--");
  const [OutletDoneData, setOutletDoneData] = useState([]);

  const [Loading, setLoading] = useState(false);
  const [QuotationData, setQuotationData] = useState([]);
  useEffect(() => {
    getAllRecce();
    getAllClientsInfo();
    getAllVendorInfo();
    getAllOutlets();
    getQuotation();
  }, []);
  const getQuotation = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getquotation`);
      if (res.status === 200) {
        let quotation = res.data.data?.filter(
          (rece) => rece.BrandState === "telangana"
        );
        setQuotationData(quotation);
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    let RecceCount = 0;
    RecceData?.filter((ele) =>
      ele.outletName?.filter((outlet) => {
        if (outlet.vendor !== null) {
          return RecceCount++;
        }
      })
    );

    let outletstat =
      Number(RecceCount) +
      Number(totalDesign) +
      Number(totalPrinting) +
      Number(totalfabrication) +
      Number(totalInstalation);

    setTotalRunningJob(outletstat);
  }, [RecceData]);

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

  const getAllRecce = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${ApiURL}/recce/recce/getallrecce`);
      if (res.status === 200) {
        let filtered = res.data.RecceData?.filter(
          (rece) => rece.BrandState === "telangana"
        );
        const recceData = filtered || [];
        setRecceData(recceData);

        const totalRecceLength = recceData.reduce(
          (total, recceItem) => total + recceItem.outletName.length,
          0
        );

        const totalDesignLength = recceData.reduce((total, recceItem) => {
          const outletNames = recceItem.outletName || [];

          const outletNameCount = outletNames.reduce((outletTotal, outlet) => {
            let outletstatusid = OutletDoneData?.filter(
              (fp) => outlet._id === fp?.outletShopId
            );
            let outletstat =
              outletstatusid[0]?.jobStatus === true ? "Completed" : "Pending";
            let cancelledStatus = outlet.RecceStatus === "Cancelled";
            let FinalStatus = cancelledStatus ? "Cancelled" : outletstat;

            return outletTotal + (FinalStatus === "Completed" ? 1 : 0);
          }, 0);

          return total + outletNameCount;
        }, 0);

        const totalPrintingLenght = recceData.reduce((total, recceItem) => {
          const outletNames = recceItem.outletName || [];

          const outletNameCount = outletNames.reduce((outletTotal, outlet) => {
            let outletstatusid = OutletDoneData?.filter(
              (fp) => outlet._id === fp?.outletShopId
            );
            let outletstat =
              outletstatusid[0]?.jobStatus === true ? "Completed" : "Pending";
            let cancelledStatus = outlet?.RecceStatus === "Cancelled";
            let FinalStatus = cancelledStatus ? "Cancelled" : outletstat;

            return outletTotal + (FinalStatus === "Completed" ? 1 : 0);
          }, 0);

          return total + outletNameCount;
        }, 0);

        const totalFabricationLength = recceData.reduce((total, recceItem) => {
          const outletNames = recceItem.outletName || [];

          const outletNameCount = outletNames.reduce(
            (outletTotal, outlet) =>
              outletTotal + (outlet.OutlateFabricationNeed === "Yes" ? 1 : 0),
            0
          );

          return total + outletNameCount;
        }, 0);

        const totalInstallationLength = recceData.reduce((total, recceItem) => {
          const outletNames = recceItem.outletName || [];

          const outletNameCount = outletNames?.reduce(
            (outletTotal, outlet) =>
              outletTotal +
              (outlet.OutlateFabricationDeliveryType === "Go to installation"
                ? 1
                : 0),
            0
          );

          return total + outletNameCount;
        }, 0);

        setTotalRecce(totalRecceLength);
        setTotalDesign(totalDesignLength);
        setTotalPrinting(totalPrintingLenght);
        setTotalFabrication(totalFabricationLength);
        setTotalInstalation(totalInstallationLength);
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const getAllVendorInfo = async () => {
    try {
      const response = await axios.get(
        `${ApiURL}/Vendor/vendorInfo/getvendorinfo`
      );

      if (response.status === 200) {
        let vendor = response.data.vendors;
        let filterCityWise = vendor?.filter(
          (ele) => ele.vendorState === "telangana"
        );
        setTotalVendorData(filterCityWise);
      } else {
        alert("Unable to fetch data");
      }
    } catch (err) {
      alert("can't able to fetch data");
    }
  };
  const getAllClientsInfo = async () => {
    try {
      const res = await axios.get(`${ApiURL}/Client/clients/getallclient`);
      if (res.status === 200) {
        let filterCityWise = res.data.client?.filter(
          (ele) => ele?.state === "telangana"
        );
        setTotalAddClients(filterCityWise);
      }
    } catch (err) {
      alert(err, "err");
    }
  };

  const handleFilterClick = (category) => {
    setActiveCategory(category);
  };

  const filterData = (activeCategory) => {
    const filteredData = [];

    RecceData?.forEach((recceItem) => {
      const outletNameArray = recceItem?.outletName;

      if (Array.isArray(outletNameArray)) {
        outletNameArray?.forEach((outlet) => {
          let outletstatusid = OutletDoneData?.filter(
            (fp) => outlet._id === fp?.outletShopId
          );
          let outletstat =
            outletstatusid[0]?.jobStatus === true ? "Completed" : "Pending";
          let cancelledStatus = outlet.RecceStatus === "Cancelled";
          let FinalStatus = cancelledStatus ? "Cancelled" : outletstat;

          let shouldInclude = false;

          switch (activeCategory) {
            case "totalRecce":
              shouldInclude = true;
              break;
            case "totalDesign":
              shouldInclude = FinalStatus?.includes("Completed");
              break;
            case "totalPrinting":
              shouldInclude = FinalStatus?.includes("Completed");
              break;
            case "totalfabrication":
              shouldInclude = outlet?.OutlateFabricationNeed?.includes("Yes");
              break;
            case "totalInstalation":
              shouldInclude =
                outlet?.OutlateFabricationDeliveryType === "Go to installation";
              break;
            default:
              shouldInclude = true;
              break;
          }

          if (shouldInclude) {
            filteredData.push(outlet);
          }
        });
      }
    });

    return filteredData;
  };

  const filteredData = filterData(activeCategory);
  let rowsDisplayed = 0;

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage1(newRowsPerPage);

    rowsDisplayed = 0;
  };

  const handleClearDateFilters = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };
  const handleFilterEndDateChange = (event) => {
    setFilterEndDate(event.target.value);
  };
  const handleFilterStartDateChange = (event) => {
    setFilterStartDate(event.target.value);
  };

  const [data1, setdata1] = useState(0);
  useEffect(() => {
    setdata1(rowsDisplayed);
  }, [rowsPerPage1]);
  const filterDateswise = (data) => {
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

  const filteredDteData = filterDateswise(filteredData);

  const [filteredData1, setFilteredData1] = useState([]);
  useEffect(() => {
    const filteredDataByStatus = filteredDteData.filter((item) => {
      const outletStatusData = OutletDoneData?.filter(
        (fp) => item._id === fp?.outletShopId
      );

      const outletStatus = outletStatusData[0]?.jobStatus
        ? "Completed"
        : "Pending";
      const cancelledStatus = item.RecceStatus === "Cancelled";
      const finalStatus = cancelledStatus ? "Cancelled" : outletStatus;

      return (
        finalStatus === selctedStatus || selctedStatus === "--Select All--"
      );
    });

    setFilteredData1(filteredDataByStatus);
  }, [filteredDteData, OutletDoneData, selctedStatus]);

  return (
    <>
      <Header />
      {Loading ? (
        <div className="row m-auto text-center" style={{ height: "100vh" }}>
          <div className="col-md-4"></div>
          <div className="col-md-4 m-auto ">
            {/* <SpinnerCircular
              size={90}
              thickness={87}
              speed={80}
              color="rgba(27, 22, 22, 1)"
              secondaryColor="rgba(214, 191, 91, 1)"
            /> */}
            Data Loading
          </div>

          <div className="col-md-4"></div>
        </div>
      ) : (
        <div className="row mt-3 m-auto containerPadding">
          <div className="row m-auto">
            <Card
              className={`col-md-3 m-2 c_zoom ${"active1"}`}
              style={{ height: "140px" }}
            >
              <div className="row m-auto">
                <div className="col-md-6 m-auto">
                  <BusinessIcon
                    className={`iconfnt ${"active1" ? "" : "clrw"}`}
                  />
                </div>
                <div className="col-md-6 m-auto">
                  <h4 className={`row  fnt35 ${"active1" ? "" : "clrw"}`}>
                    {totalAddClients?.length}
                  </h4>
                  <p className={`row  ${"active1" ? "" : "clrw"}`}>
                    {" "}
                    Active Clients
                  </p>
                </div>
              </div>
            </Card>
            <Card
              className={`col-md-3 m-2 c_zoom ${"active1"}`}
              style={{ height: "140px" }}
            >
              <div className="row m-auto">
                <div className="col-md-6 m-auto">
                  <RunningWithErrorsIcon
                    className={`iconfnt ${"active1" ? "" : "clrw"}`}
                  />
                </div>
                <div className="col-md-6 m-auto">
                  <h4 className={`row  fnt35 ${"active1" ? "" : "clrw"}`}>
                    {totalRunningJob}
                  </h4>
                  <p className={`row  ${"active1" ? "" : "clrw"}`}>
                    {" "}
                    Running Jobs
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className={`col-md-3 m-2 c_zoom ${
                activeCategory === "totalRecce" ? "active1" : ""
              }`}
              style={{ height: "140px" }}
              onClick={() => handleFilterClick("totalRecce")}
            >
              <div className={`row m-auto ${"active1"}`}>
                <div className="col-md-6 m-auto">
                  <CategoryIcon
                    className={`iconfnt ${"active1" ? "" : "clrw"}`}
                  />
                </div>

                <div className="col-md-6 m-auto">
                  <h4 className={`row  fnt35 ${"active1" ? "" : "clrw"}`}>
                    {totalRecce}
                  </h4>
                  <p className={`row  ${"active1" ? "" : "clrw"}`}>
                    Recce Jobs
                  </p>
                </div>
              </div>
            </Card>
            <Card
              className={`col-md-3 m-2 c_zoom ${
                activeCategory === "totalDesign" ? "active1" : ""
              }`}
              style={{ height: "140px" }}
              onClick={() => handleFilterClick("totalDesign")}
            >
              <div className={`row m-auto ${"active1"}`}>
                <div className="col-md-6 m-auto">
                  <DesignServicesIcon
                    className={`iconfnt ${"active1" ? "" : "clrw"}`}
                  />
                </div>
                <div className="col-md-6 m-auto">
                  <h4 className={`row  fnt35 ${"active1" ? "" : "clrw"}`}>
                    {totalDesign}
                  </h4>
                  <p className={`row  ${"active1" ? "" : "clrw"}`}>
                    Design Jobs
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className={`col-md-3 m-2 c_zoom ${
                activeCategory === "totalPrinting" ? "active1" : ""
              }`}
              style={{ height: "140px" }}
              onClick={() => handleFilterClick("totalPrinting")}
            >
              <div className={`row m-auto ${"active1"}`}>
                <div className="col-md-6 m-auto">
                  <PrintIcon className={`iconfnt ${"active1" ? "" : "clrw"}`} />
                </div>

                <div className="col-md-6 m-auto">
                  <h4 className={`row  fnt35 ${"active1" ? "" : "clrw"}`}>
                    {totalPrinting}
                  </h4>
                  <p className={`row  ${"active1" ? "" : "clrw"}`}>
                    Printing Jobs
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className={`col-md-3 m-2 c_zoom ${
                activeCategory === "totalfabrication" ? "active1" : ""
              }`}
              style={{ height: "140px" }}
              onClick={() => handleFilterClick("totalfabrication")}
            >
              <div className={`row m-auto ${"active1"}`}>
                <div className="col-md-6 m-auto">
                  <BuildIcon className={`iconfnt ${"active1" ? "" : "clrw"}`} />
                </div>

                <div className="col-md-6 m-auto">
                  <h4 className={`row  fnt35 ${"active1" ? "" : "clrw"}`}>
                    {totalfabrication}
                  </h4>
                  <p className={`row  ${"active1" ? "" : "clrw"}`}>
                    Fabrication Jobs
                  </p>
                </div>
              </div>
            </Card>
            <Card
              className={`col-md-3 m-2 c_zoom ${"active1"}`}
              style={{ height: "140px" }}
            >
              <div className="row m-auto">
                <div className="col-md-6 m-auto">
                  <AssignmentIcon
                    className={`iconfnt ${"active1" ? "" : "clrw"}`}
                  />
                </div>
                <div className="col-md-6 m-auto">
                  <h4 className={`row  fnt35 ${"active1" ? "" : "clrw"}`}>
                    {totalInstalation}
                  </h4>
                  <p className={`row  ${"active1" ? "" : "clrw"}`}>
                    Installation{" "}
                  </p>
                </div>
              </div>
            </Card>
            <Card
              className={`col-md-3 m-2 c_zoom ${"active1"}`}
              style={{ height: "140px" }}
            >
              <div className="row m-auto">
                <div className="col-md-6 m-auto">
                  <BarChartIcon
                    className={`iconfnt ${"active1" ? "" : "clrw"}`}
                  />
                </div>
                <div className="col-md-6 m-auto">
                  <h4 className={`row  fnt35 ${"active1" ? "" : "clrw"}`}>
                    {QuotationData?.length}
                  </h4>
                  <p className={`row  ${"active1" ? "" : "clrw"}`}> Billing</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="row mt-5 m-auto">
            <div className="col-md-9">
              <div className="row ">
                <div className="col-md-3 ">
                  <div className="col-md-8  mb-2">
                    <span>{data1}</span> of <span>{filteredData?.length}</span>
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

                <div className="col-md-9 float-end">
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
            </div>
            <div className="col-md-3 ">
              <label className="mb-2">Select Status</label>
              <Form.Select
                className="row "
                value={selctedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option>--Select All--</option>
                <option value="Completed" className="cureor">
                  Completed
                </option>
                <option value="Pending" className="cureor">
                  Pending
                </option>
                <option value="Cancelled" className="cureor">
                  Cancelled
                </option>
              </Form.Select>
            </div>
          </div>
          <div className="row mt-3 m-auto">
            <table>
              <thead>
                <tr>
                  <th className="th_s p-1 ">SI.No.</th>
                  <th className="th_s p-1 "> Job No.</th>
                  <th className="th_s p-1 "> Client Name</th>
                  <th className="th_s p-1 "> Outlet</th>
                  <th className="th_s p-1 ">Assigned to </th>
                  <th className="th_s p-1 ">Status</th>
                  <th className="th_s p-1 ">Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredData1?.map((item, index) => {
                  const outletStatusData = OutletDoneData?.filter(
                    (fp) => item._id === fp?.outletShopId
                  );

                  const outletStatus = outletStatusData[0]?.jobStatus
                    ? "Completed"
                    : "Pending";
                  const cancelledStatus = item.RecceStatus === "Cancelled";
                  const finalStatus = cancelledStatus
                    ? "Cancelled"
                    : outletStatus;

                  const textColor =
                    StatusColor[finalStatus]?.backgroundColor || "";
                  let JobNob = 0;
                  let brandName = "";
                  let VendersName;

                  totalVendorData?.forEach((ele) => {
                    if (ele?._id === item?.vendor) {
                      VendersName = ele?.VendorFirstName;
                    }
                  });

                  let desiredClient;
                  RecceData?.forEach((recceItem, recceIndex) => {
                    recceItem?.outletName?.forEach((outlet) => {
                      desiredClient = totalAddClients?.client?.find(
                        (client) => client._id === recceItem.BrandId
                      );

                      if (outlet._id === item._id) {
                        brandName = recceItem?.BrandName;
                        JobNob = recceIndex + 1;
                      }
                    });
                  });

                  if (rowsDisplayed < rowsPerPage1) {
                    rowsDisplayed++;
                    return (
                      <tr
                        className="tr_C p-1"
                        style={{ backgroundColor: textColor }}
                        key={item._id}
                      >
                        <td className="td_S p-1">{index + 1}</td>
                        <td className="td_S p-1">Job {JobNob}</td>
                        <td className="td_S p-1">{brandName}</td>{" "}
                        <td className="td_S p-1">{item.ShopName}</td>
                        <td className="td_S p-1">{VendersName}</td>
                        <td className="td_S p-1">{finalStatus}</td>
                        <td className="td_S p-1">
                          {item.createdAt
                            ? new Date(item.createdAt)
                                ?.toISOString()
                                ?.slice(0, 10)
                            : ""}
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
