"use client";

import React, { useState } from "react";
import Link from "next/link";

const SideBar = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  return (
    <div className="ec-left-sidebar h-100 ec-bg-sidebar">
      <div id="sidebar" className="sidebar ec-sidebar-footer">
        <div className="ec-navigation">
          <ul className="nav sidebar-inner" id="sidebar-menu">

            {/* Dashboard */}
            <li className="active">
              <Link className="sidenav-item-link" href="recruiter">
                <i className="mdi mdi-view-dashboard-outline"></i>
                <span style={{ color: "black" }} className="nav-text">
                  Dashboard
                </span>
              </Link>
              <hr />
            </li>

                      {/* Job Posts */}
               <li>
              <Link className="sidenav-item-link" href="/recruiter/job-dashboard">
                <i className="mdi mdi-briefcase-outline"></i>
                <span className="nav-text">Job Dashboard</span>
              </Link>
              <hr />
            </li>



            {/* Category */}
            <li className="has-sub">
              <a 
                className="sidenav-item-link" 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu('categories');
                }}
                style={{ cursor: 'pointer' }}
              >
                <i className="mdi mdi-dns-outline"></i>
                <span className="nav-text">Categories</span>{" "}
                <b className="caret"></b>
              </a>
              <div className={`collapse ${activeMenu === 'categories' ? 'show' : ''}`}>
                <ul className="sub-menu" id="categorys" data-parent="#sidebar-menu">
                  <li className="">
                    <Link 
                      className="sidenav-item-link" 
                      href="/admin/category/add-main-category"
                      style={{ fontWeight: 'bold', padding: '8px 15px', margin: '5px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'block' }}
                    >
                      <span className="nav-text">Add Main Category</span>
                    </Link>
                  </li>
                  <li className="">
                    <Link 
                      className="sidenav-item-link" 
                      href="/admin/category/add-sub-category"
                      style={{ fontWeight: 'bold', padding: '8px 15px', margin: '5px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'block' }}
                    >
                      <span className="nav-text">Add Sub Category</span>
                    </Link>
                  </li>
                  <li className="">
                    <Link 
                      className="sidenav-item-link" 
                      href="/admin/category/add-sub-sub-category"
                      style={{ fontWeight: 'bold', padding: '8px 15px', margin: '5px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'block' }}
                    >
                      <span className="nav-text">Add Sub Sub Category</span>
                    </Link>
                  </li>
                  <li className="">
                    <Link 
                      className="sidenav-item-link" 
                      href="/admin/category/view-main-categories"
                      style={{ fontWeight: 'bold', padding: '8px 15px', margin: '5px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'block' }}
                    >
                      <span className="nav-text">View Main Categories</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </li>


            {/* Brands */}
            <li className="has-sub">
              <a 
                className="sidenav-item-link" 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  toggleMenu('brands');
                }}
                style={{ cursor: 'pointer' }}
              >
                <i className="mdi mdi-dns-outline"></i>
                <span className="nav-text">Brands</span>{" "}
                <b className="caret"></b>
              </a>
              <div className={`collapse ${activeMenu === 'brands' ? 'show' : ''}`}>
                <ul className="sub-menu" id="categorys" data-parent="#sidebar-menu">
                  <li className="">
                    <Link 
                      className="sidenav-item-link" 
                      href="/admin/brands/add-brand"
                      style={{ fontWeight: 'bold', padding: '8px 15px', margin: '5px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'block' }}
                    >
                      <span className="nav-text">Add Brand</span>
                    </Link>
                  </li>
                  <li className="">
                    <Link 
                      className="sidenav-item-link" 
                      href="/admin/brands/brand-list"
                      style={{ fontWeight: 'bold', padding: '8px 15px', margin: '5px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'block' }}
                    >
                      <span className="nav-text">Brands List</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SideBar;