// import { useState } from 'react'
import './App.css'
import Home from './Components/Home/Home'
import Room from './Components/Room/Room'
import Main from './Components/Editor/Main'
import Dataprovider from './context/DataProvider'

import { Route, Routes } from 'react-router-dom'

function App() {
  // const [count, setCount] = useState(0)

  return (

    <Dataprovider>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/room/:id' element={<Room />} />
        <Route path='/editor' element={<Main />} />
      </Routes>
    </Dataprovider>

  )
}

export default App;
