import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Tab } from '@/types/reports.types'

export const usePdfExport = () => {
  const exportToPdf = (tab: Tab, tabLabel: string) => {
    if (!tab.tableData || tab.tableData.length === 0) {
      console.warn('No data available to export')
      return
    }

    // Create new PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text(`Report: ${tabLabel}`, 14, 20)

    // Add metadata
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28)

    // Prepare table data
    const headers = [
      'Business Owner',
      'Contact Number',
      'Business Location',
      'Zoning Classification',
      'GeoTag',
    ]

    const rows = tab.tableData.map((row) => [
      row.businessOwner || '-',
      row.contactNumber || '-',
      row.businessLocation || '-',
      row.zoningClassification || '-',
      row.geotag || '-',
    ])

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 35,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [26, 50, 99], // Primary color from theme (#1a3263)
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [231, 234, 236], // Muted color from theme (#e7eaec)
      },
      margin: { top: 35 },
    })

    // Save the PDF
    const dateString = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const fileName = `${tabLabel.replace(/\s+/g, '_')}_${dateString}.pdf`
    doc.save(fileName)
  }

  return {
    exportToPdf,
  }
}
