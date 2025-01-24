import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Login = ({ onLoginSuccess, onClose }) => {
	const [loginMethod, setLoginMethod] = useState('phone'); // 'phone', 'qr' 或 'captcha'
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [captcha, setCaptcha] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [qrImage, setQrImage] = useState('');
	const [qrKey, setQrKey] = useState('');
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		if (loginMethod === 'qr') {
			initQRCode();
		}
		return () => {
			// 清理定时器
			if (window.qrCheckInterval) {
				clearInterval(window.qrCheckInterval);
			}
		};
	}, [loginMethod]);

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const initQRCode = async () => {
		try {
			setLoading(true);
			setError('');
			// 获取二维码 key
			const key = await api.getQRKey();
			setQrKey(key);
			// 生成二维码
			const qrimg = await api.createQRCode(key);
			setQrImage(qrimg);
			// 开始轮询检查扫码状态
			startQRCheck(key);
		} catch (error) {
			setError('生成二维码失败，请重试');
		} finally {
			setLoading(false);
		}
	};

	const startQRCheck = (key) => {
		// 清除可能存在的旧定时器
		if (window.qrCheckInterval) {
			clearInterval(window.qrCheckInterval);
		}

		// 创建新的轮询
		window.qrCheckInterval = setInterval(async () => {
			try {
				const result = await api.checkQRStatus(key);
				switch (result.code) {
					case 800:
						// 二维码过期
						clearInterval(window.qrCheckInterval);
						setError('二维码已过期，请点击刷新');
						break;
					case 803:
						// 授权登录成功
						clearInterval(window.qrCheckInterval);
						const status = await api.getLoginStatus();
						if (status?.data?.profile) {
							onLoginSuccess(status.data.profile);
						}
						break;
					// 其他状态（801：等待扫码，802：待确认）不做处理
				}
			} catch (error) {
				console.error('检查扫码状态失败:', error);
			}
		}, 3000); // 每3秒检查一次
	};

	const handlePhoneLogin = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const data = await api.loginByPhone(phone, password);
			onLoginSuccess(data.profile);
		} catch (error) {
			setError(error.message || '登录失败，请重试');
		} finally {
			setLoading(false);
		}
	};

	const handleSendCaptcha = async () => {
		if (!phone) {
			setError('请输入手机号');
			return;
		}
		try {
			setLoading(true);
			await api.sendCaptcha(phone);
			setCountdown(60);
			setError('');
		} catch (error) {
			setError(error.message || '发送验证码失败');
		} finally {
			setLoading(false);
		}
	};

	const handleCaptchaLogin = async (e) => {
		e.preventDefault();
		if (!phone || !captcha) {
			setError('请输入手机号和验证码');
			return;
		}
		try {
			setLoading(true);
			const data = await api.loginByCaptcha(phone, captcha);
			onLoginSuccess(data.profile);
		} catch (error) {
			setError(error.message || '登录失败');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="login-overlay"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="login-modal">
				<button className="close-button" onClick={onClose}>
					×
				</button>
				<h2>登录网易云账号</h2>
				<div className="login-tabs">
					<button
						className={`tab-button ${
							loginMethod === 'phone' ? 'active' : ''
						}`}
						onClick={() => setLoginMethod('phone')}
					>
						密码登录
					</button>
					<button
						className={`tab-button ${
							loginMethod === 'captcha' ? 'active' : ''
						}`}
						onClick={() => setLoginMethod('captcha')}
					>
						验证码登录
					</button>
					<button
						className={`tab-button ${
							loginMethod === 'qr' ? 'active' : ''
						}`}
						onClick={() => setLoginMethod('qr')}
					>
						扫码登录
					</button>
				</div>
				{error && <div className="error-message">{error}</div>}
				{loginMethod === 'phone' ? (
					<form onSubmit={handlePhoneLogin}>
						<div className="form-group">
							<label>手机号</label>
							<input
								type="text"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="请输入手机号"
								required
							/>
						</div>
						<div className="form-group">
							<label>密码</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="请输入密码"
								required
							/>
						</div>
						<button
							type="submit"
							className="login-button"
							disabled={loading}
						>
							{loading ? '登录中...' : '登录'}
						</button>
					</form>
				) : loginMethod === 'captcha' ? (
					<form onSubmit={handleCaptchaLogin}>
						<div className="form-group">
							<label>手机号</label>
							<input
								type="text"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="请输入手机号"
								required
							/>
						</div>
						<div className="form-group">
							<label>验证码</label>
							<div className="captcha-input">
								<input
									type="text"
									value={captcha}
									onChange={(e) => setCaptcha(e.target.value)}
									placeholder="请输入验证码"
									required
								/>
								<button
									type="button"
									className="captcha-button"
									onClick={handleSendCaptcha}
									disabled={countdown > 0 || loading}
								>
									{countdown > 0
										? `${countdown}秒后重试`
										: '获取验证码'}
								</button>
							</div>
						</div>
						<button
							type="submit"
							className="login-button"
							disabled={loading}
						>
							{loading ? '登录中...' : '登录'}
						</button>
					</form>
				) : (
					<div className="qr-container">
						{loading ? (
							<div className="loading">生成二维码中...</div>
						) : qrImage ? (
							<>
								<img src={qrImage} alt="登录二维码" />
								<p className="qr-tip">
									使用网易云音乐APP扫码登录
								</p>
								<button
									className="refresh-button"
									onClick={initQRCode}
								>
									刷新二维码
								</button>
							</>
						) : (
							<button
								className="refresh-button"
								onClick={initQRCode}
							>
								重新获取二维码
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Login;
