from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from summarizer import summarize
from text_preprocessing import extract_text_from_pdf, extract_text_from_docx
from summarizer import stop_words as SUMM_STOP_WORDS
from io import BytesIO
from wordcloud import WordCloud

app = FastAPI(title="Legal Summarizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend
app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
async def root_index():
    return FileResponse("frontend/index.html")


class SummarizeRequest(BaseModel):
    text: str
    mode: str = "extractive"  # 'extractive' | 'abstractive' | 'compare'
    length: str = "medium"  # 'short' | 'medium' | 'long'
    num_sentences: int = 3


@app.post("/api/summarize")
async def summarize_route(payload: SummarizeRequest):
    mode = payload.mode
    if mode == "compare":
        res = {
            "extractive": summarize(
                payload.text,
                mode="extractive",
                length=payload.length,
                num_sentences=payload.num_sentences,
            ),
            "abstractive": summarize(
                payload.text,
                mode="abstractive",
                length=payload.length,
                num_sentences=payload.num_sentences,
            ),
        }
    else:
        res = summarize(
            payload.text,
            mode=mode,
            length=payload.length,
            num_sentences=payload.num_sentences,
        )
        if isinstance(res, str):
            res = {mode: res}
    return {"ok": True, "data": res}


@app.get("/api/health")
async def health():
    return {"ok": True}


@app.post("/api/convert")
async def convert_file(file: UploadFile = File(...)):
    name = (file.filename or "").lower()
    try:
        if name.endswith(".txt"):
            content = (await file.read()).decode("utf-8", errors="ignore")
        elif name.endswith(".pdf"):
            content = extract_text_from_pdf(file.file)
        elif name.endswith(".docx"):
            content = extract_text_from_docx(file.file)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Use .txt, .pdf, or .docx",
            )
        return {"ok": True, "text": content}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class WordcloudRequest(BaseModel):
    text: str


@app.post("/api/wordcloud")
async def wordcloud_route(payload: WordcloudRequest):
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    try:
        wc = WordCloud(
            width=800,
            height=300,
            background_color="white",
            stopwords=set(SUMM_STOP_WORDS),
            collocations=False,
        ).generate(text)
        buf = BytesIO()
        wc.to_image().save(buf, format="PNG")
        buf.seek(0)
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class AnalyticsRequest(BaseModel):
    text: str


@app.post("/api/analytics")
async def analytics_route(payload: AnalyticsRequest):
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        # Basic text analytics
        word_count = len(text.split())
        sentence_count = len([s for s in text.split(".") if s.strip()])
        paragraph_count = len([p for p in text.split("\n\n") if p.strip()])
        char_count = len(text)

        # Advanced analytics
        avg_sentence_length = word_count / max(sentence_count, 1)
        reading_time = max(1, word_count // 200)  # ~200 words per minute

        # Word frequency analysis
        words = text.lower().split()
        word_freq = {}
        for word in words:
            word_clean = "".join(c for c in word if c.isalpha())
            if len(word_clean) > 3:  # Only words longer than 3 chars
                word_freq[word_clean] = word_freq.get(word_clean, 0) + 1

        # Top 10 most frequent words
        top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]

        return {
            "ok": True,
            "data": {
                "basic": {
                    "word_count": word_count,
                    "sentence_count": sentence_count,
                    "paragraph_count": paragraph_count,
                    "character_count": char_count,
                },
                "advanced": {
                    "avg_sentence_length": round(avg_sentence_length, 1),
                    "reading_time_minutes": reading_time,
                },
                "top_words": top_words,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
