import axios from 'axios';

// 使用 netstart.cn 的 API
const BASE_URL = 'https://apis.netstart.cn/music';

// 添加备用音乐源
const BACKUP_URL = 'https://music.163.com/song/media/outer/url?id=';

// 创建 axios 实例
const instance = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	withCredentials: true, // 允许跨域请求携带 cookie
	headers: {
		'Content-Type': 'application/json',
	},
});

// 响应拦截器
instance.interceptors.response.use(
	(response) => response,
	(error) => {
		console.error('API 请求错误:', error);
		if (error.response) {
			console.error('错误状态:', error.response.status);
			console.error('错误数据:', error.response.data);
		}
		return Promise.reject(error);
	}
);

export const api = {
	// 获取推荐歌单
	async getRecommendPlaylists() {
		try {
			const response = await instance.get('/personalized?limit=30');
			if (!response.data.result) {
				throw new Error('获取推荐歌单失败');
			}
			return response.data.result;
		} catch (error) {
			console.error('获取推荐歌单失败:', error);
			return [];
		}
	},

	// 获取歌单详情
	async getPlaylistDetail(id) {
		try {
			const response = await instance.get(`/playlist/detail?id=${id}`);
			if (!response.data.playlist) {
				throw new Error('获取歌单详情失败');
			}
			return response.data.playlist;
		} catch (error) {
			console.error('获取歌单详情失败:', error);
			throw error;
		}
	},

	// 获取歌曲URL
	async getSongUrl(id) {
		try {
			// 使用 /song/url/v1 接口
			const response = await instance.get(
				`/song/url/v1?id=${id}&level=exhigh`
			);
			const url = response.data.data?.[0]?.url;

			if (!url) {
				throw new Error('获取歌曲 URL 失败');
			}

			return url;
		} catch (error) {
			console.error('获取歌曲 URL 失败:', error);
			// 如果失败了，返回一个直接的音乐链接
			return `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
		}
	},

	// 获取歌曲详情
	async getSongDetail(id) {
		try {
			const response = await instance.get(`/song/detail?ids=${id}`);
			if (!response.data.songs?.[0]) {
				throw new Error('获取歌曲详情失败');
			}
			return response.data.songs[0];
		} catch (error) {
			console.error('获取歌曲详情失败:', error);
			throw error;
		}
	},

	// 获取歌词
	async getLyric(id) {
		try {
			const response = await fetch(`${BASE_URL}/lyric?id=${id}`);
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('获取歌词失败:', error);
			return null;
		}
	},

	// 搜索
	async search(keywords) {
		try {
			const response = await instance.get(
				`/search?keywords=${encodeURIComponent(keywords)}`
			);
			return response.data.result?.songs || [];
		} catch (error) {
			console.error('搜索失败:', error);
			return [];
		}
	},

	// 获取热门搜索
	async getHotSearch() {
		try {
			const response = await instance.get('/search/hot');
			return response.data.result?.hots || [];
		} catch (error) {
			console.error('获取热门搜索失败:', error);
			return [];
		}
	},

	// 获取歌单分类
	async getPlaylistCategories() {
		try {
			const response = await instance.get('/playlist/catlist');
			return response.data.sub || [];
		} catch (error) {
			console.error('获取歌单分类失败:', error);
			return [];
		}
	},

	// 根据分类获取歌单
	async getPlaylistByCategory(category, limit = 30, offset = 0) {
		try {
			const response = await instance.get(
				`/top/playlist?cat=${encodeURIComponent(
					category
				)}&limit=${limit}&offset=${offset}`
			);
			return response.data.playlists || [];
		} catch (error) {
			console.error('获取分类歌单失败:', error);
			return [];
		}
	},

	// 手机号登录
	async loginByPhone(phone, password) {
		try {
			const response = await instance.get(
				`/login/cellphone?phone=${phone}&password=${password}`
			);
			if (response.data.code === 200) {
				return response.data;
			}
			throw new Error(response.data.message || '登录失败');
		} catch (error) {
			console.error('登录失败:', error);
			throw error;
		}
	},

	// 获取登录状态
	async getLoginStatus() {
		try {
			const response = await instance.get('/login/status');
			return response.data;
		} catch (error) {
			console.error('获取登录状态失败:', error);
			return null;
		}
	},

	// 退出登录
	async logout() {
		try {
			const response = await instance.get('/logout');
			if (response.data.code !== 200) {
				throw new Error('退出登录失败');
			}
			return response.data;
		} catch (error) {
			console.error('退出登录失败:', error);
			throw error;
		}
	},

	// 获取二维码 key
	async getQRKey() {
		try {
			const response = await instance.get('/login/qr/key');
			return response.data.data.unikey;
		} catch (error) {
			console.error('获取二维码 key 失败:', error);
			throw error;
		}
	},

	// 生成二维码
	async createQRCode(key) {
		try {
			const response = await instance.get(
				`/login/qr/create?key=${key}&qrimg=true`
			);
			return response.data.data.qrimg;
		} catch (error) {
			console.error('生成二维码失败:', error);
			throw error;
		}
	},

	// 检查二维码状态
	async checkQRStatus(key) {
		try {
			const response = await instance.get(`/login/qr/check?key=${key}`);
			return response.data;
		} catch (error) {
			console.error('检查二维码状态失败:', error);
			throw error;
		}
	},

	// 发送验证码
	async sendCaptcha(phone) {
		const res = await fetch(`${BASE_URL}/captcha/sent?phone=${phone}`);
		const data = await res.json();
		if (data.code !== 200) {
			throw new Error(data.message || '发送验证码失败');
		}
		return data;
	},

	// 验证码登录
	async loginByCaptcha(phone, captcha) {
		try {
			const response = await instance.post('/login/cellphone', {
				phone,
				captcha,
			});
			if (response.data.code === 200) {
				return response.data;
			}
			throw new Error(response.data.message || '登录失败');
		} catch (error) {
			console.error('验证码登录失败:', error);
			throw error;
		}
	},

	// 获取用户歌单
	async getUserPlaylists(uid) {
		try {
			const response = await instance.get(`/user/playlist?uid=${uid}`);
			return response.data.playlist || [];
		} catch (error) {
			console.error('获取用户歌单失败:', error);
			return [];
		}
	},

	// 获取每日推荐歌单
	async getDailyRecommendPlaylists() {
		try {
			const response = await instance.get('/recommend/resource');
			return response.data.recommend || [];
		} catch (error) {
			console.error('获取每日推荐歌单失败:', error);
			return [];
		}
	},

	// 获取每日推荐歌曲
	async getDailyRecommendSongs() {
		try {
			const response = await instance.get('/recommend/songs');
			return response.data.data?.dailySongs || [];
		} catch (error) {
			console.error('获取每日推荐歌曲失败:', error);
			return [];
		}
	},

	// 创建歌单
	async createPlaylist(name, privacy = false) {
		try {
			const response = await instance.get('/playlist/create', {
				params: {
					name,
					privacy: privacy ? 10 : 0,
				},
			});
			return response.data.playlist;
		} catch (error) {
			console.error('创建歌单失败:', error);
			throw error;
		}
	},

	// 收藏/取消收藏歌单
	async subscribePlaylist(id, subscribe = true) {
		try {
			const response = await instance.get('/playlist/subscribe', {
				params: {
					id,
					t: subscribe ? 1 : 2,
				},
			});
			return response.data;
		} catch (error) {
			console.error('收藏/取消收藏歌单失败:', error);
			throw error;
		}
	},

	// 获取热门评论
	async getMusicComments(id) {
		const response = await fetch(`${BASE_URL}/comment/hot?type=0&id=${id}`);
		return await response.json();
	},

	async getPlaylistTracks(playlistId, offset = 0, limit = 50) {
		const response = await fetch(
			`${BASE_URL}/playlist/track/all?id=${playlistId}&offset=${offset}&limit=${limit}`,
			{
				credentials: 'include',
			}
		);
		const data = await response.json();
		return data.songs || [];
	},
};
