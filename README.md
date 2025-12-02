# DeepSeek OCR Application

A complete web application for OCR (Optical Character Recognition) processing using the DeepSeek model through Ollama. This application allows you to upload PDF, PNG, or JPG files and extract their text content using AI-powered OCR.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Angular](https://img.shields.io/badge/Angular-18-red.svg)
![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)
![Ollama](https://img.shields.io/badge/Ollama-DeepSeek-green.svg)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Docker Deployment](#docker-deployment)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Frontend (Angular)
- 📤 **Drag & Drop File Upload** - Support for PDF, PNG, and JPG files
- 👁️ **File Preview** - Preview uploaded images before processing
- 📝 **Custom Prompts** - Configure OCR instructions with quick templates
- 📁 **File Browser** - Manage multiple files in queue
- 📊 **Results Viewer** - View extracted text with fullscreen mode
- 📋 **Copy & Download** - Export results as TXT or JSON
- 🎨 **Modern UI** - Clean, responsive design with turquoise accent color
- ⚡ **Real-time Progress** - Track upload and processing status

### Backend (NestJS)
- 🔄 **Multiple Input Sources** - Process files via upload, URL, base64, or server path
- 📄 **PDF Support** - Automatic PDF to image conversion
- 🔁 **Job Queue** - Async processing with status polling
- 📚 **Swagger API Docs** - Interactive API documentation
- 🛡️ **Rate Limiting** - Built-in request throttling
- ✅ **Validation** - Request validation with class-validator
- 🏥 **Health Checks** - Monitor API and Ollama status

### OCR Engine (Ollama + DeepSeek OCR)
- 🧠 **DeepSeek OCR Model** - Leverages the full potential of DeepSeek's vision-language model for accurate text extraction
- 🌐 **Multi-language** - Automatic language detection and processing
- 📐 **Layout Preservation** - Maintains document structure when requested
- 🔧 **Precise Prompts** - The model requires specific, well-crafted prompts for optimal results
- 📄 **PDF to Image** - Automatic conversion of PDF pages to images for DeepSeek OCR processing

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Angular)                       │
│  ┌─────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │ File Upload │  │ Prompt Editor  │  │ Results Viewer  │  │
│  └─────────────┘  └────────────────┘  └─────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────┴────────────────────────────────┐
│                     Backend (NestJS)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ OCR Module   │  │ Storage      │  │ Ollama Service   │  │
│  │ - Upload     │  │ - File Mgmt  │  │ - API Client     │  │
│  │ - Process    │  │ - PDF Conv   │  │ - Retry Logic    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP
┌────────────────────────────┴────────────────────────────────┐
│                     Ollama (DeepSeek OCR)                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  DeepSeek VL2 Model - Vision-Language Understanding     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Ollama** with DeepSeek OCR model

> **Note:** PDF conversion is handled natively with `pdf-to-img` library - no system dependencies like Poppler required.

### Installing Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama
ollama serve

# Pull DeepSeek OCR model
ollama pull deepseek-ocr
```

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/MAMISHO/deepseek-ocr-app.git
cd deepseek-ocr-app
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run start:dev
```

The backend will be available at `http://localhost:3000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:4200`

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Application
APP_NAME=deepseek-ocr
APP_ENV=development
APP_PORT=3000
APP_HOST=0.0.0.0
APP_CORS_ORIGINS=http://localhost:4200,http://localhost:3000

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=deepseek-ocr
OLLAMA_TIMEOUT=300000
OLLAMA_MAX_RETRIES=3
OLLAMA_RETRY_DELAY=1000

# OCR Configuration
OCR_DEFAULT_LANGUAGE=auto
OCR_DEFAULT_OUTPUT_FORMAT=text
OCR_MAX_PAGES=100
OCR_DEFAULT_PROMPT=Extract all text from this image.

# Storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=./uploads
STORAGE_MAX_FILE_SIZE=52428800
STORAGE_ALLOWED_MIMETYPES=application/pdf,image/png,image/jpeg

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

### Frontend Environment

Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  maxFileSize: 52428800, // 50MB
  allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
  allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg'],
};
```

## 📖 Usage

### Web Interface

1. Open `http://localhost:4200` in your browser
2. Drag & drop or click to upload a file (PDF, PNG, or JPG)
3. Optionally modify the prompt or select a quick template
4. Click "Start Analysis" to begin OCR processing
5. View results in the Results Viewer panel
6. Copy to clipboard or download as TXT/JSON

### Available Prompts

