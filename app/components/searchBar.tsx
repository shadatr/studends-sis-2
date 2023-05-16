'use client';
import axios from 'axios';
import React, { useRef } from 'react';

const SearchBar = () => {
  const searchType = useRef<HTMLSelectElement>(null);
  const searchBy = useRef<HTMLInputElement>(null);
  const handleSearch = () => {
    axios.post('/api/search', JSON.stringify({ searchType: searchType.current?.value, searchBy: searchBy.current?.value })).then((res) => {
      console.log(res.data);
    });
    console.log(searchType.current?.value);
  };

  return (
    <div className="flex items-center">
      <button onClick={handleSearch} className="btn_base h-9 text-center">ابحث</button>
      <select ref={searchType} className="" name="نوع" id="searchType">
        <option value="students">طالب</option>
        <option value="doctors">استاذ</option>
        <option value="admins">اداري</option>
      </select>
      <input
        ref={searchBy}
        type="text"
        dir="rtl"
        placeholder="ابحث باستعمال الرقم التريفي او الاسم"
        className="rounded-sm bg-gray-200 w-[500px] h-[45px] pr-2"
      />
    </div>
  );
};

export default SearchBar;
