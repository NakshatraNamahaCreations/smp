import React, { useState, useEffect } from "react";
import Header from "./Header";
import Button from "react-bootstrap/esm/Button";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import axios from "axios";
export default function Category() {
  const [categoryData, setCategoryData] = useState([]);
  const ApiURL = process.env.REACT_APP_API_URL;
  const ImageURL = process.env.REACT_APP_IMAGE_API_URL;
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
    }
  };

  const handleCategoryAdded = async (e) => {
    e.preventDefault();
    window.location.href = "/Addcategory";
    await getAllCategory();
  };

  const handlesubCategoryAdded = async (e) => {
    e.preventDefault();
    window.location.href = "/Subcategory";
  };
  const deleteCatagory = async (row) => {
    try {
      const response = await axios.delete(
        `${ApiURL}/Product/category/deletecategory/${row._id}`
      );

      if (response.status === 200) {
        alert(response.data.success);
        window.location.reload();
      }
    } catch (error) {
      console.log(error, "Cannot delete category");
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

  return (
    <>
      <Header />
      <div className="row  m-auto containerPadding">
        <Button className="col-md-2 ms-5" onClick={handleCategoryAdded}>
          Add Category
        </Button>

        <Button
          className="col-md-2 ms-3"
          // style={{ marginLeft: "5px" }}
          onClick={handlesubCategoryAdded}
        >
          Add Subcategory
        </Button>
        <div className="row">
          <div className="col-md-11 m-auto mt-3  containerPadding">
            <BootstrapTable
              striped
              className="poppinfnt"
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
