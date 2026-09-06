import math
import re
from collections import Counter, defaultdict

from sqlalchemy.orm import Session

from app.models.transaction import Transaction

# Keys must match frontend category ids in constants/categories.js
SEED_WORDS: dict[str, list[str]] = {
    "food": [
        "food", "restaurant", "cafe", "lunch", "dinner", "breakfast", "grocery",
        "pizza", "coffee", "snack", "meal", "canteen", "burger", "biryani",
        "momos", "tea", "milk", "bread", "kitchen", "eat", "dining", "lunchbox",
        "bakery", "noodles", "rice", "dal", "curry", "thakali", "khana",
        "kfc", "mcdonalds", "dominos", "starbucks", "bhatbhateni", "saleways",
        "bigmart", "foodmandu", "pathaofood", "swiggy", "zomato", "chowmein",
        "sekuwa", "newari", "mithai", "pastry", "icecream", "smoothie",
    ],
    "transport": [
        "uber", "taxi", "bus", "fuel", "petrol", "diesel", "metro", "ride",
        "ola", "pathao", "indrive", "transport", "fare", "ticket", "commute",
        "parking", "toll", "rickshaw", "tempo", "bike", "scooter", "totot",
        "sajha", "yatra", "cab", "auto", "petrolpump", "charging", "bolt",
        "rapido", "biketaxi", "rideshare", "ev", "chargingstation",
    ],
    "housing": [
        "rent", "room", "apartment", "hostel", "landlord", "housing", "lease",
        "deposit", "maintenance", "flat",
    ],
    "entertainment": [
        "netflix", "movie", "concert", "game", "spotify", "cinema", "party",
        "subscription", "youtube", "music", "steam", "gaming", "theatre",
        "kart", "gokart", "bowling", "arcade", "amusement", "park", "fun",
        "hobby", "outing", "qfx", "f1soft", "escaperoom", "laser", "trampoline",
        "paintball", "karaoke", "club", "dj", "festival", "ticketmaster",
    ],
    "shopping": [
        "amazon", "flipkart", "clothes", "shoes", "mall", "shop", "store",
        "fashion", "garment", "electronics", "gadget", "daraz", "sastodeal",
        "hamrobazar", "thamel", "boutique", "apparel", "sneaker",
    ],
    "utilities": [
        "electricity", "water", "internet", "wifi", "mobile", "recharge",
        "bill", "nepal", "telecom", "ncell", "ntc", "broadband", "power",
        "worldlink", "vianet", "dishhome", "sim", "datapack",
    ],
    "health": [
        "pharmacy", "medicine", "doctor", "hospital", "clinic", "dental",
        "medical", "health", "surgery", "nurse", "lab", "test", "checkup",
        "paracetamol", "vitamin", "ambulance", "therapy", "dentist",
        "hamro", "patan", "om", "teaching",
    ],
    "education": [
        "tuition", "books", "college", "school", "course", "exam", "library",
        "university", "semester", "fee", "stationery", "class", "udemy",
        "coursera",
    ],
    "travel": [
        "flight", "hotel", "airbnb", "travel", "trip", "vacation", "visa",
        "airline", "booking", "tour", "yeti", "buddhaair", "trekking",
        "pokhara", "chitwan",
    ],
    "personal": [
        "salon", "haircut", "gym", "fitness", "spa", "beauty", "skincare",
        "barber", "cosmetics", "yoga", "massage",
    ],
    "salary": ["salary", "payroll", "wage", "stipend", "paycheck"],
    "freelance": ["freelance", "client", "project", "gig", "contract", "upwork", "fiverr"],
    "business": ["business", "invoice", "vendor", "supplier", "office"],
    "investment": ["investment", "dividend", "stock", "mutual", "sip", "trading", "nabil", "nmb"],
}

