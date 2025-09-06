# Project Structure

```
legal-summarizer/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── frontend/
│   ├── index.html              # Main web interface
│   ├── script.js               # Frontend JavaScript logic
│   ├── style.css               # CSS styling
│   └── sample_document.txt     # Sample document for testing
├── output/
│   ├── Screenshot*.png         # Application screenshots
├── .gitignore                  # Git ignore rules
├── app.py                      # Main application launcher
├── server.py                   # FastAPI server implementation
├── summarizer.py               # NLP summarization logic
├── text_preprocessing.py       # Text processing utilities
├── download_nltk_data.py       # NLTK data downloader
├── requirements.txt            # Python dependencies
├── requirements-dev.txt        # Development dependencies
├── Dockerfile                  # Docker container configuration
├── docker-compose.yml          # Docker Compose setup
├── start.ps1                   # Windows PowerShell startup script
├── sample_document.txt         # Sample document
├── README.md                   # Project documentation
├── LICENSE                     # MIT License
├── CONTRIBUTING.md             # Contribution guidelines
└── PROJECT_STRUCTURE.md        # This file
```

## Key Components

### Core Files
- **app.py**: Entry point with dependency checking and auto-setup
- **server.py**: FastAPI backend with API endpoints
- **summarizer.py**: NLP models and summarization algorithms
- **text_preprocessing.py**: Text cleaning and preprocessing utilities

### Frontend
- **index.html**: Single-page application interface
- **script.js**: Interactive functionality and API communication
- **style.css**: Modern dark theme with responsive design

### Configuration
- **requirements.txt**: Production dependencies
- **requirements-dev.txt**: Development and testing dependencies
- **Dockerfile**: Containerization for easy deployment
- **docker-compose.yml**: Multi-container orchestration

### CI/CD
- **.github/workflows/ci.yml**: Automated testing and linting
- **Automated testing** across Python 3.8-3.11
- **Code quality** checks with flake8 and black

### Documentation
- **README.md**: Comprehensive project documentation
- **CONTRIBUTING.md**: Developer contribution guidelines
- **LICENSE**: MIT license for open source distribution
