import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import { updateUserData } from "../store/userSlice";
import { userLogin, userRegister } from "../services/allAPI";

function Auth({ type }) {
    const navigate = useNavigate()
    const formData = useSelector(state => state.user);
    const dispatch = useDispatch()

    const handleChange = (e) => {
        const name = e.target.name
        const value = e.target.value
        dispatch(updateUserData({ name, value }));
    };

    const handleLogin = async () => {
        if (formData.email && formData.password) {
            try {
                const result = await userLogin(formData)
                console.log(result)
                if (result.status == 200) {
                    console.log(result.data)
                    sessionStorage.setItem("user", JSON.stringify(result.data))
                    navigate("/")
                } else {
                    alert(result.response.data)
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            alert("Please enter value for all field")
        }
    }

    const handleRegister = async () => {
        if (formData.username && formData.email && formData.password) {
            try {
                const result = await userRegister(formData)
                console.log(result)
                if (result.status == 201) {
                    console.log(result.data)
                    navigate("/login")
                } else {
                    alert(result.response.data)
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            alert("Please enter value for all field")
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (type === "login") {
            handleLogin()
        } else {
            handleRegister()
        }
    };

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-900 text-white w-full">
            <h1 className="mb-10 text-blue-50 font-bold text-5xl">Welcome to Chat App</h1>
            <div className="w-96 p-8 bg-gray-800 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">{type === "login" ? "Login" : "Register"}</h2>
                <form onSubmit={handleSubmit}>
                    {type === "register" &&
                        <input
                            type="text"
                            name="username"
                            placeholder="User name"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-2 mb-3 rounded bg-gray-700 focus:outline-none"
                            required
                        />
                    }
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 mb-3 rounded bg-gray-700 focus:outline-none"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-2 mb-3 rounded bg-gray-700 focus:outline-none"
                        required
                    />
                    <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded">
                        {type === "login" ? "Login" : "Register"}
                    </button>
                </form>
                <p className="mt-4 text-sm text-gray-400">
                    {type === "login" ? "Don't have an account?" : "Already have an account?"}
                    <Link to={type === "login" ? "/register" : "/login"} className="text-blue-400 ml-1">
                        {type === "login" ? "Register" : "Login"}
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Auth;