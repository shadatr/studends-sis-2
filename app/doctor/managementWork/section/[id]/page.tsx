'use client';
import { SectionType } from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Page = ({ params }: { params: { id: number } }) => {

    const [section, setSection] = useState<SectionType[]>([]);

    useEffect(() => {
      const fetchPosts = async () => {
        const response = await axios.get(
          `/api/getAll/getAllSections/${params.id}`
        );
        const message: SectionType[] = response.data.message;
        setSection(message);
        console.log(message);
      };
      fetchPosts();
    }, [params.id]);

    return (
      <div className="flex absolute flex-col w-screen justify-center items-center mt-10 text-sm">
        <div className="p-3 m-5 bg-darkBlue text-secondary pl-[80px] pr-[80px] items-center flex justify-center rounded-sm">
          المجموعات
        </div>
        {section.map((sec, index) => (
          <div
            key={index}
            className="p-3 m-5 bg-lightBlue pl-[80px] pr-[80px] items-center flex justify-center rounded-sm"
          >
            <Link href={`/doctor/managementWork/course/${sec.id}`}>
              {sec.name}
            </Link>
          </div>
        ))}
      </div>
    );
};

export default Page;
