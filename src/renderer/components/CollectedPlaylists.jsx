import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LoadingOutlined } from '@ant-design/icons';
import '../styles/UserPlaylists.css';

const CollectedPlaylists = ({ user, onPlaylistClick }) => {
	const [playlists, setPlaylists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (user?.userId) {
			loadCollectedPlaylists();
		}
	}, [user]);

	const loadCollectedPlaylists = async () => {
		try {
			setLoading(true);
			setError(null);
			const allPlaylists = await api.getUserPlaylists(user.userId);
			const collected = allPlaylists.filter(
				(p) => p.creator.userId !== user.userId
			);
			setPlaylists(collected);
		} catch (error) {
			console.error('加载收藏的歌单失败:', error);
			setError('加载歌单失败，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="loading-container">
				<LoadingOutlined style={{ fontSize: 24 }} />
				<p>加载中...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="error-container">
				<p>{error}</p>
				<button onClick={loadCollectedPlaylists}>重试</button>
			</div>
		);
	}

	return (
		<div className="collected-playlists">
			<div className="playlists-header">
				<h2>收藏的歌单</h2>
			</div>
			<div className="playlist-grid">
				{playlists.map((playlist) => (
					<div
						key={playlist.id}
						className="playlist-card"
						onClick={() => onPlaylistClick(playlist.id)}
					>
						<div className="playlist-cover">
							<img
								src={playlist.coverImgUrl}
								alt={playlist.name}
							/>
							<div className="playlist-play-count">
								{formatPlayCount(playlist.playCount)}
							</div>
						</div>
						<div className="playlist-info">
							<h3>{playlist.name}</h3>
							<p>by {playlist.creator.nickname}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default CollectedPlaylists;
