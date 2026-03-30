'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

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
  original: { name: 'Original', width: 0, height: 0 },
  amazon: { name: 'Amazon', width: 2000, height: 2000 },
  shopify: { name: 'Shopify', width: 2048, height: 2048 },
  ebay: { name: 'eBay', width: 1600, height: 1600 },
  etsy: { name: 'Etsy', width: 2000, height: 2000 },
  instagram: { name: 'Instagram', width: 1080, height: 1080 },
  'instagram-story': { name: 'Instagram Story', width: 1080, height: 1920 },
}

const BACKGROUND_OPTIONS = [
  { id: 'transparent', name: 'Transparent', color: 'transparent', pattern: 'checkerboard' },
  { id: 'white', name: 'White', color: '#ffffff' },
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'gray', name: 'Gray', color: '#f3f4f6' },
  { id: 'gradient-blue', name: 'Blue Gradient', type: 'gradient', colors: ['#3b82f6', '#1e40af'] },
  { id: 'gradient-warm', name: 'Warm Gradient', type: 'gradient', colors: ['#f97316', '#dc2626'] },
]

const AI_BACKGROUND_PRESETS = [
  { id: 'studio-white', name: 'Studio White', prompt: 'professional white studio background, soft lighting, clean minimal' },
  { id: 'studio-gray', name: 'Studio Gray', prompt: 'professional gray studio background, soft lighting, clean minimal' },
  { id: 'street-urban', name: 'Urban Street', prompt: 'urban street background, city environment, natural lighting' },
  { id: 'nature-outdoor', name: 'Nature Outdoor', prompt: 'natural outdoor background, green plants, sunlight' },
  { id: 'luxury-indoor', name: 'Luxury Indoor', prompt: 'luxury indoor setting, elegant furniture, warm lighting' },
  { id: 'beach-sunset', name: 'Beach Sunset', prompt: 'beach sunset background, golden hour, ocean view' },
]

