import { Article } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Converts manuscript markdown content into clean, semantic, print-safe HTML.
 */
function formatContentToPrintHtml(content: string): string {
  if (!content) return '';

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  // Process inline markdown (bold, italic, code)
  const formatInline = (text: string) => {
    let result = escapeHtml(text);
    // Bold
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__(.*?)__/g, '<strong>$1</strong>');
    // Italic
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    result = result.replace(/_(.*?)_/g, '<em>$1</em>');
    // Inline code
    result = result.replace(/`([^`]+)`/g, '<code style="background:#f4f4f4;padding:1px 4px;border-radius:2px;font-family:monospace;font-size:0.9em;">$1</code>');
    return result;
  };

  const paragraphs = content.split(/\n\n+/);
  const htmlParts: string[] = [];

  for (const block of paragraphs) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('###')) {
      htmlParts.push(`<h3 style="font-family:Georgia,serif;font-size:14pt;font-weight:bold;margin:18pt 0 6pt;color:#1c1917;page-break-after:avoid;">${formatInline(trimmed.replace(/^###\s*/, ''))}</h3>`);
    } else if (trimmed.startsWith('##')) {
      htmlParts.push(`<h2 style="font-family:Georgia,serif;font-size:16pt;font-weight:bold;margin:22pt 0 8pt;color:#1c1917;border-bottom:1px solid #e7e5e4;padding-bottom:4pt;page-break-after:avoid;">${formatInline(trimmed.replace(/^##\s*/, ''))}</h2>`);
    } else if (trimmed.startsWith('#')) {
      htmlParts.push(`<h2 style="font-family:Georgia,serif;font-size:18pt;font-weight:bold;margin:24pt 0 10pt;color:#1c1917;border-bottom:1px solid #d6d3d1;padding-bottom:5pt;page-break-after:avoid;">${formatInline(trimmed.replace(/^#\s*/, ''))}</h2>`);
    } else if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '').replace(/\n>\s*/g, ' ');
      htmlParts.push(`<blockquote style="margin:16pt 0;padding:10pt 16pt;background:#fafaf9;border-left:4px solid #9c6a48;font-style:italic;color:#44403c;page-break-inside:avoid;font-size:10.5pt;line-height:1.6;">${formatInline(quoteText)}</blockquote>`);
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const listItems = trimmed.split('\n').filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));
      const itemsHtml = listItems
        .map(li => `<li style="margin-bottom:5pt;line-height:1.6;">${formatInline(li.replace(/^[\*\-]\s*/, ''))}</li>`)
        .join('');
      htmlParts.push(`<ul style="margin:12pt 0 12pt 24pt;padding-left:10pt;color:#292524;font-size:11pt;">${itemsHtml}</ul>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      const listItems = trimmed.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
      const itemsHtml = listItems
        .map(li => `<li style="margin-bottom:5pt;line-height:1.6;">${formatInline(li.replace(/^\d+\.\s*/, ''))}</li>`)
        .join('');
      htmlParts.push(`<ol style="margin:12pt 0 12pt 24pt;padding-left:10pt;color:#292524;font-size:11pt;">${itemsHtml}</ol>`);
    } else {
      // Standard paragraph with linebreaks converted
      const cleanPara = trimmed.split('\n').map(line => formatInline(line)).join('<br/>');
      htmlParts.push(`<p style="font-family:Georgia,Cambria,serif;font-size:11pt;line-height:1.75;margin-bottom:12pt;color:#1c1917;text-align:justify;text-justify:inter-word;">${cleanPara}</p>`);
    }
  }

  return htmlParts.join('\n');
}

/**
 * Builds the complete, print-ready HTML page for the article.
 */
export function generatePrintDocumentHtml(article: Article): string {
  const formattedDate = article.createdAt 
    ? new Date(article.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  const parsedBody = formatContentToPrintHtml(article.content);

  const totalReactions = (article.reactions?.great || 0) + 
                         (article.reactions?.like || 0) + 
                         (article.reactions?.heart || 0) + 
                         (article.reactions?.wow || 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${article.title} — impactED Scholastic Paper</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 18mm 20mm 18mm;
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        color: #78716c;
      }
      @bottom-left {
        content: "impactED Academic Archive • impactedglobal.xyz";
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 8pt;
        color: #78716c;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #1c1917;
      font-family: Georgia, 'Palatino Linotype', 'Book Antiqua', Palatino, serif;
      font-size: 11pt;
      line-height: 1.7;
    }

    .masthead {
      border-bottom: 2px solid #1c1917;
      padding-bottom: 10pt;
      margin-bottom: 18pt;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .masthead-brand {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .masthead-title {
      font-size: 16pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #3d2517;
      margin: 0;
      line-height: 1;
    }

    .masthead-subtitle {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #78716c;
      margin-top: 3pt;
      font-weight: 600;
    }

    .masthead-meta {
      text-align: right;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8pt;
      color: #57534e;
    }

    .masthead-ref {
      font-family: monospace;
      font-size: 7.5pt;
      color: #78716c;
      text-transform: uppercase;
    }

    .article-header {
      margin-bottom: 20pt;
    }

    .category-badge {
      display: inline-block;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #7b5033;
      background: #fdf6ee;
      border: 1px solid #f8c992;
      padding: 3pt 8pt;
      margin-bottom: 10pt;
    }

    h1.article-title {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 24pt;
      font-weight: 800;
      line-height: 1.2;
      color: #0c0a09;
      margin: 0 0 14pt 0;
      letter-spacing: -0.5px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8pt 16pt;
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      padding: 10pt 14pt;
      margin-bottom: 18pt;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9pt;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #78716c;
      font-weight: 600;
      margin-bottom: 1pt;
    }

    .meta-value {
      font-size: 9.5pt;
      font-weight: 600;
      color: #1c1917;
    }

    .abstract-box {
      margin: 16pt 0 20pt;
      padding: 12pt 16pt;
      background: #fdf6ee;
      border-left: 3px solid #9c6a48;
      border-top: 1px solid #f8c992;
      border-right: 1px solid #f8c992;
      border-bottom: 1px solid #f8c992;
      page-break-inside: avoid;
    }

    .abstract-label {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #7b5033;
      margin-bottom: 4pt;
    }

    .abstract-text {
      font-family: Georgia, serif;
      font-size: 10pt;
      font-style: italic;
      line-height: 1.6;
      color: #44403c;
      margin: 0;
    }

    .cover-image-container {
      margin: 16pt 0 20pt;
      text-align: center;
      page-break-inside: avoid;
    }

    .cover-image {
      max-width: 100%;
      max-height: 260px;
      width: auto;
      height: auto;
      object-fit: cover;
      border: 1px solid #e7e5e4;
    }

    .manuscript-body {
      margin-top: 16pt;
      margin-bottom: 24pt;
    }

    .academic-divider {
      border: 0;
      border-top: 1px solid #d6d3d1;
      margin: 24pt 0 16pt;
    }

    .publication-footer {
      page-break-inside: avoid;
      border-top: 1px solid #e7e5e4;
      padding-top: 12pt;
      margin-top: 24pt;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 8pt;
      color: #78716c;
    }

    .peer-review-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;
      color: #3d2517;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 7.5pt;
    }

    .footer-stamp {
      border: 1px dashed #7b5033;
      padding: 3pt 8pt;
      background: #fdf6ee;
      color: #7b5033;
      font-weight: 700;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>

  <!-- Masthead -->
  <div class="masthead">
    <div class="masthead-brand">
      <h2 class="masthead-title">impactED</h2>
      <div class="masthead-subtitle">Global Student Publishing Platform &bull; Academic Archive</div>
    </div>
    <div class="masthead-meta">
      <div><strong>impactedglobal.xyz</strong></div>
      <div>Date: ${formattedDate}</div>
      <div class="masthead-ref">Doc Ref: #${article.id ? article.id.slice(0, 8).toUpperCase() : 'PUBLICATION'}</div>
    </div>
  </div>

  <!-- Header Area -->
  <div class="article-header">
    <div class="category-badge">${article.category || 'Academic Paper'} &bull; ${article.type ? article.type.toUpperCase() : 'SCHOLASTIC PUBLICATION'}</div>
    <h1 class="article-title">${article.title}</h1>

    <!-- Metadata Grid -->
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Author</span>
        <span class="meta-value">${article.authorName || 'Student Scholar'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Institution / School</span>
        <span class="meta-value">${article.authorSchool || 'International Academy'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Country of Origin</span>
        <span class="meta-value">${article.authorCountry || 'Global'}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Manuscript Extent</span>
        <span class="meta-value">${article.wordCount || 0} words &bull; ${article.readingTime || 1} min read</span>
      </div>
    </div>

    <!-- Optional Abstract -->
    ${article.summary ? `
    <div class="abstract-box">
      <div class="abstract-label">Abstract / Overview</div>
      <p class="abstract-text">${article.summary}</p>
    </div>
    ` : ''}

    <!-- Optional Cover Image -->
    ${article.coverImage ? `
    <div class="cover-image-container">
      <img src="${article.coverImage}" alt="${article.title}" class="cover-image" onerror="this.style.display='none'" />
    </div>
    ` : ''}
  </div>

  <hr class="academic-divider" />

  <!-- Manuscript Body -->
  <main class="manuscript-body">
    ${parsedBody}
  </main>

  <!-- Academic Endorsement & Archival Notice -->
  <footer class="publication-footer">
    <div>
      <div class="peer-review-tag">
        <span>Verified Scholastic Publication</span> &bull; 
        <span>${totalReactions} Peer Review Stamps</span>
      </div>
      <div style="margin-top: 2pt;">
        Archived permanently on impactED Global Repository (&copy; ${new Date().getFullYear()} ${article.authorName || 'Author'}). All rights reserved.
      </div>
    </div>
    <div class="footer-stamp">
      Official PDF Archive
    </div>
  </footer>

</body>
</html>`;
}

