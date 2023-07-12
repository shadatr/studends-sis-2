'use client';
import axios from 'axios';
import React, { useState } from 'react';
// import { toast } from 'react-toastify';
import { PersonalInfoType } from '@/app/types/types';
import Link from 'next/link';


const SearchBar = () => {
  const [useSearchType, setSearchType] = useState<string>();
  const [useSearchBy, setSearchBy] = useState<string>();
  const [searchedStudent, setSearchedStudent] = useState<PersonalInfoType[]>([]);


  const handleSearch = () => {
    // setSearchBy(searchBy.current?.value|| '');
    // setSearchType(searchType.current?.value || 'students');
    axios.get(`/api/search/${useSearchType}/${useSearchBy}`).then((res) => {
      // toast.success(res.data.message);
      console.log(res.data);
      setSearchedStudent(res.data.message);
    });
  };

  return (
    <div>
      <div className="flex items-center m-5">
        <button onClick={handleSearch} className="btn_base h-9 text-center">
          ابحث
        </button>
        <select
          onChange={(event) => setSearchType(event.target.value)}
          className=""
          name="نوع"
          id="searchType"
          defaultValue=""
        >
          <option disabled value="">
            اختر النوع
          </option>
          <option value="students">طالب</option>
          <option value="doctors">استاذ</option>
          <option value="admins">اداري</option>
        </select>
        <input
          onChange={(event) => setSearchBy(event.target.value)}
          type="text"
          dir="rtl"
          placeholder="ابحث باستعمال الرقم  او الاسم"
          className="rounded-sm bg-gray-200 w-[500px] h-[45px] pr-2"
        />
      </div>
      <table className="w-[500px] m-5">
        <tbody>
          {searchedStudent == null ||
          undefined ||
          searchedStudent.length == 0 ? (
            <tr>
              <td>لا يوجد</td>
            </tr>
          ) : (
            searchedStudent.map((student, index) => {
              let type;
              if (useSearchType == 'students'){
                type='student';
              }
              else if (useSearchType == 'admins') {
                type = 'admin';
              }
              if (useSearchType == 'doctors') {
                type = 'doctor';
              }
                return (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/personalInformation/${type}/${student.id}`}
                        className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
                      >
                        الملف الشخصي
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.surname}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.name}
                    </td>
                  </tr>
                );})
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SearchBar;
