import React, {useState} from 'react';
import { Link } from 'react-router-dom'





const Login = () => {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const handleSubmit = async (props) => {
        console.log('p?', props)


        const AUTH_HOST = 'http://localhost:4445';

        await fetch(`${AUTH_HOST}/login`, {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                project: 'TIG'
            })
        })
            .then(res => console.log('res?', res.json()))
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ">

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-md sm:px-10">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md border-b border-gray-200">
                        <h2 className="text-xl font-medium text-gray-900">NYMTC</h2>
                        <p className="text-lg font-thin text-gray-600">
              <span href="#" className="font-thin text-blue-400 hover:text-blue-500">
               Login
              </span>
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className='pt-4'>
                            <label htmlFor="email" className="block text-sm font-thin text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={ e => setEmail(e.target.value) }
                                    autoComplete="email"
                                    placeholder='Enter your email'
                                    required
                                    className="appearance-none block w-full px-3 py-2 border-b border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-thin text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    placeholder='Enter your password'
                                    required
                                    className="appearance-none block w-full px-3 py-2 border-b border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to='/auth/login' className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                // type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={e => handleSubmit(e)}
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default {
    path: "/login",
    mainNav: false,
    layout: 'Simple',
    layoutSettings: {
        fixed: true,
        navBar: 'top',
        headerBar: false
    },
    component: Login
}