"""
Clean Indian Medicines Dataset
================================
Cleans a Kaggle CSV dataset of Indian medicines and outputs a normalized file.

Supported CSV schemas (auto-detected):
 - A-Z Medicine Dataset of India
 - Tata 1mg Dataset
 - Indian Pharmaceutical Products

Usage:
    python clean_medicines.py --input raw_medicines.csv --output cleaned_medicines.csv

"""

import argparse
import re
import sys
import pandas as pd
from pathlib import Path

# ── Column name aliases for various Kaggle datasets ───────────────
COLUMN_ALIASES = {
    "drug_name":    ["name", "drug_name", "medicine_name", "product_name", "drug", "brand_name", "title"],
    "manufacturer": ["manufacturer", "manufacturer_name", "company", "mfr", "brand"],
    "composition":  ["composition", "salt_composition", "ingredients", "active_ingredient", "generic_name"],
    "pack_size":    ["pack_size", "packaging", "pack", "unit", "size", "quantity"],
    "mrp":          ["mrp", "price", "max_price", "selling_price", "market_price", "cost"],
    "category":     ["drug_type", "category", "type", "schedule", "class"],
}


def detect_column(df_columns: list[str], aliases: list[str]) -> str | None:
    """Find the first column that matches any alias (case-insensitive)."""
    col_lower = {c.lower().strip(): c for c in df_columns}
    for alias in aliases:
        if alias in col_lower:
            return col_lower[alias]
    return None


def clean_price(value) -> float:
    """Extract numeric price from strings like '₹15.50', '15,000', etc."""
    if pd.isna(value):
        return 0.0
    s = str(value).strip()
    s = re.sub(r"[₹$,\s]", "", s)   # Remove currency symbols and commas
    s = re.sub(r"[^\d.]", "", s)    # Keep only digits and decimal point
    try:
        return round(float(s), 2)
    except ValueError:
        return 0.0


def clean_text(value, default: str = "") -> str:
    """Strip and title-case a text field."""
    if pd.isna(value):
        return default
    cleaned = str(value).strip()
    # Remove excessive whitespace
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned


def infer_category(row) -> str:
    """Infer medicine category from existing data."""
    drug = str(row.get("drug_name", "")).upper()
    cat = str(row.get("category", "")).lower()
    if "schedule h" in cat or "sch h" in cat or "h1" in cat:
        return "Schedule H"
    if "schedule x" in cat or "narcotic" in cat:
        return "Schedule X"
    if "otc" in cat or "over the counter" in cat:
        return "OTC"
    return "Regular"


def clean_medicines_csv(input_path: str, output_path: str) -> None:
    print(f"\n🔄  Loading: {input_path}")

    # ── Load ──────────────────────────────────────────────────────
    path = Path(input_path)
    if not path.exists():
        print(f"❌  File not found: {input_path}")
        sys.exit(1)

    suffix = path.suffix.lower()
    if suffix == ".csv":
        df = pd.read_csv(input_path, encoding="utf-8", on_bad_lines="skip", low_memory=False)
    elif suffix in (".xlsx", ".xls"):
        df = pd.read_excel(input_path)
    else:
        print(f"❌  Unsupported file type: {suffix}")
        sys.exit(1)

    print(f"✅  Loaded {len(df):,} rows × {len(df.columns)} columns")
    print(f"📋  Columns found: {list(df.columns)[:10]}")

    # ── Normalise column names ─────────────────────────────────────
    df.columns = [c.lower().strip().replace(" ", "_").replace("-", "_") for c in df.columns]

    # Build mapping: canonical name → actual column in CSV
    col_map: dict[str, str] = {}
    for canonical, aliases in COLUMN_ALIASES.items():
        found = detect_column(list(df.columns), [a.lower() for a in aliases])
        if found:
            col_map[canonical] = found

    print(f"🗺️   Column map: {col_map}")

    # ── Build clean dataframe ─────────────────────────────────────
    clean = pd.DataFrame()

    # drug_name is mandatory
    if "drug_name" not in col_map:
        print("❌  Cannot find medicine name column. Tried: name, drug_name, medicine_name, product_name, brand_name")
        sys.exit(1)

    clean["drug_name"]    = df[col_map["drug_name"]].apply(lambda v: clean_text(v))
    clean["manufacturer"] = df[col_map["manufacturer"]].apply(lambda v: clean_text(v)) if "manufacturer" in col_map else ""
    clean["composition"]  = df[col_map["composition"]].apply(lambda v: clean_text(v))  if "composition"  in col_map else ""
    clean["pack_size"]    = df[col_map["pack_size"]].apply(lambda v: clean_text(v))    if "pack_size"    in col_map else ""
    clean["mrp"]          = df[col_map["mrp"]].apply(clean_price)                      if "mrp"          in col_map else 0.0
    clean["category"]     = "Regular"

    if "category" in col_map:
        temp = df[[col_map["category"]]].copy()
        temp.columns = ["category"]
        clean["drug_name_temp"] = clean["drug_name"]
        clean["category_raw"]   = temp["category"]
        clean["category"] = clean[["drug_name_temp", "category_raw"]].apply(
            lambda r: infer_category({"drug_name": r["drug_name_temp"], "category": r["category_raw"]}),
            axis=1
        )
        clean.drop(columns=["drug_name_temp", "category_raw"], inplace=True)

    # ── Quality filters ────────────────────────────────────────────
    before = len(clean)

    # Remove empty drug names
    clean = clean[clean["drug_name"].str.len() > 2]

    # Remove items with suspiciously low MRP (likely data errors)
    # Allow 0 (price unknown) but not negative
    clean = clean[clean["mrp"] >= 0]

    # Remove duplicates (keep first occurrence)
    clean = clean.drop_duplicates(subset=["drug_name"], keep="first")

    # Reset index
    clean = clean.reset_index(drop=True)

    after = len(clean)
    print(f"\n📊  Cleaned: {before:,} → {after:,} records ({before - after:,} removed)")
    print(f"    MRP zero (unknown): {(clean['mrp'] == 0).sum():,}")
    print(f"    Schedule H:        {(clean['category'] == 'Schedule H').sum():,}")

    # ── Save ───────────────────────────────────────────────────────
    clean.to_csv(output_path, index=False, encoding="utf-8")
    print(f"\n✅  Saved to: {output_path}")
    print(f"   Sample rows:")
    print(clean[["drug_name", "manufacturer", "mrp"]].head(5).to_string(index=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean Indian medicines dataset CSV")
    parser.add_argument("--input",  "-i", required=True,  help="Path to raw Kaggle CSV/Excel")
    parser.add_argument("--output", "-o", default="cleaned_medicines.csv", help="Output CSV path")
    args = parser.parse_args()
    clean_medicines_csv(args.input, args.output)
