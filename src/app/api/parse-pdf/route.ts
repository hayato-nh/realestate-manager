import { NextRequest, NextResponse } from 'next/server'

// Dynamic import to avoid issues with worker in Node.js environment
async function parsePDF(data: Uint8Array): Promise<{ text: string; numPages: number }> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // Disable worker for server-side rendering
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs'

  // Load PDF document
  const loadingTask = pdfjsLib.getDocument({
    data,
    standardFontDataUrl: undefined,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  })

  const pdfDocument = await loadingTask.promise

  // Extract text from all pages
  let fullText = ''
  const numPages = pdfDocument.numPages

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    fullText += pageText + '\n'
  }

  return { text: fullText.trim(), numPages }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
    }

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'PDFファイルのみアップロード可能です' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const uint8Array = new Uint8Array(bytes)

    // Parse PDF
    const { text, numPages } = await parsePDF(uint8Array)

    // Debug log
    console.log('Extracted PDF text:', text.substring(0, 500))

    // Return extracted text
    return NextResponse.json({
      success: true,
      text,
      pages: numPages,
      filename: file.name,
    })
  } catch (error) {
    console.error('PDF parsing error:', error)
    return NextResponse.json(
      { error: 'PDFの解析中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
