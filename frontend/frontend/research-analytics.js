import { useEffect, useState } from 'react'
import api from './api'

export default function ResearchAnalytics(){
  const [topDiseases, setTopDiseases] = useState([])
  const [geography, setGeography] = useState([])

  useEffect(() => {
    Promise.all([api.get('/analytics/top-diseases/?period=3y'), api.get('/analytics/geography/')])
      .then(([diseases, locations]) => {
        setTopDiseases(diseases.data.results || diseases.data || [])
        setGeography(locations.data.results || locations.data || [])
      })
      .catch(() => { setTopDiseases([]); setGeography([]) })
  }, [])

  return <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div className="p-4 border rounded"><h2 className="font-semibold">Top Diseases Published</h2>{topDiseases.length ? <ol className="list-decimal ml-5 mt-2">{topDiseases.map((item, index) => <li key={item.id || item.name || index}>{item.name || item.label}</li>)}</ol> : <p className="mt-3 text-gray-600">No published disease data is available yet.</p>}</div>
    <div className="p-4 border rounded"><h2 className="font-semibold">Research Geography</h2>{geography.length ? <ul className="mt-2">{geography.map((item, index) => <li key={item.id || item.name || index}>{item.name || item.label || item.university}</li>)}</ul> : <p className="mt-3 text-gray-600">No geographic publication data is available yet.</p>}</div>
  </section>
}
