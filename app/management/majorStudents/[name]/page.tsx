'use client';
/* eslint-disable react-hooks/rules-of-hooks */
import { PersonalInfoType } from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const page = ({ params }: { params: { name: string } }) => {

    const [students, setStudents] = useState<PersonalInfoType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get(`/api/list/${params.name}/student`).then((resp) => {
        console.log(resp.data);
        const message: PersonalInfoType[] = resp.data.message;
        setStudents(message);
      });
    };
    fetchPosts();
  }, [params.name]);

  const studentsList = students.map((item, index) => (
    <table key={index} className="flex absolute text-sm justify-center items-center mt-10 left-[200px]">
      <tr className="flex flex-row">
        <td className="flex flex-row w-[800px] p-1 items-center justify-end">
          <Link href={`management/personalInformation/student/${item.id}`}>
          {item.surname} { }
          {item.name}
          </Link>
        </td>
        <td className="flex flex-row w-1/7 pr-2 pl-2">{index + 1}</td>
      </tr>
    </table>
  ));

  return <div>{studentsList}</div>;
};

export default page;
