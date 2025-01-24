import React, { useState, useEffect, useCallback } from 'react';
import {
	LoadingOutlined,
	SearchOutlined,
	PlayCircleOutlined,
	HistoryOutlined,
	DeleteOutlined,
} from '@ant-design/icons';
import { api } from '../services/api';
import '../styles/SearchMusic.css';
import { debounce } from 'lodash';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_LENGTH = 10;

const SearchMusic = ({ onPlaySong }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [hotSearches, setHotSearches] = useState([]);
	const [searchHistory, setSearchHistory] = useState(() => {
		const history = localStorage.getItem(SEARCH_HISTORY_KEY);
		return history ? JSON.parse(history) : [];
	});
	const [error, setError] = useState(null);

	useEffect(() => {
		loadHotSearches();
	}, []);

	// 保存搜索历史到 localStorage
	useEffect(() => {
		localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
	}, [searchHistory]);

	const loadHotSearches = async () => {
		try {
			const data = await api.getHotSearch();
			setHotSearches(data);
		} catch (error) {
			console.error('获取热门搜索失败:', error);
			setError('获取热门搜索失败');
		}
	};

	// 使用 useCallback 包装 handleSearch 函数
	const handleSearch = useCallback(
		async (value) => {
			if (!value?.trim()) {
				setSearchResults([]);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const results = await api.search(value);
				setSearchResults(results);

				// 添加到搜索历史
				if (value.trim()) {
					setSearchHistory((prev) => {
						const newHistory = [
							value,
							...prev.filter((item) => item !== value),
						].slice(0, MAX_HISTORY_LENGTH);
						return newHistory;
					});
				}
			} catch (error) {
				console.error('搜索失败:', error);
				setError('搜索失败，请稍后重试');
				setSearchResults([]);
			} finally {
				setLoading(false);
			}
		},
		[setSearchHistory]
	);

	// 创建防抖的搜索函数
	const debouncedSearch = useCallback(
		debounce((value) => handleSearch(value), 500),
		[handleSearch]
	);

	const handleInputChange = (e) => {
		const value = e.target.value;
		setSearchTerm(value);
		if (value) {
			debouncedSearch(value);
		} else {
			setSearchResults([]);
		}
	};

	const handleHistoryClick = (keyword) => {
		setSearchTerm(keyword);
		handleSearch(keyword);
	};

	const handleHistoryDelete = (e, keyword) => {
		e.stopPropagation();
		setSearchHistory((prev) => prev.filter((item) => item !== keyword));
	};

	const clearAllHistory = () => {
		setSearchHistory([]);
	};

	const handleHotSearchClick = (keyword) => {
		setSearchTerm(keyword);
		handleSearch(keyword);
	};

	const formatDuration = (duration) => {
		const minutes = Math.floor(duration / 1000 / 60);
		const seconds = Math.floor((duration / 1000) % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	const handlePlaySong = async (song) => {
		try {
			const songUrl = await api.getSongUrl(song.id);
			onPlaySong({
				id: song.id,
				title: song.name,
				artist: song.artists[0].name,
				album: song.album.name,
				duration: song.duration,
				cover: song.album.picUrl || song.album.artist.img1v1Url,
				url: songUrl,
			});

			// 可以选择将整个搜索结果作为播放列表
			const playlist = searchResults.map((track) => ({
				id: track.id,
				title: track.name,
				artist: track.artists[0].name,
				album: track.album.name,
				duration: track.duration,
				cover: track.album.picUrl || track.album.artist.img1v1Url,
				url: null,
			}));

			onPlaySong(
				{
					id: song.id,
					title: song.name,
					artist: song.artists[0].name,
					album: song.album.name,
					duration: song.duration,
					cover: song.album.picUrl || song.album.artist.img1v1Url,
					url: songUrl,
				},
				playlist
			);
		} catch (error) {
			console.error('播放歌曲失败:', error);
			setError('播放失败，请稍后重试');
		}
	};

	return (
		<div className="search-music">
			<div className="search-header">
				<div className="search-input-wrapper">
					<SearchOutlined className="search-icon" />
					<input
						type="text"
						value={searchTerm}
						onChange={handleInputChange}
						placeholder="搜索音乐、歌手、歌词"
						className="search-input"
					/>
				</div>
			</div>

			{error && <div className="error-message">{error}</div>}

			{!searchTerm && (
				<>
					{searchHistory.length > 0 && (
						<div className="search-history">
							<div className="history-header">
								<h3>
									<HistoryOutlined /> 搜索历史
								</h3>
								<button
									className="clear-history"
									onClick={clearAllHistory}
								>
									清空历史
								</button>
							</div>
							<div className="history-list">
								{searchHistory.map((keyword, index) => (
									<div
										key={index}
										className="history-item"
										onClick={() =>
											handleHistoryClick(keyword)
										}
									>
										<span className="history-keyword">
											{keyword}
										</span>
										<DeleteOutlined
											className="delete-icon"
											onClick={(e) =>
												handleHistoryDelete(e, keyword)
											}
										/>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="hot-searches">
						<h3>热门搜索</h3>
						<div className="hot-search-list">
							{hotSearches.map((item, index) => (
								<button
									key={index}
									className="hot-search-item"
									onClick={() =>
										handleHotSearchClick(item.first)
									}
								>
									{item.first}
								</button>
							))}
						</div>
					</div>
				</>
			)}

			{loading ? (
				<div className="loading-container">
					<LoadingOutlined style={{ fontSize: 24 }} />
					<p>搜索中...</p>
				</div>
			) : (
				searchResults.length > 0 && (
					<div className="search-results">
						<div className="song-table">
							<table>
								<thead>
									<tr>
										<th></th>
										<th>歌曲</th>
										<th>歌手</th>
										<th>专辑</th>
										<th>时长</th>
									</tr>
								</thead>
								<tbody>
									{searchResults.map((song, index) => (
										<tr
											key={song.id}
											className="song-row"
											onClick={() => handlePlaySong(song)}
										>
											<td>
												<div className="song-index">
													<span className="index">
														{index + 1}
													</span>
													<PlayCircleOutlined className="play-icon" />
												</div>
											</td>
											<td className="song-name">
												{song.name}
											</td>
											<td>{song.artists[0].name}</td>
											<td>{song.album.name}</td>
											<td>
												{formatDuration(song.duration)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)
			)}

			{!loading && searchTerm && searchResults.length === 0 && (
				<div className="no-results">
					<p>未找到相关结果</p>
				</div>
			)}
		</div>
	);
};

export default SearchMusic;
