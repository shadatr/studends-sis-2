'use client';
import { LettersType, GetPermissionType } from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [edit, setEdit] = useState(false);
  const [points, setPoints] = useState<LettersType[]>([]);
  const [letters2, setLetters2] = useState<LettersType[]>([]);
  const [letters, setLetters] = useState<LettersType[]>([]);
  const [grades, setGrades] = useState<LettersType[]>([]);
  const [grades2, setGrades2] = useState<LettersType[]>([]);
  const [points2, setPoints2] = useState<LettersType[]>([]);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [year, setYear] = useState<LettersType[]>([]);
  const [results, setResult] = useState<LettersType[]>([]);
  const [results2, setResult2] = useState<LettersType[]>([]);
  const [gpa, setGpa] = useState<LettersType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const messagePer: GetPermissionType[] = response.data.message;
        setPerms(messagePer);
      }

      const responsePoint = await axios.get(`/api/exams/grading/1`);
      const messagePoint: LettersType[] = responsePoint.data.message;
      setPoints(messagePoint);
      setPoints2(messagePoint);

      const responseLetter = await axios.get(`/api/exams/grading/3`);
      const messageLetter: LettersType[] = responseLetter.data.message;
      setLetters(messageLetter);
      setLetters2(messageLetter);

      const responseGrade = await axios.get(`/api/exams/grading/2`);
      const messageGrade: LettersType[] = responseGrade.data.message;
      setGrades(messageGrade);
      setGrades2(messageGrade);

      const responseYear = await axios.get(`/api/exams/grading/4`);
      const messageYear: LettersType[] = responseYear.data.message;
      setYear(messageYear);

      const responseResult = await axios.get(`/api/exams/grading/5`);
      const messageResult: LettersType[] = responseResult.data.message;
      setResult2(messageResult);
      setResult(messageResult);

      const responseGPA = await axios.get(`/api/exams/grading/6`);
      const messageGPA: LettersType[] = responseGPA.data.message;
      setGpa(messageGPA);
    };
    fetchPosts();
  }, [edit, user]);

  const handleChangePoints = (letter: string, value: string) => {
    const updatedPoints = points2.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setPoints2(updatedPoints);
  };

  const handleChangeLetters = (letter: string, value: string) => {
    const updatedLetters = letters2.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setLetters2(updatedLetters);
  };

  const handleChangeGrades = (letter: string, value: string) => {
    const updatedLetters = grades2.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setGrades2(updatedLetters);
  };

  const handleChangeResults = (letter: string, value: string) => {
    const updatedPoints = results2.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setResult2(updatedPoints);
  };

  const handleChangeGPA = (letter: string, value: string) => {
    const updatedPoints = gpa.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setGpa(updatedPoints);
  };

  const handleSubmit2 = () => {
    setEdit(!edit);

    axios.post(`/api/exams/grading/1`, points2);
    axios.post(`/api/exams/grading/2`, grades2);
    axios.post(`/api/exams/grading/3`, letters2);
    axios.post(`/api/exams/grading/4`, year);
    axios.post(`/api/exams/grading/5`, results2);
    axios
      .post(`/api/exams/grading/6`, gpa)
      .then(() => {
        toast.success('تم التعديل بنجاح');
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل توزيع الدراجات',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch(() => {
        toast.error('حدث خطأ اثناء التعديل');
      });
  };

  return (
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 13 && permItem.edit) {
          return (
            <button
              key={idx}
              className="m-2 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
              type="submit"
              onClick={() => (edit ? handleSubmit2() : setEdit(!edit))}
            >
              {edit ? 'ارسال' : 'تعديل'}
            </button>
          );
        } else {
          return null;
        }
      })}

      {gpa && gpa.length > 0 ? (
        edit ? (
          <div className="w-[500px] flex flex-row m-3">
            <input
              className="w-20 p-2 bg-gray-200 border-2 border-black rounded-md ml-4"
              value={gpa[0].AA || ''}
              onChange={(e) => {
                handleChangeGPA('AA', e.target.value);
              }}
              placeholder="ادخل الدرجة"
              type="text"
            />
            <h1 className="w-[200px] p-2 bg-gray-200 rounded-md ml-4">
              المجموع المطلوب لنجاح المشروط
            </h1>
          </div>
        ) : (
          <div className="w-[500px] flex flex-row m-3">
            <h1 className="w-20 p-2 bg-gray-200 border-2 border-black rounded-md ml-4">
              {gpa[0].AA}
            </h1>
            <h1 className="w-[200px] p-2 bg-gray-200 rounded-md ml-4 flex fex-end">
              :المجموع المطلوب لنجاح المشروط
            </h1>
          </div>
        )
      ) : (
        ''
      )}

      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 13 && permItem.see) {
          return (
            <table className="w-[300px] h-[600px]" key={idx}>
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                    النقاط
                  </th>
                  <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                    الدرجة
                  </th>
                  <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                    الحرف
                  </th>
                  <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                    نجاح/رسوب
                  </th>
                </tr>
              </thead>
              {points.length > 0 &&
                points.map((point, index) => {
                  const grade = grades.find((l) => l);
                  const grade2 = grades2.find((l) => l);
                  const Point2 = points2.find((p) => p);
                  const letter = letters.find((p) => p);
                  const letter2 = letters2.find((p) => p);
                  const result = results.find((p) => p);
                  const result2 = results2.find((p) => p);
                  return edit ? (
                    <tbody key={index + 3}>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.AA || 0}
                            onChange={(e) => {
                              handleChangePoints('AA', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.AA || 0}
                            onChange={(e) => {
                              handleChangeGrades('AA', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.AA || ''}
                            onChange={(e) => {
                              handleChangeLetters('AA', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('AA', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.AA}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.BA || 0}
                            onChange={(e) => {
                              handleChangePoints('BA', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.BA || 0}
                            onChange={(e) => {
                              handleChangeGrades('BA', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.BA || ''}
                            onChange={(e) => {
                              handleChangeLetters('BA', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('BA', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.BA}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.BB || 0}
                            onChange={(e) => {
                              handleChangePoints('BB', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.BB || 0}
                            onChange={(e) => {
                              handleChangeGrades('BB', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.BB || ''}
                            onChange={(e) => {
                              handleChangeLetters('BB', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('BB', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.BB}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.CB || 0}
                            onChange={(e) => {
                              handleChangePoints('CB', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.CB || 0}
                            onChange={(e) => {
                              handleChangeGrades('CB', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.CB || ''}
                            onChange={(e) => {
                              handleChangeLetters('CB', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('CB', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.CB}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.CC || 0}
                            onChange={(e) => {
                              handleChangePoints('CC', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.CC || 0}
                            onChange={(e) => {
                              handleChangeGrades('CC', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.CC || ''}
                            onChange={(e) => {
                              handleChangeLetters('CC', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('CC', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.CC}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.DC || 0}
                            onChange={(e) => {
                              handleChangePoints('DC', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.DC || 0}
                            onChange={(e) => {
                              handleChangeGrades('DC', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.DC || ''}
                            onChange={(e) => {
                              handleChangeLetters('DC', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('DC', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.DC}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.DD || 0}
                            onChange={(e) => {
                              handleChangePoints('DD', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.DD || 0}
                            onChange={(e) => {
                              handleChangeGrades('DD', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.DD || ''}
                            onChange={(e) => {
                              handleChangeLetters('DD', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('DD', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.DD}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.FD || 0}
                            onChange={(e) => {
                              handleChangePoints('FD', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.FD || 0}
                            onChange={(e) => {
                              handleChangeGrades('FD', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.FD || ''}
                            onChange={(e) => {
                              handleChangeLetters('FD', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('FD', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.FD}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.FF || 0}
                            onChange={(e) => {
                              handleChangePoints('FF', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.FF || 0}
                            onChange={(e) => {
                              handleChangeGrades('FF', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.FF || ''}
                            onChange={(e) => {
                              handleChangeLetters('FF', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('FF', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.FF}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          {point.AA || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.AA}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.AA}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.AA}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          {point.BA || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.BA}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.BA}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.BA}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          {point.BB || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.BB}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.BB}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.BB}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2"
                          key={point.id}
                        >
                          {point.CB || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.CB}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.CB}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.CB}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2"
                          key={point.id}
                        >
                          {point.CC || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.CC}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.CC}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px] ">
                          {result?.CC}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2"
                          key={point.id}
                        >
                          {point.DC || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.DC}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.DC}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.DC}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2"
                          key={point.id}
                        >
                          {point.DD || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.DD}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.DD}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.DD}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2"
                          key={point.id}
                        >
                          {point.FD || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.FD}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.FD}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.FD}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2"
                          key={point.id}
                        >
                          {point.FF || 0}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.FF}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.FF}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.FF}
                        </td>
                      </tr>
                    </tbody>
                  );
                })}
            </table>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
};

export default Page;
