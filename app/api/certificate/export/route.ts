import { NextRequest, NextResponse } from 'next/server'
import type { CanvasElement } from '@/types/canvas'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'
// @ts-ignore
import QRCode from 'qrcode'

// Create a service role client for API routes
const supabaseUrl = "https://zccuayvctmnaureizyua.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key-here"

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Generate PDF using Puppeteer and save to Supabase storage
async function generateAndSavePDF(orgId: string, studentName: string, template: any, studentData: any) {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Get template dimensions
    const canvasWidth = template.canvas_width || 800
    const canvasHeight = template.canvas_height || 600
    
    // Set viewport to match template dimensions
    await page.setViewport({ width: canvasWidth, height: canvasHeight })
    
    // Create HTML content based on template elements
    const htmlContent = await generateHTMLFromTemplate(template, studentData)
    
    // Set the HTML content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    // Generate PDF with exact size and no margins (pixel-perfect, no white bars)
    const pdfBuffer = await page.pdf({
      width: `${canvasWidth}px`,
      height: `${canvasHeight}px`,
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    })
    
    await browser.close()
    
    // Create folder structure: org_id/student_name/
    const folderPath = `${orgId}/${studentName.replace(/[^a-z0-9]/gi, "_")}/`
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `certificate_${timestamp}.pdf`
    const fullPath = `${folderPath}${filename}`
    
    // Upload PDF to Supabase storage
    const { data, error } = await supabaseAdmin.storage
      .from('certificates')
      .upload(fullPath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })
    
    if (error) {
      console.error('Storage upload error:', error)
      throw new Error(`Failed to save PDF: ${error.message}`)
    }
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('certificates')
      .getPublicUrl(fullPath)
    
    return {
      success: true,
      filePath: fullPath,
      publicUrl: urlData.publicUrl,
      filename: filename
    }
  } catch (error) {
    console.error('PDF generation error:', error)
    throw error
  }
}

