'use client';
import { CourseType, PrerequisiteCourseType, SectionType } from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaTrashAlt } from 'react-icons/fa';
import { useSession } from 'next-auth/react';


const Page = ({ params }: { params: { courseId: number,majId: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }
  const [section, setSection] = useState<SectionType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [load, setLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [prerequisites, setPrerequisites] = useState<PrerequisiteCourseType[]>([]);
  const [maxStudents, setMaxStudents] = useState<number>();

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseName(event.target.value);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if(typeof window !== 'undefined'){
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/getAll/getAllSections/${params.courseId}`
      );
      const message: SectionType[] = response.data.message;
      setSection(message);

      const responseCourse = await axios.get(
        `/api/course/majorCourses/${params.majId}`
      );
      const messageCourse: CourseType[] = responseCourse.data.message;
      console.log(messageCourse);
      setCourses(messageCourse);

      const responsePerCourse = await axios.get(
        `/api/course/prerequisitesCourses/${params.courseId}`
      );
      const messagePerCourse: PrerequisiteCourseType[] =
        responsePerCourse.data.message;
      console.log(messageCourse);
      setPrerequisites(messagePerCourse);
    };
    fetchPosts();}
  }, [params.courseId, load, params.majId]);

  const handleRegisterSection = () => {
    
    const selectedCourse = courses.find(
      (course) => params.courseId == course.id
    );

    if (!maxStudents){
      toast.error('يجب ادخال الحد الاقصى لطلاب');
      return;
    }

    const data= {
      name: selectedCourse?.course_name + `(مجموعة${section.length + 1})`,
      course_id: selectedCourse?.id,
      max_students: maxStudents
    };
    console.log(data);
    axios
      .post('/api/course/sectionRegistration', data)
      .then((res) => {
        setLoad(!load);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

    const handleRegisterCourPre = () => {
      const selectedCourse = courses.find(
        (course) => params.courseId == course.id
        );

        const selectedCoursePer = courses.find(
          (course) =>selectedCourseName == course.course_name
          );


          let duplicateFound = false;
    
          prerequisites.forEach((item) => {
            if (item.prerequisite_course_id === selectedCoursePer?.id) {
              duplicateFound = true;
              return;
            }
          });
    
          if (duplicateFound) {
            toast.error('هذه المادة مسجلة بالفعل');
            return;
          }

          
      const data= {
        course_id: selectedCourse?.id,
        prerequisite_course_id: selectedCoursePer?.id,
      };
      console.log(data);
      axios
        .post(`/api/course/prerequisitesCourses/${params.courseId}`, data)
        .then((res) => {
          setLoad(!load);
          console.log(res.data);
          toast.success(res.data.message);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    };

      const handleDelete = (course_id?: number) => {
        const data = { item_course_id: course_id };
        axios.post('/api/course/prerequisitesCourses/delete', data).then((resp) => {
          toast.success(resp.data.message);
          setLoad(!load);
        });
      };

  return (
    <div className="flex absolute flex-col w-screen justify-center items-center  text-sm">
      <div className="text-sm flex flex-row ">
        <button
          onClick={() => handleTabClick('Tab 1')}
          className={
            activeTab === 'Tab 1'
              ? ' w-[400px] text-secondary flex bg-darkBlue p-2 justify-center'
              : ' w-[400px]  flex bg-grey p-2 justify-center'
          }
        >
          المجموعات
        </button>
        <button
          onClick={() => handleTabClick('Tab 2')}
          className={
            activeTab === 'Tab 2'
              ? ' w-[400px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[400px] flex bg-grey p-2 justify-center'
          }
        >
          المواد المشروطة
        </button>
      </div>
      {activeTab === 'Tab 1' && (
        <>
          <button
            onClick={handleRegisterSection}
            className="p-3 m-5 bg-blue-900 hover:bg-blue-700 text-secondary rounded-md pl-[80px] pr-[80px] items-center flex justify-center "
          >
            اضاف مجموعة
          </button>
          <input
            placeholder="الحد الاقصى لطلاب"
            onChange={(event) => setMaxStudents(parseInt(event.target.value))}
            className="border border-gray-300 px-4 py-2 flex items-right"
          />
          {section.map((sec, index) => (
            <div
              key={index}
              className="p-3 m-5 bg-lightBlue pl-[80px] pr-[80px] items-center flex justify-center rounded-sm"
            >
              <Link
                href={`/management/course/managementWork/course/${sec.id}/${params.courseId}`}
              >
                {sec.name}
              </Link>
            </div>
          ))}
        </>
      )}
      {activeTab === 'Tab 2' && (
        <div className="flex flex-col m-10 max-w-[600px] w-screen justify-center items-center ">
          <select
            value={selectedCourseName}
            onChange={handleCourseChange}
            className="w-[350px] bg-lightBlue p-2 rounded-md"
          >
            <option disabled value="">
              اختر مادة
            </option>
            {courses.map((course, index) => (
              <option
                key={index}
                value={course.course_name}
                className="items-right flex h-[50px]"
              >
                {course.course_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleRegisterCourPre}
            className="rounded-md bg-blue-800 hover:bg-blue-600 text-secondary p-2 w-[200px] m-5"
          >
            اضافة
          </button>
          <table className="m-10 w-[600px]">
            <thead>
              <tr>
                <th className="bg-darkBlue text-secondary p-2">
                  المواد المشروطة
                </th>
              </tr>
            </thead>
            <tbody>
              {prerequisites.map((preCourse, index) => {
                const selectedPreCourse = courses.find(
                  (course) => course.id == preCourse.prerequisite_course_id
                );
                return (
                  <tr key={index}>
                    <td className="p-2 items-center flex justify-between">
                      <FaTrashAlt
                        className="cursor-pointer"
                        onClick={() => handleDelete(preCourse.id)}
                      />
                      {selectedPreCourse?.course_name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Page;
