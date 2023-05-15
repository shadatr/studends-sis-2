"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { useState } from "react";


const checkList: string[] = [
  "مادة",
  "مادة",
  "مادة",
  "مادة",
  "مادة",
  "مادة",
  "مادة",
  "مادة",
  "مادة",
  "مادة",
  "مادة",
  "مادة",
];

function App() {
  const [checked, setChecked] = useState<string[]>([]);
  useSession({required : true, onUnauthenticated() {
    redirect("/login/student");
  },});
  
  const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    let updatedList = [...checked];
    if (event.target.checked) {
      updatedList = [...checked, event.target.value];
    } else {
      updatedList.splice(checked.indexOf(event.target.value), 1);
    }
    setChecked(updatedList);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(checked);
  };

  return (
    <div className="fixed w-[800px] text-sm right-[464px] top-[140px] ">
      <form onSubmit={handleSubmit}>
        <h1>اختر المواد </h1>
        <div className="">
          {checkList.map((item, index) => (
            <div className="bg-lightBlue  flex justify-between" key={index}>
              <input
                className="p-9 ml-9"
                value={item}
                type="checkbox"
                onChange={handleCheck}
              />
              <label className="p-2">{item}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-center	">
          <button
            className=" w-[800px] bg-darkBlue text-secondary "
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
