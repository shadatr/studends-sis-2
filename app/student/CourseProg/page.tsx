import { useSession } from "next-auth/react"
import { it } from "node:test"
import React from "react"

interface Item {
  h1: string
  h2: string
}

interface Course {
  id: number
  name: string
  hour: string[]
}

const days: Course[] = [
  {
    id: 1,
    name: "الاحد",
    hour: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  },
  {
    id: 2,
    name: "الاثنين",
    hour: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  },
  {
    id: 3,
    name: "الثلثاء",
    hour: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  },
  {
    id: 4,
    name: "الاربعاء",
    hour: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  },
  {
    id: 5,
    name: "الخميس",
    hour: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  },
  {
    id: 6,
    name: "الجمعة",
    hour: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  },
  {
    id: 7,
    name: "السبت",
    hour: [" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
  },
]

const hours: Item[] = [
  { h1: "19:00", h2: "20:00" },
  { h1: "18:00", h2: "19:00" },
  { h1: "17:00", h2: "18:00" },
  { h1: "16:00", h2: "17:00" },
  { h1: "15:00", h2: "16:00" },
  { h1: "14:00", h2: "15:00" },
  { h1: "13:00", h2: "14:00" },
  { h1: "12:00", h2: "13:00" },
  { h1: "11:00", h2: "12:00" },
  { h1: "10:00", h2: "11:00" },
  { h1: "9:00", h2: "10:00" },
  { h1: "8:00", h2: "9:00" },
]

const page = () => {
  const session = useSession({ required: true })

  const hoursCol = hours.map((hour) => (
    <th className="text-center bg-darkBlue text-secondary">
      <div>{hour.h1}</div>
      <div>{hour.h2}</div>
    </th>
  ))

  const table = days.map((item) => (
    <tr key={item.id}>
      {item.hour.map((i) => (
        <td className="text-center">{i}</td>
      ))}
      <td className="text-center bg-darkBlue text-secondary">{item.name}</td>
    </tr>
  ))

  return (
    <table className=" fixed max-w-[1200px] w-[1200px] h-[500px] text-sm top-[180px] right-[280px] bg-lightBlue">
      {hoursCol}
      {table}
    </table>
  )
}

export default page
