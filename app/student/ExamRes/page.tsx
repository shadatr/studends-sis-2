import React from 'react';

interface Item {
  id: number;
  name: string;
  mid: string;
  final: string;
  passingGrade: string;
  avrg: string
  hw: string
}

const examsData: Item[] = [
  {
    id: 1,
    name: "اسم المادة",
    mid: "56",
    final: "78",
    passingGrade: "76",
    avrg: "86",
    hw: "65",
  },
  {
    id: 2,
    name: "اسم المادة",
    mid: "56",
    final: "78",
    passingGrade: "76",
    avrg: "86",
    hw: "65",
  },
  {
    id: 3,
    name: "اسم المادة",
    mid: "56",
    final: "78",
    passingGrade: "76",
    avrg: "86",
    hw: "65",
  },
  {
    id: 4,
    name: "اسم المادة",
    mid: "56",
    final: "78",
    passingGrade: "76",
    avrg: "86",
    hw: "65",
  },
  {
    id: 5,
    name: "اسم المادة",
    mid: "56",
    final: "78",
    passingGrade: "76",
    avrg: "86",
    hw: "65",
  },
];

const title: string[] = ["اسم المادة", "الامتحان النصفي", "الامتحان النهائي","اعمال السنة","المعدل","معدل النجاح"];

const page = () => {
    const results = examsData.map((exam) => (
      <tr key={exam.id}>
        <td className=" text-sm p-3">{exam.passingGrade}</td>
        <td className=" text-sm p-3">{exam.avrg}</td>
        <td className=" text-sm p-3">{exam.hw}</td>
        <td className=" text-sm p-3">{exam.final}</td>
        <td className=" text-sm p-3">{exam.mid}</td>
        <td className=" text-sm p-3">{exam.name}</td>
      </tr>
    ));

    const titles = title.map((t) => (
      <th className=" text-sm p-3">{t} </th>
    ));

  return (
    <div>
      <table className="fixed w-[900px] right-[464px] top-[230px]">
        <tr className="bg-darkBlue text-secondary">{titles}</tr>
        {results}
      </table>
    </div>
  );
};

export default page;
