# PDF Book Feature with Read Aloud

## Overview
Added full support for uploading and viewing PDF books with in-browser PDF viewer and text-to-speech (read aloud) functionality.

## Features Implemented

### 1. **PDF Upload for Books**
- Admin can upload PDF files (up to 10MB) when creating a book
- PDF files stored in `storage/app/public/books-pdf/`
- Optional: Can still provide external book URL instead

### 2. **In-Browser PDF Viewer**
- Uses PDF.js library (v3.11.174) from CDN
- Features:
  - Page navigation (Previous/Next)
  - Zoom controls (0.5x to 3x)
  - Canvas rendering for crisp display
  - Responsive design

### 3. **Read Aloud Functionality**
- **Text Extraction**: Automatically extracts all text from PDF
- **Web Speech API**: Uses browser's built-in text-to-speech
- **Controls**:
  - Play/Stop reading
  - Pause/Resume
  - Speed control (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
- **Visual Feedback**:
  - Animated reading indicator
  - Wave animation while reading
  - Pulse effect on active button

### 4. **Professional UI/UX**
- Modern gradient header
- Smooth animations and transitions
- Sticky reading indicator
- Mobile responsive design
- Clean controls layout

## Files Modified/Created

### Frontend
1. **Created**: `src/components/PdfViewer.jsx` - Main PDF viewer component
2. **Created**: `src/styles/pdf-viewer.css` - PDF viewer styles
3. **Modified**: `src/pages/PostBlog.jsx` - Added PDF upload field
4. **Modified**: `src/pages/BlogDetail.jsx` - Shows PDF viewer for books

### Backend
1. **Migration**: `2025_12_04_095438_add_pdf_file_to_blogs_table.php`
2. **Modified**: `app/Http/Controllers/BlogController.php` - PDF upload handling
3. **Modified**: `app/Models/Blog.php` - Added `pdf_file` to fillable

## Usage

### For Admins - Uploading Books
1. Navigate to Blog page (must be logged in as admin)
2. Click "Post Blog" button
3. Select "Book" from Type dropdown
4. Fill in:
   - Title
   - Excerpt
   - Book Author
   - **Upload PDF File** (required for in-browser viewing)
   - Book Link URL (optional)
   - Cover Image
5. Click "Post Book"

### For Users - Reading Books
1. Browse to Blog page
2. Click on a book card
3. If PDF was uploaded:
   - PDF viewer loads automatically
   - Use navigation controls to browse pages
   - Click "Read Aloud" to start text-to-speech
   - Adjust speed as needed
   - Pause/Resume/Stop as desired

## Technical Details

### PDF.js Integration
```javascript
// Loaded from CDN
https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js
```

### Text-to-Speech API
```javascript
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 1.0;  // Speed
utterance.pitch = 1.0; // Voice pitch
utterance.volume = 1.0; // Volume
utterance.lang = 'en-US'; // Language
window.speechSynthesis.speak(utterance);
```

### File Validation
- **Images**: JPEG, PNG, JPG, WEBP (max 2MB)
- **PDFs**: PDF only (max 10MB)

## Browser Support

### PDF Viewer
✅ Chrome, Edge, Firefox, Safari (all modern versions)

### Read Aloud (Web Speech API)
✅ Chrome, Edge (full support)
✅ Safari (iOS 7+, macOS)
⚠️ Firefox (partial support, may require flags)

## Future Enhancements (Optional)
- [ ] Bookmark/save reading position
- [ ] Highlight and annotate PDFs
- [ ] Download PDF option
- [ ] Full-text search within PDF
- [ ] Multiple voice options
- [ ] Dark mode for PDF viewer
- [ ] Reading progress tracking

## Security Notes
- PDF uploads restricted to admin users only
- File type validation on both frontend and backend
- File size limits enforced (10MB)
- Files stored in `storage/app/public` with proper permissions

## Testing
1. Create a test admin account
2. Upload a sample PDF book
3. View the book as a regular user
4. Test read aloud with different speeds
5. Test on mobile devices
