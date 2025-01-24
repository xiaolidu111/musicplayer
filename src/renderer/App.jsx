import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import MainContent from './components/MainContent';
import Login from './components/Login';
import UserPlaylists from './components/UserPlaylists';
import PlaylistDetail from './components/PlaylistDetail';
import SearchMusic from './components/SearchMusic';
import { api } from './services/api';

const App = () => {
	const [currentSong, setCurrentSong] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [showLogin, setShowLogin] = useState(false);
	const [user, setUser] = useState(null);
	const [currentView, setCurrentView] = useState('discover');
	const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
	const [playQueue, setPlayQueue] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(-1);

	useEffect(() => {
		checkLoginStatus();
	}, []);

	const checkLoginStatus = async () => {
		try {
			const status = await api.getLoginStatus();
			if (status?.data?.profile) {
				setUser(status.data.profile);
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error('检查登录状态失败:', error);
			setUser(null);
		}
	};

	const handleLoginSuccess = (profile) => {
		setUser(profile);
		setShowLogin(false);
		checkLoginStatus();
	};

	const handleLogout = async () => {
		try {
			await api.logout();
			setUser(null);
			document.cookie =
				'MUSIC_U=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
		} catch (error) {
			console.error('退出登录失败:', error);
		}
	};

	const handlePlaylistClick = (playlistId) => {
		console.log('切换到歌单:', playlistId);
		setSelectedPlaylistId(playlistId);
		setCurrentView('playlistDetail');
	};

	const handlePlaySong = (song, playlist = []) => {
		setCurrentSong(song);
		setIsPlaying(true);
		if (playlist.length > 0) {
			setPlayQueue(playlist);
			setCurrentIndex(playlist.findIndex((item) => item.id === song.id));
		} else {
			setPlayQueue([song]);
			setCurrentIndex(0);
		}
	};

	const handleSongChange = async (direction) => {
		if (playQueue.length === 0 || currentIndex === -1) return;

		let newIndex;
		if (direction === 'next') {
			newIndex =
				currentIndex + 1 >= playQueue.length ? 0 : currentIndex + 1;
		} else {
			newIndex =
				currentIndex - 1 < 0 ? playQueue.length - 1 : currentIndex - 1;
		}

		try {
			const nextSong = playQueue[newIndex];
			// 如果歌曲没有 URL，获取 URL
			if (!nextSong.url) {
				const songUrl = await api.getSongUrl(nextSong.id);
				nextSong.url = songUrl;
			}

			setCurrentIndex(newIndex);
			setCurrentSong(nextSong);
			setIsPlaying(true);

			// 更新播放队列中的歌曲 URL
			const updatedQueue = [...playQueue];
			updatedQueue[newIndex] = nextSong;
			setPlayQueue(updatedQueue);
		} catch (error) {
			console.error('切换歌曲失败:', error);
		}
	};

	const renderContent = () => {
		switch (currentView) {
			case 'search':
				return <SearchMusic onPlaySong={handlePlaySong} />;
			case 'playlistDetail':
				return (
					<PlaylistDetail
						playlistId={selectedPlaylistId}
						onPlaySong={handlePlaySong}
						onBack={() => {
							setCurrentView('playlists');
							setSelectedPlaylistId(null);
						}}
					/>
				);
			case 'playlists':
			default:
				return (
					<UserPlaylists
						user={user}
						onPlaylistClick={handlePlaylistClick}
						viewType="all"
					/>
				);
		}
	};

	return (
		<div className="app-container">
			<Sidebar
				user={user}
				onLoginClick={() => setShowLogin(true)}
				onLogout={handleLogout}
				currentView={currentView}
				onViewChange={setCurrentView}
			/>
			<MainContent
				onPlaySong={handlePlaySong}
				user={user}
				currentView={currentView}
				onViewChange={setCurrentView}
			/>
			<MusicPlayer
				currentSong={currentSong}
				isPlaying={isPlaying}
				setIsPlaying={setIsPlaying}
				onSongChange={handleSongChange}
			/>
			{showLogin && (
				<Login
					onLoginSuccess={handleLoginSuccess}
					onClose={() => setShowLogin(false)}
				/>
			)}
		</div>
	);
};

export default App;
