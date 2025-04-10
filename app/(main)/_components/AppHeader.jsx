import { UserButton } from '@stackframe/stack'
import Image from 'next/image'
import React from 'react'

const AppHeader = () => {
  return (
    <div className='p-3 shadow-sm flex justify-between items-center'>
      <Image src={'/logo.jpg'} alt='logo'
      width={200}
      height={200}/>
      <UserButton/>
    </div>
  )
}

export default AppHeader
