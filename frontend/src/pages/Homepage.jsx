import { useState, useEffect } from "react"
import { NavLink } from "react-router"
import { useSelector, useDispatch } from "react-redux"
import axiosClient from "../utils/axiosClient"
import { logoutUser } from "../authSlice"
import BeatCodeLogo from "../assets/beatcodeLogoCircle.png"

function Homepage() {

    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [search, setSearch] = useState("");
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState([]);
    const [filters, setFilters] = useState({
        difficulty: 'all',
        tags: 'all',
        status: 'all'
    });

    useEffect(() => {
        async function fetchProblems() {
            try {
                const response = await axiosClient.get('/problem/list');
                setProblems(response.data.problems);
            }
            catch (err) {
                console.error("Error Fetching Problems: ", err);
            }
        }
        async function fetchSolvedProblems() {
            try {
                const response = await axiosClient.get('/problem/solved-by-user');
                setSolvedProblems(response.data.problems);
            }
            catch (err) {
                console.error("Error Fetching Problems: ", err);
            }
        }

        fetchProblems();
        if (user) fetchSolvedProblems();
    }, [user])


    const handleLogout = () => {
        dispatch(logoutUser());
        setSolvedProblems([]); // clear solved problems on logout
    }

    const filteredProblems = problems.filter(problem => {
        const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
        const tagsMatch = filters.tags === 'all' || problem.tags === filters.tags;
        const statusMatch = filters.status === 'all' || solvedProblems.some(sp => sp._id === problem._id);
        const searchMatch = problem.title.toLowerCase().includes(search.toLowerCase());
        return difficultyMatch && tagsMatch && statusMatch && searchMatch;
    })

    return (
        <div className="min-h-screen bg-[#222222]">
            {/* Navigation Bar */}
            <nav className="navbar bg-[#2A2A2A] shadow-lg px-4">
                {/* Logo */}
                <div className="flex-1">
                    <NavLink to="/" className='flex items-center gap-2'>
                        <img className="w-8 h-8" src={BeatCodeLogo} />
                        <h2 className="text-2xl font-bold font-[Trebuchet_MS]"><span className="text-orange-300">Beat</span>Code</h2>
                    </NavLink>
                </div>

                {/* User Info and Logout */}
                <div className="flex-none gap-4">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} className="cursor-pointer hover:bg-[#3a3a3a]  flex gap-2 items-center justify-center px-4 text-sm font-semibold py-2 rounded-full">
                            <svg width="18" height="18" viewBox="0 0 118 121" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g filter="url(#filter0_d_41_910)">
                                    <path d="M108.167 59C108.167 86.1538 86.1537 108.167 58.9999 108.167C31.8459 108.167 9.83325 86.1538 9.83325 59C9.83325 31.846 31.8459 9.83333 58.9999 9.83333C86.1537 9.83333 108.167 31.846 108.167 59Z" fill="#2F2F2F" />
                                    <path d="M108.167 59C108.167 86.1538 86.1537 108.167 58.9999 108.167C31.8459 108.167 9.83325 86.1538 9.83325 59C9.83325 31.846 31.8459 9.83333 58.9999 9.83333C86.1537 9.83333 108.167 31.846 108.167 59Z" stroke="white" stroke-width="8.5" />
                                </g>
                                <path d="M72.5209 46.7083C72.5209 54.1758 66.4675 60.2292 59.0001 60.2292C51.5326 60.2292 45.4792 54.1758 45.4792 46.7083C45.4792 39.241 51.5326 33.1875 59.0001 33.1875C66.4675 33.1875 72.5209 39.241 72.5209 46.7083Z" stroke="white" stroke-width="8.5" />
                                <path d="M26.6665 95.1111L29.4254 89.7873C33.808 81.3307 41.9642 76.1111 50.7978 76.1111H66.5355C75.369 76.1111 83.5251 81.3307 87.9076 89.7873L90.6665 95.1111" fill="#2F2F2F" />
                                <path d="M26.6665 95.1111L29.4254 89.7873C33.808 81.3307 41.9642 76.1111 50.7978 76.1111H66.5355C75.369 76.1111 83.5251 81.3307 87.9076 89.7873L90.6665 95.1111" stroke="white" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>

                            <span className="-translate-y-[1px]">{user?.firstName}</span>
                        </div>
                        <ul className="mt-5 p-2 bg-[#2A2A2A] shadow menu menu-sm dropdown-content rounded-box w-60">
                            <li>
                                <div className="flex items-center gap-4">
                                    <svg width="40" height="40" viewBox="0 0 118 121" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g filter="url(#filter0_d_41_910)">
                                            <path d="M108.167 59C108.167 86.1538 86.1537 108.167 58.9999 108.167C31.8459 108.167 9.83325 86.1538 9.83325 59C9.83325 31.846 31.8459 9.83333 58.9999 9.83333C86.1537 9.83333 108.167 31.846 108.167 59Z" fill="#2F2F2F" />
                                            <path d="M108.167 59C108.167 86.1538 86.1537 108.167 58.9999 108.167C31.8459 108.167 9.83325 86.1538 9.83325 59C9.83325 31.846 31.8459 9.83333 58.9999 9.83333C86.1537 9.83333 108.167 31.846 108.167 59Z" stroke="white" stroke-width="8.5" />
                                        </g>
                                        <path d="M72.5209 46.7083C72.5209 54.1758 66.4675 60.2292 59.0001 60.2292C51.5326 60.2292 45.4792 54.1758 45.4792 46.7083C45.4792 39.241 51.5326 33.1875 59.0001 33.1875C66.4675 33.1875 72.5209 39.241 72.5209 46.7083Z" stroke="white" stroke-width="8.5" />
                                        <path d="M26.6665 95.1111L29.4254 89.7873C33.808 81.3307 41.9642 76.1111 50.7978 76.1111H66.5355C75.369 76.1111 83.5251 81.3307 87.9076 89.7873L90.6665 95.1111" fill="#2F2F2F" />
                                        <path d="M26.6665 95.1111L29.4254 89.7873C33.808 81.3307 41.9642 76.1111 50.7978 76.1111H66.5355C75.369 76.1111 83.5251 81.3307 87.9076 89.7873L90.6665 95.1111" stroke="white" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <div className="flex text-[12px] gap-1 flex-col">
                                        <span>{user.firstName}</span>
                                        <span>{user.emailId}</span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <button className="hover:bg-orange-400 pl-5 flex gap-6 mt-2" onClick={handleLogout}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#ffffff" width="20" height="20">
                                        <path d="M160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0zM502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"/>
                                    </svg>
                                    <span>Logout</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto p-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">

                    <select 
                        className="bg-[#2A2A2A] max-w-75 select select-bordered"
                        value={filters.status}
                        onChange={(e)=>setFilters({...filters, status:e.target.value})}
                    >
                        <option className="hover:bg-orange-400" value="all">Problems</option>
                        <option className="hover:bg-orange-400" value="solved">Solved Problems</option>
                    </select>

                    <select 
                        className="bg-[#2A2A2A] max-w-75 select select-bordered"
                        value={filters.difficulty}
                        onChange={(e)=>setFilters({...filters, difficulty:e.target.value})}
                    >
                        <option className="hover:bg-orange-400" value="all">Difficulty Level</option>
                        <option className="hover:bg-orange-400" value="easy">Easy</option>
                        <option className="hover:bg-orange-400" value="medium">Medium</option>
                        <option className="hover:bg-orange-400" value="hard">Hard</option>
                    </select>

                    <select 
                        className="bg-[#2A2A2A] max-w-75 select select-bordered"
                        value={filters.tags}
                        onChange={(e)=>setFilters({...filters, tags:e.target.value})}
                    >
                        <option className="hover:bg-orange-400" value="all">Topic</option>
                        <option className="hover:bg-orange-400" value="math">Math</option>
                        <option className="hover:bg-orange-400" value="array">Array</option>
                        <option className="hover:bg-orange-400" value="string">String</option>
                        <option className="hover:bg-orange-400" value="recursion">Recursion</option>
                        <option className="hover:bg-orange-400" value="linkedList">Linked List</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search"
                        className="input input-bordered bg-[#2A2A2A] max-w-75"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

                {/* Problems List */}
                <div className="grid gap-4">
                    {filteredProblems.map(problem=>(
                        <div key={problem._id} className="card hover:scale-101 transition duration-300 shadow-md bg-[#2A2A2A]">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <h2 className="card-title">
                                        <NavLink to={`problem/get/${problem._id}`} className="hover:text-primary">
                                            {problem.title}
                                        </NavLink>
                                    </h2>
                                    {solvedProblems.some(sp=>sp._id==problem._id) && (
                                        <div className="badge badge-success gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Solved
                                        </div>
                                    )}
                                </div>   
                                <div className="flex gap-2">
                                    <div className={` text-white font-semibold badge ${getDifficultyBadgeColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </div>
                                    <div className=" text-white font-semibold badge badge-primary">
                                        {problem.tags}
                                    </div>
                                </div> 
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </div>
    )
}

function getDifficultyBadgeColor(difficulty){
    switch(difficulty.toLowerCase()){
        case 'easy': return 'badge-success';
        case 'medium': return 'badge-warning';
        case 'hard': return 'badge-error';
        default: return 'badge-neutral';
    }
}

export default Homepage