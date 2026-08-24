import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://rsre-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

export async function fetchLatestArticles(limit=10){
  const res = await api.get(`/articles/?state=published&ordering=-published_at&page_size=${limit}`)
  return res.data
}

export async function fetchArticle(id){
  const res = await api.get(`/articles/${id}/`)
  return res.data
}

export default api


