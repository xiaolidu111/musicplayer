import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LoadingOutlined } from '@ant-design/icons';
import PlaylistDetail from './PlaylistDetail';
import DiscoverMusic from './DiscoverMusic';
import UserPlaylists from './UserPlaylists';
import SearchMusic from './SearchMusic';

const MainContent = ({ onPlaySong, user, currentView, onViewChange }) => {
	const [playlists, setPlaylists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedPlaylist, setSelectedPlaylist] = useState(null);
	const [currentPlaylistId, setCurrentPlaylistId] = useState(null);

	useEffect(() => {
		loadRecommendPlaylists();
	}, []);

	const loadRecommendPlaylists = async () => {
		try {
			setError(null);
			setLoading(true);
			const data = await api.getRecommendPlaylists();
			if (data.length === 0) {
				setError('暂无推荐歌单');
			} else {
				setPlaylists(data);
			}
		} catch (error) {
			setError('加载推荐歌单失败，请稍后重试');
			console.error('加载推荐歌单失败:', error);
		} finally {
			setLoading(false);
		}
	};

	const handlePlaylistClick = (playlistId) => {
		console.log('切换到歌单:', playlistId);
		setCurrentPlaylistId(playlistId);
		onViewChange('playlist');
	};

	const renderContent = () => {
		switch (currentView) {
			case 'discover':
				return (
					<div className="content-container discover-container">
						<DiscoverMusic
							onPlaySong={onPlaySong}
							onPlaylistClick={handlePlaylistClick}
						/>
					</div>
				);
			case 'search':
				return (
					<div className="content-container">
						<SearchMusic onPlaySong={onPlaySong} />
					</div>
				);
			case 'myMusic':
			case 'created':
			case 'collected':
				return (
					<div className="content-container playlists-container">
						{user ? (
							<UserPlaylists
								user={user}
								onPlaylistClick={handlePlaylistClick}
								viewType={currentView}
							/>
						) : (
							<div className="login-prompt">
								<p>请先登录</p>
								<button
									onClick={() => onViewChange('discover')}
								>
									立即登录
								</button>
							</div>
						)}
					</div>
				);
			case 'playlist':
				return (
					<div className="content-container playlist-detail-container">
						<PlaylistDetail
							playlistId={currentPlaylistId}
							onPlaySong={onPlaySong}
							onBack={() => onViewChange('discover')}
						/>
					</div>
				);
			default:
				return (
					<div className="content-container discover-container">
						<DiscoverMusic
							onPlaySong={onPlaySong}
							onPlaylistClick={handlePlaylistClick}
						/>
					</div>
				);
		}
	};

	if (loading) {
		return (
			<div className="main-content">
				<div className="content-container">
					<div className="loading-container">
						<LoadingOutlined style={{ fontSize: 24 }} />
						<p>加载中...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="main-content">
				<div className="content-container">
					<div className="error-container">
						<p>{error}</p>
						<button onClick={loadRecommendPlaylists}>重试</button>
					</div>
				</div>
			</div>
		);
	}

	return <main className="main-content">{renderContent()}</main>;
};

export default MainContent;