| Prompt | Description |
|--------|-------------|
| Extract Text | Basic text extraction |
| To Markdown | Convert document to markdown format |
| Parse Figure | Analyze charts and diagrams |
| Free OCR | General purpose OCR |
| Layout Analysis | Preserve document layout |

## 💡 Tested and Effective Prompts

DeepSeek OCR requires precise prompts for optimal results. Here is a list of prompts that have been tested and work correctly:

| To achieve... | Use prompts like... |
|---------------|---------------------|
| **Simple and reliable text extraction** | `"Extract all text from this image."` <br> `"Perform OCR and output the text."` |
| **Structure a document (clean Markdown)** | `"Convert the entire document to clean markdown, using appropriate headings and lists. Exclude any non-textual elements or coordinates."` |
| **Transcribe handwritten text** | `"Transcribe the handwritten text exactly as it appears."` |
| **Focus on specific information types** | `"Extract all text, with a focus on numerical data and dates."` <br> `"Find and list all names and email addresses in the document."` |
| **Extract tables** | `"Extract the table data and format it as a markdown table."` |
| **Invoice/receipt analysis** | `"Extract all text from this receipt, including item names, quantities, prices, and total."` |

> **📝 Note:** If you discover other prompts that work reliably, please contribute by adding them to this documentation via a Pull Request or Issue.

> **⚠️ Important:** The DeepSeek OCR model is sensitive to prompt precision. Avoid vague or ambiguous prompts for better results.

## 📚 API Documentation

### Swagger UI

Access the interactive API documentation at:
```
http://localhost:3000/api/docs
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ocr/upload` | Upload file(s) |
| `POST` | `/api/ocr/process` | Process uploaded file by ID |
| `POST` | `/api/ocr/process-url` | Process file from URL |
| `POST` | `/api/ocr/process-base64` | Process file from base64 |
| `POST` | `/api/ocr/process-path` | Process file from server path |
| `GET` | `/api/ocr/status/:jobId` | Get job status |
| `GET` | `/api/ocr/result/:jobId` | Get job result |
| `DELETE` | `/api/ocr/file/:fileId` | Delete uploaded file |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/config` | Public configuration |

### Example API Call

```bash
# Upload a file
curl -X POST http://localhost:3000/api/ocr/upload \
  -F "file=@document.png"

# Process the file
curl -X POST http://localhost:3000/api/ocr/process \
  -H "Content-Type: application/json" \
  -d '{"fileId": "uuid-here", "prompt": "<image>\nExtract the text in the image."}'

# Get result
curl http://localhost:3000/api/ocr/result/{jobId}
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Production (with GPU support)
docker-compose up -d

# Development (CPU only)
docker-compose -f docker-compose.dev.yml up -d
```

### Build Individual Containers

```bash
# Build backend
cd backend
docker build -t deepseek-ocr-backend .

# Build frontend
cd frontend
docker build -t deepseek-ocr-frontend .
```

### Container Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Frontend   │  │   Backend    │  │   Ollama     │  │
│  │   (nginx)    │──│   (NestJS)   │──│  (DeepSeek)  │  │
│  │   Port: 80   │  │  Port: 3000  │  │ Port: 11434  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  Volumes:                                               │
│  - ollama_data: Model storage                           │
│  - uploads_data: Uploaded files                         │
└─────────────────────────────────────────────────────────┘
```

## 💻 Development

### Project Structure

```
deepseek-ocr-app/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── modules/
│   │   │   ├── ocr/          # OCR processing
│   │   │   ├── ollama/       # Ollama integration
│   │   │   ├── storage/      # File storage
│   │   │   └── health/       # Health checks
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Services, models
│   │   │   ├── features/     # Feature modules
│   │   │   └── shared/       # Shared components
│   │   └── environments/
│   ├── Dockerfile
│   └── package.json
├── docs/
│   └── postman-collection.json
├── docker-compose.yml
└── README.md
```

### Running Tests

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e
npm run test:cov

# Frontend tests
cd frontend
npm run test
```

### Code Style

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
```

## 🧪 Testing with Postman

Import the Postman collection from `docs/postman-collection.json` for easy API testing.

The collection includes:
- All API endpoints
- Pre-configured variables
- Example requests
- Complete workflow tests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [DeepSeek](https://www.deepseek.com/) for the OCR model
- [Ollama](https://ollama.ai/) for the local AI runtime
- [Angular](https://angular.io/) for the frontend framework
- [NestJS](https://nestjs.com/) for the backend framework

---

Made with ❤️ by [MAMISHO](https://github.com/MAMISHO)
