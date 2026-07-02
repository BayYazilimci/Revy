import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePublishedSite } from '../hooks/useWebsites'
import { WEBSITE_TEMPLATES } from '../data/websiteTemplates'
import { WebsitePreview as SiteRenderer } from '../components/website/SiteRenderer'
import LoadingState from '../components/ui/LoadingState'
import { Globe } from 'lucide-react'

export default function PublishedSite() {
  const { slug } = useParams()
  const { site, loading, error } = usePublishedSite(slug)

  useEffect(() => {
    if (!site) return
    document.title = site.metaTitle || site.name || 'Web Sitesi'

    let metaDesc = document.querySelector('meta[name="description"]')
    if (site.metaDescription) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.name = 'description'
        document.head.appendChild(metaDesc)
      }
      metaDesc.content = site.metaDescription
    }

    return () => {
      document.title = 'FSBO'
    }
  }, [site])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingState type="spinner" />
      </div>
    )
  }

  if (error || !site) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Globe size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-xl font-extrabold text-deep mb-2">Site Bulunamadı</h1>
          <p className="text-sm text-gray-500">Bu adreste yayınlanmış bir site bulunmuyor.</p>
        </div>
      </div>
    )
  }

  const template = WEBSITE_TEMPLATES.find(t => t.id === site.templateId) || WEBSITE_TEMPLATES[0]
  const colors = site.colors || template.colors

  const siteTemplate = { ...template, colors: { ...template.colors, ...colors } }

  return (
    <div className="min-h-screen bg-cream">
      <SiteRenderer
        template={siteTemplate}
        companyInfo={site.companyInfo || {}}
        listings={site.listings || []}
        sections={(site.sections || []).map(s => ({ ...s, visible: true }))}
        customDomain={site.customDomain}
      />
    </div>
  )
}
