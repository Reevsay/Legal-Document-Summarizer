import heapq
from text_preprocessing import (
    clean_text,
    split_sentences,
    lemmatize_text,
)
from sklearn.feature_extraction.text import TfidfVectorizer

from transformers.pipelines import pipeline as hf_pipeline
import nltk
from nltk.corpus import stopwords

try:
    import tensorflow as tf

    _HAS_TF = True
except Exception:
    tf = None
    _HAS_TF = False
from functools import lru_cache


# -------------------------------
# STOPWORDS (generic + legal)
# -------------------------------
common_stopwords = {
    "the",
    "is",
    "and",
    "to",
    "of",
    "a",
    "in",
    "for",
    "on",
    "with",
    "by",
    "as",
    "from",
    "that",
    "this",
    "an",
    "it",
    "at",
    "which",
    "be",
    "have",
    "or",
    "may",
    "not",
    "will",
    "has",
    "are",
    "you",
    "shall",
    "any",
    "can",
    "does",
    "if",
    "your",
    "all",
    "between",
    "under",
    "above",
    "etc",
    "hereby",
    "thereof",
    "pursuant",
    "whereas",
    "party",
    "parties",
    "agreement",
    "aforementioned",
    "said",
    "now",
    "therefore",
    "witnesseth",
    "in witness whereof",
    "executed",
    "date",
    "first",
    "second",
    "third",
}


def _ensure_nltk_resource(name: str, download_name: str | None = None):
    try:
        nltk.data.find(name)
        return True
    except LookupError:
        try:
            nltk.download(download_name or name.split("/")[-1])
            return True
        except Exception:
            return False


# Ensure stopwords (fallback to common_stopwords if offline)
_ensure_nltk_resource("corpora/stopwords", "stopwords")
try:
    sw = set(stopwords.words("english"))
except Exception:
    sw = set()
stop_words = list(sw.union(common_stopwords))


# -------------------------------
# TF-IDF based scoring
# -------------------------------
def sentence_scores_tfidf(text):
    """
    Compute TF-IDF scores for each sentence in the text.
    Higher the TF-IDF value, more important the sentence.
    """
    if not text or not text.strip():
        return [], {}

    # First split into sentences (preserve delimiters in cleaning),
    # then lemmatize per sentence to keep sentence boundaries.
    sentences = split_sentences(text)
    if not sentences:
        return [], {}

    lem_sentences = [lemmatize_text(s) for s in sentences]
    # Filter out empty lemmatized sentences
    valid_pairs = [
        (orig, lem) for orig, lem in zip(sentences, lem_sentences) if lem.strip()
    ]
    if not valid_pairs:
        return sentences, {s: 0.0 for s in sentences}

    sentences, lem_sentences = zip(*valid_pairs)
    sentences, lem_sentences = list(sentences), list(lem_sentences)

    try:
        vectorizer = TfidfVectorizer(stop_words=stop_words)
        vectorizer.fit(lem_sentences)
        sentence_vectors = vectorizer.transform(lem_sentences)
        # Efficient sparse sum without SciPy import beyond sklearn's return type
        sums = sentence_vectors.sum(axis=1).A1  # 1D array
        scores = {sentences[i]: float(sums[i]) for i in range(len(sentences))}
        return sentences, scores
    except Exception:
        # Fallback: assign uniform scores
        return sentences, {s: 1.0 for s in sentences}


# -------------------------------
# Extractive Summary
# -------------------------------
def summarize_extractive(text, num_sentences=3):
    text = clean_text(text)
    if not text:
        return ""
    sentences, scores = sentence_scores_tfidf(text)
    # pick top sentences by score
    if not sentences:
        return ""
    k = max(1, min(num_sentences, len(sentences)))
    top_sentences = heapq.nlargest(k, scores, key=lambda s: scores[s])
    return " ".join(top_sentences)


# -------------------------------
# Abstractive Summary (BART)
# -------------------------------
@lru_cache(maxsize=1)
def _get_abstractive_pipeline():
    # initialize and cache the BART summarization pipeline
    try:
        has_gpu = bool(_HAS_TF and tf and tf.config.list_physical_devices("GPU"))
    except Exception:
        has_gpu = False
    device = 0 if has_gpu else -1
    return hf_pipeline("summarization", model="facebook/bart-large-cnn", device=device)


def summarize_abstractive(text, summary_length="medium"):
    length_settings = {"short": (30, 60), "medium": (60, 150), "long": (150, 300)}
    min_length, max_length = length_settings.get(summary_length, (60, 150))
    summarizer = _get_abstractive_pipeline()
    if not text:
        return ""
    outputs = summarizer(
        text, max_length=max_length, min_length=min_length, do_sample=False
    )
    # pipeline returns list of dicts
    if isinstance(outputs, list) and outputs:
        return outputs[0].get("summary_text", "")
    return ""


# -------------------------------
# Hybrid summarizer interface
# -------------------------------
def summarize(text, mode="abstractive", length="medium", num_sentences=3):
    cleaned = clean_text(text or "")
    if mode == "abstractive":
        return summarize_abstractive(cleaned, summary_length=length)
    else:
        return summarize_extractive(cleaned, num_sentences=num_sentences)
