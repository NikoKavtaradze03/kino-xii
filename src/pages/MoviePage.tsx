import { useParams } from 'react-router'

export function MoviePage() {
  const { slug } = useParams()

  return (
    <section className="px-gutter pt-header">
      <h1 className="text-h1">{slug}</h1>
    </section>
  )
}
