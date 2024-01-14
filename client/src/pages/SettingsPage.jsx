import { Separator } from "@/components/ui/separator";
import React from "react";

const SettingsPage = () => {
  return (
    <div className="flex">
      <div className="flex-1 shrink"></div>
      <div className="flex-3 flex flex-col h-screen items-center justify-center gap-y-2">
        <p>My Account</p>
        <div className="relative rounded-md flex bg-indigo-500 h-[430px] flex-col w-[600px]">
          <div className="h-[90px] w-full bg-indigo-500 flex flex-col rounded-md"></div>
          <div className="left-[10px] absolute top-[60px] left-[12px] border-8 border-main10 rounded-full h-[80px] w-[80px]"></div>
          <div className="flex flex-col rounded-b-md w-full p-4 gap-y-8 bg-main10">
            <div className="pl-[90px] flex justify-between">
              <p className="">Name</p>
              <button className="bg-emerald-500 rounded-sm px-3 text-sm h-[30px]">
                Edit User Profile
              </button>
            </div>
            <div className="flex flex-col gap-y-3 p-4 bg-main08 rounded-md">
              <div className="flex justify-between">
                <div>
                  <p>Display Name</p>
                  <p>Name</p>
                </div>
                <button>Edit</button>
              </div>
              <div className="flex justify-between">
                <div>
                  <p>Display Name</p>
                  <p>Name</p>
                </div>
                <button>Edit</button>
              </div>
              <div className="flex justify-between">
                <div>
                  <p>Display Name</p>
                  <p>Name</p>
                </div>
                <button>Edit</button>
              </div>
              <div className="flex justify-between">
                <div>
                  <p>Display Name</p>
                  <p>Name</p>
                </div>
                <button>Add</button>
              </div>
            </div>
          </div>
        </div>
        <Separator className="text-white w-full h-[1px]" />
      </div>
      <div className="flex-1"></div>
    </div>
  );
};

export default SettingsPage;
