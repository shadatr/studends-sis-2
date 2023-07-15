'use client';
import {
  CourseType,
  GetPermissionType,
  PrerequisiteCourseType,
  SectionType,
} from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaTrashAlt } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const Page = ({ params }: { params: { courseId: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [section, setSection] = useState<SectionType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [load, setLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [prerequisites, setPrerequisites] = useState<PrerequisiteCourseType[]>(
    []
  );
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      if(user){
        const responsePer = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const messagePer: GetPermissionType[] = responsePer.data.message;
        setPerms(messagePer);
      }

      const response = await axios.get(
        `/api/getAll/getAllSections/${params.courseId}`
      );
      const message: SectionType[] = response.data.message;
      setSection(message);

      const responseCourse = await axios.get(`/api/course/courseRegistration`);
      const messageCourse: CourseType[] = responseCourse.data.message;
      setCourses(messageCourse);

      const responsePerCourse = await axios.get(
        `/api/course/prerequisitesCourses/${params.courseId}`
      );
      const messagePerCourse: PrerequisiteCourseType[] =
        responsePerCourse.data.message;
      setPrerequisites(messagePerCourse);
    };
    fetchPosts();
  }, [params.courseId, load, user]);

  const handleRegisterSection = () => {
    const selectedCourse = courses.find(
      (course) => params.courseId == course.id
    );

    const data = {
      name: selectedCourse?.course_name + `(مجموعة${section.length + 1})`,
      course_id: selectedCourse?.id,
    };
    axios
      .post('/api/course/sectionRegistration', data)
      .then((res) => {
        setLoad(!load);
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' اضافة مجموعة لمادة' + selectedCourse?.course_name,
        };
        axios.post('/api/usageHistory', dataUsageHistory);
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
      (course) => selectedCourseName == course.course_name
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

    const data = {
      course_id: selectedCourse?.id,
      prerequisite_course_id: selectedCoursePer?.id,
    };

    axios
      .post(`/api/course/prerequisitesCourses/${params.courseId}`, data)
      .then((res) => {
        setLoad(!load);
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
          {perms.map((permItem, idx) => {
            if (permItem.permission_id === 6 && permItem.active) {
              return (
                <>
                  <button
                    key={idx}
                    onClick={handleRegisterSection}
                    className="p-3 m-5 bg-blue-900 hover:bg-blue-700 text-secondary rounded-md pl-[80px] pr-[80px] items-center flex justify-center "
                  >
                    اضاف مجموعة
                  </button>
                </>
              );
            }
            return null;
          })}
          {section.map((sec) => (
            <Link
              key={sec.id}
              href={`/management/course/managementWork/class/${sec.id}`}>
              <div
                className="p-3 m-5 bg-lightBlue pl-[80px] pr-[80px] items-center flex justify-center rounded-sm"
              >
                {sec.name}
              </div>
            </Link>
          ))}
        </>
      )}
      {activeTab === 'Tab 2' && (
        <div className="flex flex-col m-10 max-w-[600px] w-screen justify-center items-center ">
          {perms.map((permItem) => {
            const prereqCourse = courses.filter((item2) =>
              prerequisites.map(
                (item3) => item2.id != item3.prerequisite_course_id
              )
            );
            const selectedCourses = prereqCourse.filter(
              (item) => item.id != params.courseId
            );

            if (permItem.permission_id === 6 && permItem.active) {
              return (
                <>
                  <select
                    className="w-[350px] bg-lightBlue p-2 rounded-md"
                    defaultValue=""
                    onChange={(e) => setSelectedCourseName(e.target.value)}
                  >
                    <option disabled value="">
                      اختر مادة
                    </option>
                    {selectedCourses.map((course, index) => (
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
                </>
              );
            }
            return null;
          })}
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