/**
 * Triggers the browser's clean print dialog to export the article as a PDF.
 * Uses a dedicated hidden iframe to avoid printing application navigation,
 * controls, comments, or dark mode themes.
 */
export async function printArticleAsPdf(article: Article): Promise<void> {
  return new Promise((resolve) => {
    // Remove any previous print iframes
    const existingIframe = document.getElementById('impacted-pdf-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    // Create an invisible iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'impacted-pdf-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      // Fallback: direct window print
      window.print();
      resolve();
      return;
    }

    const html = generatePrintDocumentHtml(article);
    doc.open();
    doc.write(html);
    doc.close();

    // Set page title for sensible default PDF filename when saving
    const originalTitle = document.title;
    const sanitizedTitle = (article.title || 'Scholastic-Paper').replace(/[^\w\s-]/g, '').trim();
    document.title = `${sanitizedTitle} - impactED Paper`;

    // Wait for images or fonts to finish rendering
    const executePrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print intercepted, falling back to window.print', err);
        window.print();
      } finally {
        // Restore document title
        setTimeout(() => {
          document.title = originalTitle;
          // Clean up iframe after print dialog is closed
          setTimeout(() => {
            iframe.remove();
            resolve();
          }, 1000);
        }, 500);
      }
    };

    // If iframe has images, wait for them or timeout after 500ms
    const images = doc.images;
    if (images.length === 0) {
      setTimeout(executePrint, 250);
    } else {
      let loadedCount = 0;
      let hasExecuted = false;

      const timer = setTimeout(() => {
        if (!hasExecuted) {
          hasExecuted = true;
          executePrint();
        }
      }, 700);

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.complete) {
          loadedCount++;
        } else {
          img.onload = img.onerror = () => {
            loadedCount++;
            if (loadedCount >= images.length && !hasExecuted) {
              hasExecuted = true;
              clearTimeout(timer);
              executePrint();
            }
          };
        }
      }

      if (loadedCount >= images.length && !hasExecuted) {
        hasExecuted = true;
        clearTimeout(timer);
        setTimeout(executePrint, 250);
      }
    }
  });
}

