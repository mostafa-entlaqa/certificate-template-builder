import type { CanvasElement } from '@/types/canvas'

interface CertificateExportData {
  student_name: string
  recipient_name?: string
  course_name: string
  template_id: string
  org_id: string
  completion_date: string
  instructor_name: string
  grade: string
  student_qr_url?: string
  company_logo?: string
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
 * Complete certificate export and download process
 */
export async function exportAndDownloadCertificate(data: CertificateExportData): Promise<boolean> {
  try {
    const result = await exportCertificate(data)
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Export failed')
    }

    // Use the public_url or download_url to download the PDF
    const url = result.data.public_url || result.data.download_url
    if (typeof url === 'string' && url.length > 0) {
      const a = document.createElement('a')
      a.href = url
      a.download = result.data.filename || 'certificate.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return true
    } else {
      throw new Error('No public URL returned from export')
    }
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