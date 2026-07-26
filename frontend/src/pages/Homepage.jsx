import { useState, useEffect } from "react"
import { NavLink } from "react-router"
import { useSelector, useDispatch } from "react-redux"
import axiosClient from "../utils/axiosClient"
import { logoutUser } from "../authSlice"
import toast from 'react-hot-toast';
import BeatCodeLogo from "../assets/beatcodeLogoCircle.png"

function Homepage() {

    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState(null);
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

    const deleteProblem = async () => {
        if (!deleteId)
            return;
        try {
            const id = deleteId;
            setDeleteId(null); // reset the delete id state to null
            
            await axiosClient.delete(`/problem/delete/${id}`);

            // remove the problem from problem list
            const filteredProblems = problems.filter(problem => problem._id !== id);
            setProblems(filteredProblems);
            toast.success("Problem Deleted Successfully.");
        }
        catch (err) {
            toast.error("Error deleting the problem.");
        }
    }

    const handleLogout = () => {
        dispatch(logoutUser());
        setSolvedProblems([]); // clear solved problems on logout
    }

    const filteredProblems = problems.filter(problem => {
        const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
        const tagsMatch = filters.tags === 'all' || problem.tags === filters.tags;
        const statusMatch = filters.status === 'all' || solvedProblems.some(sp => sp._id === problem._id);
        const searchMatch =
            problem.title.toLowerCase().includes(search.toLowerCase());
        return difficultyMatch && tagsMatch && statusMatch && searchMatch;
    })

    return (
        <div className="min-h-screen relative bg-[#222222]">
            {/* Navigation Bar */}
            <nav className="navbar bg-[#2A2A2A] shadow-lg px-4">
                {/* Logo */}
                <div className="flex-1 items-center flex gap-4">
                    <NavLink to="/" className='flex items-center gap-2'>
                        <img className="w-8 h-8" src={BeatCodeLogo} />
                        <h2 className="text-2xl font-bold font-[Trebuchet_MS]"><span className="text-orange-300">Beat</span>Code</h2>
                    </NavLink>
                    {user.role === 'admin' && (<h2 className="font-semibold text-orange-300 translate-0.5 italic font-mono font-lg">Admin</h2>)}
                </div>

                {/* User Info and Logout */}
                <div className="flex-none gap-4">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} className="cursor-pointer hover:bg-[#3a3a3a]  flex gap-2 items-center justify-center px-4 text-sm font-semibold py-2 rounded-full">
                            <svg width="18" height="18" viewBox="0 0 118 121" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g filter="url(#filter0_d_41_910)">
                                    <path d="M108.167 59C108.167 86.1538 86.1537 108.167 58.9999 108.167C31.8459 108.167 9.83325 86.1538 9.83325 59C9.83325 31.846 31.8459 9.83333 58.9999 9.83333C86.1537 9.83333 108.167 31.846 108.167 59Z" fill="#2F2F2F" />
                                    <path d="M108.167 59C108.167 86.1538 86.1537 108.167 58.9999 108.167C31.8459 108.167 9.83325 86.1538 9.83325 59C9.83325 31.846 31.8459 9.83333 58.9999 9.83333C86.1537 9.83333 108.167 31.846 108.167 59Z" stroke="white" strokeWidth="8.5" />
                                </g>
                                <path d="M72.5209 46.7083C72.5209 54.1758 66.4675 60.2292 59.0001 60.2292C51.5326 60.2292 45.4792 54.1758 45.4792 46.7083C45.4792 39.241 51.5326 33.1875 59.0001 33.1875C66.4675 33.1875 72.5209 39.241 72.5209 46.7083Z" stroke="white" strokeWidth="8.5" />
                                <path d="M26.6665 95.1111L29.4254 89.7873C33.808 81.3307 41.9642 76.1111 50.7978 76.1111H66.5355C75.369 76.1111 83.5251 81.3307 87.9076 89.7873L90.6665 95.1111" fill="#2F2F2F" />
                                <path d="M26.6665 95.1111L29.4254 89.7873C33.808 81.3307 41.9642 76.1111 50.7978 76.1111H66.5355C75.369 76.1111 83.5251 81.3307 87.9076 89.7873L90.6665 95.1111" stroke="white" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            <span className="-translate-y-px">{user?.firstName}</span>
                        </div>
                        <ul className="mt-5 p-2 bg-[#2A2A2A] shadow menu menu-sm dropdown-content rounded-box w-60">
                            <li>
                                <div className="flex items-center gap-4">
                                    <svg width="40" height="40" viewBox="0 0 118 121" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g filter="url(#filter0_d_41_910)">
                                            <path d="M108.167 59C108.167 86.1538 86.1537 108.167 58.9999 108.167C31.8459 108.167 9.83325 86.1538 9.83325 59C9.83325 31.846 31.8459 9.83333 58.9999 9.83333C86.1537 9.83333 108.167 31.846 108.167 59Z" fill="#2F2F2F" />
                                            <path d="M108.167 59C108.167 86.1538 86.1537 108.167 58.9999 108.167C31.8459 108.167 9.83325 86.1538 9.83325 59C9.83325 31.846 31.8459 9.83333 58.9999 9.83333C86.1537 9.83333 108.167 31.846 108.167 59Z" stroke="white" strokeWidth="8.5" />
                                        </g>
                                        <path d="M72.5209 46.7083C72.5209 54.1758 66.4675 60.2292 59.0001 60.2292C51.5326 60.2292 45.4792 54.1758 45.4792 46.7083C45.4792 39.241 51.5326 33.1875 59.0001 33.1875C66.4675 33.1875 72.5209 39.241 72.5209 46.7083Z" stroke="white" strokeWidth="8.5" />
                                        <path d="M26.6665 95.1111L29.4254 89.7873C33.808 81.3307 41.9642 76.1111 50.7978 76.1111H66.5355C75.369 76.1111 83.5251 81.3307 87.9076 89.7873L90.6665 95.1111" fill="#2F2F2F" />
                                        <path d="M26.6665 95.1111L29.4254 89.7873C33.808 81.3307 41.9642 76.1111 50.7978 76.1111H66.5355C75.369 76.1111 83.5251 81.3307 87.9076 89.7873L90.6665 95.1111" stroke="white" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" />
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
                                        <path d="M160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0zM502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
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
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option className="hover:bg-orange-400" value="all">Problems</option>
                        <option className="hover:bg-orange-400" value="solved">Solved Problems</option>
                    </select>

                    <select
                        className="bg-[#2A2A2A] max-w-75 select select-bordered"
                        value={filters.difficulty}
                        onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    >
                        <option className="hover:bg-orange-400" value="all">Difficulty Level</option>
                        <option className="hover:bg-orange-400" value="easy">Easy</option>
                        <option className="hover:bg-orange-400" value="medium">Medium</option>
                        <option className="hover:bg-orange-400" value="hard">Hard</option>
                    </select>

                    <select
                        className="bg-[#2A2A2A] max-w-75 select select-bordered"
                        value={filters.tags}
                        onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
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
                {user.role === 'admin' && (
                    <div className="btn rounded-full mb-6 bg-orange-400/90 font-bold tracking-wide">
                        <NavLink to="/admin/create">✚ Create Problem</NavLink>
                    </div>
                )}

                {/* Problems List */}
                <div className="grid gap-5">
                    {filteredProblems.length ?
                        (filteredProblems.map(problem => (
                            <div
                                key={problem._id}
                                className="group card bg-[#2A2A2A] border border-gray-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                            >
                                <div className="card-body p-6">
                                    {/* Header with title and solved badge */}
                                    <div className="flex items-start justify-between gap-4">
                                        <h2 className="text-xl font-semibold tracking-tight">
                                            <NavLink
                                                to={`problem/${problem._id}`}
                                                className="hover:text-primary transition-colors duration-200"
                                            >
                                                {problem.title}
                                            </NavLink>
                                        </h2>
                                        {solvedProblems.some(sp => sp._id == problem._id) && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Solved
                                            </div>
                                        )}
                                    </div>

                                    {/* Meta badges - difficulty & tags */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <div className={`px-3 py-1 rounded-full badge text-white text-xs font-medium border ${difficultyColor[problem.difficulty]}`}>
                                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                                            {problem.tags.charAt(0).toUpperCase() + problem.tags.slice(1)}
                                        </div>
                                    </div>

                                    {/* Admin actions - only visible to admin */}
                                    {user.role === 'admin' && (
                                        <>
                                            <div className="border-t border-gray-700/50 my-2"></div>
                                            <div className="flex items-center gap-3">
                                                <NavLink to={`/admin/update/${problem._id}`}>
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-sm font-medium transition-colors duration-200 border border-yellow-500/20 hover:border-yellow-500/40">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                        Update
                                                    </div>
                                                </NavLink>
                                                <button
                                                    className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium transition-colors duration-200 border border-red-500/20 hover:border-red-500/40"
                                                    onClick={() => setDeleteId(problem._id)}
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="mb-4">
                                    <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-gray-300 mb-1">No Problems Found</h3>
                                <p className="text-sm text-gray-400 max-w-sm mb-5">
                                    {search || filters.difficulty !== 'all' || filters.tags !== 'all' || filters.status !== 'all'
                                        ? "Try adjusting your filters or search term."
                                        : "There are no problems available at the moment."}
                                </p>
                            </div>
                        )
                    }
                </div>
            </div>

            {/* Delete Problem */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black opacity-90">
                    <div className="bg-[#2A2A2A] p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4 text-white">Confirm Delete</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete this problem?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                className="btn btn-outline hover:bg-[#222222] text-white border-white"
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error bg-red-600 hover:bg-red-700 border-none shadow-none text-white"
                                onClick={deleteProblem}
                                disabled={!deleteId}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const difficultyColor = {
    easy: 'bg-green-400 border-green-500/30',
    medium: 'bg-yellow-400/90 border-yellow-500/30',
    hard: 'bg-red-500/90 border-red-500/30'
};

export default Homepage