const SHADOW_OPTIONS = [
  { id: 'none', name: 'No Shadow' },
  { id: 'soft', name: 'Soft Shadow', blur: 20, opacity: 0.3, offset: 10 },
  { id: 'natural', name: 'Natural Shadow', blur: 15, opacity: 0.4, offset: 15 },
  { id: 'hard', name: 'Hard Shadow', blur: 5, opacity: 0.5, offset: 8 },
  { id: 'floating', name: 'Floating', blur: 30, opacity: 0.2, offset: 25 },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null)
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof PLATFORM_PRESETS>('original')
  const [selectedBg, setSelectedBg] = useState('transparent')
  const [selectedAiBg, setSelectedAiBg] = useState<string | null>(null)
  const [selectedShadow, setSelectedShadow] = useState('soft')
  const [customPrompt, setCustomPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [showAiOptions, setShowAiOptions] = useState(false)

  const processImage = async (file: File, isBatch = false): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('platform', selectedPlatform)
    formData.append('background', selectedBg)
    formData.append('shadow', selectedShadow)
    if (selectedAiBg) {
      formData.append('aiBackground', selectedAiBg)
    }
    if (customPrompt) {
      formData.append('customPrompt', customPrompt)
    }

    const response = await fetch('/api/remove-bg', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to process image')
    }

    const data = await response.json()
    return data.processed
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    const validFiles = acceptedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload image files only')
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File too large. Maximum size is 10MB.')
        return false
      }
      return true
    })

    if (activeTab === 'single') {
      if (validFiles.length > 0) {
        const file = validFiles[0]
        setIsProcessing(true)
        setError(null)
        setProgress(10)

        try {
          const arrayBuffer = await file.arrayBuffer()
          const originalBase64 = `data:${file.type};base64,${btoa(
            String.fromCharCode(...new Uint8Array(arrayBuffer))
          )}`

          setProgress(30)
          const processed = await processImage(file)
          setProgress(100)

          setProcessedImage({
            original: originalBase64,
            processed: processed,
            filename: file.name,
          })
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
          setIsProcessing(false)
        }
      }
    } else {
      const newItems: BatchItem[] = validFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        status: 'pending',
        progress: 0,
      }))
      setBatchItems(prev => [...prev, ...newItems])
      processBatch(newItems)
    }
  }, [activeTab, selectedPlatform, selectedBg, selectedAiBg, selectedShadow, customPrompt])

  const processBatch = async (items: BatchItem[]) => {
    const concurrency = 3
    
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency)
      
      await Promise.all(batch.map(async (item) => {
        setBatchItems(prev => prev.map(bi => 
          bi.id === item.id ? { ...bi, status: 'processing', progress: 10 } : bi
        ))

        try {
          const result = await processImage(item.file, true)
          
          setBatchItems(prev => prev.map(bi => 
            bi.id === item.id ? { ...bi, status: 'completed', progress: 100, result } : bi
          ))
        } catch (err) {
          setBatchItems(prev => prev.map(bi => 
            bi.id === item.id ? { 
              ...bi, 
              status: 'error', 
              error: err instanceof Error ? err.message : 'Failed' 
            } : bi
          ))
        }
      }))
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: activeTab === 'single' ? 1 : 50,
    disabled: isProcessing,
  })

  const handleDownload = (imageUrl?: string, filename?: string) => {
    const url = imageUrl || processedImage?.processed
    const name = filename || processedImage?.filename
    if (!url) return
    
    const link = document.createElement('a')
    link.href = url
    const ext = selectedBg === 'transparent' ? 'png' : 'jpg'
    link.download = `processed-${name?.replace(/\.[^/.]+$/, '') || 'image'}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadAll = () => {
    batchItems.forEach((item, index) => {
      if (item.result) {
        setTimeout(() => {
          handleDownload(item.result, item.file.name)
        }, index * 500)
      }
    })
  }

  const handleReset = () => {
    setProcessedImage(null)
    setBatchItems([])
    setError(null)
    setProgress(0)
    setSelectedAiBg(null)
    setCustomPrompt('')
  }

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              <span className="text-primary-600">AI</span> BG Remover
            </h1>
            <nav className="flex space-x-4 sm:space-x-8 text-sm sm:text-base">
              <a href="#" className="text-gray-500 hover:text-gray-900 hidden sm:block">Features</a>
              <a href="#" className="text-gray-500 hover:text-gray-900 hidden sm:block">Pricing</a>
              <a href="#" className="text-gray-500 hover:text-gray-900">API</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 sm:mb-4">
            Professional Product Photos
            <span className="block text-primary-600">in Seconds</span>
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Remove backgrounds, generate AI scenes, add shadows. 
            Perfect for Amazon, Shopify, eBay, and social media.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'single' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single Image
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'batch' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Batch Processing
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'single' && !processedImage && (
            <>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-12 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50'}
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input {...getInputProps()} />
                <div className="mb-3 sm:mb-4">
                  <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {isProcessing ? (
                  <div>
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-2">Processing...</p>
                    <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">{progress}%</p>
                  </div>
                ) : (
                  <>
                    <p className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                      {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">PNG, JPG, WebP up to 10MB</p>
                  </>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'batch' && (
            <>
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center cursor-pointer mb-4
                  transition-all duration-200
                  ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50'}
                `}
              >
                <input {...getInputProps()} />
                <p className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                  {isDragActive ? 'Drop images here' : 'Drag & drop multiple images'}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Process up to 50 images at once</p>
              </div>

              {batchItems.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Queue ({batchItems.filter(i => i.status === 'completed').length}/{batchItems.length})
                    </h3>
                    <button
                      onClick={handleDownloadAll}
                      disabled={!batchItems.some(i => i.status === 'completed')}
                      className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      Download All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {batchItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                          <div className="flex items-center gap-2">
                            {item.status === 'processing' && (
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                              </div>
                            )}
                            <span className={`text-xs ${
                              item.status === 'completed' ? 'text-green-600' :
                              item.status === 'error' ? 'text-red-600' :
                              item.status === 'processing' ? 'text-primary-600' : 'text-gray-500'
                            }`}>
                              {item.status === 'completed' ? 'Done' :
                               item.status === 'error' ? 'Error' :
                               item.status === 'processing' ? 'Processing' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        {item.result && (
                          <button onClick={() => handleDownload(item.result, item.file.name)} className="text-primary-600 hover:text-primary-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        )}
                        <button onClick={() => removeBatchItem(item.id)} className="text-gray-400 hover:text-red-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Options Panel */}
          {!processedImage && (
            <div className="mt-4 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Platform */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 sm:mb-4">Platform Size</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(PLATFORM_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPlatform(key as keyof typeof PLATFORM_PRESETS)}
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        selectedPlatform === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 sm:mb-4">Background</h3>
                <div className="grid grid-cols-3 gap-2">
                  {BACKGROUND_OPTIONS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => { setSelectedBg(bg.id); setSelectedAiBg(null) }}
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                        selectedBg === bg.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span 
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded border flex-shrink-0 ${bg.pattern === 'checkerboard' ? 'bg-checkerboard' : ''}`}
                        style={{ 
                          backgroundColor: bg.color !== 'transparent' ? bg.color : undefined,
                          background: bg.type === 'gradient' ? `linear-gradient(135deg, ${bg.colors?.[0]}, ${bg.colors?.[1]})` : undefined
                        }}
                      ></span>
                      <span className="truncate">{bg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shadow */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 sm:mb-4">Shadow Effect</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SHADOW_OPTIONS.map((shadow) => (
                    <button
                      key={shadow.id}
                      onClick={() => setSelectedShadow(shadow.id)}
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        selectedShadow === shadow.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {shadow.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Background */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">AI Background</h3>
                  <button onClick={() => setShowAiOptions(!showAiOptions)} className="text-xs text-primary-600 hover:text-primary-700">
                    {showAiOptions ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showAiOptions && (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {AI_BACKGROUND_PRESETS.map((bg) => (
                        <button
                          key={bg.id}
                          onClick={() => { setSelectedAiBg(bg.id); setSelectedBg('transparent') }}
                          className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors text-left ${
                            selectedAiBg === bg.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {bg.name}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Or describe your custom background..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {processedImage && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Result</h3>
                <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700 font-medium">← Process another</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Original</p>
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img src={processedImage.original} alt="Original" className="w-full h-auto max-h-48 sm:max-h-96 object-contain" />
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Processed</p>
                  <div className="rounded-lg overflow-hidden" style={{ backgroundColor: selectedBg === 'transparent' && !selectedAiBg ? undefined : BACKGROUND_OPTIONS.find(b => b.id === selectedBg)?.color }}>
                    {selectedBg === 'transparent' && !selectedAiBg ? (
                      <div className="bg-checkerboard">
                        <img src={processedImage.processed} alt="Processed" className="w-full h-auto max-h-48 sm:max-h-96 object-contain" />
                      </div>
                    ) : (
                      <img src={processedImage.processed} alt="Processed" className="w-full h-auto max-h-48 sm:max-h-96 object-contain" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <button onClick={() => handleDownload()} className="bg-primary-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button onClick={handleReset} className="bg-gray-100 text-gray-700 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">Start Over</button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-4">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">Lightning Fast</h3>
            <p className="text-sm text-gray-600">Remove backgrounds in seconds with AI</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">High Quality</h3>
            <p className="text-sm text-gray-600">Pixel-perfect edges, even with hair</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">Batch Processing</h3>
            <p className="text-sm text-gray-600">Process up to 50 images at once</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <p className="text-center text-gray-500 text-sm">© 2024 AI Background Remover. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}