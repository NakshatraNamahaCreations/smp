import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Header from "./Header";
import Col from "react-bootstrap/Col";
import { ToastContainer, toast } from "react-toastify";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/esm/Button";
import Card from "react-bootstrap/Card";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import "react-toastify/dist/ReactToastify.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import axios from "axios";
import CheckIcon from "@mui/icons-material/Check";

export default function JobManagement() {
  const [vendorData, setVendorData] = useState([]);
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
  const [selecteZone, setSelectedZone] = useState("");
  const [selectedCity, setselectedCity] = useState([]);

  const [LoadingAssign, setLoadingAssign] = useState(false);
  const [RecceIndex, setRecceIndex] = useState(null);
  const [jobType, setJobType] = useState();

  const [AssignJob, setAssignJob] = useState(false);
  const [selected, setSelected] = useState(null);
  const [assign, setAssign] = useState([]);
  const [ClientInfo, setClientInfo] = useState([]);
  const [RecceData, setRecceData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [Quantity, setQuantity] = useState("");
  const [CatagoryName, setCatagoryName] = useState("");
  const [selectedIndexPrint, setselectedIndexPrint] = useState(false);
  const [getDesignData, setgetDesignData] = useState(null);
  const [selectedIndexDesign, setSelectedIndexDesign] = useState(false);
  const [selectedIndexFabrication, setselectedIndexFabrication] =
    useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [selectedCheckboxes1, setselectedCheckboxes1] = useState([]);
  const [PrintData, setPrintData] = useState(null);
  // const [AllRecceId, setAllRecceId] = useState(null);
  const [selectedBrandNames, setSelectedBrandNames] = useState("");
  const [brandName, setbrandName] = useState(false);

  const [cityNames, setcityNames] = useState(false);
  const [rowsPerPage1, setRowsPerPage1] = useState(5);
  const [selectedRecce, setselectedRecce] = useState(false);
  const [SelectedData, setSelectedData] = useState({});
  const [selectedRecceItems, setSelectedRecceItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedOutletIds, setSelectedOutletIds] = useState([]);
  const [selectedAllOutletIds, setSelectedAllOutletIds] = useState();
  const [selectedOutletcity, setselectedOutletcity] = useState([]);
  const [seletedInstalation, setSeletedInstalation] = useState(false);
  let serialNumber = 0;
  let rowsDisplayed = 0;
  const [selectAllClients, setselectAllClients] = useState(false);

  const [selectAllCity, setselectAllCity] = useState(false);
  const [OutletDoneData, setOutletDoneData] = useState([]);
  useEffect(() => {
    getAllRecce();
    getAllCategory();
    getAllOutlets();
  }, []);
  const getAllCategory = async () => {
    try {
      const res = await fetch(`${ApiURL}/Product/category/getcategory`);
      if (res.ok) {
        const data = await res.json();

        const categoriesArray = Object.values(data.category);
        setCategoryData(categoriesArray);
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const getAllRecce = async () => {
    try {
      const res = await axios.get(`${ApiURL}/recce/recce/getallrecce`);
      if (res.status === 200) {
        let filtered = res.data.RecceData?.filter(
          (rece) => rece.BrandState === "telangana"
        );
        setRecceData(filtered);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllVendorInfo();
    getAllClientsInfo();
  }, []);

  const getAllVendorInfo = async () => {
    try {
      const response = await axios.get(
        `${ApiURL}/Vendor/vendorInfo/getvendorinfo`
      );

      if (response.status === 200) {
        let vendor = response.data.vendors;

        let filterCityWise = vendor?.filter((ele) => ele.vendorState === "telangana");
        setVendorData(filterCityWise);
      } else {
        alert("Unable to fetch data");
      }
    } catch (err) {
      console.log("can't able to fetch data");
    }
  };

  const AssignJobs = async (
    selectedRecceItems,
    vendordata,
    selectedCity,
    selecteZone
  ) => {
    try {
      setLoadingAssign(true);
      const selectedCitiesArray = selectedCity
        ?.split(",")
        ?.map((city) => city?.trim()?.toLowerCase());

      if (!assign) {
        alert("Please select a zone.");
        return;
      }

      if (!Array.isArray(selectedRecceItems)) {
        alert("selectedRecceItems is not iterable");
        return;
      }

      const updatedRecceData = [];

      for (const recceId of selectedRecceItems) {
        const filteredData = RecceData?.map((ele) =>
          ele?.outletName?.filter((item) => {
            if (
              recceId === item?._id &&
              item?.OutletZone === selecteZone &&
              selectedCitiesArray?.includes(item?.OutletCity?.toLowerCase())
            ) {
              item.vendor = vendordata._id;
            }
            return item;
          })
        );

        updatedRecceData.push(...filteredData);

        const config = {
          url: `/recce/recce/outletupdate/${recceId}/${vendordata?._id}`,
          baseURL: ApiURL,
          method: "put",
          headers: { "Content-Type": "application/json" },
          data: { RecceData: updatedRecceData },
        };

        const res = await axios(config);

        if (res.status !== 200) {
          console.log(
            `Failed to assign ${jobType} to: ${vendordata.VendorFirstName}`
          );
        }
      }
      setLoadingAssign(false);
      alert(
        `Successfully ${jobType} assigned to: ${vendordata.VendorFirstName}`
      );

      window.location.reload();
    } catch (err) {
      console.error("Error:", err);

      alert("Failed to assign recce. Error: " + err.message);
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value);
    setRowsPerPage1(newRowsPerPage);
    rowsDisplayed = 0;
  };

  const handleEdit = (item) => {
    setgetDesignData(item);
    setSelectedIndexDesign(true);
  };

  const getAllClientsInfo = async () => {
    try {
      const res = await axios.get(`${ApiURL}/Client/clients/getallclient`);
      if (res.status === 200) {
        let filtered = res.data.client?.filter(
          (clients) => clients.state === "telangana"
        );
        setClientInfo(filtered);
      }
    } catch (err) {
      alert(err, "err");
    }
  };

  const handleUpdate = async () => {
    const formdata = new FormData();
    formdata.append("No_Quantity", Quantity);
    formdata.append("printingStatus", "Processing");
    formdata.append("category", CatagoryName);
    try {
      const config = {
        url: `/recce/recce/updatereccedata/${RecceIndex}/${PrintData._id}`,
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
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      alert(
        "Not able to update: " +
          (err.response ? err.response.data.message : err.message)
      );
    }
  };

  const downloadAsPdf = () => {};

  const handleSelectClientName = () => {
    const selectedBrandNames = selectedCheckboxes?.map((value) => {
      const [brandName] = value?.split("_");
      const desiredClient = ClientInfo?.find(
        (client) => client?._id === brandName
      );

      return desiredClient?.clientsBrand || brandName;
    });

    setSelectedBrandNames(selectedBrandNames.join(", "));
    setbrandName(!brandName);
  };

  const handleCheckboxChange = (event, brandName, index, recceItemId) => {
    const updatedCheckboxes = event.target.checked
      ? [...selectedCheckboxes, `${brandName}_${index}_${recceItemId}`]
      : selectedCheckboxes?.filter(
          (checkbox) =>
            !checkbox?.includes(`${brandName}_${index}_${recceItemId}`)
        );

    setSelectedCheckboxes(updatedCheckboxes);
  };

  const handleSelectOutlet = (index, id) => {
    if (jobType === "Recce" || jobType === "Installation") {
      const selectedIds = selectedCheckboxes?.map((checkbox) => {
        const parts = checkbox?.split("_");
        return parts[2];
      });

      setSelectedData({
        jobType: jobType,
        selectedBrandNames: {
          index: index,
          selectedIds: selectedIds,
        },
        selectedCity: selectedCity,
        selecteZone: selecteZone,
      });

      setSelected(true);
    } else {
      alert("Please Select Job Type");
    }
  };

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);

    if (!selectAll) {
      const allOutletIds = RecceData?.flatMap((item) =>
        item?.outletName?.map((outlet) => outlet?._id)
      );
      setSelectedRecceItems(allOutletIds);
    } else {
      setSelectedRecceItems([]);
    }
  };

  const handleSelectVendor = () => {
    const selectedIds = [];

    for (const itemId of selectedRecceItems) {
      selectedIds.push(itemId);
    }

    setAssign(selectedIds);

    setselectedRecce(true);
  };

  const handleSelectVendorfoInstallation = () => {
    const selectedIds = [];

    for (const itemId of selectedRecceItems) {
      selectedIds.push(itemId);
    }

    setAssign(selectedIds);

    setSeletedInstalation(true);
  };

  const handleToggleSelect = (item, outletId) => {
    let updatedSelectedRecceItems;

    if (selectedRecceItems?.includes(outletId)) {
      updatedSelectedRecceItems = selectedRecceItems?.filter(
        (id) => id !== outletId
      );
    } else {
      updatedSelectedRecceItems = [...selectedRecceItems, outletId];
    }

    setSelectedRecceItems(updatedSelectedRecceItems);

    if (item && item?.outletName) {
      const selectedOutlet = item?.outletName.find(
        (outlet) => outlet?._id === outletId
      );

      if (selectedOutlet) {
        AssignJobs(selectedOutlet, selectedOutlet.OutletZone);
      }
    }
  };

  const handleSelectAllCity = () => {
    setselectAllCity(!selectAllCity);

    if (!selectAllCity) {
      const allCitiesSet = new Set();

      RecceData?.filter((recceItem) =>
        recceItem?._id?.includes(selectedOutletIds)
      ).forEach((ele) =>
        ele?.outletName?.forEach((outlet) => {
          const lowercaseCity = outlet?.OutletCity?.toLowerCase();
          if (lowercaseCity && !allCitiesSet.has(lowercaseCity)) {
            allCitiesSet.add(lowercaseCity);
          }
        })
      );

      const updatedCheckboxes = [
        ...new Set([...selectedCheckboxes1, ...Array.from(allCitiesSet)]),
      ];

      setselectedCity(Array.from(allCitiesSet).join(","));
      setselectedCheckboxes1(updatedCheckboxes);
    } else {
      setselectedCheckboxes1([]);
      setselectedCity("");
    }
  };

  const handleSelectAllClientName = () => {
    setselectAllClients(!selectAllClients);

    if (!selectAllClients) {
      const allClientsSet = new Set();
      const allRecceIdsSet = new Set();
      const updatedCheckboxes = RecceData?.map((recceItem, index) => {
        let lowebrand = recceItem?.BrandName?.toLowerCase();
        let RecceId = recceItem?._id;
        if (lowebrand && !allClientsSet.has(lowebrand)) {
          allClientsSet.add(lowebrand);
          allRecceIdsSet.add(RecceId);
        }

        // return `${lowebrand}_${index}_${recceItem?._id}`;
        return `${lowebrand}_${index}_${RecceId}`;
      });

      setSelectedBrandNames(Array.from(allClientsSet).join(","));
      setSelectedAllOutletIds(Array.from(allRecceIdsSet));
      setSelectedCheckboxes(updatedCheckboxes);
    } else {
      setSelectedCheckboxes([]);
      setSelectedBrandNames("");
    }
  };

  const AssignInstallation = async (
    selectedRecceItems,
    vendor,
    selecteZone,
    selectedCity
  ) => {
    try {
      if (!assign) {
        alert("Please select a zone.");
        return;
      }

      if (!Array.isArray(selectedRecceItems)) {
        alert("selectedRecceItems is not iterable");
        return;
      }

      const updatedRecceData = [];

      for (const recceId of selectedRecceItems) {
        const filteredData = RecceData?.filter((ele) =>
          ele?.outletName?.filter((item) => {
            if (
              recceId === item?._id &&
              item?.OutletZone === selecteZone &&
              item?.OutletCity?.toLowerCase()?.includes(
                selectedCity?.toLowerCase()
              )
            ) {
              item.InstalationGroup = vendor;
            }
            return item;
          })
        );

        updatedRecceData.push(...filteredData);

        const config = {
          url: `/api/recce/recce/updateinstaltion/${recceId}/${vendor}`,
          baseURL: ApiURL,
          method: "put",
          headers: { "Content-Type": "application/json" },
          data: { RecceData: updatedRecceData },
        };

        const res = await axios(config);

        vendorData
          ?.filter((ele) => ele?._id === vendor)
          ?.map((vonf) => {
            if (res.status === 200) {
              alert(
                `${jobType} assigned to:   ${vonf?.VendorFirstName} vendor`
              );
            } else {
              alert(
                `Failed to assign ${jobType} to:  ${vonf?.VendorFirstName} vendor`
              );
            }
          });
      }
      alert("Successfully linked vendors to recce items");

      window.location.reload();
    } catch (err) {
      console.error("Error:", err);

      alert("Failed to assign recce. Error: " + err.message);
    }
  };
  const handleCheckboxChange1 = (event, city) => {
    const isChecked = event.target.checked;
    let updatedCheckboxes;

    if (isChecked) {
      updatedCheckboxes = [...new Set([...selectedCheckboxes1, city])];
    } else {
      updatedCheckboxes = selectedCheckboxes1?.filter(
        (checkbox) => checkbox !== city
      );
    }

    if (Array.isArray(updatedCheckboxes)) {
      setselectedCheckboxes1(updatedCheckboxes);
    }

    const selectedCities = updatedCheckboxes.join(", ");
    setselectedCity(selectedCities);
  };
  const allCitiesSet = new Set();

  const selectedid = SelectedData?.selectedBrandNames?.selectedIds;

  const getAllOutlets = async () => {
    try {
      const res = await axios.get(`${ApiURL}/getalloutlets`);
      if (res.status === 200) {
        setOutletDoneData(res?.data?.outletData);
      }
    } catch (err) {
      // alert(err);
      console.log(err);
    }
  };
  const filteredCities = RecceData?.flatMap((recceItem) =>
    selectedAllOutletIds?.map((Ele) => Ele?.includes(recceItem?._id)) ||
    selectedOutletIds?.includes(recceItem?._id)
      ? recceItem?.outletName?.map((outlet) =>
          outlet?.OutletCity?.toLowerCase()
        )
      : []
  );
  const uniqueFilteredCities = [...new Set(filteredCities)];

  return (
    <>
      <Header />

      <div className="row mt-3 m-auto containerPadding">
        <>
          {!selected ? (
            <>
              {jobType === "Design" ||
              jobType === "Printing" ||
              jobType === "Fabrication" ? (
                <>
                  <Form className="mb-3">
                    <Row>
                      <Col>
                        <Form.Group
                          md="5"
                          className="col-md-2 mb-3"
                          controlId="exampleForm.ControlInput1"
                        >
                          <Form.Label>Types of Job</Form.Label>
                          <Form.Select
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            type="text"
                          >
                            <option>Choose...</option>
                            <option>Recce</option>
                            <option>Design</option>
                            <option>Printing</option>
                            <option>Fabrication</option>
                            <option>Installation</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="row m-auto">
                      <Button
                        onClick={() => setSelected(true)}
                        className="col-md-2 c_W"
                      >
                        Select Outlate
                      </Button>
                    </Row>
                  </Form>
                </>
              ) : (
                <>
                  <Form>
                    <Row>
                      <Col>
                        <Form.Group
                          md="5"
                          className="mb-3"
                          controlId="exampleForm.ControlInput1"
                        >
                          <Form.Label>Types of Job</Form.Label>
                          <Form.Select
                            value={jobType}
                            onChange={(e) => setJobType(e.target.value)}
                            type="text"
                          >
                            <option>Choose...</option>
                            <option>Recce</option>
                            <option>Design</option>
                            <option>Printing</option>
                            <option>Fabrication</option>
                            <option>Installation</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>

                      <Col>
                        <Form.Group
                          md="5"
                          className="mb-3"
                          controlId="exampleForm.ControlInput1"
                        >
                          {" "}
                          <>
                            <Form.Label>Select Clients name</Form.Label>
                            <div>
                              <Form.Control
                                placeholder="select clients name"
                                value={selectedBrandNames}
                                onClick={() => setbrandName(!brandName)}
                                readOnly
                              />
                            </div>
                            {brandName ? (
                              <div
                                style={{
                                  position: "absolute",
                                  width: "14.2rem",
                                }}
                                className="col-md-2 m-auto shadow-sm p-3 mb-5 bg-white rounded"
                              >
                                <div className="row">
                                  <span className="col-md-1 m-auto">
                                    <Form.Check
                                      checked={selectAllClients}
                                      onClick={handleSelectAllClientName}
                                    />
                                  </span>
                                  <Form.Label className="col-md-8 p-0 m-0 m-auto">
                                    Select All
                                  </Form.Label>
                                </div>

                                <div className="row">
                                  {RecceData?.map((ele, index) => {
                                    return (
                                      <div
                                        className="row m-auto"
                                        key={index}
                                        style={{ zIndex: "100" }}
                                      >
                                        <Form.Label>
                                          <Form.Check
                                            type="checkbox"
                                            className="me-3 d-inline"
                                            value={`${ele?.BrandName}_${index}`}
                                            checked={
                                              selectAllClients ||
                                              selectedCheckboxes?.includes(
                                                `${ele?.BrandName}_${index}_${ele?._id}`
                                              )
                                            }
                                            onChange={(event) => {
                                              handleCheckboxChange(
                                                event,
                                                ele?.BrandName,
                                                index,
                                                ele?._id
                                              );
                                              setSelectedOutletIds(ele?._id);
                                            }}
                                          />

                                          <p className="d-inline">
                                            <span className="me-3">
                                              {" "}
                                              Job {index + 1}
                                            </span>
                                            {ele?.BrandName}
                                          </p>
                                        </Form.Label>
                                      </div>
                                    );
                                  })}
                                  <p
                                    className="cureor m-auto "
                                    onClick={handleSelectClientName}
                                    style={{ borderTop: "1px solid grey" }}
                                  >
                                    Apply selection <CheckIcon />
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Group
                          md="5"
                          className="mb-3"
                          controlId="exampleForm.ControlInput1"
                        >
                          {" "}
                          <>
                            <Form.Label>Select City</Form.Label>
                            <div>
                              <Form.Control
                                placeholder="select city "
                                value={selectedCity}
                                onClick={() => setcityNames(true)}
                                readOnly
                              />
                            </div>

                            {cityNames ? (
                              <div
                                style={{
                                  position: "absolute",
                                  width: "14.2rem",
                                }}
                                className="col-md-2 m-auto shadow-sm p-3 mb-5 bg-white rounded"
                              >
                                {uniqueFilteredCities.length === 0 ? null : (
                                  <div className="row">
                                    <span className="col-md-1 m-auto">
                                      <Form.Check
                                        checked={selectAllCity}
                                        onClick={handleSelectAllCity}
                                      />
                                    </span>
                                    <Form.Label className="col-md-8 p-0 m-0 m-auto">
                                      Select All
                                    </Form.Label>
                                  </div>
                                )}
                                <div>
                                  {uniqueFilteredCities.length === 0 ? (
                                    <span className="mt-3">
                                      Please Select Clients
                                    </span>
                                  ) : (
                                    uniqueFilteredCities?.map((outletcity) => {
                                      return (
                                        <div
                                          className="row m-auto"
                                          style={{ zIndex: "100" }}
                                        >
                                          <Form.Label>
                                            <Form.Check
                                              type="checkbox"
                                              className="me-3 d-inline"
                                              value={outletcity}
                                              checked={selectedCheckboxes1?.includes(
                                                outletcity
                                              )}
                                              onChange={(event) => {
                                                handleCheckboxChange1(
                                                  event,
                                                  outletcity
                                                );
                                                setselectedOutletcity(
                                                  event,
                                                  outletcity
                                                );
                                              }}
                                            />
                                            <p className="d-inline">
                                              {outletcity}
                                            </p>
                                          </Form.Label>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                                <p
                                  className="cureor m-auto "
                                  onClick={() => setcityNames(false)}
                                  style={{ borderTop: "1px solid grey" }}
                                >
                                  Apply selection <CheckIcon />
                                </p>
                              </div>
                            ) : null}
                          </>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group
                          md="5"
                          className="mb-3"
                          controlId="exampleForm.ControlInput1"
                        >
                          <Form.Label>Select Outlate Zone</Form.Label>

                          <Form.Select
                            value={selecteZone}
                            onChange={(e) => {
                              const newSelectedZone = e.target.value;
                              setSelectedZone(newSelectedZone);
                            }}
                          >
                            <option value="Select All">Select All</option>
                            <option value="West">West</option>
                            <option value="South">South</option>
                            <option value="North">North</option>
                            <option value="East">East</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="row m-auto">
                      <Button
                        onClick={() => handleSelectOutlet(selectedOutletIds)}
                        className="col-md-2 c_W"
                      >
                        Select Outlet
                      </Button>
                    </Row>
                  </Form>
                </>
              )}
            </>
          ) : jobType === "Recce" ? (
            <>
              <ToastContainer type="success" />
              {!selectedRecce ? (
                <>
                  <div className="row">
                    <div className="col-md-3">
                      <ArrowCircleLeftIcon
                        onClick={() => setSelected(false)}
                        style={{ color: "#068FFF", fontSize: "35px" }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <Col className="col-md-1 mb-3 m-auto">
                      <Form.Control
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
                    </Col>
                    <div className="col-md-11 mb-3  m-auto">
                      <Button
                        onClick={handleSelectVendor}
                        className="row  m-auto c_W"
                      >
                        {LoadingAssign ? "Assigning" : "Select Vendor "}
                      </Button>
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
                              onChange={handleSelectAllChange}
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

                          <th className="th_s p-1">Date</th>
                          <th className="th_s p-1">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RecceData?.filter((recceItem) =>
                          selectedid?.includes(recceItem._id)
                        )?.map((outerRecceItem) =>
                          outerRecceItem.outletName
                            ?.filter(
                              (out) =>
                                out.vendor === null || out.vendor === undefined
                            )
                            ?.map((outlet) => {
                              let JobNob = 0;
                              RecceData?.forEach((recceItem, recceIndex) => {
                                recceItem?.outletName?.forEach((item) => {
                                  if (outlet?._id === item?._id) {
                                    JobNob = recceIndex + 1;
                                  }
                                });
                              });

                              if (rowsDisplayed < rowsPerPage1) {
                                const pincodePattern = /\b\d{6}\b/;
                                const address = outlet?.OutletAddress;
                                const extractedPincode =
                                  address?.match(pincodePattern);

                                if (extractedPincode) {
                                  outlet.OutletPincode = extractedPincode[0];
                                }

                                const selectedCitiesArray =
                                  SelectedData.selectedCity
                                    ?.split(",")
                                    ?.map((city) =>
                                      city?.trim()?.toLowerCase()
                                    );
                                const isCityMatched = selectedCitiesArray.some(
                                  (ele) => {
                                    const outletCity =
                                      outlet?.OutletCity?.trim();
                                    return (
                                      outletCity &&
                                      ele === outletCity?.toLowerCase()
                                    );
                                  }
                                );

                                const isZoneMatched =
                                  outlet?.OutletZone?.trim()?.toLowerCase() ===
                                    SelectedData?.selecteZone
                                      ?.trim()
                                      ?.toLowerCase() ||
                                  SelectedData?.selecteZone
                                    ?.trim()
                                    ?.toLowerCase() === "select all";

                                if (isCityMatched && isZoneMatched) {
                                  rowsDisplayed++;
                                  serialNumber++;

                                  return (
                                    <tr className="tr_C" key={outlet?._id}>
                                      <td className="td_S p-1">
                                        <input
                                          style={{
                                            width: "15px",
                                            height: "15px",
                                            marginRight: "5px",
                                          }}
                                          type="checkbox"
                                          checked={selectedRecceItems?.includes(
                                            outlet._id
                                          )}
                                          onChange={() =>
                                            handleToggleSelect(
                                              outerRecceItem?.BrandId,
                                              outlet._id
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="td_S p-1">
                                        {serialNumber}
                                      </td>
                                      <td className="td_S p-1">Job{JobNob}</td>
                                      <td className="td_S p-1">
                                        {outerRecceItem.BrandName}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.ShopName}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.ClientName}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.State}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.OutletContactNumber}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.OutletZone}
                                      </td>
                                      <td className="td_S p-1">
                                        {extractedPincode
                                          ? extractedPincode[0]
                                          : ""}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.OutletCity}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.FLBoard}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.GSB}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.Inshop}
                                      </td>
                                      <td className="td_S ">
                                        {outlet?.createdAt
                                          ? new Date(outlet?.createdAt)
                                              ?.toISOString()
                                              ?.slice(0, 10)
                                          : ""}
                                      </td>
                                      <td className="td_S ">
                                        <span
                                          variant="info "
                                          onClick={() => {
                                            handleEdit(outlet);
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
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-md-1">
                    <ArrowCircleLeftIcon
                      onClick={() => setSelected(false)}
                      style={{ color: "#068FFF", fontSize: "35px" }}
                    />
                  </div>
                  <div className="row mt-3 m-auto containerPadding">
                    {vendorData ? (
                      vendorData?.map((ele, index) => (
                        <Card
                          key={ele?.VendorId}
                          className="col-md-4 m-3 "
                          style={{
                            width: "240px",
                            height: "320px",
                            borderRadius: "10%",
                          }}
                        >
                          <div className="row text-center m-auto">
                            {ele?.VendorImage ? (
                              <img
                                style={{
                                  width: "70%",
                                  height: "50%",
                                  borderRadius: "100%",
                                }}
                                className="m-auto"
                                src={`${ImageURL}/VendorImage/${ele?.VendorImage}`}
                                alt=""
                              />
                            ) : (
                              <span>No Image Available</span>
                            )}
                            <span>
                              {ele?.VendorFirstName?.charAt(0)?.toUpperCase() +
                                ele?.VendorFirstName?.substr(1)}
                              {ele?.VendorLastName}
                            </span>
                            <span>{ele?.VendorId}</span>
                            <span style={{ color: "orange" }}>
                              Job Assigned
                              <span style={{ margin: "5px" }}>0</span>
                            </span>
                            <span style={{ color: "green" }}>
                              Job Completed
                              <span style={{ margin: "5px" }}>0</span>
                            </span>
                            <Button
                              className="c_W mt-2"
                              onClick={() => {
                                AssignJobs(
                                  selectedRecceItems,
                                  ele,
                                  selectedCity,
                                  selecteZone
                                );
                              }}
                            >
                              Assign job
                            </Button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div>Loading or no data available</div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : jobType === "Design" ? (
            <>
              <ToastContainer type="success" />
              {!selectedIndexDesign ? (
                <>
                  <div className="row">
                    <div className="col-md-3">
                      <ArrowCircleLeftIcon
                        onClick={() => setSelected(false)}
                        style={{ color: "#068FFF", fontSize: "35px" }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <Col className="col-md-1 mb-3">
                      <Form.Control
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
                    </Col>
                  </div>
                  <div className="row">
                    {/* <table className="t-p">
                      <thead className="t-c">
                        <tr>
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
                          <th className="th_s p-1">Category</th>
                          <th className="th_s p-1">Hight</th>
                          <th className="th_s p-1">Width</th>
                          <th className="th_s p-1">Date</th>
                          <th className="th_s p-1">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RecceData?.map((recceItem, index) =>
                          recceItem?.outletName?.map((outlet, outletArray) => {
                            // const desiredClient = ClientInfo?.client?.find(
                            //   (client) => client._id === recceItem?.BrandName
                            // );

                            let JobNob = 0;
                            RecceData?.forEach((recceItem, recceIndex) => {
                              recceItem?.outletName?.forEach((item) => {
                                if (outlet?._id === item?._id) {
                                  JobNob = recceIndex + 1;
                                }
                              });
                            });
                            if (rowsDisplayed < rowsPerPage1) {
                              const pincodePattern = /\b\d{6}\b/;

                              const address = outlet?.OutletAddress;
                              const extractedPincode =
                                address?.match(pincodePattern);

                              if (extractedPincode) {
                                outlet.OutletPincode = extractedPincode[0];
                              }
                              if (outlet?.RecceStatus?.includes("Completed")) {
                                rowsDisplayed++;
                                serialNumber++;
                                return (
                                  <tr className="tr_C" key={outlet?._id}>
                                    <td className="td_S p-1">{serialNumber}</td>
                                    <td className="td_S p-1">Job{JobNob}</td>
                                    <td className="td_S p-1">
                                      {recceItem?.BrandName}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.ShopName}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.ClientName}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.State}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.OutletContactNumber}
                                    </td>

                                    <td className="td_S p-1">
                                      {outlet?.OutletZone}
                                    </td>
                                    <td className="td_S p-1">
                                      {extractedPincode
                                        ? extractedPincode[0]
                                        : ""}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.OutletCity}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.FLBoard}
                                    </td>
                                    <td className="td_S p-1">{outlet?.GSB}</td>
                                    <td className="td_S p-1">
                                      {outlet?.Inshop}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.Category}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.height}
                                      {outlet?.unit}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.width}
                                      {outlet?.unit}
                                    </td>
                                    <td className="td_S ">
                                      {recceItem?.createdAt
                                        ? new Date(recceItem?.createdAt)
                                            ?.toISOString()
                                            ?.slice(0, 10)
                                        : ""}
                                    </td>
                                    <td className="td_S ">
                                      <span
                                        variant="info "
                                        onClick={() => {
                                          handleEdit(outlet);
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
                    </table> */}
                    <table className="t-p">
                      <thead className="t-c">
                        <tr>
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
                        {RecceData?.map((recceItem, index) => {
                          const outletDoneItems = [];

                          return recceItem?.outletName
                            ?.filter((outlet) => {
                              let outletDoneItem = OutletDoneData?.find(
                                (ele) => ele.outletShopId === outlet._id
                              );

                              outletDoneItems.push(outletDoneItem);

                              return outletDoneItem?.jobStatus === true;
                            })
                            .map((outlet, innerIndex) => {
                              let JobNob = 0;

                              const matchingRecceItem = RecceData?.find(
                                (recce, recceIndex) =>
                                  recce?.outletName?.some(
                                    (item) => item?._id === outlet?._id
                                  )
                              );

                              if (matchingRecceItem) {
                                JobNob =
                                  RecceData.indexOf(matchingRecceItem) + 1;
                              }
                              const pincodePattern = /\b\d{6}\b/;
                              const address = outlet?.OutletAddress;
                              const extractedPincode =
                                address?.match(pincodePattern);

                              if (extractedPincode) {
                                outlet.OutletPincode = extractedPincode[0];
                              }
                              serialNumber++;

                              return (
                                <tr className="tr_C" key={serialNumber}>
                                  <td className="td_S p-1">{serialNumber}</td>
                                  <td className="td_S p-1">Job{JobNob}</td>
                                  <td className="td_S p-1">
                                    {recceItem.BrandName}
                                  </td>
                                  <td className="td_S p-1">
                                    {outlet?.ShopName}
                                  </td>
                                  <td className="td_S p-1">
                                    {outlet?.ClientName}
                                  </td>
                                  <td className="td_S p-1">
                                    {outlet?.PartnerCode}
                                  </td>
                                  <td className="td_S p-1">{outlet?.State}</td>
                                  <td className="td_S p-1">
                                    {outlet?.OutletContactNumber}
                                  </td>
                                  <td className="td_S p-1">
                                    {outlet?.OutletZone}
                                  </td>
                                  <td className="td_S p-1">
                                    {extractedPincode
                                      ? extractedPincode[0]
                                      : ""}
                                  </td>
                                  <td className="td_S p-1">
                                    {outlet?.OutletCity}
                                  </td>
                                  <td className="td_S p-1">
                                    {outlet?.FLBoard}
                                  </td>
                                  <td className="td_S p-1">{outlet?.GSB}</td>
                                  <td className="td_S p-1">{outlet?.Inshop}</td>
                                  <td className="td_S p-1">
                                    {outlet?.Designstatus}
                                  </td>
                                  <td className="td_S p-2 text-nowrap text-center">
                                    {outletDoneItems[innerIndex]?.createdAt
                                      ? new Date(
                                          outletDoneItems[innerIndex].createdAt
                                        )
                                          ?.toISOString()
                                          ?.slice(0, 10)
                                      : "Date not available"}
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
                            });
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-md-1">
                    <ArrowCircleLeftIcon
                      onClick={() => setSelectedIndexDesign(false)}
                      style={{ color: "#068FFF", fontSize: "35px" }}
                    />
                  </div>

                  <div className="row  m-auto ">
                    <div className="col-md-8">
                      <div>
                        <p>
                          <span className="cl"> Shop Name:</span>
                          <span>{getDesignData.ShopName}</span>
                        </p>
                        <p>
                          <span className="cl"> Partner Code:</span>
                          <span> {getDesignData.PartnerCode}</span>
                        </p>
                        <p>
                          <span className="cl"> Category :</span>
                          <span> {getDesignData.Category}</span>
                        </p>
                        <p>
                          <span className="cl">Outlet Pincode :</span>
                          <span> {getDesignData.OutletPincode}</span>
                        </p>
                        <p>
                          <span className="cl"> Inshop :</span>
                          <span>
                            {getDesignData.Inshop === "Y" || "y"
                              ? getDesignData.Inshop
                              : "No"}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> GSB :</span>
                          <span>
                            {getDesignData.GSB === "Y" || "y"
                              ? getDesignData.GSB
                              : "No"}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> FLBoard :</span>
                          <span>
                            {getDesignData.FLBoard === "Y"
                              ? getDesignData.FLBoard
                              : "No"}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> Hight:</span>
                          <span>
                            {getDesignData.height}
                            {getDesignData.unit}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> Width :</span>
                          <span>
                            {getDesignData.width}
                            {getDesignData.unit}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> GST Number :</span>
                          <span>{getDesignData.GSTNumber}</span>
                        </p>
                      </div>

                      <p>
                        <span className="cl"> Download :</span>
                        <span>
                          <img
                            onClick={downloadAsPdf}
                            width={"50px"}
                            height={"50px"}
                            src="../Assests/downloadicon.gif"
                            alt=""
                          />
                        </span>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null || jobType === "Installation" ? (
            <>
              <ToastContainer type="success" />
              {!seletedInstalation ? (
                <>
                  <div className="row">
                    <div className="col-md-3">
                      <ArrowCircleLeftIcon
                        onClick={() => setSelected(false)}
                        style={{ color: "#068FFF", fontSize: "35px" }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <Col className="col-md-1 mb-3 m-auto">
                      <Form.Control
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
                    </Col>
                    <div className="col-md-11 mb-3  m-auto">
                      <Button
                        onClick={handleSelectVendorfoInstallation}
                        className="row  m-auto c_W"
                      >
                        Select Vendor
                      </Button>
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
                              onChange={handleSelectAllChange}
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

                          <th className="th_s p-1">Date</th>
                          <th className="th_s p-1">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RecceData?.filter((recceItem) =>
                          selectedid?.includes(recceItem._id)
                        )?.map((outerRecceItem) =>
                          outerRecceItem.outletName
                            .filter((outl) => {
                              const deliveryType =
                                outl?.OutlateFabricationDeliveryType;
                              const isGoToInstallation =
                                deliveryType &&
                                deliveryType.trim() === "Go to installation";
                              const isVendorNull =
                                outl?.InstalationGroup === null ||
                                outl?.InstalationGroup === undefined;
                              return isGoToInstallation && isVendorNull;
                            })
                            ?.map((outlet) => {
                              let JobNob = 0;
                              RecceData?.forEach((recceItem, recceIndex) => {
                                recceItem?.outletName?.forEach((item) => {
                                  if (outlet?._id === item?._id) {
                                    JobNob = recceIndex + 1;
                                  }
                                });
                              });

                              if (rowsDisplayed < rowsPerPage1) {
                                const pincodePattern = /\b\d{6}\b/;
                                const address = outlet?.OutletAddress;
                                const extractedPincode =
                                  address?.match(pincodePattern);

                                if (extractedPincode) {
                                  outlet.OutletPincode = extractedPincode[0];
                                }

                                const selectedCitiesArray =
                                  SelectedData.selectedCity
                                    ?.split(",")
                                    ?.map((city) =>
                                      city?.trim()?.toLowerCase()
                                    );
                                const isCityMatched = selectedCitiesArray.some(
                                  (ele) => {
                                    const outletCity =
                                      outlet?.OutletCity?.trim();
                                    return (
                                      outletCity &&
                                      ele === outletCity?.toLowerCase()
                                    );
                                  }
                                );

                                const isZoneMatched =
                                  outlet?.OutletZone?.trim()?.toLowerCase() ===
                                    SelectedData?.selecteZone
                                      ?.trim()
                                      ?.toLowerCase() ||
                                  SelectedData?.selecteZone
                                    ?.trim()
                                    ?.toLowerCase() === "select all";

                                if (isCityMatched && isZoneMatched) {
                                  rowsDisplayed++;
                                  serialNumber++;

                                  return (
                                    <tr className="tr_C" key={outlet?._id}>
                                      <td className="td_S p-1">
                                        <input
                                          style={{
                                            width: "15px",
                                            height: "15px",
                                            marginRight: "5px",
                                          }}
                                          type="checkbox"
                                          checked={selectedRecceItems?.includes(
                                            outlet._id
                                          )}
                                          onChange={() =>
                                            handleToggleSelect(
                                              outerRecceItem?.BrandId,
                                              outlet._id
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="td_S p-1">
                                        {serialNumber}
                                      </td>
                                      <td className="td_S p-1">Job{JobNob}</td>
                                      <td className="td_S p-1">
                                        {outerRecceItem.BrandName}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.ShopName}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.ClientName}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.State}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.OutletContactNumber}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.OutletZone}
                                      </td>
                                      <td className="td_S p-1">
                                        {extractedPincode
                                          ? extractedPincode[0]
                                          : ""}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.OutletCity}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.FLBoard}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.GSB}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.Inshop}
                                      </td>
                                      <td className="td_S ">
                                        {outlet?.createdAt
                                          ? new Date(outlet?.createdAt)
                                              ?.toISOString()
                                              ?.slice(0, 10)
                                          : ""}
                                      </td>
                                      <td className="td_S ">
                                        <span
                                          variant="info "
                                          onClick={() => {
                                            handleEdit(outlet);
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
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-md-1">
                    <ArrowCircleLeftIcon
                      onClick={() => setSelected(false)}
                      style={{ color: "#068FFF", fontSize: "35px" }}
                    />
                  </div>
                  <ToastContainer type="success" />

                  <div className="row mt-3 m-auto containerPadding">
                    {vendorData ? (
                      vendorData?.map((ele, index) => {
                        return (
                          <Card
                            key={ele?.VendorId}
                            className="col-md-4 m-3 "
                            style={{
                              width: "240px",
                              height: "320px",
                              borderRadius: "10%",
                            }}
                          >
                            <div className="row text-center m-auto">
                              {ele?.VendorImage ? (
                                <img
                                  style={{
                                    width: "70%",
                                    height: "50%",
                                    borderRadius: "100%",
                                  }}
                                  className="m-auto"
                                  src={`${ImageURL}/VendorImage/${ele?.VendorImage}`}
                                  alt=""
                                />
                              ) : (
                                <span>No Image Available</span>
                              )}
                              <span>
                                {ele?.VendorFirstName?.charAt(
                                  0
                                )?.toUpperCase() +
                                  ele?.VendorFirstName?.substr(1)}
                                {ele?.VendorLastName}
                              </span>
                              <span>{ele?.VendorId}</span>
                              <span style={{ color: "orange" }}>
                                Job Assigned
                                <span style={{ margin: "5px" }}>0</span>
                              </span>
                              <span style={{ color: "green" }}>
                                Job Completed
                                <span style={{ margin: "5px" }}>0</span>
                              </span>
                              <Button
                                className="c_W mt-2"
                                onClick={() => {
                                  AssignInstallation(
                                    selectedRecceItems,
                                    ele?._id,
                                    selectedCity,
                                    selecteZone
                                  );
                                }}
                              >
                                Assign Installation
                              </Button>
                            </div>
                          </Card>
                        );
                      })
                    ) : (
                      <div>Loading or no data available</div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : null || jobType === "Printing" ? (
            <>
              <div className="col-md-12">
                {!selectedIndexPrint ? (
                  <>
                    <h2 className="text-center">Printing</h2>
                    <>
                      <div className="row">
                        <div className="col-md-3">
                          <ArrowCircleLeftIcon
                            onClick={() => setSelected(false)}
                            style={{ color: "#068FFF", fontSize: "35px" }}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <Col className="col-md-1 mb-3">
                          <Form.Control
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
                        </Col>
                      </div>
                      <div className="row">
                        <table className="t-p">
                          <thead className="t-c">
                            <tr>
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
                            {RecceData?.map((recceItem, index) => {
                              const outletDoneItems = [];

                              return recceItem?.outletName
                                ?.filter((outlet) => {
                                  let outletDoneItem = OutletDoneData?.find(
                                    (ele) => ele.outletShopId === outlet._id
                                  );

                                  outletDoneItems.push(outletDoneItem);

                                  return outletDoneItem?.jobStatus === true;
                                })
                                ?.map((outlet, innerIndex) => {
                                  let JobNob = 0;

                                  const matchingRecceItem = RecceData?.find(
                                    (recce, recceIndex) =>
                                      recce?.outletName?.some(
                                        (item) => item?._id === outlet?._id
                                      )
                                  );

                                  if (matchingRecceItem) {
                                    JobNob =
                                      RecceData.indexOf(matchingRecceItem) + 1;
                                  }
                                  const pincodePattern = /\b\d{6}\b/;
                                  const address = outlet?.OutletAddress;
                                  const extractedPincode =
                                    address?.match(pincodePattern);

                                  if (extractedPincode) {
                                    outlet.OutletPincode = extractedPincode[0];
                                  }
                                  serialNumber++;

                                  return (
                                    <tr className="tr_C" key={serialNumber}>
                                      <td className="td_S p-1">
                                        {serialNumber}
                                      </td>
                                      <td className="td_S p-1">Job{JobNob}</td>
                                      <td className="td_S p-1">
                                        {recceItem.BrandName}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.ShopName}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.ClientName}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.PartnerCode}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.State}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.OutletContactNumber}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.OutletZone}
                                      </td>
                                      <td className="td_S p-1">
                                        {extractedPincode
                                          ? extractedPincode[0]
                                          : ""}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.OutletCity}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.FLBoard}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.GSB}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.Inshop}
                                      </td>
                                      <td className="td_S p-1">
                                        {outlet?.Designstatus}
                                      </td>
                                      <td className="td_S p-2 text-nowrap text-center">
                                        {outletDoneItems[innerIndex]?.createdAt
                                          ? new Date(
                                              outletDoneItems[
                                                innerIndex
                                              ].createdAt
                                            )
                                              ?.toISOString()
                                              ?.slice(0, 10)
                                          : "Date not available"}
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
                                });
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  </>
                ) : (
                  <>
                    <div
                      className="col-md-1"
                      onClick={(e) => setSelected(e, null)}
                    >
                      <ArrowCircleLeftIcon
                        onClick={() => setselectedIndexPrint(false)}
                        style={{ color: "#068FFF", fontSize: "35px" }}
                      />
                    </div>
                    <Row className="row m-auto">
                      <Col className="col-md-3">
                        <Form.Label>Choose Category</Form.Label>{" "}
                        <Form.Select
                          onChange={(e) => setCatagoryName(e.target.value)}
                        >
                          <option value="">Select</option>
                          {categoryData?.map((category) => (
                            <option
                              key={category._id}
                              value={category.categoryName}
                            >
                              {category.categoryName}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>

                      <Col className="col-md-3">
                        <Form.Group
                          className="mb-3"
                          controlId="exampleForm.ControlInput1"
                        >
                          <Form.Label>Quantity</Form.Label>
                          <Form.Control
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Enter  Quantity"
                            type="text"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="row  m-auto ">
                      <div className="col-md-8">
                        <div>
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
                              {PrintData.Inshop === "Y" || "y"
                                ? PrintData.Inshop
                                : "No"}
                            </span>
                          </p>
                          <p>
                            <span className="cl"> GSB :</span>
                            <span>
                              {PrintData.GSB === "Y" || "y"
                                ? PrintData.GSB
                                : "No"}
                            </span>
                          </p>
                          <p>
                            <span className="cl"> FLBoard :</span>
                            <span>
                              {PrintData.FLBoard === "Y"
                                ? PrintData.FLBoard
                                : "No"}
                            </span>
                          </p>
                          <p>
                            <span className="cl"> Hight:</span>
                            <span>
                              {PrintData.height}
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

                        <p>
                          <span className="cl"> Download :</span>
                          <span>
                            <img
                              onClick={downloadAsPdf}
                              width={"50px"}
                              height={"50px"}
                              src="../Assests/downloadicon.gif"
                              alt=""
                            />
                          </span>
                        </p>
                      </div>
                      <div className="row mt-3">
                        <Button
                          onClick={(event) =>
                            handleUpdate(event, PrintData._id)
                          }
                          className="col-md-2 mt-3 "
                        >
                          Process
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null || jobType === "Fabrication" ? (
            <>
              {!selectedIndexFabrication ? (
                <>
                  <div className="row">
                    <div className="col-md-3">
                      <ArrowCircleLeftIcon
                        onClick={() => setSelected(false)}
                        style={{ color: "#068FFF", fontSize: "35px" }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <Col className="col-md-1 mb-3">
                      <Form.Control
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
                    </Col>
                  </div>
                  <div className="row">
                    <table className="t-p">
                      <thead className="t-c">
                        <tr>
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
                          <th className="th_s p-1">Category</th>
                          <th className="th_s p-1">Hight</th>
                          <th className="th_s p-1">Width</th>
                          <th className="th_s p-1">Date</th>
                          <th className="th_s p-1">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RecceData?.map((recceItem, index) =>
                          recceItem?.outletName?.map((outlet, outletArray) => {
                            let JobNob = 0;
                            RecceData?.forEach((recceItem, recceIndex) => {
                              recceItem?.outletName?.forEach((item) => {
                                if (outlet?._id === item?._id) {
                                  JobNob = recceIndex + 1;
                                }
                              });
                            });
                            if (rowsDisplayed < rowsPerPage1) {
                              const pincodePattern = /\b\d{6}\b/;

                              const address = outlet?.OutletAddress;
                              const extractedPincode =
                                address?.match(pincodePattern);

                              if (extractedPincode) {
                                outlet.OutletPincode = extractedPincode[0];
                              }
                              if (
                                outlet?.OutlateFabricationNeed?.includes("Yes")
                              ) {
                                serialNumber++;
                                rowsDisplayed++;
                                return (
                                  <tr className="tr_C" key={serialNumber}>
                                    <td className="td_S p-1">{serialNumber}</td>
                                    <td className="td_S p-1">Job{JobNob}</td>
                                    <td className="td_S p-1">
                                      {recceItem?.BrandName}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.ShopName}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.ClientName}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.State}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.OutletContactNumber}
                                    </td>

                                    <td className="td_S p-1">
                                      {outlet?.OutletZone}
                                    </td>
                                    <td className="td_S p-1">
                                      {extractedPincode
                                        ? extractedPincode[0]
                                        : ""}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.OutletCity}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.FLBoard}
                                    </td>
                                    <td className="td_S p-1">{outlet?.GSB}</td>
                                    <td className="td_S p-1">
                                      {outlet?.Inshop}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.Category}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.height}
                                      {outlet?.unit}
                                    </td>
                                    <td className="td_S p-1">
                                      {outlet?.width}
                                      {outlet?.unit}
                                    </td>
                                    <td className="td_S ">
                                      {recceItem?.createdAt
                                        ? new Date(recceItem?.createdAt)
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
                </>
              ) : (
                <>
                  <div className="col-md-1">
                    <ArrowCircleLeftIcon
                      onClick={() => setselectedIndexFabrication(false)}
                      style={{ color: "#068FFF", fontSize: "35px" }}
                    />
                  </div>

                  <div className="row  m-auto ">
                    <div className="col-md-8">
                      <div>
                        <p>
                          <span className="cl"> Shop Name:</span>
                          <span>{getDesignData.ShopName}</span>
                        </p>
                        <p>
                          <span className="cl"> Partner Code:</span>
                          <span> {getDesignData.PartnerCode}</span>
                        </p>
                        <p>
                          <span className="cl"> Category :</span>
                          <span> {getDesignData.Category}</span>
                        </p>
                        <p>
                          <span className="cl">Outlet Pincode :</span>
                          <span> {getDesignData.OutletPincode}</span>
                        </p>
                        <p>
                          <span className="cl"> Inshop :</span>
                          <span>
                            {getDesignData.Inshop === "Y" || "y"
                              ? getDesignData.Inshop
                              : "No"}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> GSB :</span>
                          <span>
                            {getDesignData.GSB === "Y" || "y"
                              ? getDesignData.GSB
                              : "No"}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> FLBoard :</span>
                          <span>
                            {getDesignData.FLBoard === "Y"
                              ? getDesignData.FLBoard
                              : "No"}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> Hight:</span>
                          <span>
                            {getDesignData.height}
                            {getDesignData.unit}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> Width :</span>
                          <span>
                            {getDesignData.width}
                            {getDesignData.unit}
                          </span>
                        </p>
                        <p>
                          <span className="cl"> GST Number :</span>
                          <span>{getDesignData.GSTNumber}</span>
                        </p>
                      </div>

                      <p>
                        <span className="cl"> Download :</span>
                        <span>
                          <img
                            onClick={downloadAsPdf}
                            width={"50px"}
                            height={"50px"}
                            src="../Assests/downloadicon.gif"
                            alt=""
                          />
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div>
                      <img
                        style={{ borderRadius: "10px" }}
                        width={"120px"}
                        height={"60px"}
                        src="https://d2tl9ctlpnidkn.cloudfront.net/hlsonprint/images/products_gallery_images/vinyl-banner-printing-hls-02b35.jpg"
                        alt=""
                      />
                    </div>

                    <div className="row mt-5">
                      <div
                        className="col-md-5 "
                        style={{
                          padding: "20px",
                          border: "1px solid grey",
                          borderRadius: "20px",
                        }}
                      >
                        <div className="text-center">
                          <p> Add your design</p>

                          <AddCircleOutlineIcon
                            className="m-auto"
                            style={{ color: "blue" }}
                          />
                        </div>
                      </div>
                      <div className="col-md-1">
                        <label>
                          <input type="file" className="hide" />
                          <img
                            className="mt-4"
                            width={"50px"}
                            height={"50px"}
                            alt=""
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJIAAAB8CAMAAAC16xlOAAAAk1BMVEX2tjj////5+fn2sR/4+vz44LzZ2dnw8PD2tC786Mv0uEnU1NXZ08zm5ubU1tjdz7v4xWr++O/87931rQD3vVL3wF7+9Ob50pL++/f85cP74bj869L5zof4xnD626r5yn362KLXxKbboS34u0X27+bcmwDx59jp4dbnqzPRmzLqwoLtvWfZsW7Tyr+7vb/GxsfftGm0tGBfAAADoUlEQVR4nM3cW1ejMBQF4GCUBmovAUq5lFplxlFn6sz//3WTQKAFi9oCPXs/6du3aNcmnJAyq45MMpd9liDbpdb4YfVfSc7FpyLGBBdBfD1S4n/hMSo/i65Eir8n0igRXoUUBV99aEcmNu51MiTn+yJlyq5BWvMzSMxPrkDKzrlKjLlXIC3PI4kxq+BC0hqPFMCRGAckOYMmHICkOnzIsKXXnzRwhEjRSKp+JRzp0Cs4pFWERmKuPEHiVBGdpO0dTeK16CJ5t0SJeSdpZtPk8SnvItmTG5JEP+Ju0oToOi1++l2k2WxCk2eHdZGIPrqbWynGI6krfUl+vYxFmtjT6fyS3L+euqEMQJpoz+KSPD6lnidHINlz++3Cuwrjvu+LZHDS1F71u4HzdUX6/aLybM/sfiUwm7/1XVLw1JD+vKrs36fvf6e9Mv/2AKYr4oFJnejfkyIt9vf7/X2vLM6aLZxMzlaBTvGPO0B6i5jLANaTjYiMbdBIG7ZDI+1Y0v8LOWh4wmI0UszOmlJeIcJhHrWhHY+FObWhmTxkcoB2GzJuxKyAGtFMoFYCK2pEI2KlSGeOvEeOyBRpjUXSS7gtVFfyrSLdYZFiRUp7LwSHjJ8qUoh1lUJNwvp6S0WSUHcUV5Oink9eg0bPddnZ24OjRu/RKtIDEmlTkJDqW+8RKNIWiKTKW5OQVt+qvDUJqb5VeWtSiEQKy/kSEsmCJVE7jpIbEs4dRSwNCae+dXkXJJz6FjtDwhme8MSQcOpbl3dBwhmeCMeQgIYnniHhDE/y0JAimOGJG1XbOjDDk6DeaUKpb7GqSSj1LR5qEkp9l2/nFCSU4UlR3iXJQSE5NckDWcT5Xk1CGZ7wsCZJakuVww64BOnK4ECKMPYJxTI6vCeA0ZVlUxoSxtZlsfKuSBj1bV6tLEkY9a3HJjUJY/VdlrchYdR3Wd6GJDFI8oiEManwrWMSxnepQUJ4IKjOSFx2NGYcUtYgIdS3Ke+KtAP4MvFdg4QwPOFJgxQjfHBxg5QikNIGCWJ44jVICPuEuWyQEIYn1TnA6kQqwANB0CLRPxAUM+9jEn19V+Vdk+jruyrvmkRf31V516SUnpS2SPSrbx62SPSveYg2ib6+c9kmkXdl+8ieFVEvdQ/H7+tfXaAenpixyTGJelLx4fgn/dsCfviBRLxrUe5VtEgeLck7QbIcQYYSwrFOkSwv+PLHV0YCBUen0hsk9ey0IWjMYNP8WYn/NPFdfinnNV8AAAAASUVORK5CYII="
                          />
                        </label>
                      </div>
                      <div className="col-md-1">
                        <label>
                          <input type="file" className="hide" />
                          <img
                            className="mt-4"
                            width={"50px"}
                            height={"50px"}
                            alt=""
                            src="https://cdn-icons-png.flaticon.com/512/4208/4208479.png"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-md-7">
                        <Button onClick={AssignJob} className="mt-3 c_W">
                          Add fabrication
                        </Button>
                        <Button
                          onClick={() => setSelected(null)}
                          className="mt-3 c_W"
                        >
                          Go back
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : null}
        </>
      </div>
    </>
  );
}
