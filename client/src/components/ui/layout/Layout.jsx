import React from "react";

const Layout = ({ children }) => {
  return (
    <>
      <main style={{ height: "70vh" }}>{children}</main>
    </>
  );
};

export default Layout;
