import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import BeatCodeLogo from '../assets/beatcodeLogoCircle.png'
import { useSelector, useDispatch } from 'react-redux'
import { loginUser } from '../authSlice'
import { useEffect, useState } from 'react'

const loginSchema = z.object({
    emailId: z.email("Invalid email address"),
    password: z.string().min(8, "Password is too weak")
})

export default function Login() {

    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });
    const { isAuthenticated, loading, error } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated)
            navigate('/');
    }, [isAuthenticated, navigate])

    const onSubmit = (credentials) => {
        dispatch(loginUser(credentials));
    }

    return (
        <div className="bg-[#222222] min-h-screen flex items-center justify-center p-4">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body bg-[#282828] rounded-md text-white">
                    <img className="w-12 h-12 mx-auto mt-4" src={BeatCodeLogo} />
                    <h2 className="card-title justify-center text-2xl font-[Trebuchet_MS]"><p className='text-center'><span className="text-orange-300">Beat</span>Code</p></h2>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        <div className="form-control mt-6">
                            <input
                                type="email"
                                placeholder="E-mail address"
                                className={`input bg-[#2A2A2A] ${errors.emailId && 'input-error'}`}
                                {...register('emailId')}
                            />
                            {errors.emailId && (
                                <span className="text-error">{errors.emailId.message}</span>
                            )}
                        </div>

                        <div className="form-control mt-6">
                            <div className='relative'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={`input bg-[#2A2A2A] ${errors.password && 'input-error'}`}
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <span className="text-error">{errors.password.message}</span>
                                )}
                                <button
                                    type="button"
                                    className='absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-600'
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>

                                    )
                                    }
                                </button>
                            </div>
                        </div>

                        <div className="form-control mt-6 flex justify-center">
                            <button
                                type="submit"
                                className={`btn bg-[#F5F5F5] ${loading? 'loading' : ''} hover:bg-orange-400 hover:text-white text-[#3b3a3a]`}
                                disabled={loading}
                            >
                                {loading ? <span className="loading loading-spinner"></span> : 'Sign In'}
                            </button>
                        </div>
                    </form>
                    <div className='mx-auto text-center'>
                        <span>Don't have an account? </span><Link className='text-blue-400 underline' to="/signup">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
