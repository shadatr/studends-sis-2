/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import axios from 'axios';
import React, { FC, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import MyModel from '@/app/components/dialog';
import { AddCourseType, AddCourse2Type } from '@/app/types/types';

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const CourseItems: FC<{
  courses: AddCourse2Type[];
  num: number;
  handleDelete: any;
}> = ({ courses, num, handleDelete }) => {
  return courses.map((item, index) => {
    if (item.min_semester == num) {
      return (
        <div key={index} className="courses">
          <td>
            <MyModel
              depOrMaj="المادة"
              name={''}
              deleteModle={() => handleDelete(item.id)}
            />
          </td>
          <td>{item.passing_percentage}</td>
          <td>{item.min_semester}</td>
          <td>{item.credits}</td>
          <td>{item.hours}</td>
          <td>{item.course_name}</td>
          <td className="flex flex-row w-1/7 pr-2 pl-2">{index + 1}</td>
        </div>
      );
    }
  });
};

const page = ({ params }: { params: { id: number } }) => {
  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const course = useRef<HTMLInputElement>(null);
  const [loadCourses, setLoadCourse] = useState(false);
  const [semester, setSemester] = useState('');
  const [credits, setCredits] = useState('');
  const [hours, setHours] = useState('');
  const [newItemCourse, setNewItemCourse] = useState('');
  const [passingGrade, setPassingGrade] = useState('');

  const headers = (
    <tr className="coursesHeader">
      <th> </th>
      <th>درجة النجاح</th>
      <th>تبدا من الفصل الدراسي</th>
      <th>الكريدت</th>
      <th>الساعات</th>
      <th>اسم المادة</th>
      <th> </th>
    </tr>
  );

  const selection = numbers.map((num, index) => (
    <option key={index}>{num}</option>
  ));

  const handleRegisterCourse = () => {
    if (!newItemCourse) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }

    if (!credits && !hours && !passingGrade && !semester) {
      toast.error('يجب ملئ جميع الحقول');
      return;
    }

    let duplicateFound = false;

    courses.forEach((item) => {
      if (item.course_name === newItemCourse) {
        duplicateFound = true;
        return;
      }
    });

    if (duplicateFound) {
      toast.error('هذه المادة مسجلة بالفعل');
      return;
    }

    const data: AddCourseType = {
      major_id: params.id,
      course_name: newItemCourse,
      credits: credits,
      min_semester: semester,
      hours: hours,
      passing_percentage: passingGrade,
    };
    axios
      .post(`/api/courseRegistration/${params.id}`, data)
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message);
        setLoadCourse(!loadCourses);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get(`/api/courseRegistration/${params.id}`).then((resp) => {
        console.log(resp.data);
        const message: AddCourse2Type[] = resp.data.message;
        setCourses(message);
      });
    };
    fetchPosts();
  }, [loadCourses, params.id]);

  const handleDelete = (id: number) => {
    const data = { item_name: id };
    axios.post(`/api/courseRegDelete/${params.id}`, data).then((resp) => {
      console.log(resp.data);
      toast.success(resp.data.message);
      setLoadCourse(!loadCourses);
    });
  };

  return (
    <div className="absolute flex flex-col right-[300px]">
      <div className="flex flex-col  items-center justify-center text-sm">
        <div className="flex flex-row-reverse items-center justify-center  text-sm mt-10 mb-10 w-[1000px]">
          <input
            ref={course}
            dir="rtl"
            placeholder="ادخل اسم المادة"
            type="text"
            className="w-[700px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
            onChange={(e) => setNewItemCourse(e.target.value)}
          />
          <select
            id="dep"
            dir="rtl"
            onChange={(e) => setCredits(e.target.value)}
            className="p-4 text-sm bg-lightBlue "
          >
            <option selected disabled>
              {' '}
              الكريدت
            </option>
            {selection}
          </select>
          <select
            id="dep"
            dir="rtl"
            onChange={(e) => setHours(e.target.value)}
            className="p-4 text-sm bg-lightBlue "
          >
            <option selected disabled>
              الساعات
            </option>
            {selection}
          </select>
          <select
            id="dep"
            dir="rtl"
            onChange={(e) => setSemester(e.target.value)}
            className="p-4 text-sm bg-lightBlue "
          >
            <option selected disabled>
              تبدا من الفصل الدراسي
            </option>
            {selection}
          </select>
          <input
            ref={course}
            dir="rtl"
            placeholder="درجة النجاح"
            type="text"
            className="w-[200px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
            onChange={(e) => setPassingGrade(e.target.value)}
          />
          <button
            className="bg-darkBlue text-secondary p-3 w-[200px] rounded-[5px]"
            type="submit"
            onClick={handleRegisterCourse}
          >
            سجل
          </button>
        </div>
        <table className="w-[1000px] flex flex-col h-[200px] overflow-y-auto">
          <tr className="flex justify-center items-center text-sm bg-darkBlue text-secondary ">
            الفصل الدراسي الاول
          </tr>
          <thead>{headers}</thead>
          <tbody className="course">
            <CourseItems
              handleDelete={handleDelete}
              num={1}
              courses={courses}
            />
          </tbody>
        </table>
        <table className="w-[1000px]  flex flex-col h-[200px] overflow-y-auto">
          <tr className="flex justify-center items-center text-sm bg-darkBlue text-secondary ">
            الفصل الدراسي الثاني
          </tr>
          <thead>{headers}</thead>
          <tbody className="course">
            <CourseItems
              handleDelete={handleDelete}
              num={2}
              courses={courses}
            />
          </tbody>
        </table>
        <table className="w-[1000px]  flex flex-col h-[200px] overflow-y-auto">
          <tr className="flex justify-center items-center text-sm bg-darkBlue text-secondary ">
            الفصل الدراسي الثالث
          </tr>
          <thead>{headers}</thead>
          <tbody className="course">
            <CourseItems
              handleDelete={handleDelete}
              num={3}
              courses={courses}
            />
          </tbody>
        </table>
        <table className="w-[1000px]  flex flex-col h-[200px] overflow-y-auto">
          <tr className="flex justify-center items-center text-sm bg-darkBlue text-secondary ">
            الفصل الدراسي الرابع
          </tr>
          <thead>{headers}</thead>
          <tbody className="course">
            <CourseItems
              handleDelete={handleDelete}
              num={4}
              courses={courses}
            />
          </tbody>
        </table>
        <table className="w-[1000px]  flex flex-col h-[200px] overflow-y-auto">
          <tr className="flex justify-center items-center text-sm bg-darkBlue text-secondary ">
            الفصل الدراسي الخامس
          </tr>
          <thead>{headers}</thead>
          <tbody className="course">
            <CourseItems
              handleDelete={handleDelete}
              num={5}
              courses={courses}
            />
          </tbody>
        </table>
        <table className="w-[1000px]  flex flex-col h-[200px] overflow-y-auto">
          <tr className="flex justify-center items-center text-sm bg-darkBlue text-secondary ">
            الفصل الدراسي السادس
          </tr>
          <thead>{headers}</thead>
          <tbody className="course">
            <CourseItems
              handleDelete={handleDelete}
              num={6}
              courses={courses}
            />
          </tbody>
        </table>
        <table className="w-[1000px]  flex flex-col h-[200px] overflow-y-auto">
          <tr className="flex justify-center items-center text-sm bg-darkBlue text-secondary ">
            الفصل الدراسي السابع{' '}
          </tr>
          <thead>{headers}</thead>
          <tbody className="course">
            <CourseItems
              handleDelete={handleDelete}
              num={7}
              courses={courses}
            />
          </tbody>
        </table>
        <table className="w-[1000px]  flex flex-col h-[200px] overflow-y-auto">
          <tr className="flex justify-center items-center text-sm bg-darkBlue text-secondary ">
            الفصل الدراسي الثامن
          </tr>
          <thead>{headers}</thead>
          <tbody className="course">
            <CourseItems
              handleDelete={handleDelete}
              num={8}
              courses={courses}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default page;
