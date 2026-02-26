import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import FakeEmbeddings


# ✅ Load Documents
def load_documents(file_path):

    if file_path.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    else:
        loader = TextLoader(file_path)

    docs = loader.load()

    return docs


# ✅ Create Vectorstore using Fake Embeddings
def create_vectorstore(docs):

    if not docs:
        raise ValueError("No readable content found in document.")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    split_docs = splitter.split_documents(docs)

    # 🔥 Using Fake Embeddings (No OpenAI Needed)
    embeddings = FakeEmbeddings(size=1536)

    vectorstore = FAISS.from_documents(split_docs, embeddings)

    return vectorstore