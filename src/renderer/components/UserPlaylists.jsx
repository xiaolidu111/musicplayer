import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import '../styles/UserPlaylists.css';

const UserPlaylists = ({ user, onPlaylistClick, viewType }) => {
	const [myPlaylists, setMyPlaylists] = useState([]);
	const [favoritePlaylists, setFavoritePlaylists] = useState([]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [playlistName, setPlaylistName] = useState('');
	const [description, setDescription] = useState('');

	useEffect(() => {
		if (user?.userId) {
			loadUserPlaylists();
		}
	}, [user]);

	const loadUserPlaylists = async () => {
		try {
			const playlists = await api.getUserPlaylists(user.userId);
			if (Array.isArray(playlists)) {
				const created = playlists.filter(
					(p) => p.creator.userId === user.userId
				);
				const favorited = playlists.filter(
					(p) => p.creator.userId !== user.userId
				);
				setMyPlaylists(created);
				setFavoritePlaylists(favorited);
			}
		} catch (error) {
			console.error('加载用户歌单失败:', error);
		}
	};

	const handleCreatePlaylist = async (e) => {
		e.preventDefault();
		try {
			await api.createPlaylist(playlistName, false, description);
			setShowCreateModal(false);
			setPlaylistName('');
			setDescription('');
			loadUserPlaylists();
		} catch (error) {
			console.error('创建歌单失败:', error);
		}
	};

	const handlePlaylistClick = (playlistId) => {
		console.log('点击歌单:', playlistId);
		if (onPlaylistClick) {
			onPlaylistClick(playlistId);
		}
	};

	// 根据 viewType 渲染不同的内容
	const renderContent = () => {
		switch (viewType) {
			case 'created':
				return (
					<div className="playlists-section">
						<div className="section-header">
							<h2>创建的歌单</h2>
							<button
								className="create-playlist-btn"
								onClick={() => setShowCreateModal(true)}
							>
								<PlusOutlined /> 新建歌单
							</button>
						</div>
						<div className="playlist-list">
							{myPlaylists.map((playlist) => (
								<div
									key={playlist.id}
									className="playlist-item"
									onClick={() =>
										handlePlaylistClick(playlist.id)
									}
								>
									<img
										src={playlist.coverImgUrl}
										alt={playlist.name}
									/>
									<div className="playlist-info">
										<h4>{playlist.name}</h4>
										<p>{playlist.trackCount}首歌曲</p>
									</div>
								</div>
							))}
						</div>
					</div>
				);
			case 'collected':
				return (
					<div className="playlists-section">
						<div className="section-header">
							<h2>收藏的歌单</h2>
						</div>
						<div className="playlist-list">
							{favoritePlaylists.map((playlist) => (
								<div
									key={playlist.id}
									className="playlist-item"
									onClick={() =>
										handlePlaylistClick(playlist.id)
									}
								>
									<img
										src={playlist.coverImgUrl}
										alt={playlist.name}
									/>
									<div className="playlist-info">
										<h4>{playlist.name}</h4>
										<p>by {playlist.creator.nickname}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				);
			default:
				return (
					<>
						{/* 显示所有歌单 */}
						<div className="playlists-section">
							<div className="section-header">
								<h2>创建的歌单</h2>
								<button
									className="create-playlist-btn"
									onClick={() => setShowCreateModal(true)}
								>
									<PlusOutlined /> 新建歌单
								</button>
							</div>
							<div className="playlist-list">
								{myPlaylists.map((playlist) => (
									<div
										key={playlist.id}
										className="playlist-item"
										onClick={() =>
											handlePlaylistClick(playlist.id)
										}
									>
										<img
											src={playlist.coverImgUrl}
											alt={playlist.name}
										/>
										<div className="playlist-info">
											<h4>{playlist.name}</h4>
											<p>{playlist.trackCount}首歌曲</p>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="playlists-section">
							<div className="section-header">
								<h2>收藏的歌单</h2>
							</div>
							<div className="playlist-list">
								{favoritePlaylists.map((playlist) => (
									<div
										key={playlist.id}
										className="playlist-item"
										onClick={() =>
											handlePlaylistClick(playlist.id)
										}
									>
										<img
											src={playlist.coverImgUrl}
											alt={playlist.name}
										/>
										<div className="playlist-info">
											<h4>{playlist.name}</h4>
											<p>
												by {playlist.creator.nickname}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</>
				);
		}
	};

	return (
		<div className="user-playlists">
			{renderContent()}
			{showCreateModal && (
				<div className="create-playlist-modal">
					<div className="modal-content">
						<div className="modal-header">
							<h3>创建歌单</h3>
							<button
								className="close-button"
								onClick={() => setShowCreateModal(false)}
							>
								<CloseOutlined />
							</button>
						</div>
						<form
							className="modal-form"
							onSubmit={handleCreatePlaylist}
						>
							<div className="form-group">
								<label>歌单名称</label>
								<input
									type="text"
									value={playlistName}
									onChange={(e) =>
										setPlaylistName(e.target.value)
									}
									placeholder="请输入歌单名称"
									required
								/>
							</div>
							<div className="form-group">
								<label>歌单简介</label>
								<input
									type="text"
									value={description}
									onChange={(e) =>
										setDescription(e.target.value)
									}
									placeholder="请输入歌单简介（选填）"
								/>
							</div>
							<div className="modal-actions">
								<button
									type="button"
									className="cancel-button"
									onClick={() => setShowCreateModal(false)}
								>
									取消
								</button>
								<button
									type="submit"
									className="submit-button"
									disabled={!playlistName.trim()}
								>
									创建
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default UserPlaylists;
