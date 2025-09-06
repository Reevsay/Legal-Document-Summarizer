import re
import nltk
from nltk.stem import WordNetLemmatizer  # or PorterStemmer
import PyPDF2
import docx

# nltk.download('stopwords') # Moved stopwords download to summarizer.py

def clean_text(text):
    """Removes extra spaces, newlines, and special characters from legal text."""
    text = re.sub(r"\n+", " ", text)  # Remove extra newlines
    text = re.sub(r"\s+", " ", text).strip()  # Remove extra spaces
    text = re.sub(r"'s", "", text)  # Remove "'s"
    # Preserve sentence delimiters (., !, ?) so sentence splitting works
    text = re.sub(r"[^\w\s\.\!\?]", "", text)
    return text


def split_sentences(text):
    """Splits text into well-structured sentences for further processing."""
    # Ensure tokenizer is available; try both newer and legacy resource names
    def _ensure(name, dl=None):
        try:
            nltk.data.find(name)
            return True
        except LookupError:
            try:
                nltk.download(dl or name.split('/')[-1])
                return True
            except Exception:
                return False

    have_punkt = _ensure('tokenizers/punkt', 'punkt') or _ensure('tokenizers/punkt_tab', 'punkt')
    if have_punkt:
        try:
            return nltk.sent_tokenize(text)
        except Exception:
            pass
    # Fallback: naive split
    return [s.strip() for s in re.split(r'[.!?]+\s+', text) if s.strip()]


def lemmatize_text(text):
    # Ensure wordnet; if unavailable, return text unchanged (safe fallback)
    try:
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet')
        try:
            nltk.data.find('corpora/omw-1.4')
        except LookupError:
            nltk.download('omw-1.4')
        lemmatizer = WordNetLemmatizer()
        return " ".join(lemmatizer.lemmatize(w) for w in text.split())
    except Exception:
        return text


def preprocess_text(text):
    text = clean_text(text)
    text = lemmatize_text(text)
    return text


def extract_text_from_pdf(file):
    """
    Extract text from a PDF. Accepts a file path or a file-like object (e.g., BytesIO).
    """
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text


def extract_text_from_docx(file):
    """
    Extract text from a DOCX file. Accepts a file path or a file-like object.
    """
    doc = docx.Document(file)
    full_text = [para.text for para in doc.paragraphs]
    return "\n".join(full_text)


if __name__ == "__main__":
    sample_text = """CONFIDENTIALITY AGREEMENT... This Agreement is made on April 1, 2025. 
    The Receiving Party's must protect confidential information. They're going to agree to the terms."""

    cleaned = clean_text(sample_text)
    print("Cleaned Text:", cleaned)

    lemmatized = lemmatize_text(cleaned)
    print("Lemmatized Text:", lemmatized)

    sentences = split_sentences(cleaned)
    print("Sentences:", sentences)