'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface ProcessedImage {
  original: string
  processed: string
  filename: string
}

interface BatchItem {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  result?: string
  error?: string
}

const PLATFORM_PRESETS = {
  original: { name: '原始尺寸', width: 0, height: 0 },
  amazon: { name: 'Amazon', width: 2000, height: 2000 },
  shopify: { name: 'Shopify', width: 2048, height: 2048 },
  ebay: { name: 'eBay', width: 1600, height: 1600 },
  etsy: { name: 'Etsy', width: 2000, height: 2000 },
  instagram: { name: 'Instagram', width: 1080, height: 1080 },
  'instagram-story': { name: 'Instagram Story', width: 1080, height: 1920 },
}

const BACKGROUND_OPTIONS = [
  { id: 'transparent', name: '透明', color: 'transparent' },
  { id: 'white', name: '白色', color: '#ffffff' },
  { id: 'black', name: '黑色', color: '#000000' },
  { id: 'gray', name: '灰色', color: '#e5e5e5' },
]

const AI_BACKGROUND_PRESETS = [
  // Studio - Professional
  { id: 'studio-white', name: 'White Studio', icon: '⚪', desc: 'Clean professional white', color: '#f8fafc', category: 'studio' },
  { id: 'studio-gray', name: 'Gray Studio', icon: '⚫', desc: 'Neutral gray backdrop', color: '#6b7280', category: 'studio' },
  { id: 'studio-black', name: 'Black Studio', icon: '⬛', desc: 'Dramatic black background', color: '#1f2937', category: 'studio' },
  { id: 'gradient-pink', name: 'Pink Gradient', icon: '🩷', desc: 'Soft pink gradient', color: '#fce7f3', category: 'studio' },
  { id: 'gradient-blue', name: 'Blue Gradient', icon: '💙', desc: 'Cool blue gradient', color: '#dbeafe', category: 'studio' },
  
  // Lifestyle - Real World
  { id: 'street-urban', name: 'Urban Street', icon: '🏙️', desc: 'Modern city environment', color: '#374151', category: 'lifestyle' },
  { id: 'nature-outdoor', name: 'Nature Garden', icon: '🌿', desc: 'Green plants & sunlight', color: '#10b981', category: 'lifestyle' },
  { id: 'beach-sunset', name: 'Beach Sunset', icon: '🌅', desc: 'Golden beach vibes', color: '#f97316', category: 'lifestyle' },
  { id: 'coffee-shop', name: 'Coffee Shop', icon: '☕', desc: 'Cozy cafe setting', color: '#92400e', category: 'lifestyle' },
  { id: 'home-living', name: 'Home Living', icon: '🏠', desc: 'Warm home interior', color: '#fbbf24', category: 'lifestyle' },
  { id: 'office-desk', name: 'Office Desk', icon: '💼', desc: 'Professional workspace', color: '#64748b', category: 'lifestyle' },
  
  // Luxury - Premium
  { id: 'luxury-indoor', name: 'Luxury Interior', icon: '✨', desc: 'Premium elegant setting', color: '#f59e0b', category: 'luxury' },
  { id: 'marble-gold', name: 'Marble & Gold', icon: '🏛️', desc: 'High-end marble texture', color: '#fef3c7', category: 'luxury' },
  { id: 'velvet-red', name: 'Velvet Red', icon: '🎭', desc: 'Rich velvet backdrop', color: '#991b1b', category: 'luxury' },
  { id: 'concrete-minimal', name: 'Concrete Minimal', icon: '🏗️', desc: 'Industrial concrete', color: '#9ca3af', category: 'luxury' },
  
  // Seasonal - Trending
  { id: 'christmas-winter', name: 'Christmas', icon: '🎄', desc: 'Winter holiday theme', color: '#166534', category: 'seasonal' },
  { id: 'valentine-romance', name: 'Valentine', icon: '💝', desc: 'Romantic pink theme', color: '#fbcfe8', category: 'seasonal' },
  { id: 'halloween-spooky', name: 'Halloween', icon: '🎃', desc: 'Spooky orange & black', color: '#ea580c', category: 'seasonal' },
  { id: 'summer-tropical', name: 'Tropical Summer', icon: '🌴', desc: 'Tropical paradise', color: '#22c55e', category: 'seasonal' },
  
  // E-commerce - Product Focus
  { id: 'amazon-style', name: 'Amazon Style', icon: '📦', desc: 'Clean white product shot', color: '#ffffff', category: 'ecommerce' },
  { id: 'lifestyle-flatlay', name: 'Flat Lay', icon: '📱', desc: 'Top-down arrangement', color: '#f3f4f6', category: 'ecommerce' },
  { id: 'wood-rustic', name: 'Wood Rustic', icon: '🪵', desc: 'Natural wood texture', color: '#a16207', category: 'ecommerce' },
  { id: 'fabric-linen', name: 'Linen Fabric', icon: '🧵', desc: 'Soft fabric backdrop', color: '#fefce8', category: 'ecommerce' },
]