# Multi-word / brand phrases — checked against the full description first
PHRASE_HINTS: dict[str, str] = {
    "pathao": "transport",
    "pathao ride": "transport",
    "pathao bike": "transport",
    "pathao cab": "transport",
    "in drive": "transport",
    "indrive": "transport",
    "uber": "transport",
    "ola": "transport",
    "totot": "transport",
    "bolt": "transport",
    "rapido": "transport",
    "go kart": "entertainment",
    "go karting": "entertainment",
    "go-kart": "entertainment",
    "gokart": "entertainment",
    "karting": "entertainment",
    "bowling alley": "entertainment",
    "movie ticket": "entertainment",
    "qfx": "entertainment",
    "escape room": "entertainment",
    "petrol pump": "transport",
    "gas station": "transport",
    "bus fare": "transport",
    "taxi fare": "transport",
    "ride share": "transport",
    "rideshare": "transport",
    "grocery store": "food",
    "fast food": "food",
    "foodmandu": "food",
    "pathao food": "food",
    "bhatbhateni": "food",
    "daraz": "shopping",
    "sastodeal": "shopping",
    "amazon": "shopping",
    "flipkart": "shopping",
    "netflix": "entertainment",
    "spotify": "entertainment",
    "hospital": "health",
    "pharmacy": "health",
    "medical store": "health",
    "electricity bill": "utilities",
    "wifi bill": "utilities",
    "internet bill": "utilities",
    "worldlink": "utilities",
    "ncell": "utilities",
    "house rent": "housing",
    "room rent": "housing",
}

STRONG_WORDS: dict[str, list[str]] = {
    "health": [
        "hospital", "pharmacy", "clinic", "doctor", "medicine", "medical",
        "dental", "surgery", "ambulance",
    ],
    "food": [
        "restaurant", "grocery", "cafe", "pizza", "biryani", "canteen",
        "foodmandu", "bhatbhateni",
    ],
    "transport": [
        "uber", "taxi", "petrol", "diesel", "pathao", "ola", "indrive", "totot",
        "fare", "commute", "bolt", "rapido",
    ],
    "housing": ["rent", "hostel", "landlord"],
    "utilities": ["electricity", "internet", "recharge", "wifi", "ncell", "worldlink"],
    "entertainment": [
        "netflix", "spotify", "cinema", "kart", "gokart", "bowling", "arcade", "qfx",
    ],
    "education": ["tuition", "college", "university"],
    "travel": ["flight", "hotel", "airbnb"],
    "salary": ["salary", "payroll"],
}

CATEGORY_ALIASES = {
    "transportation": "transport",
    "transport": "transport",
}

VALID_EXPENSE = {
    "food", "transport", "housing", "entertainment", "health", "education",
    "shopping", "utilities", "travel", "personal", "investment", "other",
}
VALID_INCOME = {"salary", "freelance", "business", "investment", "other"}


def _normalize_category(cat: str) -> str:
    return CATEGORY_ALIASES.get(cat, cat)


