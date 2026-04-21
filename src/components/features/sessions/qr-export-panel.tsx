import { QRCodeSVG } from 'qrcode.react'
import { toBlob } from 'html-to-image'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { MonitorPlay } from 'lucide-react'

interface QrExportPanelProps {
  session: any
  studentUrl: string
  onProjectQR: () => void
}

export function QrExportPanel({
  session,
  studentUrl,
  onProjectQR,
}: QrExportPanelProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    const node = document.getElementById('full-qr-export-node')
    if (!node) return
    setIsDownloading(true)
    try {
      const blob = await toBlob(node, {
        quality: 1,
        backgroundColor: 'transparent',
      })
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'Q&A-Join-Instructions.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Downloaded full instructions!')
      }
    } catch (err) {
      toast.error('Failed to generate image')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Student QR
      </p>

      {/* Hidden full styled container for image export */}
      <div className="fixed -left-2499.75 -ml-2499.75">
        <div
          id="full-qr-export-node"
          style={{
            width: '1000px',
            height: '1200px',
            background: '#111827',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'sans-serif',
            position: 'relative',
            overflow: 'hidden',
            padding: '60px',
            boxSizing: 'border-box',
          }}
        >
          {/* Decorative background elements */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '400px',
              height: '400px',
              background:
                'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0) 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: '400px',
              height: '400px',
              background:
                'radial-gradient(circle, rgba(147,51,234,0.2) 0%, rgba(147,51,234,0) 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2
                style={{
                  fontSize: '40px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {session?.topic}
              </h2>
              <p
                style={{
                  fontSize: '24px',
                  color: 'rgba(147,197,253,0.8)',
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {session?.instructor}
              </p>
            </div>
            <div
              style={{
                background: 'white',
                padding: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: '48px',
                width: '100%',
                maxWidth: '800px',
                border: '4px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1
                  style={{
                    fontSize: '72px',
                    fontWeight: 900,
                    color: '#111827',
                    margin: '0 0 16px 0',
                    lineHeight: '1',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Got a question?
                </h1>
                <p
                  style={{
                    fontSize: '28px',
                    color: '#6b7280',
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  Scan the code below to ask your questions
                </p>
              </div>
              <div
                style={{
                  padding: '32px',
                  background: '#f9fafb',
                  borderRadius: '32px',
                  border: '2px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <QRCodeSVG value={studentUrl} size={420} />
              </div>
            </div>
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '20px',
                  color: '#9ca3af',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  margin: '0 0 12px 0',
                }}
              >
                Or visit
              </p>
              <p
                style={{
                  fontSize: '48px',
                  color: 'white',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {studentUrl.replace(/^https?:\/\//, '')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="p-3 border border-gray-100 rounded-xl mb-4 bg-white"
        id="student-qr-container"
      >
        <QRCodeSVG id="student-qr-code" value={studentUrl} size={160} />
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(studentUrl)
          toast.success('Link copied!')
        }}
        className="text-xs font-mono bg-gray-50 border border-gray-200 text-gray-500 px-3 py-2 rounded-lg mb-4 w-full truncate text-center hover:bg-gray-100 transition-colors"
        title="Click to copy"
      >
        {studentUrl}
      </button>
      <div className="flex gap-2 w-full">
        <button
          onClick={onProjectQR}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
        >
          <MonitorPlay size={15} /> Project
        </button>
        <button
          disabled={isDownloading}
          onClick={handleDownload}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
            isDownloading
              ? 'bg-gray-100 text-gray-400 cursor-wait border border-gray-200'
              : 'text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          {isDownloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            'Download'
          )}
        </button>
      </div>
    </div>
  )
}
