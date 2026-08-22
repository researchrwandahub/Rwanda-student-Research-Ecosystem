import { useState, useEffect } from 'react'
import ArticleCard from './components/ArticleCard'
import api from './utils/api'

export default function Articles(){
  const [articles, setArticles] = useState([])

  useEffect(()=>{api.get('/articles/?state=published&ordering=-published_at').then(r=>setArticles(r.data.results || r.data)).catch(()=>setArticles([]))},[])

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  )
}