def _normalize_text(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", " ", text.lower()).strip()


def _tokenize(text: str) -> list[str]:
    return re.findall(r"\b[a-z]{2,}\b", _normalize_text(text))


def _phrase_hits(description: str) -> list[str]:
    """Return category hits from known phrases/brands in the description."""
    text = _normalize_text(description)
    compact = text.replace(" ", "")
    hits: list[str] = []
    for phrase, cat in PHRASE_HINTS.items():
        p = phrase.lower().strip()
        p_space = re.sub(r"[\s\-]+", " ", p)
        p_compact = re.sub(r"[\s\-]+", "", p)
        if p_space in text or p_compact in compact:
            hits.append(_normalize_category(cat))
    return hits


def _edit_distance(a: str, b: str) -> int:
    """Levenshtein distance for short typo tolerance (pathaoo, pathau)."""
    if a == b:
        return 0
    if abs(len(a) - len(b)) > 2:
        return 99
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def _fuzzy_seed_hits(tokens: list[str], vocab: set[str]) -> list[tuple[str, str]]:
    """Match tokens to seed vocab via containment or small edit distance."""
    hits = []
    for token in tokens:
        if token in vocab:
            continue
        best = None
        best_dist = 99
        for w in vocab:
            if len(w) < 4 or len(token) < 3:
                continue
            if w in token or token in w:
                hits.append((token, w))
                best = None
                break
            if len(token) >= 4 and len(w) >= 4:
                d = _edit_distance(token, w)
                max_d = 1 if min(len(token), len(w)) < 6 else 2
                if d <= max_d and d < best_dist:
                    best_dist = d
                    best = w
        if best:
            hits.append((token, best))
    return hits


def _build_model(txs: list) -> tuple[dict, dict, dict, set, int]:
    category_counts: dict[str, int] = defaultdict(int)
    word_counts_by_cat: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    total_words_by_cat: dict[str, int] = defaultdict(int)
    vocab: set[str] = set()

    for cat, words in SEED_WORDS.items():
        cat = _normalize_category(cat)
        category_counts[cat] += 3
        for w in words:
            word_counts_by_cat[cat][w] += 3
            total_words_by_cat[cat] += 3
            vocab.add(w)

    for cat, words in STRONG_WORDS.items():
        cat = _normalize_category(cat)
        for w in words:
            word_counts_by_cat[cat][w] += 12
            total_words_by_cat[cat] += 12
            vocab.add(w)

    for tx in txs:
        cat = _normalize_category(tx.category)
        category_counts[cat] += 1
        for w in _tokenize(tx.description or ""):
            word_counts_by_cat[cat][w] += 1
            total_words_by_cat[cat] += 1
            vocab.add(w)
        if getattr(tx, "notes", None):
            for w in _tokenize(tx.notes):
                word_counts_by_cat[cat][w] += 1
                total_words_by_cat[cat] += 1
                vocab.add(w)

    total_transactions = max(sum(category_counts.values()), 1)
    return category_counts, word_counts_by_cat, total_words_by_cat, vocab, total_transactions


def _word_to_categories(word_counts_by_cat: dict) -> dict[str, str]:
    """Map each vocab word to its strongest category (for fuzzy remaps)."""
    mapping: dict[str, str] = {}
    for cat, words in word_counts_by_cat.items():
        for w, count in words.items():
            prev = mapping.get(w)
            if prev is None or count > word_counts_by_cat[prev].get(w, 0):
                mapping[w] = cat
    return mapping


def suggest_category_nb(
    user_id, description: str, db: Session, tx_type: str = "expense"
) -> dict | None:
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id, Transaction.deleted_at.is_(None))
        .all()
    )
    tokens = _tokenize(description or "")
    if not tokens and not (description or "").strip():
        return None

    valid = VALID_INCOME if tx_type == "income" else VALID_EXPENSE

    # 1) Phrase / brand shortcuts beat the prior for novel descriptions
    phrase_cats = [c for c in _phrase_hits(description or "") if c in valid]
    if phrase_cats:
        best = Counter(phrase_cats).most_common(1)[0][0]
        return {
            "category": best,
            "confidence": 92.0,
            "is_starter": len(txs) == 0,
        }

    category_counts, word_counts_by_cat, total_words_by_cat, vocab, total_transactions = _build_model(txs)
    word_cat = _word_to_categories(word_counts_by_cat)

    # Remap fuzzy OOV tokens onto known seed words
    scored_tokens = list(tokens)
    for token, seed in _fuzzy_seed_hits(tokens, vocab):
        scored_tokens.append(seed)
        # Prefer the seed's category via an artificial phrase-like boost
        cat = word_cat.get(seed)
        if cat and cat in valid:
            phrase_cats.append(cat)

    if phrase_cats:
        best = Counter(phrase_cats).most_common(1)[0][0]
        return {
            "category": best,
            "confidence": 85.0,
            "is_starter": len(txs) == 0,
        }

    known = [t for t in scored_tokens if t in vocab]
    if not known:
        return None

    vocab_size = len(vocab) or 1
    best_category = None
    best_prob = -float("inf")
    log_probs: dict[str, float] = {}

    for cat in category_counts:
        if cat not in valid:
            continue
        prior = category_counts[cat] / total_transactions
        log_prob = math.log(prior)

        # Only known tokens contribute — avoids Laplace dragging toward the prior
        for token in known:
            count = word_counts_by_cat[cat].get(token, 0)
            token_prob = (count + 1) / (total_words_by_cat[cat] + vocab_size + 1)
            log_prob += math.log(token_prob)

        log_probs[cat] = log_prob
        if log_prob > best_prob:
            best_prob = log_prob
            best_category = cat

    if not best_category:
        return None

    max_log = max(log_probs.values())
    exp_scores = {c: math.exp(lp - max_log) for c, lp in log_probs.items()}
    total = sum(exp_scores.values()) or 1
    confidence = round((exp_scores[best_category] / total) * 100, 1)

    # Ignore weak prior-only guesses
    if confidence < 28:
        return None

    return {
        "category": best_category,
        "confidence": confidence,
        "is_starter": len(txs) == 0,
    }
