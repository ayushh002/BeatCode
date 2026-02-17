import { useEffect } from 'react'
import {Routes, Route, Navigate} from 'react-router'
import Homepage from './pages/Homepage';
import Login from './pages/Login'
import Signup from './pages/Signup';
import ProblemPage from './pages/ProblemPage';
import { checkAuth } from './authSlice';
import { useSelector, useDispatch } from 'react-redux';
import UpdateProblem from './components/UpdateProblem';
import CreateProblem from './components/CreateProblem';
import UploadVideo from './components/UploadVideo';

function App() {
  
  const {user, isAuthenticated, loading} = useSelector(state=>state.auth);
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
      <Route path="/" element={isAuthenticated?<Homepage/>:<Navigate to="/login"/>}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/"/>:<Login/>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/"/>:<Signup/>}></Route>
      <Route path="/problem/:problemId" element={isAuthenticated?<ProblemPage/>:<Navigate to="/login"/>}></Route>
      <Route path="/admin/create" element={(isAuthenticated && user?.role==='admin')?<CreateProblem/>:<Navigate to="/"/>}></Route>
      <Route path="/admin/update/:id" element={(isAuthenticated && user?.role==='admin')?<UpdateProblem/>:<Navigate to="/"/>}></Route>
      <Route path="/admin/upload/:problemId" element={(isAuthenticated && user?.role==='admin')?<UploadVideo/>:<Navigate to="/"/>}></Route>
    </Routes>
  )
}

export default App
