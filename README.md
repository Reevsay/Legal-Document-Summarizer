# ⚖️ Legal Summarizer

A modern web application for summarizing legal documents using both extractive and abstractive NLP techniques. Built with FastAPI, powered by Hugging Face Transformers, and featuring an intuitive dark-themed interface.

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![AI](https://img.shields.io/badge/AI-NLP-orange.svg)

## 📸 Screenshots

### Main Interface
![Main Interface](output/Screenshot%202025-09-06%20123439.png)

### Document Processing & Summarization
![Document Processing](output/Screenshot%202025-09-06%20123750.png)

### Visual Analytics Dashboard
![Visual Analytics](output/Screenshot%202025-09-06%20123915.png)

## 🚀 Features

- **📄 Extractive Summarization**: TF-IDF based sentence scoring for quick key sentence extraction
- **🤖 Abstractive Summarization**: Facebook BART model (facebook/bart-large-cnn) for human-like summaries
- **📁 Document Upload**: Support for .txt, .pdf, and .docx files
- **☁️ Real-time Word Cloud**: Visual representation of key terms and concepts
- **� Interactive Charts**: Visual analytics with Chart.js integration
- **�📚 History Tracking**: Persistent summary history with localStorage
- **🎨 Responsive UI**: Modern dark theme with smooth animations
- **⚡ One-Click Start**: Automated dependency installation and server startup

## ⚡ Quick Start

### Option 1: Automatic Setup (Recommended)
```bash
python app.py
```

This will automatically:
- ✅ Check and install missing dependencies
- 📦 Download required NLTK data
- 🚀 Start the FastAPI server on http://127.0.0.1:8000
- 🌐 Open your browser automatically

### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/legal-summarizer.git
   cd legal-summarizer
   ```

2. **Create virtual environment (recommended)**
   ```bash
   python -m venv .venv
   
   # On Windows
   .venv\Scripts\activate
   
   # On macOS/Linux
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download NLTK data**
   ```bash
   python download_nltk_data.py
   ```

5. **Start the application**
   ```bash
   python app.py
   ```

### Option 3: Windows PowerShell Script
```powershell
# Optional: create virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Start application (installs missing deps if needed)
.\start.ps1
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves the frontend interface |
| `/api/summarize` | POST | Returns JSON with extractive and abstractive summaries |
| `/api/convert` | POST | Upload .txt/.pdf/.docx files and convert to text |
| `/api/wordcloud` | POST | Generate PNG word cloud for provided text |
| `/api/health` | GET | API health status check |

## 🛠️ Technology Stack

- **Backend**: FastAPI, Python 3.8+
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **NLP**: NLTK, Hugging Face Transformers, scikit-learn
- **Visualization**: Chart.js, WordCloud, Matplotlib
- **Document Processing**: PyPDF2, python-docx
- **Server**: Uvicorn ASGI server

## 📋 Requirements

- Python 3.8 or higher
- 4GB+ RAM (recommended for BART model)
- Internet connection (for initial model download)

## 🎯 Usage

1. **Upload Document**: Click "Choose File" and select a .txt, .pdf, or .docx file
2. **Enter Text**: Or paste text directly into the text area
3. **Choose Summary Type**: Select between Extractive, Abstractive, or Both
4. **Adjust Length**: Use the slider to control summary length
5. **Generate**: Click "Generate Summary" to process
6. **View Results**: See your summary, word cloud, and statistics
7. **Download**: Save summaries as text files
8. **History**: Access previous summaries from the history panel

## � Visual Analytics

The application provides comprehensive visual analytics including:

- **Word Cloud**: Visual representation of key terms
- **Text Analysis Chart**: Breakdown of words, sentences, and paragraphs
- **Compression Metrics**: Pie chart showing summary vs original content ratio
- **Summary Comparison**: Side-by-side comparison of original vs summary statistics

## �📝 Notes

- On first abstractive summarization run, the BART model (~1.6GB) will download automatically
- Subsequent runs use the cached model for faster processing
- The application stores summary history locally in your browser
- For large documents, extractive summarization is significantly faster

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment

#### Option 1: Direct Python
```bash
uvicorn server:app --host 0.0.0.0 --port 8000
```

#### Option 2: Docker
```bash
# Build and run with Docker
docker build -t legal-summarizer .
docker run -p 8000:8000 legal-summarizer
```

#### Option 3: Docker Compose
```bash
# Run with docker-compose
docker-compose up -d
```

#### Option 4: Cloud Deployment
The application can be easily deployed to:
- **Heroku**: Use the provided `Dockerfile`
- **Google Cloud Run**: Containerized deployment
- **AWS ECS/Fargate**: Container-based deployment
- **Azure Container Instances**: Quick container deployment

### Environment Variables
- `BIND_ADDR`: Server bind address (default: 127.0.0.1)
- `PORT`: Server port (default: 8000)
- `PYTHONPATH`: Python path for modules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for the BART model
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent web framework
- [NLTK](https://www.nltk.org/) for natural language processing tools
- [Chart.js](https://www.chartjs.org/) for interactive visualizations

## 📞 Support

If you encounter any issues or have questions:

- Check the [Issues](https://github.com/yourusername/legal-summarizer/issues) page
- Create a new issue with detailed information
- Include screenshots and error messages if applicable

---

**Made with ❤️ for legal professionals and document analysis enthusiasts**
- If you prefer PyTorch backend, install `torch` and omit `tensorflow-cpu`.

## Project structure
- `server.py` — FastAPI app (APIs + static frontend)
- `frontend/` — index.html, style.css, script.js, sample_document.txt
- `summarizer.py` — extractive and abstractive summarizers
- `text_preprocessing.py` — text utilities and file extraction
- `download_nltk_data.py` — one‑time NLTK downloader
- `start.ps1` — Windows start script

Legacy: The old Streamlit UI is removed.

## License
MIT
