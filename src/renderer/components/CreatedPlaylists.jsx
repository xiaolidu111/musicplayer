import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import '../styles/UserPlaylists.css';

const CreatedPlaylists = ({ user, onPlaylistClick }) => {
	const [playlists, setPlaylists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [playlistName, setPlaylistName] = useState('');
	const [description, setDescription] = useState('');

	useEffect(() => {
		if (user?.userId) {
			loadCreatedPlaylists();
		}
	}, [user]);

	const loadCreatedPlaylists = async () => {
		try {
			setLoading(true);
			setError(null);
			const allPlaylists = await api.getUserPlaylists(user.userId);
			const created = allPlaylists.filter(
				(p) => p.creator.userId === user.userId
			);
			setPlaylists(created);
		} catch (error) {
			console.error('加载创建的歌单失败:', error);
			setError('加载歌单失败，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	const handleCreatePlaylist = async (e) => {
		e.preventDefault();
		try {
			await api.createPlaylist(playlistName, false, description);
			setShowCreateModal(false);
			setPlaylistName('');
			setDescription('');
			loadCreatedPlaylists();
		} catch (error) {
			console.error('创建歌单失败:', error);
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
				<button onClick={loadCreatedPlaylists}>重试</button>
			</div>
		);
	}

	return (
		<div className="created-playlists">
			<div className="playlists-header">
				<h2>创建的歌单</h2>
				<button
					className="create-playlist-btn"
					onClick={() => setShowCreateModal(true)}
				>
					<PlusOutlined /> 新建歌单
				</button>
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
							<p>{playlist.trackCount}首歌曲</p>
						</div>
					</div>
				))}
			</div>

			{/* 创建歌单的模态框 */}
			{showCreateModal && (
				<CreatePlaylistModal
					onClose={() => setShowCreateModal(false)}
					onSubmit={handleCreatePlaylist}
					playlistName={playlistName}
					setPlaylistName={setPlaylistName}
					description={description}
					setDescription={setDescription}
				/>
			)}
		</div>
	);
};

export default CreatedPlaylists;
