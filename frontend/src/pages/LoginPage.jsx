import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineShieldCheck, HiOutlineCode } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage — Two-step email OTP authentication.
 * Step 1: Enter email → send OTP
 * Step 2: Enter 6-digit OTP → verify and login
 */
export default function LoginPage() {
    const navigate = useNavigate();
    const { user, sendOtp, verifyOtp } = useAuth();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const otpRefs = useRef([]);

    // Redirect if already logged in
    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email');
            return;
        }

        try {
            setLoading(true);
            await sendOtp(email.trim());
            toast.success('OTP sent to your email!');
            setStep(2);
            setCountdown(60);
            // Focus first OTP input after transition
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to send OTP';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            // Handle paste: distribute digits across inputs
            const digits = value.replace(/\D/g, '').slice(0, 6).split('');
            const newOtp = [...otp];
            digits.forEach((digit, i) => {
                if (index + i < 6) newOtp[index + i] = digit;
            });
            setOtp(newOtp);
            const nextIndex = Math.min(index + digits.length, 5);
            otpRefs.current[nextIndex]?.focus();
            return;
        }

        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            await verifyOtp(email.trim(), otpString);
            toast.success('Welcome to MockAPI!');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid OTP';
            toast.error(msg);
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        try {
            setLoading(true);
            await sendOtp(email.trim());
            toast.success('New OTP sent!');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } catch (err) {
            toast.error('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <HiOutlineCode className="login-brand-icon" />
                    <h1>MockAPI</h1>
                    <p className="text-muted">Generate mock REST APIs instantly</p>
                </div>

                {step === 1 ? (
                    <form className="login-form" onSubmit={handleSendOtp} key="email-step">
                        <div className="login-step-header">
                            <div className="login-step-icon">
                                <HiOutlineMail />
                            </div>
                            <h2>Sign in with Email</h2>
                            <p className="text-muted">We'll send you a verification code</p>
                        </div>

                        <div className="form-group">
                            <input
                                id="login-email"
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                                autoComplete="email"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg login-btn"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleVerifyOtp} key="otp-step">
                        <div className="login-step-header">
                            <div className="login-step-icon login-step-icon-verify">
                                <HiOutlineShieldCheck />
                            </div>
                            <h2>Enter Verification Code</h2>
                            <p className="text-muted">
                                Sent to <strong>{email}</strong>
                            </p>
                        </div>

                        <div className="otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (otpRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    className="otp-input"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                        handleOtpChange(0, pasted);
                                    }}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg login-btn"
                            disabled={loading || otp.join('').length !== 6}
                        >
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                        </button>

                        <div className="login-footer">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => {
                                    setStep(1);
                                    setOtp(['', '', '', '', '', '']);
                                }}
                            >
                                ← Change email
                            </button>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={handleResend}
                                disabled={countdown > 0 || loading}
                            >
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
