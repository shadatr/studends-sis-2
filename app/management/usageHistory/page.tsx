'use client';

import React, { useEffect, useState } from 'react';
import { UsageHistoryType, PersonalInfoType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const itemsPerPage = 18; // Number of items to display per page


const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [usage, setUsage] = useState<UsageHistoryType[]>([]);
  const [admin, setAdmin] = useState<PersonalInfoType[]>([]);
  const [doctor, setDoctor] = useState<PersonalInfoType[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      const responsePer = await axios.get(
        `/api/usageHistory`
      );
      const messagePer: UsageHistoryType[] = responsePer.data.message;
      setUsage(messagePer);

      const responseAdmin = await axios.get(`/api/getAll/getAllStaff`);
      const messageAdmin: PersonalInfoType[] = responseAdmin.data.message;
      setAdmin(messageAdmin);

      const responseDoctor = await axios.get(`/api/getAll/doctor`);
      const messageDoctor: PersonalInfoType[] = responseDoctor.data.message;
      setDoctor(messageDoctor);

    };
    fetchPosts();
  }, [user]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, usage.length);

  // Array to store the current page items
  const currentItems = [];

  // Populate the currentItems array with items for the current page
  for (let i = startIndex; i < endIndex; i++) {
    currentItems.push(usage[i]);
  }

  // Handle the pagination event by updating the current page state
  const handlePageChange = (pageNumber:number) => {
    setCurrentPage(pageNumber);
  };

  // Generate the array of page numbers
  const totalPages = Math.ceil(usage.length / itemsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex absolute flex-col w-[80%] justify-center items-center">
      <table className="border-collapse mt-8 w-[1000px]">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">
              الوظيفة
            </th>
            <th className="border border-gray-300 px-4 py-2">اسم المستخدم</th>
            <th className="border border-gray-300 px-4 py-2"> الحركة</th>
            <th className="border border-gray-300 px-4 py-2">تاريخ </th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((user, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td className="border border-gray-300 px-4 py-2">
                {user.type == 'admin' ? 'موظف' : 'دكتور'}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.type === 'admin'
                  ? `${admin.find((adm) => adm.id === user.user_id)?.name} ${
                      admin.find((adm) => adm.id === user.user_id)?.surname
                    }`
                  : `${doctor.find((doc) => doc.id === user.user_id)?.name} ${
                      doctor.find((doc) => doc.id === user.user_id)?.surname
                    }`}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.action}
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4">
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handlePageChange(pageNumber)}
            disabled={currentPage === pageNumber}
            className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded ${
              currentPage === pageNumber ? 'bg-gray-500' : ''
            }`}
          >
            {pageNumber}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Page;
