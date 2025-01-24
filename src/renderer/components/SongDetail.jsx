import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
	LoadingOutlined,
	MessageOutlined,
	HeartOutlined,
} from '@ant-design/icons';
import '../styles/SongDetail.css';

const SongDetail = ({ currentSong, currentTime }) => {
	const [lyrics, setLyrics] = useState([]);
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState('lyrics'); // 'lyrics' 或 'comments'
	const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
	const lyricsRef = useRef(null);

	useEffect(() => {
		if (currentSong?.id) {
			console.log('Loading lyrics for song:', currentSong.id);
			loadLyrics();
			loadComments();
		}
	}, [currentSong]);

	// 监听播放时间更新，更新当前歌词
	useEffect(() => {
		if (lyrics.length > 0 && currentTime >= 0) {
			let index = lyrics.findIndex((lyric) => lyric.time > currentTime);
			if (index === -1) {
				index = lyrics.length;
			}
			index = Math.max(0, index - 1);

			if (index !== currentLyricIndex) {
				setCurrentLyricIndex(index);
				// 滚动到当前歌词
				const lyricElement = document.querySelector(
					`.lyric-line-${index}`
				);
				if (lyricElement && lyricsRef.current) {
					lyricsRef.current.scrollTo({
						top:
							lyricElement.offsetTop -
							lyricsRef.current.clientHeight / 2,
						behavior: 'smooth',
					});
				}
			}
		}
	}, [currentTime, lyrics]);

	const loadLyrics = async () => {
		try {
			setLoading(true);
			const data = await api.getLyric(currentSong.id);
			console.log('Lyrics data:', data);

			if (data?.lrc?.lyric) {
				const parsedLyrics = parseLyric(data.lrc.lyric);
				console.log('Parsed lyrics:', parsedLyrics);
				setLyrics(parsedLyrics);
			} else {
				console.log('No lyrics found in response');
				setLyrics([]);
			}
		} catch (error) {
			console.error('获取歌词失败:', error);
			setLyrics([]);
		} finally {
			setLoading(false);
		}
	};

	const loadComments = async () => {
		try {
			const data = await api.getMusicComments(currentSong.id);
			setComments(data?.hotComments || []);
		} catch (error) {
			console.error('获取评论失败:', error);
		}
	};

	// 解析歌词
	const parseLyric = (lrc) => {
		if (!lrc) return [];

		const lines = lrc.split('\n');
		const timeExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

		return lines
			.map((line) => {
				const matches = timeExp.exec(line);
				if (!matches) return null;

				const minutes = parseInt(matches[1], 10);
				const seconds = parseInt(matches[2], 10);
				const milliseconds = parseInt(matches[3], 10);
				const time = minutes * 60 + seconds + milliseconds / 1000;
				const text = line.replace(timeExp, '').trim();

				if (!text) return null;

				return {
					time,
					text,
				};
			})
			.filter((item) => item !== null);
	};

	const formatDate = (timestamp) => {
		const date = new Date(timestamp);
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<div className="song-detail">
			<div className="song-detail-tabs">
				<button
					className={`tab-button ${
						activeTab === 'lyrics' ? 'active' : ''
					}`}
					onClick={() => setActiveTab('lyrics')}
				>
					歌词
				</button>
				<button
					className={`tab-button ${
						activeTab === 'comments' ? 'active' : ''
					}`}
					onClick={() => setActiveTab('comments')}
				>
					评论
				</button>
			</div>

			<div className="song-detail-content">
				{activeTab === 'lyrics' ? (
					<div className="lyrics-container">
						{loading ? (
							<div className="loading">
								<LoadingOutlined />
								<span>加载歌词中...</span>
							</div>
						) : lyrics.length > 0 ? (
							<div className="lyrics-content" ref={lyricsRef}>
								{lyrics.map((line, index) => (
									<p
										key={index}
										className={`lyric-line lyric-line-${index} ${
											currentLyricIndex === index
												? 'active'
												: ''
										}`}
									>
										{line.text}
									</p>
								))}
							</div>
						) : (
							<div className="no-lyrics">暂无歌词</div>
						)}
					</div>
				) : (
					<div className="comments-container">
						{comments.length > 0 ? (
							comments.map((comment) => (
								<div
									key={comment.commentId}
									className="comment-item"
								>
									<img
										src={comment.user.avatarUrl}
										alt={comment.user.nickname}
										className="comment-avatar"
									/>
									<div className="comment-content">
										<div className="comment-header">
											<span className="comment-user">
												{comment.user.nickname}
											</span>
											<span className="comment-time">
												{formatDate(comment.time)}
											</span>
										</div>
										<p className="comment-text">
											{comment.content}
										</p>
										<div className="comment-actions">
											<span className="like-count">
												<HeartOutlined />{' '}
												{comment.likedCount}
											</span>
										</div>
									</div>
								</div>
							))
						) : (
							<div className="no-comments">暂无评论</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default SongDetail;
