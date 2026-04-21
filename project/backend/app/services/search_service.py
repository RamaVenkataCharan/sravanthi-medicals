from rapidfuzz import fuzz

def hybrid_search(query: str, medicines: list):
    results = []
    query_lower = query.lower()

    for med in medicines:
        name = med.name.lower()
        score = 0

        # Exact match boost
        if name == query_lower:
            score += 100
            
        # Prefix boost (strong signal)
        if name.startswith(query_lower):
            score += 80
        else:
            # Fuzzy score for typo handling
            score += fuzz.partial_ratio(query_lower, name)

        # Manufacturer relevance
        if med.manufacturer and query_lower in med.manufacturer.lower():
            score += 20

        # Filter weak matches
        if score > 60:
            results.append((med, score))

    # Sort by score descending
    results.sort(key=lambda x: x[1], reverse=True)

    # Return top 10 results
    return [r[0] for r in results[:10]]
