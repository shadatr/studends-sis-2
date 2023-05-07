import React from 'react'

type Item = {
  id: number;
  name: string;
  weeks:string[];
}

const attenData: Item[] = [
  {
    id: 1,
    name: "اسم المادة",
    weeks: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    },
    {
    id: 2,
    name: "اسم المادة",
    weeks: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    },
    {
    id: 3,
    name: "اسم المادة",
    weeks: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    },
    {
    id: 4,
    name: "اسم المادة",
    weeks: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    },
    {
    id: 5,
    name: "اسم المادة",
    weeks: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
    },
  
];

const header: string[] = [
    "14",
    "12",
    "11",
    "10",
    "9",
    "8",
    "7",
    "6",
    "5",
    "4",
    "3",
    "2",
    "1",
  "اسم المادة",
];

const page = () => {

    const attendance = attenData.map((item) => (
      <tr key={item.id}>
        {item.weeks.map((i) => (
            <td className=" p-2 pr-5">{i}</td>
            ))}
        <td className=" p-2 pr-5">{item.name}</td>
      </tr>
    ));

    const headers = header.map((h) => (
      <th className=" p-2 pr-5 bg-darkBlue text-secondary ">{h}</th>
    ));
    
  return (
      <table className="fixed w-[800px] text-sm bg-lightBlue right-[464px] top-[260px]">
        <tr className="">{headers}</tr>
        {attendance}
      </table>
  );
}

export default page
