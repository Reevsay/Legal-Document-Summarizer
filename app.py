#!/usr/bin/env python3
"""
Legal Summarizer - Main Entry Point

Run the entire project with:
    python app.py

This will start the FastAPI server on http://127.0.0.1:8000
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def check_dependencies():
    """Check if required packages are installed."""
    required_packages = [
        'fastapi', 'uvicorn', 'python-multipart', 'transformers', 
        'scikit-learn', 'nltk', 'wordcloud', 'PyPDF2', 'python-docx'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"⚠️  Missing packages: {', '.join(missing)}")
        print("Installing missing dependencies...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing)
            print("✅ Dependencies installed successfully!")
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies. Please run:")
            print(f"pip install {' '.join(missing)}")
            return False
    
    return True

def download_nltk_data():
    """Download required NLTK data."""
    try:
        import nltk
        nltk_data = ['punkt', 'stopwords', 'wordnet', 'omw-1.4']
        for data in nltk_data:
            try:
                nltk.data.find(f'tokenizers/{data}' if data == 'punkt' else f'corpora/{data}')
            except LookupError:
                print(f"📦 Downloading NLTK data: {data}")
                try:
                    nltk.download(data, quiet=True)
                except Exception as e:
                    print(f"⚠️  Could not download {data}: {e}")
    except Exception as e:
        print(f"⚠️  NLTK setup warning: {e}")

def main():
    """Main entry point."""
    print("🚀 Starting Legal Summarizer...")
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Download NLTK data
    download_nltk_data()
    
    # Import and start the server
    try:
        import uvicorn
        
        host = "127.0.0.1"
        port = 8000
        url = f"http://{host}:{port}"
        
        print(f"📱 Server will start at: {url}")
        print("🌐 Opening browser in 3 seconds...")
        
        # Open browser after a short delay
        def open_browser():
            time.sleep(3)
            try:
                webbrowser.open(url)
            except Exception:
                pass
        
        import threading
        threading.Thread(target=open_browser, daemon=True).start()
        
        # Start the server
        print("🔥 Starting FastAPI server...")
        print("📝 Use Ctrl+C to stop the server")
        print("-" * 50)
        
        uvicorn.run(
            "server:app",
            host=host,
            port=port,
            reload=True,
            reload_dirs=[str(script_dir)],
            access_log=False
        )
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

