'use client';
/* eslint-disable react-hooks/rules-of-hooks */
import { PersonalInfoType } from '@/app/types/types';
import axios from 'axios';
<<<<<<< HEAD
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const page = ({ params }: { params: { name: string } }) => {

    const [students, setStudents] = useState<PersonalInfoType[]>([]);
=======
// import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const page = ({ params }: { params: { name: string } }) => {
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
>>>>>>> 6c47a59c27d4115e842fb4c43bd1113e740cf309

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
<<<<<<< HEAD
    <table key={index} className="flex absolute text-sm justify-center items-center mt-10 left-[200px]">
      <tr className="flex flex-row">
        <td className="flex flex-row w-[800px] p-1 items-center justify-end">
          <Link href={`management/personalInformation/student/${item.id}`}>
          {item.surname} { }
          {item.name}
          </Link>
=======
    <table
      key={index}
      className="flex absolute text-sm justify-center items-center mt-10 left-[200px]"
    >
      <tr className="flex flex-row">
        <td className="flex flex-row w-[800px] p-1 items-center justify-end">
          {item.surname} {}
          {item.name}
>>>>>>> 6c47a59c27d4115e842fb4c43bd1113e740cf309
        </td>
        <td className="flex flex-row w-1/7 pr-2 pl-2">{index + 1}</td>
      </tr>
    </table>
  ));

<<<<<<< HEAD
  return <div>{studentsList}</div>;
=======
  const noStudents = (
    <div className='h-full flex justify-center items-center w-full'>
      <h1 className="flex flex-row justify-center items-center text-2xl">
        لا يوجد طلاب
      </h1>
    </div>
  );
  return <div>{students.length == 0 ? noStudents : studentsList}</div>;
>>>>>>> 6c47a59c27d4115e842fb4c43bd1113e740cf309
};

export default page;
