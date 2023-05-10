"use client"
import { useSession } from "next-auth/react";
import React from "react";

interface Item {
  id: number;
  name: string;
}

const uniAnno: Item[] = [
  { id: 1, name: "اعلان...." },
  { id: 2, name: "اعلان...." },
  { id: 3, name: "اعلان...." },
  { id: 4, name: "اعلان...." },
  { id: 5, name: "اعلان...." },
  { id: 6, name: "اعلان...." },
];

const courseAnno: Item[] = [
  { id: 1, name: "اعلان...." },
  { id: 2, name: "اعلان...." },
  { id: 3, name: "اعلان...." },
  { id: 4, name: "اعلان...." },
  { id: 5, name: "اعلان...." },
  { id: 6, name: "اعلان...." },
 
];

const AnnoPage = () => {
  // const session = useSession({required : true})

  const uni = uniAnno.map((i) => (
    <tr>
      <td className=" p-1 pr-3 " key={i.id}>
        {i.name}
      </td>
    </tr>
  ));
  const course = courseAnno.map((i) => (
    <tr>
    <td className=" p-1 pr-3" key={i.id}>
      {i.name}
    </td>
    </tr>
  ));

  return (
    <div className=" flex w-[800px] right-[464px]  flex-col absolute  top-[180px] text-sm  ">
      <table>
        <tr>
          <th className="bg-darkBlue   text-secondary  p-[10px]">
            اعلانات الجامعة
          </th>
        </tr>
        {uni}
      </table>
      <table className="mt-[30px]">
        <tr>
          <th className="bg-darkBlue  text-secondary  p-[10px]">
            اعلانات المواد
          </th>
        </tr>
        {course}
      </table>
    </div>
  );
};

export default AnnoPage;
// right-[464px]