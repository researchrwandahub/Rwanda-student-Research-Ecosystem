import { useState, useEffect } from 'react'
import ArticleCard from '../../ArticleCard'
import api from '../../api'

export default function Articles() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    api
      .get('/articles/?state=published&ordering=-published_at')
      .then((r) => setArticles(r.data.results || r.data || []))
      .catch((err) => console.error('Articles error:', err))
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Articles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </main>
  )
}
