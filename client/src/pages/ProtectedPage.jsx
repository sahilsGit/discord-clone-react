import React from "react";
import { Button } from "@/components/ui/button";

const ProtectedPage = () => {
  const takeThere = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Origin", "http://localhost:5173");

    const options = {
      method: "GET",
      headers,
      credentials: "include",
    };

    await fetch("http://localhost:4000/api/proPage/get", options).then(
      (response) => {
        try {
          if (response.ok) {
            alert("You are logged in!");
          }
        } catch (err) {
          alert(err);
        }
      }
    );
  };
  return (
    <>
      <div>
        This is the Protected Page, if everything's working as exptected, you
        are here after signing in.
      </div>
      <Button onClick={takeThere}>Take me there! </Button>
    </>
  );
};

export default ProtectedPage;