const SHADOW_OPTIONS = [
  { id: 'none', name: '无阴影', blur: 0, offset: 0, opacity: 0 },
  { id: 'soft', name: '柔和阴影', blur: 20, offset: 10, opacity: 0.3 },
  { id: 'natural', name: '自然投影', blur: 15, offset: 15, opacity: 0.4 },
  { id: 'hard', name: '硬阴影', blur: 5, offset: 8, opacity: 0.5 },
  { id: 'floating', name: '悬浮效果', blur: 30, offset: 25, opacity: 0.2 },
]

export default function Home() {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload')
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof PLATFORM_PRESETS>('original')
  const [selectedBg, setSelectedBg] = useState('transparent')
  const [activeTab, setActiveTab] = useState<'basic' | 'ai'>('basic')
  const [selectedAiBg, setSelectedAiBg] = useState<string | null>(null)
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null)
  const [selectedShadow, setSelectedShadow] = useState('none')
  const [aiCustomPrompt, setAiCustomPrompt] = useState('')
  const [isGeneratingAiBg, setIsGeneratingAiBg] = useState(false)
  const [selectedAiCategory, setSelectedAiCategory] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isDragActive, setIsDragActive] = useState(false)

  const processImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('platform', selectedPlatform)
    formData.append('background', selectedBg)

    const response = await fetch('/api/remove-bg', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || '处理失败')
    }

    const data = await response.json()
    return data.processed
  }

  const generateAiBackground = async () => {
    if (!processedImage) return
    
    setIsGeneratingAiBg(true)
    setError('AI 生成中，请稍候（约10-30秒）...')
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒超时
      
      const response = await fetch('/api/ai-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: processedImage.processed,
          preset: selectedAiBg,
          customPrompt: aiCustomPrompt,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.message || data.error)
        if (data.demo) {
          // For demo, composite on colored background
          const canvas = document.createElement('canvas')
          canvas.width = 1024
          canvas.height = 1024
          const ctx = canvas.getContext('2d')
          if (ctx) {
            const preset = AI_BACKGROUND_PRESETS.find(p => p.id === selectedAiBg)
            ctx.fillStyle = preset?.color || '#f8fafc'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            const img = new Image()
            img.crossOrigin = 'anonymous'
            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
              img.src = processedImage.processed
            })
            
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.6
            const x = (canvas.width - img.width * scale) / 2
            const y = (canvas.height - img.height * scale) / 2
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
            
            setAiGeneratedImage(canvas.toDataURL('image/png'))
            setError(null)
          }
        }
      } else {
        setAiGeneratedImage(data.result)
        setError(null)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('AI 生成超时，请重试')
      } else {
        setError(err?.message || 'AI 生成失败')
      }
    } finally {
      setIsGeneratingAiBg(false)
    }
  }

  // Batch processing functions
  const processBatchItem = async (item: BatchItem) => {
    setBatchItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, status: 'processing', progress: 10 } : i
    ))

    try {
      const formData = new FormData()
      formData.append('image', item.file)
      formData.append('platform', selectedPlatform)
      formData.append('background', selectedBg)

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('处理失败')
      }

      const data = await response.json()

      setBatchItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: 'completed', progress: 100, result: data.processed } : i
      ))
    } catch (err: any) {
      setBatchItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: 'error', error: err?.message || '失败' } : i
      ))
    }
  }

  const processBatch = async (items: BatchItem[]) => {
    const concurrency = 3
    
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency)
      await Promise.all(batch.map(item => processBatchItem(item)))
    }
  }

  const handleBatchDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )
    
    if (files.length === 0) {
      setError('请上传有效的图片文件（最大10MB）')
      return
    }

    const newItems: BatchItem[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      status: 'pending',
      progress: 0,
    }))

    setBatchItems(newItems)
    processBatch(newItems)
  }, [selectedPlatform, selectedBg])

  const handleBatchFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )

    const newItems: BatchItem[] = validFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      status: 'pending',
      progress: 0,
    }))

    setBatchItems(newItems)
    processBatch(newItems)
  }, [selectedPlatform, selectedBg])

  const downloadBatchItem = (item: BatchItem) => {
    if (!item.result) return
    const link = document.createElement('a')
    link.href = item.result
    const ext = selectedBg === 'transparent' ? 'png' : 'jpg'
    link.download = `bg-removed-${item.file.name.replace(/\.[^/.]+$/, '')}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllBatch = () => {
    batchItems.forEach((item, index) => {
      if (item.result) {
        setTimeout(() => downloadBatchItem(item), index * 500)
      }
    })
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    
    if (mode === 'batch') {
      await handleBatchDrop(e)
      return
    }
    
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('文件太大，最大10MB')
      return
    }

    await processFile(file)
  }, [selectedPlatform, selectedBg, mode])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    if (mode === 'batch') {
      await handleBatchFileSelect(e)
      return
    }
    
    const file = files[0]
    await processFile(file)
  }, [selectedPlatform, selectedBg, mode])

  // Helper function to convert array buffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const processFile = async (file: File) => {
    setStep('processing')
    setIsProcessing(true)
    setError(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const originalBase64 = `data:${file.type};base64,${arrayBufferToBase64(arrayBuffer)}`

      setProgress(30)
      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: (() => {
          const formData = new FormData()
          formData.append('image', file)
          formData.append('platform', selectedPlatform)
          formData.append('background', selectedBg)
          return formData
        })(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.upgrade) {
          throw new Error('No credits remaining. Please upgrade to Pro.')
        }
        throw new Error(errorData.error || 'Processing failed')
      }

      const data = await response.json()
      setProgress(100)

      setProcessedImage({
        original: originalBase64,
        processed: data.processed,
        filename: file.name,
      })
      
      // Update credits display
      if (data.creditsRemaining !== undefined) {
        setCreditsRemaining(data.creditsRemaining === 'unlimited' ? 'unlimited' : data.creditsRemaining)
        // Update session
        await update({ credits: data.creditsRemaining === 'unlimited' ? -1 : data.creditsRemaining })
      }
      
      setStep('result')
    } catch (err: any) {
      setError(err?.message || '处理出错')
      setStep('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  // Canvas resize function for platform presets
  const resizeImage = (imageUrl: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Fill background if not transparent
        if (selectedBg !== 'transparent') {
          ctx.fillStyle = BACKGROUND_OPTIONS.find(b => b.id === selectedBg)?.color || '#ffffff'
          ctx.fillRect(0, 0, width, height)
        }
        
        // Calculate scaling to fit image within canvas while maintaining aspect ratio
        const scale = Math.min(width / img.width, height / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (width - scaledWidth) / 2
        const y = (height - scaledHeight) / 2
        
        // Apply shadow if selected
        const shadow = SHADOW_OPTIONS.find(s => s.id === selectedShadow)
        if (shadow && shadow.id !== 'none') {
          ctx.save()
          ctx.shadowColor = `rgba(0, 0, 0, ${shadow.opacity})`
          ctx.shadowBlur = shadow.blur
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = shadow.offset
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
          ctx.restore()
        } else {
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        }
        
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageUrl
    })
  }

  const handleDownload = async () => {
    if (!processedImage) return
    
    const preset = PLATFORM_PRESETS[selectedPlatform]
    let imageUrl = processedImage.processed
    
    // Resize if platform preset is selected
    if (preset.width > 0 && preset.height > 0) {
      try {
        setError('正在调整尺寸...')
        imageUrl = await resizeImage(processedImage.processed, preset.width, preset.height)
        setError(null)
      } catch (err) {
        console.error('Resize failed:', err)
        // Fall back to original processed image
      }
    }
    
    const link = document.createElement('a')
    link.href = imageUrl
    const ext = selectedBg === 'transparent' ? 'png' : 'jpg'
    const platformName = selectedPlatform === 'original' ? '' : `-${selectedPlatform}`
    link.download = `bg-removed${platformName}-${processedImage.filename.replace(/\.[^/.]+$/, '')}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReset = () => {
    setProcessedImage(null)
    setBatchItems([])
    setError(null)
    setStep('upload')
  }

  const { data: session, status, update } = useSession()
  const [creditsRemaining, setCreditsRemaining] = useState<number | 'unlimited' | null>(null)

  // Fetch user credits on mount
  useEffect(() => {
    if (session?.user) {
      fetchUserCredits()
    }
  }, [session])

  const fetchUserCredits = async () => {
    try {
      const res = await fetch('/api/user/stats')
      if (res.ok) {
        const data = await res.json()
        setCreditsRemaining(data.user.credits === -1 ? 'unlimited' : data.user.credits)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Header */}
      <header style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(34, 211, 238, 0.3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BG Remover Pro</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="/pricing" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '14px' }}>Pricing</a>
            <a href="/dashboard" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', fontSize: '14px' }}>Dashboard</a>
            {status === 'authenticated' && session?.user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Credits Badge */}
                {creditsRemaining !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: creditsRemaining === 'unlimited' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)', borderRadius: '20px', border: `1px solid ${creditsRemaining === 'unlimited' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={creditsRemaining === 'unlimited' ? '#fbbf24' : '#10b981'}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                    </svg>
                    <span style={{ color: creditsRemaining === 'unlimited' ? '#fbbf24' : '#10b981', fontSize: '13px', fontWeight: '500' }}>
                      {creditsRemaining === 'unlimited' ? 'Unlimited' : `${creditsRemaining} credits`}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                  <span style={{ color: '#ffffff', fontSize: '13px' }}>{session.user.email}</span>
                  <span style={{ color: session.user.plan === 'pro' ? '#fbbf24' : 'rgba(255, 255, 255, 0.6)', fontSize: '12px', fontWeight: '500' }}>
                    {session.user.plan === 'pro' ? 'PRO' : 'FREE'}
                  </span>
                </div>
                <a 
                  href="/dashboard"
                  style={{ padding: '8px 16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', textDecoration: 'none' }}
                >
                  Dashboard
                </a>
              </div>
            ) : (
              <>
                <a href="/login" style={{ padding: '8px 20px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', textDecoration: 'none' }}>Login</a>
                <a href="/pricing" style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', boxShadow: '0 4px 20px rgba(34, 211, 238, 0.3)', textDecoration: 'none' }}>Get Started</a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      {step === 'upload' && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '9999px', color: '#22d3ee', fontSize: '14px', marginBottom: '32px' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#22d3ee', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
            AI 驱动，5秒完成背景移除
          </div>
          
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px', lineHeight: 1.2 }}>
            专业级
            <span style={{ background: 'linear-gradient(135deg, #22d3ee 0%, #a78bfa 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> 背景移除 </span>
            工具
          </h1>
          
          <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '600px', margin: '0 auto 48px' }}>
            一键移除图片背景，生成透明 PNG 或自定义背景色。完美适用于电商、社交媒体、产品展示。
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', marginBottom: '64px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff' }}>10M+</div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>图片处理</div>
            </div>
            <div style={{ width: '1px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff' }}>5秒</div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>平均处理</div>
            </div>
            <div style={{ width: '1px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff' }}>99.9%</div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>准确率</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 64px', backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
        {/* Card Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setMode('single')}
              style={{ 
                padding: '8px 20px', 
                borderRadius: '6px', 
                fontSize: '14px', 
                fontWeight: '500', 
                background: mode === 'single' ? 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)' : 'transparent',
                color: mode === 'single' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                boxShadow: mode === 'single' ? '0 4px 12px rgba(34, 211, 238, 0.3)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              单张处理
            </button>
            <button 
              onClick={() => setMode('batch')}
              style={{ 
                padding: '8px 20px', 
                borderRadius: '6px', 
                fontSize: '14px', 
                fontWeight: '500',
                background: mode === 'batch' ? 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)' : 'transparent',
                color: mode === 'batch' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                boxShadow: mode === 'batch' ? '0 4px 12px rgba(34, 211, 238, 0.3)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              批量处理
            </button>
          </div>
          {mode === 'batch' && batchItems.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                已完成 {batchItems.filter(i => i.status === 'completed').length} / {batchItems.length}
              </span>
              <button 
                onClick={downloadAllBatch}
                disabled={!batchItems.some(i => i.status === 'completed')}
                style={{
                  padding: '8px 16px',
                  background: batchItems.some(i => i.status === 'completed') ? 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)' : 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: batchItems.some(i => i.status === 'completed') ? 'pointer' : 'not-allowed',
                  opacity: batchItems.some(i => i.status === 'completed') ? 1 : 0.5,
                }}
              >
                下载全部
              </button>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: '500px' }}>
          {/* Sidebar */}
          <div style={{ padding: '24px', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
              <button 
                onClick={() => setActiveTab('basic')}
                style={{ 
                  flex: 1, 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'basic' ? 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)' : 'transparent',
                  color: activeTab === 'basic' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  boxShadow: activeTab === 'basic' ? '0 4px 12px rgba(34, 211, 238, 0.3)' : 'none',
                }}
              >
                基础
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                style={{ 
                  flex: 1, 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'ai' ? 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)' : 'transparent',
                  color: activeTab === 'ai' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  boxShadow: activeTab === 'ai' ? '0 4px 12px rgba(167, 139, 250, 0.3)' : 'none',
                }}
              >
                AI 背景
              </button>
            </div>

            {activeTab === 'basic' ? (
              <>
                {/* Platform */}
                <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                平台尺寸
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {Object.entries(PLATFORM_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPlatform(key as keyof typeof PLATFORM_PRESETS)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: selectedPlatform === key ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedPlatform === key ? '#22d3ee' : 'rgba(255, 255, 255, 0.8)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderColor: selectedPlatform === key ? 'rgba(34, 211, 238, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                </svg>
                背景颜色
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {BACKGROUND_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBg(bg.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: `1px solid ${selectedBg === bg.id ? '#22d3ee' : 'rgba(255, 255, 255, 0.1)'}`,
                      backgroundColor: selectedBg === bg.id ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backgroundColor: bg.color === 'transparent' ? undefined : bg.color,
                        backgroundImage: bg.color === 'transparent'
                          ? 'linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)'
                          : undefined,
                        backgroundSize: bg.color === 'transparent' ? '6px 6px' : undefined,
                      }}
                    />
                    <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

              </>
            ) : (
              <>
                {/* AI Background */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    AI Scene Generation
                  </div>
                  
                  {/* Category Filter */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {['all', 'studio', 'lifestyle', 'luxury', 'seasonal', 'ecommerce'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedAiCategory(cat)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          border: 'none',
                          cursor: 'pointer',
                          background: selectedAiCategory === cat ? 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)' : 'rgba(255, 255, 255, 0.1)',
                          color: selectedAiCategory === cat ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                    {AI_BACKGROUND_PRESETS
                      .filter(preset => selectedAiCategory === 'all' || preset.category === selectedAiCategory)
                      .map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedAiBg(preset.id)}
                        disabled={!processedImage}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: `1px solid ${selectedAiBg === preset.id ? '#ec4899' : 'rgba(255, 255, 255, 0.1)'}`,
                          backgroundColor: selectedAiBg === preset.id ? 'rgba(236, 72, 153, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          cursor: processedImage ? 'pointer' : 'not-allowed',
                          opacity: processedImage ? 1 : 0.5,
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ fontSize: '18px', marginBottom: '2px' }}>{preset.icon}</div>
                        <div style={{ fontSize: '11px', fontWeight: '500', color: selectedAiBg === preset.id ? '#ec4899' : 'rgba(255, 255, 255, 0.8)', marginBottom: '1px' }}>{preset.name}</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)' }}>{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                  
                  {processedImage ? (
                    <>
                      <textarea
                        value={aiCustomPrompt}
                        onChange={(e) => setAiCustomPrompt(e.target.value)}
                        placeholder="或输入自定义场景描述..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#ffffff',
                          fontSize: '13px',
                          resize: 'none',
                          marginBottom: '12px',
                        }}
                        rows={2}
                      />
                      <button
                        onClick={generateAiBackground}
                        disabled={!selectedAiBg || isGeneratingAiBg}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: isGeneratingAiBg ? 'rgba(167, 139, 250, 0.3)' : 'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: (!selectedAiBg || isGeneratingAiBg) ? 'not-allowed' : 'pointer',
                          opacity: (!selectedAiBg || isGeneratingAiBg) ? 0.7 : 1,
                        }}
                      >
                        {isGeneratingAiBg ? '生成中...' : '生成 AI 背景'}
                      </button>
                    </>
                  ) : (
                    <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>请先上传图片以使用 AI 背景生成功能</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Pro Card */}
            <div style={{ padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(249, 115, 22, 0.2) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="#fbbf24">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Pro 功能
              </div>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '12px' }}>解锁 AI 背景生成、批量处理、高清输出</p>
              <button style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>升级 Pro</button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '32px' }}>
            {mode === 'batch' ? (
              // Batch Mode
              <div>
                {batchItems.length === 0 ? (
                  <div
                    style={{
                      border: `2px dashed ${isDragActive ? '#22d3ee' : 'rgba(255, 255, 255, 0.2)'}`,
                      borderRadius: '16px',
                      padding: '64px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isDragActive ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: isDragActive ? '0 0 30px rgba(34, 211, 238, 0.2)' : 'none',
                    }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                    onDragLeave={() => setIsDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('batch-file-input')?.click()}
                  >
                    <input
                      id="batch-file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                    <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(34, 211, 238, 0.2)' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p style={{ fontSize: '20px', color: '#ffffff', marginBottom: '8px' }}>
                      <span style={{ color: '#22d3ee', fontWeight: 600 }}>点击上传</span> 或拖拽多张图片
                    </p>
                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '32px' }}>支持批量上传，最多 50 张，每张最大 10MB</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '16px' }}>批量处理队列</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {batchItems.map((item) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                              </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.file.name}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {item.status === 'pending' && <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>等待中...</span>}
                                {item.status === 'processing' && <span style={{ fontSize: '12px', color: '#22d3ee' }}>处理中...</span>}
                                {item.status === 'completed' && <span style={{ fontSize: '12px', color: '#10b981' }}>✓ 完成</span>}
                                {item.status === 'error' && <span style={{ fontSize: '12px', color: '#ef4444' }}>✗ 失败</span>}
                              </div>
                            </div>
                            {item.status === 'completed' && item.result && (
                              <button
                                onClick={() => downloadBatchItem(item)}
                                style={{
                                  padding: '8px 16px',
                                  background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                }}
                              >
                                下载
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setBatchItems([])}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        清空队列
                      </button>
                      <button
                        onClick={() => document.getElementById('batch-file-input')?.click()}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        添加更多
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Single Mode
              <>
                {step === 'upload' && (
                  <div>
                    <div
                      style={{
                        border: `2px dashed ${isDragActive ? '#22d3ee' : 'rgba(255, 255, 255, 0.2)'}`,
                        borderRadius: '16px',
                        padding: '64px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        boxShadow: isDragActive ? '0 0 30px rgba(34, 211, 238, 0.2)' : 'none',
                      }}
                      onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                      onDragLeave={() => setIsDragActive(false)}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                      />
                      <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(34, 211, 238, 0.2)' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p style={{ fontSize: '20px', color: '#ffffff', marginBottom: '8px' }}>
                        <span style={{ color: '#22d3ee', fontWeight: 600 }}>点击上传</span> 或拖拽图片到这里
                      </p>
                      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '32px' }}>支持 JPG、PNG、WebP 格式，最大 10MB</p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          5秒完成
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          高清输出
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          安全私密
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '14px' }}>
                        {error}
                      </div>
                    )}
                  </div>
                )}

            {step === 'processing' && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ width: '100px', height: '100px', margin: '0 auto 32px', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(255, 255, 255, 0.1)', borderRadius: '50%' }}></div>
                  <div style={{ position: 'absolute', inset: 0, border: '4px solid transparent', borderTopColor: '#22d3ee', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#22d3ee' }}>
                    {progress}%
                  </div>
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>正在处理...</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>AI 正在移除背景，请稍候</p>
              </div>
            )}

            {step === 'result' && processedImage && (
              <div>
                {/* Platform info */}
                {selectedPlatform !== 'original' && (
                  <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                    <span style={{ color: '#22d3ee', fontSize: '14px' }}>
                      已选择 {PLATFORM_PRESETS[selectedPlatform].name} 尺寸 ({PLATFORM_PRESETS[selectedPlatform].width} × {PLATFORM_PRESETS[selectedPlatform].height}px)，下载时将自动裁剪
                    </span>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)' }}>原图</span>
                    </div>
                    <div style={{ padding: '24px' }}>
                      <img src={processedImage.original} alt="原图" style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', borderRadius: '8px' }} />
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', backgroundColor: 'rgba(34, 211, 238, 0.1)', borderBottom: '1px solid rgba(34, 211, 238, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#22d3ee' }}>移除背景</span>
                      {selectedPlatform !== 'original' && (
                        <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                          {PLATFORM_PRESETS[selectedPlatform].width} × {PLATFORM_PRESETS[selectedPlatform].height}px
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '24px' }}>
                      <div style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', backgroundColor: selectedBg === 'transparent' ? undefined : BACKGROUND_OPTIONS.find(b => b.id === selectedBg)?.color, backgroundImage: selectedBg === 'transparent' ? 'linear-gradient(45deg, #1f2937 25%, transparent 25%), linear-gradient(-45deg, #1f2937 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1f2937 75%), linear-gradient(-45deg, transparent 75%, #1f2937 75%)' : undefined, backgroundSize: selectedBg === 'transparent' ? '16px 16px' : undefined }}>
                        <img src={processedImage.processed} alt="处理后" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={handleDownload} style={{ flex: 1, padding: '16px 24px', background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 20px rgba(34, 211, 238, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载高清图片
                  </button>
                  <button onClick={handleReset} style={{ padding: '16px 24px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}>
                    处理新图片
                  </button>
                </div>
              </div>
            )}
          </>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}
