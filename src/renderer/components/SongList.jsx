import React, { useEffect, useRef, useCallback } from 'react';
import { PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import './styles/SongList.css';

const SongList = ({ songs, onPlaySong, onLoadMore, loading, hasMore }) => {
	const observerRef = useRef(null);
	const loadingRef = useRef(null);

	const formatDuration = (duration) => {
		const minutes = Math.floor(duration / 60000);
		const seconds = Math.floor((duration % 60000) / 1000)
			.toString()
			.padStart(2, '0');
		return `${minutes}:${seconds}`;
	};

	const handleObserver = useCallback(
		(entries) => {
			const target = entries[0];
			if (target.isIntersecting && hasMore && !loading) {
				onLoadMore();
			}
		},
		[hasMore, loading, onLoadMore]
	);

	useEffect(() => {
		const options = {
			root: null,
			rootMargin: '20px',
			threshold: 0,
		};

		observerRef.current = new IntersectionObserver(handleObserver, options);

		if (loadingRef.current) {
			observerRef.current.observe(loadingRef.current);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [handleObserver]);

	return (
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
					{songs.map((song, index) => (
						<tr
							key={song.id}
							onClick={() => onPlaySong(song, index)}
							className="song-row"
						>
							<td>{index + 1}</td>
							<td>
								<div className="song-name">
									<PlayCircleOutlined className="play-icon" />
									{song.name}
								</div>
							</td>
							<td>{song.ar[0].name}</td>
							<td>{song.al.name}</td>
							<td>{formatDuration(song.dt)}</td>
						</tr>
					))}
				</tbody>
			</table>
			<div ref={loadingRef} className="loading-more">
				{loading && (
					<div className="loading-indicator">
						<LoadingOutlined />
						<span>加载中...</span>
					</div>
				)}
				{!hasMore && songs.length > 0 && (
					<div className="no-more">没有更多歌曲了</div>
				)}
			</div>
		</div>
	);
};

export default SongList;
