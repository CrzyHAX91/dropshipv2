import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import QRCode from 'qrcode.react';

const Auth = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [requires2FA, setRequires2FA] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        code: ''
    });
    const [tempToken, setTempToken] = useState('');
    const [qrCode, setQRCode] = useState('');
    const [secret, setSecret] = useState('');

    const handleInputChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.requiresSecondFactor) {
                setRequires2FA(true);
                setTempToken(data.tempToken);
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/admin');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handle2FAVerification = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/verify-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tempToken,
                    code: credentials.code
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '2FA verification failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/admin');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const setup2FA = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch('http://localhost:3000/api/auth/setup-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user.id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '2FA setup failed');
            }

            setQRCode(data.qrCode);
            setSecret(data.secret);
            setShow2FASetup(true);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const verify2FASetup = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/auth/verify-2fa-setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    code: credentials.code,
                    secret
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '2FA verification failed');
            }

            toast.success('2FA setup completed successfully');
            setShow2FASetup(false);
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (show2FASetup) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="card w-96 bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Setup Two-Factor Authentication</h2>
                        <div className="text-center my-4">
                            <QRCode value={qrCode} size={200} />
                        </div>
                        <p className="text-sm mb-4">
                            Scan this QR code with your authenticator app, then enter the code below.
                        </p>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Verification Code</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                className="input input-bordered"
                                value={credentials.code}
                                onChange={handleInputChange}
                                placeholder="Enter 6-digit code"
                            />
                        </div>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={verify2FASetup}
                        >
                            Verify and Enable 2FA
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (requires2FA) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="card w-96 bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Two-Factor Authentication</h2>
                        <p className="text-sm mb-4">
                            Enter the code from your authenticator app.
                        </p>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Verification Code</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                className="input input-bordered"
                                value={credentials.code}
                                onChange={handleInputChange}
                                placeholder="Enter 6-digit code"
                            />
                        </div>
                        <button 
                            className="btn btn-primary mt-4"
                            onClick={handle2FAVerification}
                        >
                            Verify
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">{isLogin ? 'Login' : 'Register'}</h2>
                    <form onSubmit={handleLogin}>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Username</span>
                            </label>
                            <input
                                type="text"
                                name="username"
                                className="input input-bordered"
                                value={credentials.username}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="input input-bordered"
                                value={credentials.password}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button 
                            className="btn btn-primary w-full mt-4"
                            type="submit"
                        >
                            {isLogin ? 'Login' : 'Register'}
                        </button>
                    </form>
                    <div className="divider">OR</div>
                    <button 
                        className="btn btn-outline w-full"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Create Account' : 'Back to Login'}
                    </button>
                    {isLogin && (
                        <button 
                            className="btn btn-ghost btn-sm mt-2"
                            onClick={() => navigate('/reset-password')}
                        >
                            Forgot Password?
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Auth;
