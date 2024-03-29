import React, { useState, useEffect } from "react";
import Header from "./Header";
import Button from "react-bootstrap/esm/Button";
import axios from "axios";
import Form from "react-bootstrap/Form";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

function Addcategory() {
  const [catagoryName, setCatagoryName] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [editcategorydata, setEditCAtegoryData] = useState(null);
  const [editCatagoryName, setEditCatagoryName] = useState("");
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;

  const AddCatagory = async (e) => {
    e.preventDefault();

    try {
      const config = {
        url: "/Product/category/addcategory",
        method: "POST",
        baseURL: ApiURL,
        Header: { "Content-Type": "application/json" },
        data: { categoryName: catagoryName },
      };
      await axios(config).then(function (res) {
        if (res.status === 200) {
          alert("Category Added");
          setCatagoryName("");
          getAllCategory();
        }
      });
    } catch (error) {
      console.log("Unable to complete");
    }
  };

  useEffect(() => {
    getAllCategory();
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
    } finally {
      setLoading(false);
    }
  };

  const deleteCatagory = async (row) => {
    try {
      const response = await axios.delete(
        `${ApiURL}/Product/category/deletecategory/${row._id}`
      );

      if (response.status === 200) {
        console.log(response.data.success);
        window.location.reload();
      }
    } catch (error) {
      console.log(error, "Cannot delete category");
    }
  };

  const editData = async () => {
    try {
      const categoryId = editcategorydata?._id;
      const updateData = {
        categoryName: editCatagoryName || editcategorydata?.categoryName,
      };
      const config = {
        url: `/Product/category/editcategory/${categoryId}`,
        method: "put",
        baseURL: ApiURL,
        headers: {
          "Content-Type": "application/json",
        },
        data: updateData,
      };
      const res = await axios(config);
      if (res.status === 200) {
        alert("Edit updated");
        window.location.reload();
      }
    } catch (err) {
      console.log("you can't edit");
    }
  };

  const columns = [
    {
      dataField: "categoryName",
      text: "Category",
    },
    {
      dataField: "_id",
      text: "Action",
      formatter: (cell, row) => (
        <>
          <span
            style={{ cursor: "pointer", color: "green" }}
            onClick={() => handleEdit(row)}
            className="m-1"
          >
            Edit
          </span>
          <span
            style={{ cursor: "pointer", color: "red" }}
            onClick={() => deleteCatagory(row)}
            className="m-1"
          >
            Delete
          </span>
        </>
      ),
    },
  ];

  const handleEdit = (categoty) => {
    setEditCAtegoryData(categoty);
    setShowPopup(true);
  };

  return (
    <>
      <Header />
      <div className="row m-3 containerPadding">
        {!showPopup ? (
          <div className="row">
            <div className="col-md-6">
              <Form.Control
                type="text"
                id="Category"
                placeholder="Enter Category"
                value={catagoryName}
                onChange={(e) => setCatagoryName(e.target.value)}
              />
            </div>
            <div className="col-md-2 ">
              <Button variant="primary" onClick={AddCatagory}>
                Save
              </Button>
            </div>
            <div className="col-md-2 ">
              <Button variant="primary" href="/CategoryManagement">
                Back
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="col-md-9">
              <div className="row">
                <div className="col-md-6">
                  <Form.Control
                    defaultValue={editcategorydata?.categoryName}
                    onChange={(e) => setEditCatagoryName(e.target.value)}
                  />{" "}
                </div>
                <div className="col-md-3">
                  <Button onClick={() => editData()}>Update</Button>{" "}
                </div>
                <div className="col-md-3">
                  <Button onClick={() => setShowPopup(false)}>Cancel</Button>
                </div>
              </div>{" "}
            </div>
          </>
        )}
        <div className="row mt-5 containerPadding">
          <div className="col-md-8">
            <BootstrapTable
              striped
              bordered
              hover
              keyField="_id"
              data={categoryData}
              columns={columns}
              noDataIndication="No data available"
              pagination={paginationFactory({
                sizePerPage: 5,
                hidePageListOnlyOnePage: true,
              })}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Addcategory;