/**
 * Generates a clean, multi-page PDF manuscript and initiates a direct browser download.
 * Uses html2canvas + jsPDF with high-DPI retina rendering and exact A4 proportion slicing.
 */
export async function downloadArticleAsPdf(article: Article): Promise<void> {
  const sanitizedTitle = (article.title || 'Scholastic-Paper')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const filename = `${sanitizedTitle || 'Manuscript'}.pdf`;

  // Create an offscreen rendering container
  const container = document.createElement('div');
  container.id = 'impacted-pdf-download-stage';
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '794px'; // ~A4 width in standard screen pixels (210mm @ 96dpi)
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#1c1917';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.zIndex = '-9999';

  // Inject the print HTML inside a wrapped scoped container
  const rawHtml = generatePrintDocumentHtml(article);
  // Extract body contents and styles from the full document
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const styleMatch = rawHtml.match(/<style[^>]*>([\s\S]*)<\/style>/i);

  const styles = styleMatch ? styleMatch[1] : '';
  const bodyContent = bodyMatch ? bodyMatch[1] : rawHtml;

  container.innerHTML = `
    <style>
      ${styles}
      /* Additional container-level overrides for offscreen rendering */
      #impacted-pdf-download-stage {
        box-sizing: border-box;
      }
      .pdf-render-wrap {
        padding: 44px 50px;
        background: #ffffff;
        box-sizing: border-box;
      }
    </style>
    <div class="pdf-render-wrap">
      ${bodyContent}
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Wait for all images in container to load
    const images = Array.from(container.querySelectorAll('img'));
    if (images.length > 0) {
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = () => {
              img.style.display = 'none';
              resolve(null);
            };
            setTimeout(resolve, 1500);
          });
        })
      );
    }

    // Brief settling delay for typography and DOM geometry
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Capture the container with high-density scale (2x)
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 850
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidthMm = 210;
    const pageHeightMm = 297;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    // Calculate the height in canvas pixels that corresponds to one A4 page
    const pageCanvasHeight = (canvasWidth * pageHeightMm) / pageWidthMm;

    const totalPages = Math.max(1, Math.ceil(canvasHeight / pageCanvasHeight));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      // Create an individual slice canvas with exact A4 proportions
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageCanvasHeight;

      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        // Pure white page base
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, pageCanvasHeight);

        const srcY = page * pageCanvasHeight;
        const sliceHeight = Math.min(pageCanvasHeight, canvasHeight - srcY);

        ctx.drawImage(
          canvas,
          0,
          srcY,
          canvasWidth,
          sliceHeight,
          0,
          0,
          canvasWidth,
          sliceHeight
        );
      }

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');
    }

    pdf.save(filename);
  } catch (error) {
    console.warn('Canvas PDF download encountered an issue, falling back to print dialog:', error);
    // Graceful fallback to print-to-PDF
    await printArticleAsPdf(article);
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Universal export function: default to direct PDF file download, with option for print.
 */
export async function exportArticleAsPdf(article: Article, mode: 'download' | 'print' = 'download'): Promise<void> {
  if (mode === 'print') {
    return printArticleAsPdf(article);
  }
  return downloadArticleAsPdf(article);
}
