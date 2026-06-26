import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-softPink flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h2 className="text-xl font-extrabold mb-2" style={{ color: '#1e1b2e' }}>
              Bir hata oluştu
            </h2>
            <p className="text-sm text-gray-400 font-medium mb-6">
              {this.state.error?.message || 'Beklenmeyen bir hata meydana geldi.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-3 rounded-2xl text-sm font-extrabold shadow-lg inline-flex items-center gap-2"
              style={{ background: '#e3d10d', color: '#1e1b2e', boxShadow: '0 8px 24px rgba(227,209,13,.25)' }}
            >
              <RefreshCw size={16} strokeWidth={2.5} />
              Tekrar Dene
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
