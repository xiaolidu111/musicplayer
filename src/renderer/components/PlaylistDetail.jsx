import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
	LoadingOutlined,
	PlayCircleOutlined,
	ArrowLeftOutlined,
} from '@ant-design/icons';
import '../styles/PlaylistDetail.css';
import SongList from './SongList';

const PlaylistDetail = ({ playlistId, onPlaySong, onBack }) => {
	const [playlist, setPlaylist] = useState(null);
	const [initialLoading, setInitialLoading] = useState(true); // 初始加载状态
	const [loadingMore, setLoadingMore] = useState(false); // 加载更多状态
	const [error, setError] = useState(null);
	const [offset, setOffset] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [tracks, setTracks] = useState([]);
	const LIMIT = 50; // 每次加载的歌曲数量

	useEffect(() => {
		if (playlistId) {
			// 重置状态
			setOffset(0);
			setTracks([]);
			setHasMore(true);
			loadPlaylistDetail();
		}
	}, [playlistId]);

	const loadPlaylistDetail = async () => {
		try {
			setInitialLoading(true);
			setError(null);
			const data = await api.getPlaylistDetail(playlistId);
			setPlaylist(data);
			// 加载第一批歌曲
			const initialTracks = await api.getPlaylistTracks(
				playlistId,
				0,
				LIMIT
			);
			setTracks(initialTracks);
			setHasMore(initialTracks.length === LIMIT);
		} catch (error) {
			setError('加载歌单详情失败');
			console.error('加载歌单详情失败:', error);
		} finally {
			setInitialLoading(false);
		}
	};

	const loadMoreTracks = async () => {
		if (!hasMore || loadingMore) return;

		try {
			setLoadingMore(true);
			const newOffset = offset + LIMIT;
			const newTracks = await api.getPlaylistTracks(
				playlistId,
				newOffset,
				LIMIT
			);

			setTracks((prev) => [...prev, ...newTracks]);
			setOffset(newOffset);
			setHasMore(newTracks.length === LIMIT);
		} catch (error) {
			console.error('加载更多歌曲失败:', error);
		} finally {
			setLoadingMore(false);
		}
	};

	const handlePlaySong = async (song, index) => {
		try {
			const songUrl = await api.getSongUrl(song.id);
			onPlaySong(
				{
					id: song.id,
					title: song.name,
					artist: song.ar[0].name,
					cover: song.al.picUrl,
					url: songUrl,
				},
				playlist.tracks.map((track) => ({
					id: track.id,
					title: track.name,
					artist: track.ar[0].name,
					cover: track.al.picUrl,
					url: null,
				}))
			);
		} catch (error) {
			console.error('播放歌曲失败:', error);
		}
	};

	if (initialLoading) {
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
				<button onClick={loadPlaylistDetail}>重试</button>
			</div>
		);
	}

	if (!playlist) return null;

	return (
		<div className="playlist-detail">
			<button className="back-button" onClick={onBack}>
				<ArrowLeftOutlined /> 返回
			</button>
			<div className="playlist-header">
				<img src={playlist.coverImgUrl} alt={playlist.name} />
				<div className="playlist-text">
					<h2>{playlist.name}</h2>
					<p>{playlist.description || '暂无简介'}</p>
					<div className="playlist-stats">
						<span>播放量：{playlist.playCount}</span>
						<span>歌曲数：{playlist.trackCount}</span>
					</div>
				</div>
			</div>
			<SongList
				songs={tracks}
				onPlaySong={handlePlaySong}
				onLoadMore={loadMoreTracks}
				loading={loadingMore}
				hasMore={hasMore}
			/>
		</div>
	);
};

export default PlaylistDetail;