// Generate HTML from template elements
async function generateHTMLFromTemplate(template: any, studentData: any) {
  const elements = template.elements || []
  const canvasWidth = template.canvas_width || 800
  const canvasHeight = template.canvas_height || 600
  const background = template.background || '#ffffff'
  const gradient = template.gradient || null
  
  console.log('Generating HTML for template:', {
    template_name: template.name,
    elements_count: elements.length,
    canvas_width: canvasWidth,
    canvas_height: canvasHeight,
    background: background,
    gradient: gradient
  })
  
  // Create CSS for elements
  const elementStyles = elements.map((element: any, index: number) => {
    const { type, x, y, width, height, content, fontSize, fontFamily, color, fontWeight, textAlign, backgroundColor, borderColor, borderWidth, borderRadius, imageUrl, zIndex } = element
    
    console.log(`Element ${index}:`, { type, x, y, width, height, content: content?.substring(0, 50) })
    
    let elementCSS = `
      .element-${index} {
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
        z-index: ${zIndex || 1};
    `
    
    if (type === 'text') {
      elementCSS += `
        font-size: ${fontSize || 20}px;
        font-family: '${fontFamily || 'Noto Sans Arabic, Arial, sans-serif'}';
        color: ${color || '#000000'};
        font-weight: ${fontWeight || 'normal'};
        text-align: ${textAlign || 'center'};
        line-height: 1.2;
        display: flex;
        align-items: center;
        justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'};
      `
    } else if (type === 'rectangle') {
      elementCSS += `
        background-color: ${backgroundColor || 'transparent'};
        border: ${borderWidth || 0}px solid ${borderColor || 'transparent'};
        border-radius: ${borderRadius || 0}px;
      `
    } else if (type === 'image') {
      elementCSS += `
        background-image: url('${imageUrl || ''}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      `
    } else if (type === 'qr') {
      elementCSS += `
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
      `
    }
    
    elementCSS += '}'
    return elementCSS
  }).join('\n')
  
  // Create HTML elements (async for QR)
  const elementHTML = await Promise.all(elements.map(async (element: any, index: number) => {
    const { type, content, imageUrl } = element
    if (type === 'text') {
      let displayText = content || '';
      // Replace all placeholders globally
      displayText = displayText
        .replace(/{{student_name}}/g, studentData.student_name)
        .replace(/{{course_name}}/g, studentData.course_name)
        .replace(/{{completion_date}}/g, studentData.completion_date)
        .replace(/{{instructor_name}}/g, studentData.instructor_name)
        .replace(/{{grade}}/g, studentData.grade)
        .replace(/{{org_id}}/g, studentData.org_id);
      console.log(`Text element ${index}: "${content}" -> "${displayText}"`);
      return `<div class="element-${index}">${displayText}</div>`;
    } else if (type === 'rectangle') {
      return `<div class="element-${index}"></div>`
    } else if (type === 'image') {
      return `<div class="element-${index}"></div>`
    } else if (type === 'qr') {
      // Generate QR code for the provided link
      const qrValue = studentData.student_qr_url || 'https://default-link.com';
      const qrDataUrl = await QRCode.toDataURL(qrValue);
      return `<div class="element-${index}"><img src="${qrDataUrl}" alt="QR Code" style="width:100%;height:100%;object-fit:contain;" /></div>`;
    }
    return ''
  }))
  .then(results => results.join('\n'))
  
  // Create background style
  let backgroundStyle = `background: ${background};`
  if (gradient) {
    backgroundStyle = `background: ${gradient};`
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Certificate</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap');
        body {
          margin: 0;
          padding: 0;
          font-family: 'Noto Sans Arabic', Arial, sans-serif;
          direction: rtl;
        }
        .certificate {
          width: ${canvasWidth}px;
          height: ${canvasHeight}px;
          position: relative;
          overflow: hidden;
          ${backgroundStyle}
        }
        ${elementStyles}
      </style>
    </head>
    <body>
      <div class="certificate">
        ${elementHTML}
      </div>
    </body>
    </html>
  `
  
  console.log('Generated HTML length:', htmlContent.length)
  console.log('Element HTML:', elementHTML)
  
  return htmlContent
}

interface CertificateExportRequest {
  student_name: string
  course_name: string
  template_id: string
  org_id: string
  completion_date: string
  instructor_name: string
  grade: string
  student_qr_url?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CertificateExportRequest = await request.json()
    
    const { template_id, student_name, course_name, org_id, completion_date, instructor_name, grade } = body

    // Validate required fields
    if (!template_id || typeof template_id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid template_id' },
        { status: 400 }
      )
    }

    if (!student_name || !course_name || !completion_date || !instructor_name || !grade) {
      return NextResponse.json(
        { error: 'Missing required fields: student_name, course_name, completion_date, instructor_name, grade' },
        { status: 400 }
      )
    }

    // Fetch template from database
    const { data: template, error: templateError } = await supabaseAdmin
      .from('templates')
      .select('*')
      .eq('id', template_id)
      .maybeSingle()

    if (templateError) {
      console.error('Supabase error:', templateError)
      return NextResponse.json(
        { error: 'Database error', details: templateError.message },
        { status: 500 }
      )
    }

    if (!template) {
      // Debug: Get all templates to see what's available
      const { data: allTemplates } = await supabaseAdmin
        .from('templates')
        .select('id, name')
        .limit(5)
      
      return NextResponse.json(
        { 
          error: 'Template not found', 
          template_id,
          available_templates: allTemplates || []
        },
        { status: 404 }
      )
    }

    // Debug: Log template information
    console.log('Template found:', {
      id: template.id,
      name: template.name,
      elements_count: template.elements?.length || 0,
      canvas_width: template.canvas_width,
      canvas_height: template.canvas_height,
      elements: template.elements
    })

    // Convert any image element with the QR placeholder to a QR element
    const fixedElements = (template.elements || []).map((el: any) => {
      if (
        el.type === "image" &&
        (el.imageUrl === "/qr-placeholder.jpg" || el.imageUrl?.includes("qr-placeholder"))
      ) {
        return { ...el, type: "qr" };
      }
      return el;
    });
    const fixedTemplate = { ...template, elements: fixedElements };

    const elements = fixedTemplate.elements || [];
    const canvasSize = {
      width: fixedTemplate.canvas_width || 800,
      height: fixedTemplate.canvas_height || 600
    };

    // If no elements, return error
    if (elements.length === 0) {
      return NextResponse.json(
        { 
          error: 'Template has no elements', 
          template_id,
          template_name: fixedTemplate.name,
          message: 'The template exists but has no elements to render. Please add elements to your template first.'
        },
        { status: 400 }
      )
    }

    // Generate PDF and save to storage
    const storageResult = await generateAndSavePDF(
      org_id || 'default',
      student_name,
      fixedTemplate,
      {
        student_name,
        course_name,
        template_id,
        org_id,
        completion_date,
        instructor_name,
        grade,
        student_qr_url: body.student_qr_url // ensure this is passed
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        file_path: storageResult.filePath,
        public_url: storageResult.publicUrl,
        filename: storageResult.filename,
        download_url: storageResult.publicUrl
      }
    })

  } catch (error) {
    console.error('Certificate export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate certificate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://yourdomain.com']
  
  const response = new NextResponse(null, { status: 200 })
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return response
} 