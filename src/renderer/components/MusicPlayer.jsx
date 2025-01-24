import React, { useRef, useEffect, useState } from 'react';
import {
	PlayCircleFilled,
	PauseCircleFilled,
	StepBackwardOutlined,
	StepForwardOutlined,
	SoundOutlined,
	LoadingOutlined,
	MessageOutlined,
} from '@ant-design/icons';
import SongDetail from './SongDetail';

const MusicPlayer = ({
	currentSong,
	isPlaying,
	setIsPlaying,
	onSongChange,
}) => {
	const audioRef = useRef(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(0.5);
	const [loading, setLoading] = useState(false);
	const prevSongRef = useRef(null);
	const [showDetail, setShowDetail] = useState(false);

	useEffect(() => {
		if (currentSong) {
			setIsPlaying(true);
			if (!prevSongRef.current) {
				setLoading(true);
			}
			prevSongRef.current = currentSong;
		}
	}, [currentSong, setIsPlaying]);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = volume;

			const handleCanPlay = () => {
				setLoading(false);
				if (isPlaying) {
					audioRef.current.play().catch((error) => {
						console.error('自动播放失败:', error);
						setIsPlaying(false);
					});
				}
			};

			audioRef.current.addEventListener('canplay', handleCanPlay);
			return () => {
				audioRef.current?.removeEventListener('canplay', handleCanPlay);
			};
		}
	}, [currentSong, isPlaying, volume]);

	const formatTime = (time) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	const handleTimeUpdate = () => {
		setCurrentTime(audioRef.current.currentTime);
	};

	const handleLoadedMetadata = () => {
		setDuration(audioRef.current.duration);
		setLoading(false);
	};

	const handleProgressChange = (e) => {
		const time = parseFloat(e.target.value);
		audioRef.current.currentTime = time;
		setCurrentTime(time);
	};

	const handleVolumeChange = (e) => {
		const newVolume = parseFloat(e.target.value);
		setVolume(newVolume);
		audioRef.current.volume = newVolume;
	};

	const handlePlayPause = () => {
		if (!currentSong) return;

		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play().catch((error) => {
				console.error('播放失败:', error);
				setIsPlaying(false);
			});
		}
		setIsPlaying(!isPlaying);
	};

	const handlePrevSong = () => {
		if (onSongChange) {
			onSongChange('prev');
		}
	};

	const handleNextSong = () => {
		if (onSongChange) {
			onSongChange('next');
		}
	};

	const handleEnded = () => {
		// 播放结束时自动播放下一首
		handleNextSong();
	};

	return (
		<>
			<div className="music-player">
				<div className="song-info">
					{currentSong && (
						<>
							<img src={currentSong.cover} alt="album cover" />
							<div>
								<h3>{currentSong.title}</h3>
								<p>{currentSong.artist}</p>
							</div>
						</>
					)}
				</div>

				<div className="controls">
					<button
						className="control-button"
						onClick={handlePrevSong}
						disabled={!currentSong}
					>
						<StepBackwardOutlined />
					</button>
					<button
						className="play-button"
						onClick={handlePlayPause}
						disabled={!currentSong}
					>
						{loading ? (
							<LoadingOutlined />
						) : isPlaying ? (
							<PauseCircleFilled />
						) : (
							<PlayCircleFilled />
						)}
					</button>
					<button
						className="control-button"
						onClick={handleNextSong}
						disabled={!currentSong}
					>
						<StepForwardOutlined />
					</button>
					<span className="time">{formatTime(currentTime)}</span>
					<input
						type="range"
						className="progress"
						min="0"
						max={duration || 0}
						value={currentTime}
						onChange={handleProgressChange}
					/>
					<span className="time">{formatTime(duration)}</span>
					<div className="volume-control">
						<SoundOutlined />
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={volume}
							onChange={handleVolumeChange}
						/>
					</div>
					<div className="extra-controls">
						<button
							className={`control-button ${
								showDetail ? 'active' : ''
							}`}
							onClick={() => setShowDetail(!showDetail)}
						>
							<MessageOutlined />
						</button>
					</div>
					<audio
						ref={audioRef}
						src={currentSong?.url}
						onTimeUpdate={handleTimeUpdate}
						onLoadedMetadata={handleLoadedMetadata}
						onEnded={handleEnded}
					/>
				</div>
			</div>
			{showDetail && currentSong && (
				<SongDetail
					currentSong={currentSong}
					currentTime={currentTime}
				/>
			)}
		</>
	);
};

export default MusicPlayer;
