from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# More granular docs = better retrieval precision
docs = [
    "Udaipur is known as the City of Lakes, located in Rajasthan, India.",
    "Best time to visit Udaipur is October to February for pleasant weather.",
    "Fateh Sagar Lake is less crowded in the mornings — ideal for a quiet visit.",
    "Pichola Lake offers scenic boat rides with views of the City Palace.",
    "Local food to try: Dal Baati Churma, Gatte ki Sabzi, and Laal Maas.",
    "Famous restaurants: Ambrai (lakeside dining), Natraj Dining Hall (thali).",
    "The Taj Lake Palace and Leela Palace are iconic luxury stay options.",
    "Budget accommodation is available near Jagdish Temple and Fateh Sagar.",
    "The Lali Laxmi Vilas Palace is a mid-range heritage hotel option.",
    "Sun N Moon Cafe and Qalaa Art & Bar are popular spots for travellers.",
    "City Palace and Saheliyon ki Bari are must-see historical landmarks.",
    "Auto-rickshaws and cabs are the main modes of transport within Udaipur.",
    "Shopping: Hathipol Bazaar for textiles, Bada Bazaar for silver jewellery.",
]

# Module-level init — created once, reused across all calls
_embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")
_vector_store = FAISS.from_texts(docs, embedding=_embeddings)


def get_context(query: str, travel_type: str = "general", k: int = 4) -> str:
    enriched_query = f"{query} {travel_type} travel"
    results = _vector_store.similarity_search(enriched_query, k=k)
    # Deduplicate (FAISS can return near-duplicates)
    seen = set()
    unique = []
    for doc in results:
        if doc.page_content not in seen:
            seen.add(doc.page_content)
            unique.append(doc.page_content)
    return "\n".join(unique)