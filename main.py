from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from database import init_db, add_subject
from rag import load_documents, create_vectorstore

app = FastAPI()

# ✅ Enable CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Initialize DB
init_db()

# ✅ Store vectorstores in memory
vectorstores = {}

# ✅ Upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# -----------------------------
# 1️⃣ Create Subject
# -----------------------------
@app.post("/create-subject")
def create_subject(name: str):
    success = add_subject(name)

    if not success:
        return {"message": "Subject already exists"}

    return {"message": f"Subject '{name}' created successfully"}


# -----------------------------
# 2️⃣ Upload File
# -----------------------------
@app.post("/upload/{subject_name}")
async def upload_file(subject_name: str, file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    try:
        # Load documents
        docs = load_documents(file_path)

        # Create vectorstore
        vectorstore = create_vectorstore(docs)

        # Store in memory
        vectorstores[subject_name] = vectorstore

        return {"message": "File uploaded and processed successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# 3️⃣ Ask Question
# -----------------------------
@app.post("/ask/{subject_name}")
def ask_question(subject_name: str, question: str):

    if subject_name not in vectorstores:
        return {"error": "No file uploaded for this subject yet"}

    vectorstore = vectorstores[subject_name]

    docs = vectorstore.similarity_search(question, k=3)

    if not docs:
        return {
            "answer": "Not found in notes",
            "confidence": "Low"
        }

    context = "\n\n".join([doc.page_content for doc in docs])

    return {
        "answer": context,
        "confidence": "Medium",
        "citations": [doc.metadata.get("source", "Unknown") for doc in docs]
    }
      