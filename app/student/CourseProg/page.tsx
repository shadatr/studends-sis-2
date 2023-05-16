'use client';
import { useSession } from 'next-auth/react';
import React from 'react';

interface Item {
  startTime: string;
}

const hours: Item[] = [
  { startTime: '19:00' },
  { startTime: '18:00' },
  { startTime: '17:00' },
  { startTime: '16:00' },
  { startTime: '15:00' },
  { startTime: '14:00' },
  { startTime: '13:00' },
  { startTime: '12:00' },
  { startTime: '11:00' },
  { startTime: '10:00' },
  { startTime: '9:00' },
  { startTime: '8:00' },
];

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a student, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }

  const daysOfWeek = [
    'السبت',
    'الاحد',
    'الاثنين',
    'الثلثاء',
    'الاربعاء',
    'الخميس',
    'الجمعة',
  ];


  const hoursCol = hours.map((hour, index) => (
    <th key={index} className="text-center bg-darkBlue text-secondary">
      <div>{hour.startTime}</div>
    </th>
  ));

  const table = daysOfWeek.map((item, index) => (
    <tr key={index}>
      {Array.from({ length: 12 }, (_, index) => (
        <td key={index} className="text-center">
          {''}
        </td>
      ))}
      <td className="text-center bg-darkBlue text-secondary">{item}</td>
    </tr>
  ));

  return (
    <table className=" fixed max-w-[1200px] w-[1200px] h-[500px] text-sm top-[180px] right-[280px] bg-lightBlue">
      {hoursCol}
      {table}
    </table>
  );
};

export default Page;
