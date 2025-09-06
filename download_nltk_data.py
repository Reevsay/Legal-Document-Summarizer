"""
Utility script to download required NLTK data once.
Run:
    python download_nltk_data.py
"""

import nltk

# Download necessary NLTK datasets
datasets = ["punkt", "wordnet", "stopwords"]
for ds in datasets:
    nltk.download(ds)

print("NLTK data download complete.")
