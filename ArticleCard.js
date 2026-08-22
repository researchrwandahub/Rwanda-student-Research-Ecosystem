import Link from 'next/link'

export default function ArticleCard({article}){
  return (
    <article className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-1"><Link href={`/articles/${article.slug || article.id}`}>{article.title}</Link></h3>
      <div className="text-sm text-gray-600 mb-2">{article.authors?.join(', ') || 'Unknown author'} • {article.university_name || ''}</div>
      <p className="text-sm text-gray-700">{article.abstract?.slice(0,200)}{article.abstract && article.abstract.length>200 ? '…' : ''}</p>
    </article>
  )
}
