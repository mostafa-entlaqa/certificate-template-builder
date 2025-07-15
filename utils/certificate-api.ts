import type { CanvasElement } from '@/types/canvas'

interface CertificateExportData {
  student_name: string
  course_name: string
  template_id: string
  org_id: string
  completion_date: string
  instructor_name: string
  grade: string
}

interface CertificateExportResponse {
  success: boolean
  data?: {
    pdf?: string
    filename?: string
    contentType?: string
    public_url?: string
    download_url?: string
    file_path?: string
  }
  error?: string
}

/**
 * Exports a certificate by calling the API endpoint
 */
export async function exportCertificate(data: CertificateExportData): Promise<CertificateExportResponse> {
  try {
    const response = await fetch('/api/certificate/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Certificate export error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export certificate'
    }
  }
}

/**
 * Downloads a PDF from base64 data
 */
export function downloadPDFFromBase64(base64Data: string, filename: string) {
  try {
    // Convert base64 to blob
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download error:', error)
    throw new Error('Failed to download PDF')
  }
}

/**
 * Complete certificate export and download process
 */
export async function exportAndDownloadCertificate(data: CertificateExportData): Promise<boolean> {
  try {
    const result = await exportCertificate(data)
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Export failed')
    }

    downloadPDFFromBase64(result.data.pdf, result.data.filename)
    return true
  } catch (error) {
    console.error('Export and download error:', error)
    alert(error instanceof Error ? error.message : 'Failed to export certificate')
    return false
  }
}

export async function exportAndOpenCertificate(data: CertificateExportData): Promise<boolean> {
  try {
    const result = await exportCertificate(data);
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Export failed');
    }
    // Open the PDF in a new tab using the public_url or download_url
    const url = result.data.public_url || result.data.download_url;
    if (typeof url === 'string' && url.length > 0) {
      const urlString = url;
      window.open(urlString, '_blank');
      return true;
    } else {
      throw new Error('No public URL returned from export');
    }
  } catch (error) {
    console.error('Export and open error:', error);
    alert(error instanceof Error ? error.message : 'Failed to export certificate');
    return false;
  }
} 