const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class DocumentExportService {
  constructor() {
    console.log('📄 DocumentExportService initialized');
    // 查找系統中的中文字體
    this.chineseFont = this.findChineseFont();
  }

  // 查找系統中的中文字體
  findChineseFont() {
    // 使用項目內建的中文字體（OTF 格式）
    const bundledFont = path.join(__dirname, '../../assets/fonts/SourceHanSansCN-Regular.otf');
    if (fs.existsSync(bundledFont)) {
      console.log('✅ Using bundled Chinese font (OTF):', bundledFont);
      return bundledFont;
    }
    
    console.warn('⚠️ No Chinese font found, Chinese characters may not display correctly');
    return null;
  }

  // 導出為Word文檔
  async exportToWord(courseData) {
    try {
      console.log('📝 Exporting course to Word format...');

      const { title, content, parameters, generatedAt } = courseData;

      // 創建文檔結構
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // 標題
            new Paragraph({
              text: title,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // 課程資訊
            new Paragraph({
              text: '課程資訊 Course Information',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 }
            }),
            this.createInfoParagraph('目標年齡 Target Age', parameters.targetAge),
            this.createInfoParagraph('科別 Category', parameters.category),
            this.createInfoParagraph('主題 Topic', parameters.topic),
            this.createInfoParagraph('課程時間 Duration', `${parameters.duration} minutes`),
            this.createInfoParagraph('教學風格 Style', parameters.style),
            this.createInfoParagraph('語言 Language', parameters.language),
            this.createInfoParagraph('生成時間 Generated', new Date(generatedAt).toLocaleString('zh-TW')),

            // 分隔線
            new Paragraph({
              text: '─'.repeat(60),
              spacing: { before: 200, after: 200 }
            }),

            // 課程內容
            new Paragraph({
              text: '課程內容 Course Content',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 }
            }),

            // 將內容轉換為段落
            ...this.contentToParagraphs(content)
          ]
        }]
      });

      // 生成Word文件
      const buffer = await Packer.toBuffer(doc);
      
      // 保存文件
      const fileName = `course_${Date.now()}.docx`;
      const filePath = path.join('assets', 'exports', fileName);
      
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, buffer);

      console.log(`✅ Word document created: ${filePath}`);

      return {
        success: true,
        filePath,
        fileName,
        downloadUrl: `/api/download-document?path=${encodeURIComponent(filePath)}`
      };

    } catch (error) {
      console.error('❌ Word export failed:', error);
      throw new Error(`Word export failed: ${error.message}`);
    }
  }

  // 導出為PDF文檔
  async exportToPDF(courseData) {
    try {
      console.log('📄 Exporting course to PDF format...');

      const { title, content, parameters, generatedAt } = courseData;

      const fileName = `course_${Date.now()}.pdf`;
      const filePath = path.join('assets', 'exports', fileName);
      
      await fs.ensureDir(path.dirname(filePath));

      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          },
          // 啟用 UTF-8 支持
          info: {
            Title: title,
            Author: 'Googoogaga Course Generator'
          }
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // 設置中文字體（如果可用）
        if (this.chineseFont) {
          doc.font(this.chineseFont);
        }

        // 標題
        doc.fontSize(20)
           .text(title, { align: 'center' });
        
        doc.moveDown(1);

        // 課程資訊區塊
        doc.fontSize(16)
           .text('課程資訊 Course Information');
        
        doc.moveDown(0.5);
        doc.fontSize(12);

        // 課程參數
        const infoLines = [
          `目標年齡 Target Age: ${parameters.targetAge}`,
          `科別 Category: ${parameters.category}`,
          `主題 Topic: ${parameters.topic}`,
          `課程時間 Duration: ${parameters.duration} minutes`,
          `教學風格 Style: ${parameters.style}`,
          `語言 Language: ${parameters.language}`,
          `生成時間 Generated: ${new Date(generatedAt).toLocaleString('zh-TW')}`
        ];

        infoLines.forEach(line => {
          doc.text(line);
        });

        doc.moveDown(1);
        doc.text('─'.repeat(80));
        doc.moveDown(1);

        // 課程內容
        doc.fontSize(16)
           .text('課程內容 Course Content');
        
        doc.moveDown(0.5);

        // 嵌入課程圖片（如果有的話）
        if (courseData.images && courseData.images.length > 0) {
          doc.fontSize(14).text('課程插圖 Course Illustrations');
          doc.moveDown(0.5);
          
          for (const image of courseData.images) {
            try {
              if (fs.existsSync(image.path)) {
                doc.image(image.path, {
                  fit: [450, 300],
                  align: 'center'
                });
                doc.moveDown(0.5);
              }
            } catch (imgError) {
              console.error('Failed to embed image:', imgError.message);
            }
          }
          doc.moveDown(1);
        }

        // 處理內容（分段、標題等）
        this.addContentToPDF(doc, content);

        // 完成PDF
        doc.end();

        stream.on('finish', () => {
          console.log(`✅ PDF document created: ${filePath}`);
          resolve({
            success: true,
            filePath,
            fileName,
            downloadUrl: `/api/download-document?path=${encodeURIComponent(filePath)}`
          });
        });

        stream.on('error', reject);
      });

    } catch (error) {
      console.error('❌ PDF export failed:', error);
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }

  // 創建資訊段落（Word）
  createInfoParagraph(label, value) {
    return new Paragraph({
      children: [
        new TextRun({
          text: `${label}: `,
          bold: true
        }),
        new TextRun({
          text: value
        })
      ],
      spacing: { after: 100 }
    });
  }

  // 將內容轉換為Word段落
  contentToParagraphs(content) {
    const lines = content.split('\n');
    const paragraphs = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        // 空行
        paragraphs.push(new Paragraph({ text: '' }));
        continue;
      }

      // 檢測標題（# ## ###）
      const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const [, hashes, text] = headingMatch;
        const level = hashes.length === 1 ? HeadingLevel.HEADING_2 :
                      hashes.length === 2 ? HeadingLevel.HEADING_3 :
                      HeadingLevel.HEADING_4;
        
        paragraphs.push(new Paragraph({
          text: text,
          heading: level,
          spacing: { before: 200, after: 100 }
        }));
        continue;
      }

      // 檢測列表項（- * 1. 2.）
      const listMatch = trimmedLine.match(/^[-*]\s+(.+)$/) || 
                       trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (listMatch) {
        paragraphs.push(new Paragraph({
          text: `  • ${listMatch[1]}`,
          spacing: { after: 50 }
        }));
        continue;
      }

      // 檢測粗體文字（**text**）
      const boldMatch = trimmedLine.match(/\*\*(.+?)\*\*/g);
      if (boldMatch) {
        const children = [];
        let lastIndex = 0;
        let tempLine = trimmedLine;
        
        const boldRegex = /\*\*(.+?)\*\*/g;
        let match;
        
        while ((match = boldRegex.exec(trimmedLine)) !== null) {
          if (match.index > lastIndex) {
            children.push(new TextRun({
              text: trimmedLine.substring(lastIndex, match.index)
            }));
          }
          children.push(new TextRun({
            text: match[1],
            bold: true
          }));
          lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < trimmedLine.length) {
          children.push(new TextRun({
            text: trimmedLine.substring(lastIndex)
          }));
        }
        
        paragraphs.push(new Paragraph({
          children,
          spacing: { after: 100 }
        }));
        continue;
      }

      // 普通段落
      paragraphs.push(new Paragraph({
        text: trimmedLine,
        spacing: { after: 100 }
      }));
    }

    return paragraphs;
  }

  // 將內容添加到PDF
  addContentToPDF(doc, content) {
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        doc.moveDown(0.3);
        continue;
      }

      // 檢測標題
      const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        const [, hashes, text] = headingMatch;
        const fontSize = hashes.length === 1 ? 16 :
                        hashes.length === 2 ? 14 : 12;
        
        doc.moveDown(0.5);
        doc.fontSize(fontSize)
           .text(text);
        doc.moveDown(0.3);
        doc.fontSize(12);
        continue;
      }

      // 檢測列表項
      const listMatch = trimmedLine.match(/^[-*]\s+(.+)$/) || 
                       trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (listMatch) {
        doc.text(`  • ${listMatch[1]}`);
        continue;
      }

      // 處理粗體文字（簡化版）
      const cleanedText = trimmedLine.replace(/\*\*(.+?)\*\*/g, '$1');
      doc.text(cleanedText);
    }
  }

  // 導出 Prompt 為 Word 文檔 (Page 4: BizPrompt Architect Pro)
  async exportPromptToWord(docContent) {
    try {
      console.log('📝 Exporting prompt to Word format...');

      const { title, content, generatedAt } = docContent;

      // 創建文檔結構
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // 標題
            new Paragraph({
              text: title,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // 生成時間
            new Paragraph({
              children: [
                new TextRun({
                  text: `生成時間 Generated: ${new Date(generatedAt).toLocaleString('zh-TW')}`,
                  size: 20,
                  color: '666666'
                })
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 300 }
            }),

            // 分隔線
            new Paragraph({
              text: '─'.repeat(60),
              spacing: { before: 200, after: 200 }
            }),

            // Prompt 內容
            new Paragraph({
              text: 'AI Prompt 內容',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 200 }
            }),

            // 將 Prompt 內容轉換為段落
            ...this.contentToParagraphs(content),

            // 頁尾
            new Paragraph({
              text: '─'.repeat(60),
              spacing: { before: 300, after: 100 }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Generated by BizPrompt Architect Pro - Googoogaga Platform',
                  size: 18,
                  color: '999999',
                  italics: true
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 100 }
            })
          ]
        }]
      });

      // 生成 Word 文件
      const buffer = await Packer.toBuffer(doc);
      
      // 保存文件
      const fileName = `prompt_${Date.now()}.docx`;
      const filePath = path.join('assets', 'exports', fileName);
      
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, buffer);

      console.log(`✅ Prompt Word document created: ${filePath}`);

      return {
        success: true,
        filename: fileName,
        downloadUrl: `/api/download-document?path=${encodeURIComponent(filePath)}`
      };

    } catch (error) {
      console.error('❌ Prompt Word export failed:', error);
      throw new Error(`Prompt Word export failed: ${error.message}`);
    }
  }
}

module.exports = DocumentExportService;
