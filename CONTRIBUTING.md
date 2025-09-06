# Contributing to Legal Summarizer

Thank you for your interest in contributing to Legal Summarizer! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use clear, descriptive titles** for your issues
3. **Provide detailed information** including:
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Your environment (OS, Python version, etc.)
   - Screenshots if applicable

### Suggesting Enhancements

1. **Check existing feature requests** to avoid duplicates
2. **Clearly describe the enhancement** and its benefits
3. **Provide examples** of how it would work
4. **Consider backward compatibility**

### Code Contributions

#### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/legal-summarizer.git
   cd legal-summarizer
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   python download_nltk_data.py
   ```

4. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

- **Follow PEP 8** Python style guidelines
- **Write clear, descriptive commit messages**
- **Add comments** for complex logic
- **Update documentation** when necessary
- **Test your changes** thoroughly

#### Code Style

- Use meaningful variable and function names
- Keep functions small and focused
- Add docstrings for functions and classes
- Use type hints where appropriate

Example:
```python
def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text content from a PDF file.
    
    Args:
        file_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text content
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        PyPDF2.errors.PdfReadError: If PDF is corrupted
    """
    # Implementation here
```

#### Testing

- Test your changes with different file types (.txt, .pdf, .docx)
- Verify both extractive and abstractive summarization work
- Check the web interface functionality
- Test with various document sizes

#### Pull Request Process

1. **Ensure your code follows the guidelines above**
2. **Update the README.md** if you've added new features
3. **Commit your changes** with clear messages:
   ```bash
   git add .
   git commit -m "Add feature: brief description of what you added"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** with:
   - Clear title and description
   - Reference to any related issues
   - Screenshots/examples if applicable

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment details**:
  - Operating System
  - Python version
  - Package versions (`pip list`)
  
- **Steps to reproduce**:
  - Exact steps that led to the bug
  - Input data or files used
  
- **Expected behavior**: What should have happened
- **Actual behavior**: What actually happened
- **Error messages**: Full error traces if any

## 💡 Feature Requests

For new features, please:

- **Explain the use case**: Why is this feature needed?
- **Describe the solution**: How should it work?
- **Consider alternatives**: Are there other ways to achieve this?
- **Assess impact**: How would this affect existing functionality?

## 📝 Documentation

Help improve our documentation by:

- Fixing typos or unclear instructions
- Adding examples and use cases
- Improving API documentation
- Translating to other languages

## 🔍 Areas for Contribution

We especially welcome contributions in these areas:

- **Performance optimization** for large documents
- **Additional file format support** (e.g., .rtf, .odt)
- **UI/UX improvements** and accessibility
- **Mobile responsiveness** enhancements
- **Internationalization** (i18n) support
- **Advanced NLP features** (entity recognition, topic modeling)
- **Batch processing** capabilities
- **API rate limiting** and security improvements

## 📞 Getting Help

If you need help or have questions:

- **Check the documentation** first
- **Search existing issues** for similar questions
- **Open a new issue** with the "question" label
- **Be specific** about what you're trying to achieve

## 🎯 Recognition

Contributors will be:

- Added to the project's contributor list
- Mentioned in release notes for significant contributions
- Invited to be maintainers for exceptional ongoing contributions

Thank you for helping make Legal Summarizer better! 🙏
