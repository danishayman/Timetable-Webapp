import { TimetableSlot } from '@/types/timetable';
import { DAYS_OF_WEEK, TIME_SLOTS } from '@/constants';
import { handleError, withRetry, createAppError, ERROR_CODES } from '@/lib/errorHandler';
import { notifyError, notifySuccess, notifyLoading } from '@/lib/notifications';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export Service
 * Handles exporting timetable data in various formats
 */
export class ExportService {
  /**
   * Export timetable data to PDF
   * @param timetableSlots Array of timetable slots
   * @param title Optional title for the PDF
   * @returns Promise resolving to Blob containing the PDF
   */
  static async exportToPDF(timetableSlots: TimetableSlot[], title: string = 'My Timetable'): Promise<Blob> {
    const loadingId = notifyLoading('Generating PDF', 'Creating your timetable PDF...');
    
    try {
      // Validate input
      if (!Array.isArray(timetableSlots)) {
        throw createAppError(
          'Invalid timetable data provided',
          ERROR_CODES.VALIDATION_ERROR
        );
      }

      return await withRetry(async () => {
        // Create a new PDF document
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Add title
        pdf.setFontSize(18);
        pdf.text(title, pageWidth / 2, 15, { align: 'center' });
        
        // Add timestamp
        pdf.setFontSize(10);
        pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });
        
        // Draw timetable grid
        const margin = 10;
        const gridWidth = pageWidth - (margin * 2);
        const gridHeight = pageHeight - 35 - margin;
        const colWidth = gridWidth / 8; // Time column + 7 days
        const rowHeight = gridHeight / (TIME_SLOTS.length + 1); // +1 for header
        
        // Draw grid header
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, 30, gridWidth, rowHeight, 'F');
        
        // Draw time column header
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Time', margin + (colWidth / 2), 30 + (rowHeight / 2), { align: 'center' });
        
        // Draw day headers
        DAYS_OF_WEEK.forEach((day, index) => {
          pdf.text(
          day, 
          margin + colWidth + (colWidth * index) + (colWidth / 2), 
          30 + (rowHeight / 2), 
          { align: 'center' }
        );
      });
      
      // Draw time slots and grid
      TIME_SLOTS.forEach((time, timeIndex) => {
        const y = 30 + rowHeight + (timeIndex * rowHeight);
        
        // Draw time cell
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, y, colWidth, rowHeight, 'F');
        pdf.text(time, margin + (colWidth / 2), y + (rowHeight / 2), { align: 'center' });
        
        // Draw day cells for this time slot
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const x = margin + colWidth + (dayIndex * colWidth);
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(x, y, colWidth, rowHeight, 'S');
          
          // Find slots for this day and time
          const slotsForCell = timetableSlots.filter(
            slot => slot.day_of_week === dayIndex && slot.start_time === time
          );
          
          // Draw slots
          if (slotsForCell.length > 0) {
            slotsForCell.forEach((slot, slotIndex) => {
              // Set color based on slot type
              const colorHex = slot.color || '#3b82f6';
              const r = parseInt(colorHex.slice(1, 3), 16);
              const g = parseInt(colorHex.slice(3, 5), 16);
              const b = parseInt(colorHex.slice(5, 7), 16);
              
              pdf.setFillColor(r, g, b);
              
              // Draw slot background
              const slotHeight = rowHeight / slotsForCell.length;
              const slotY = y + (slotIndex * slotHeight);
              pdf.rect(x, slotY, colWidth, slotHeight, 'F');
              
              // Draw slot text
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(8);
              pdf.text(
                `${slot.subject_code} - ${slot.type}`,
                x + (colWidth / 2),
                slotY + (slotHeight / 2) - 2,
                { align: 'center' }
              );
              pdf.text(
                slot.venue,
                x + (colWidth / 2),
                slotY + (slotHeight / 2) + 2,
                { align: 'center' }
              );
            });
          }
        }
      });
      
      // Convert to blob
      const pdfBlob = pdf.output('blob');
      
      // Remove loading notification and show success
      const { removeNotification } = require('@/lib/notifications');
      removeNotification(loadingId);
      notifySuccess('PDF Generated', 'Your timetable PDF has been created successfully.');
      
      return pdfBlob;
      }, 2, 1000); // Retry up to 2 times with 1 second delay
    } catch (error) {
      // Remove loading notification and show error
      const { removeNotification } = require('@/lib/notifications');
      removeNotification(loadingId);
      
      const appError = handleError(error, {
        context: { operation: 'export_pdf', title, slotsCount: timetableSlots.length }
      });
      
      notifyError('PDF Export Failed', appError.message);
      throw appError;
    }
  }
  
  /**
   * Export timetable data to ICS (iCalendar) format
   * @param timetableSlots Array of timetable slots
   * @param title Optional calendar title
   * @returns Promise resolving to Blob containing the ICS file
   */
  static async exportToICS(timetableSlots: TimetableSlot[], title: string = 'My Timetable'): Promise<Blob> {
    try {
      // Start building the ICS file content
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Timetable App//EN',
        `X-WR-CALNAME:${title}`,
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];
      
      // Get the current date as a reference point
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Find the next occurrence of each day of the week
      const nextDayOccurrence = Array(7).fill(0).map((_, i) => {
        const date = new Date();
        const diff = (i - date.getDay() + 7) % 7;
        date.setDate(date.getDate() + diff);
        return date;
      });
      
      // Generate events for each timetable slot
      timetableSlots.forEach(slot => {
        // Get the date for this slot's day of the week
        const eventDate = new Date(nextDayOccurrence[slot.day_of_week]);
        
        // Parse start and end times
        const [startHour, startMinute] = slot.start_time.split(':').map(Number);
        const [endHour, endMinute] = slot.end_time.split(':').map(Number);
        
        // Set the event start and end times
        const startDate = new Date(eventDate);
        startDate.setHours(startHour, startMinute, 0);
        
        const endDate = new Date(eventDate);
        endDate.setHours(endHour, endMinute, 0);
        
        // Format dates for ICS
        const formatDate = (date: Date) => {
          return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        
        // Create a unique ID for the event
        const eventId = `timetable-${slot.subject_id}-${slot.type}-${slot.day_of_week}-${formatDate(startDate)}`;
        
        // Add the event to the ICS content
        icsContent = icsContent.concat([
          'BEGIN:VEVENT',
          `UID:${eventId}`,
          `DTSTAMP:${formatDate(now)}`,
          `DTSTART:${formatDate(startDate)}`,
          `DTEND:${formatDate(endDate)}`,
          `SUMMARY:${slot.subject_code} - ${slot.type}`,
          `DESCRIPTION:${slot.subject_name}\\n${slot.type}\\nInstructor: ${slot.instructor || 'N/A'}`,
          `LOCATION:${typeof slot.venue === 'string' ? slot.venue : 'No venue'}`,
          'RRULE:FREQ=WEEKLY;COUNT=15', // Repeat weekly for 15 weeks
          'END:VEVENT'
        ]);
      });
      
      // Close the calendar
      icsContent.push('END:VCALENDAR');
      
      // Join with CRLF as required by the ICS spec
      const icsString = icsContent.join('\r\n');
      
      // Create a blob with the ICS content
      return new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    } catch (error) {
      console.error('Error generating ICS:', error);
      throw new Error('Failed to generate ICS file');
    }
  }
  
  /**
   * Export timetable as an image
   * @param timetableSlots Array of timetable slots
   * @param title Optional title for the image
   * @returns Promise resolving to Blob containing the image
   */
  static async exportToImage(timetableSlots: TimetableSlot[], title: string = 'My Timetable'): Promise<Blob> {
    try {
      // Create a temporary div to render the timetable
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1000px'; // Fixed width for better quality
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      
      // Add title
      const titleElement = document.createElement('h2');
      titleElement.textContent = title;
      titleElement.style.textAlign = 'center';
      titleElement.style.margin = '0 0 10px 0';
      titleElement.style.fontFamily = 'Arial, sans-serif';
      tempDiv.appendChild(titleElement);
      
      // Add timestamp
      const timestampElement = document.createElement('p');
      timestampElement.textContent = `Generated on ${new Date().toLocaleString()}`;
      timestampElement.style.textAlign = 'center';
      timestampElement.style.margin = '0 0 20px 0';
      timestampElement.style.fontSize = '12px';
      timestampElement.style.color = '#666';
      timestampElement.style.fontFamily = 'Arial, sans-serif';
      tempDiv.appendChild(timestampElement);
      
      // Create table for timetable
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontFamily = 'Arial, sans-serif';
      
      // Create header row
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      // Add empty cell for top-left corner
      const cornerCell = document.createElement('th');
      cornerCell.style.border = '1px solid #ddd';
      cornerCell.style.padding = '8px';
      cornerCell.style.backgroundColor = '#f2f2f2';
      headerRow.appendChild(cornerCell);
      
      // Add day headers
      DAYS_OF_WEEK.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body
      const tbody = document.createElement('tbody');
      
      // Create rows for each time slot
      TIME_SLOTS.forEach(timeSlot => {
        const row = document.createElement('tr');
        
        // Add time cell
        const timeCell = document.createElement('td');
        timeCell.textContent = timeSlot;
        timeCell.style.border = '1px solid #ddd';
        timeCell.style.padding = '8px';
        timeCell.style.fontWeight = 'bold';
        timeCell.style.backgroundColor = '#f8f8f8';
        row.appendChild(timeCell);
        
        // Add cells for each day
        DAYS_OF_WEEK.forEach((_, dayIndex) => {
          const cell = document.createElement('td');
          cell.style.border = '1px solid #ddd';
          cell.style.padding = '8px';
          cell.style.height = '50px';
          cell.style.verticalAlign = 'top';
          
          // Find slots for this day and time
          const slotsForCell = timetableSlots.filter(
            slot => slot.day_of_week === dayIndex && slot.start_time === timeSlot
          );
          
          // Add slots to cell
          slotsForCell.forEach(slot => {
            const slotDiv = document.createElement('div');
            slotDiv.style.backgroundColor = slot.color || '#3b82f6'; // Default blue color
            slotDiv.style.color = 'white';
            slotDiv.style.padding = '4px';
            slotDiv.style.borderRadius = '4px';
            slotDiv.style.marginBottom = '4px';
            slotDiv.style.fontSize = '12px';
            
            const codeElement = document.createElement('div');
            codeElement.textContent = slot.subject_code;
            codeElement.style.fontWeight = 'bold';
            slotDiv.appendChild(codeElement);
            
            const typeElement = document.createElement('div');
            typeElement.textContent = slot.type;
            slotDiv.appendChild(typeElement);
            
            const venueElement = document.createElement('div');
            venueElement.textContent = slot.venue;
            venueElement.style.fontSize = '10px';
            slotDiv.appendChild(venueElement);
            
            cell.appendChild(slotDiv);
          });
          
          row.appendChild(cell);
        });
        
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      tempDiv.appendChild(table);
      
      // Add to document temporarily
      document.body.appendChild(tempDiv);
      
      // Use html2canvas to render the div to a canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Higher scale for better quality
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Remove the temporary div
      document.body.removeChild(tempDiv);
      
      // Convert canvas to blob
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image');
    }
  }
  
  /**
   * Export timetable from HTML element
   * @param element HTML element containing the timetable
   * @param exportType Type of export (pdf or image)
   * @param title Optional title for the export
   * @returns Promise resolving to Blob containing the export
   */
  static async exportFromElement(
    element: HTMLElement, 
    exportType: 'pdf' | 'image',
    title: string = 'My Timetable'
  ): Promise<Blob> {
    try {
      // Use html2canvas to render the element to a canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for images
        logging: false, // Disable logging
        backgroundColor: '#ffffff' // White background
      });
      
      if (exportType === 'image') {
        // For image export, convert canvas to blob
        return new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          }, 'image/png');
        });
      } else {
        // For PDF export
        const imgData = canvas.toDataURL('image/png');
        
        // Calculate dimensions
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Create PDF with landscape orientation if wider than tall
        const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
        const pdf = new jsPDF(orientation, 'mm', 'a4');
        
        // Get adjusted page dimensions based on orientation
        const pdfWidth = orientation === 'landscape' ? pageHeight : imgWidth;
        const pdfHeight = orientation === 'landscape' ? imgWidth : pageHeight;
        
        // Calculate image dimensions to fit the page
        const finalImgWidth = orientation === 'landscape' ? pdfWidth : imgWidth;
        const finalImgHeight = (canvas.height * finalImgWidth) / canvas.width;
        
        // Add title
        pdf.setFontSize(16);
        pdf.text(title, pdfWidth / 2, 15, { align: 'center' });
        
        // Add image
        pdf.addImage(imgData, 'PNG', 0, 25, finalImgWidth, finalImgHeight);
        
        // Convert to blob
        const pdfBlob = pdf.output('blob');
        return pdfBlob;
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
  
  /**
   * Download a blob as a file
   * @param blob The blob to download
   * @param filename The filename to save as
   */
  static downloadBlob(blob: Blob, filename: string): void {
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to the document
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  /**
   * Format timetable data for export
   * @param timetableSlots Array of timetable slots
   * @returns Formatted timetable data
   */
  static formatTimetableData(timetableSlots: TimetableSlot[]): {
    days: string[];
    timeSlots: string[];
    slotsByDayAndTime: Record<string, Record<string, TimetableSlot[]>>;
  } {
    // Create a map of slots by day and time
    const slotsByDayAndTime: Record<string, Record<string, TimetableSlot[]>> = {};
    
    // Initialize the map with empty arrays for each day and time slot
    DAYS_OF_WEEK.forEach((day, dayIndex) => {
      slotsByDayAndTime[dayIndex] = {};
      
      TIME_SLOTS.forEach(timeSlot => {
        slotsByDayAndTime[dayIndex][timeSlot] = [];
      });
    });
    
    // Populate the map with timetable slots
    timetableSlots.forEach(slot => {
      const day = slot.day_of_week;
      const startTime = slot.start_time;
      
      // Find all time slots this class spans
      const startIndex = TIME_SLOTS.indexOf(startTime);
      if (startIndex === -1) return; // Skip if start time not found
      
      // Add the slot to the corresponding day and time
      if (slotsByDayAndTime[day] && slotsByDayAndTime[day][startTime]) {
        slotsByDayAndTime[day][startTime].push(slot);
      }
    });
    
    return {
      days: DAYS_OF_WEEK,
      timeSlots: TIME_SLOTS,
      slotsByDayAndTime
    };
  }
  
  /**
   * Generate filename for export
   * @param title Base title for the file
   * @param exportType Type of export
   * @returns Filename with extension
   */
  static generateFilename(title: string, exportType: 'pdf' | 'ics' | 'image'): string {
    // Sanitize title for use as filename
    const sanitizedTitle = title
      .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric chars with underscore
      .toLowerCase();
    
    // Add date stamp
    const date = new Date();
    const dateStamp = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    // Get file extension
    const extension = this.getFileExtension(exportType);
    
    return `${sanitizedTitle}_${dateStamp}${extension}`;
  }
  
  /**
   * Get file extension for export type
   * @param exportType The type of export
   * @returns The file extension
   */
  static getFileExtension(exportType: 'pdf' | 'ics' | 'image'): string {
    switch (exportType) {
      case 'pdf':
        return '.pdf';
      case 'ics':
        return '.ics';
      case 'image':
        return '.png';
      default:
        return '';
    }
  }
} 