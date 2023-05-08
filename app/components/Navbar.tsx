// "use client"
import { useSession, signOut } from "next-auth/react"
import React from "react"

const Navbar = () => {
  const session = useSession()
  return (
    <div className="flex justify-between text-lg text-left p-[35px] bg-darkBlue text-secondary">
      <p>جامعة طرابلس</p>
      <button onClick={() => (signOut({redirect : true, callbackUrl : "/"}))} >logout</button>
    </div>
  )
}

export default Navbar
