import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔥 [Janogon ErrorBoundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || String(this.state.error);
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '24px'
          }}
        >
          <div
            style={{
              maxWidth: '620px',
              width: '100%',
              backgroundColor: '#1e293b',
              borderRadius: '16px',
              padding: '36px 32px',
              border: '1px solid #334155',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'rgba(230, 0, 18, 0.15)',
                color: '#e60012',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 20px auto',
                fontWeight: 'bold'
              }}
            >
              !
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px', color: '#ffffff' }}>
              একটি অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
              পোর্টাল লোড করার সময় ব্রাউজারে ক্যাশ বা ডাটা সংক্রান্ত সমস্যা হয়েছে। নিচের বাটনে ক্লিক করে ক্যাশ ক্লিয়ার করে সাইট পুনরায় লোড করুন।
            </p>

            {errorMsg && (
              <div
                style={{
                  backgroundColor: '#090d16',
                  border: '1px solid #273549',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  color: '#fca5a5',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: '24px'
                }}
              >
                {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🔄 পুনরায় লোড করুন (Reload)
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#e60012',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🧹 ক্যাশ ক্লিয়ার ও রিসেট (Reset Data)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
