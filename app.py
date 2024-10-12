from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

app = Flask(__name__)


# TODO: Fetch dataset, initialize vectorizer and LSA here
# Fetch the dataset
newsgroups = fetch_20newsgroups(subset='all')
documents = newsgroups.data

# Create TF-IDF vectorizer and fit-transform the documents
tfidf_vectorizer = TfidfVectorizer(max_features=2000, stop_words='english')
term_doc_matrix = tfidf_vectorizer.fit_transform(documents).toarray()


# Manually perform SVD
U, Sigma, VT = np.linalg.svd(term_doc_matrix, full_matrices=False)

# Determine number of components to keep
n_components = 100  # You can adjust this based on the desired dimensionality

# Reduce the matrices based on the chosen number of components
U_k = U[:, :n_components]  # Reduced U matrix
Sigma_k = np.diag(Sigma[:n_components])  # Reduced diagonal matrix of singular values
VT_k = VT[:n_components, :]  # Reduced V^T matrix

# Project the term-doc matrix into the reduced space
lsa_matrix = np.dot(U_k, Sigma_k)

print(f"LSA applied with {n_components} components.")

def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    Input: query (str)
    Output: documents (list), similarities (list), indices (list)
    """
    # Transform the query into the TF-IDF space
    query_vec = tfidf_vectorizer.transform([query]).toarray()  # Convert to dense array

    # Project the query into the reduced LSA space
    query_lsa = np.dot(query_vec, VT_k.T)

    
    # Compute cosine similarities between the query and all documents
    similarities = cosine_similarity(query_lsa, lsa_matrix)[0]
    
    # Get the indices of the top 5 most similar documents
    top_indices = similarities.argsort()[-5:][::-1]
    top_similarities = similarities[top_indices].tolist()
    top_documents = [documents[i] for i in top_indices]
    top_indices = top_indices.tolist()
    return top_documents, top_similarities, top_indices

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices}) 

if __name__ == '__main__':
    app.run(debug=True)
