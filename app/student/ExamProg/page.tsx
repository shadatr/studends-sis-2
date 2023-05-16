import { useSession } from "next-auth/react";
import React from "react";

interface Item {
  id: number
  name: string
  date: string
  place: string
}

const examsData: Item[] = [
  { id: 1, name: "اسم المادة", date: "تاريخ", place: "435" },
  { id: 2, name: "اسم المادة", date: "تاريخ", place: "435" },
  { id: 3, name: "اسم المادة", date: "تاريخ", place: "435" },
  { id: 4, name: "اسم المادة", date: "تاريخ", place: "435" },
  { id: 5, name: "اسم المادة", date: "تاريخ", place: "435" },
  { id: 6, name: "اسم المادة", date: "تاريخ", place: "435" },
];

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a student, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }
  
  const exams = examsData.map((exam) => (
    <tr key={exam.id}>
      <td className=" text-sm p-3">{exam.place}</td>
      <td className=" text-sm p-3">{exam.date}</td>
      <td className=" text-sm p-3">{exam.name}</td>
    </tr>
  ));

  return (
    <table className="fixed w-[800px] top-[250px] right-[464px] text-sm p-3">
      <tr className="bg-darkBlue text-secondary">
        <th className=" text-sm p-3">رقم القاعة</th>
        <th className=" text-sm p-3">تاريخ الامتحان</th>
        <th className=" text-sm p-3">اسم المادة</th>
      </tr>
      {exams}
    </table>
  );
};

export default Page;
