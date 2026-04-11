from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Your knowledge base
docs = [
    "Udaipur is known as the City of Lakes",
    "Best time to visit Udaipur is October to February",
    "Fateh Sagar Lake is less crowded in mornings",
    "Local food includes Dal Baati Churma and Gatte ki Sabzi",
    "The famous hotels are Taj lake palace, The Lali Laxmi Vilas Palace",
    "The famous cafe are Sun N Moon cafe, Qalaa - Art and Bar"
]

# Create embeddings
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")

# Create vector store ONCE ✅
vector_store = FAISS.from_texts(docs, embedding=embeddings)


def get_context(query: str):
    results = vector_store.similarity_search(query, k=3)

    context = "\n".join([doc.page_content for doc in results])

    return context