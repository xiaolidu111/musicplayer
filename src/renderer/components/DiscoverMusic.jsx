import React, { useState, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { api } from '../services/api';

const DiscoverMusic = ({ onPlaySong, onPlaylistClick }) => {
	const [recommendPlaylists, setRecommendPlaylists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadRecommendPlaylists();
	}, []);

	const loadRecommendPlaylists = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.getRecommendPlaylists();
			setRecommendPlaylists(data);
		} catch (error) {
			console.error('加载推荐歌单失败:', error);
			setError('加载推荐歌单失败，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	const handlePlaylistClick = (playlist) => {
		onPlaylistClick(playlist.id);
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
				<button onClick={loadRecommendPlaylists}>重试</button>
			</div>
		);
	}

	return (
		<div className="discover-music">
			<section className="recommend-playlists">
				<h2>推荐歌单</h2>
				<div className="playlist-grid">
					{recommendPlaylists.map((playlist) => (
						<div
							key={playlist.id}
							className="playlist-card"
							onClick={() => handlePlaylistClick(playlist)}
						>
							<div className="playlist-cover">
								<img
									src={playlist.picUrl}
									alt={playlist.name}
									loading="lazy"
								/>
								<div className="playlist-play-count">
									{formatPlayCount(playlist.playCount)}
								</div>
							</div>
							<div className="playlist-info">
								<h3>{playlist.name}</h3>
								<p>{playlist.copywriter}</p>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
};

// 格式化播放次数
const formatPlayCount = (count) => {
	if (count < 10000) {
		return count;
	} else if (count < 100000000) {
		return Math.floor(count / 10000) + '万';
	} else {
		return Math.floor(count / 100000000) + '亿';
	}
};

export default DiscoverMusic;
