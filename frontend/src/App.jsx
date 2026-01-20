import { useEffect } from 'react'
import {Routes, Route, Navigate} from 'react-router'
import Homepage from './pages/Homepage';
import Login from './pages/Login'
import Signup from './pages/Signup';
import { checkAuth } from './authSlice';
import { useSelector, useDispatch } from 'react-redux';

function App() {
  
  const {isAuthenticated, loading} = useSelector(state=>state.auth);
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(checkAuth());
  }, [dispatch])

  if(loading){
    return(
      <div className='bg-[#222222] min-h-screen flex justify-center items-center'>
        <span className='loading loading-spinner loading-lg'></span>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated?<Homepage/>:<Navigate to="/signup"/>}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/"/>:<Login/>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/"/>:<Signup/>}></Route>
    </Routes>
  )
}

export default App
