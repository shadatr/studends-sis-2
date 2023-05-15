'use client';
import { useSession } from 'next-auth/react';
import React from 'react';

type ItemType = {
  id: number;
  name: string;
  weeks: string[];
};

const attenData: ItemType[] = [
  {
    id: 1,
    name: 'اسم المادة',
    weeks: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  },
  {
    id: 2,
    name: 'اسم المادة',
    weeks: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  },
  {
    id: 3,
    name: 'اسم المادة',
    weeks: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  },
  {
    id: 4,
    name: 'اسم المادة',
    weeks: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  },
  {
    id: 5,
    name: 'اسم المادة',
    weeks: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  },
];

const header: string[] = [
  '14',
  '12',
  '11',
  '10',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  '2',
  '1',
  'اسم المادة',
];

const page = () => {
  // const session = useSession({required : true})

  const attendance = attenData.map((item) => (
    <tr key={item.id}>
      {item.weeks.map((item, index) => (
        <td key={index} className=" p-2 pr-5">
          {item}
        </td>
      ))}
      <td className=" p-2 pr-5">{item.name}</td>
    </tr>
  ));

  const headers = header.map((hour, index) => (
    <th key={index} className=" p-2 pr-5 bg-darkBlue text-secondary ">
      {hour}
    </th>
  ));

  return (
    <table className="fixed w-[800px] text-sm bg-lightBlue right-[464px] top-[260px]">
      <tr className="">{headers}</tr>
      {attendance}
    </table>
  );
};

export default page;
