import React from 'react';
import {
	CustomerServiceOutlined,
	HeartOutlined,
	PlusOutlined,
	FolderOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import '../styles/Sidebar.css';

const Sidebar = ({
	user,
	onLoginClick,
	onLogout,
	currentView,
	onViewChange,
}) => {
	const menuItems = [
		{
			key: 'discover',
			label: '发现音乐',
			icon: <CustomerServiceOutlined />,
		},
		{
			key: 'myMusic',
			label: '我的音乐',
			icon: <HeartOutlined />,
			requireLogin: true,
		},
		{
			key: 'created',
			label: '创建的歌单',
			icon: <PlusOutlined />,
			requireLogin: true,
		},
		{
			key: 'collected',
			label: '收藏的歌单',
			icon: <FolderOutlined />,
			requireLogin: true,
		},
		{
			key: 'search',
			label: '搜索',
			icon: <SearchOutlined />,
		},
	];

	const handleMenuClick = (key) => {
		if (!user && menuItems.find((item) => item.key === key)?.requireLogin) {
			onLoginClick();
			return;
		}
		onViewChange(key);
	};

	return (
		<div className="sidebar">
			<div className="logo">音乐播放器</div>
			<div className="user-section">
				{user ? (
					<div className="user-info">
						<img
							src={user.avatarUrl}
							alt={user.nickname}
							className="avatar"
						/>
						<span className="nickname">{user.nickname}</span>
						<button className="logout-button" onClick={onLogout}>
							退出
						</button>
					</div>
				) : (
					<button className="login-button" onClick={onLoginClick}>
						立即登录
					</button>
				)}
			</div>
			<nav>
				<ul>
					{menuItems.map((item) => (
						<li
							key={item.key}
							className={`menu-item ${
								currentView === item.key ? 'active' : ''
							}`}
							onClick={() => handleMenuClick(item.key)}
						>
							{item.icon}
							<span>{item.label}</span>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
};

export default Sidebar;
