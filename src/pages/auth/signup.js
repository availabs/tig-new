import React, {useState} from 'react';
import TigLayout from 'components/tig/TigLayout'

import { Link } from 'react-router-dom'





const SignUp = () => {
    const [email, setEmail] = useState();
    const [phone, setPhone] = useState();
    const [password, setPassword] = useState();
    const [verifyPassword, setVerifyPassword] = useState();

    const handleSubmit = async (props) => {
        console.log('p?', props)


        const AUTH_HOST = 'http://localhost:4445';

        await fetch(`${AUTH_HOST}/signup/request`, {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                project: 'TIG'
            })
        })
            .then(res => console.log('res?', res.json()))
    }

    return (
        <TigLayout>
            <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-gray-100 py-8 px-4 shadow-lg sm:rounded-md sm:px-10 border-t-4 border-tigGreen-100">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md border-b border-gray-200">
                        <h2 className="text-xl font-medium text-gray-900">NYMTC</h2>
                        <p className="text-lg font-thin text-gray-600">
              <span href="#" className="font-thin text-orange-400 hover:text-tigGray-500">
               Sign Up
              </span>
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className='pt-4'>
                            <label htmlFor="email" className="block text-sm font-thin text-gray-700">
                                * Email
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

                        <div className='pt-4'>
                            <label htmlFor="phone" className="block text-sm font-thin text-gray-700">
                                Phone
                            </label>
                            <div className="mt-1">
                                <input
                                    id="phone"
                                    name="phone"
                                    type="phone"
                                    value={phone}
                                    onChange={ e => setPhone(e.target.value) }
                                    placeholder='Enter your phone'
                                    required
                                    className="appearance-none block w-full px-3 py-2 border-b border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-thin text-gray-700">
                                * Password
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

                        <div>
                            <label htmlFor="verifyPassword" className="block text-sm font-thin text-gray-700">
                                * Password confirmation
                            </label>
                            <div className="mt-1">
                                <input
                                    id="verifyPassword"
                                    name="verifyPassword"
                                    type="password"
                                    value={verifyPassword}
                                    onChange={e => setVerifyPassword(e.target.value)}
                                    autoComplete="current-password"
                                    placeholder='Enter your password'
                                    required
                                    className="appearance-none block w-full px-3 py-2 border-b border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                disabled={ password !== verifyPassword }
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:text-orange-300 bg-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={e => handleSubmit(e)}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </TigLayout>
    )
}

export default {
    path: "/signup",
    mainNav: false,
    layout: 'Simple',
    layoutSettings: {
        fixed: true,
        navBar: 'top',
        headerBar: false
    },
    component: SignUp
}