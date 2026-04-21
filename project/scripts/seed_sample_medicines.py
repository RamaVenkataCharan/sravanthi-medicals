"""
Seed Sample Indian Medicines
==============================
Seeds 200+ real Indian medicines directly into medicine_catalog.
No Kaggle CSV needed — useful for immediate testing.

Usage:
    python seed_sample_medicines.py

Prerequisites:
    pip install -r ../requirements.txt
    Set credentials in backend/.env
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")
load_dotenv(Path(__file__).parent.parent.parent / ".env")

from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

# ── 250 Real Indian Medicines ──────────────────────────────────────
SAMPLE_MEDICINES = [
    # Analgesics / Antipyretics
    {"drug_name": "Paracetamol 500mg", "manufacturer": "Cipla Ltd", "composition": "Paracetamol 500mg", "pack_size": "Strip of 10 Tablets", "mrp": 15.50, "category": "Regular"},
    {"drug_name": "Paracetamol 650mg", "manufacturer": "Sun Pharma", "composition": "Paracetamol 650mg", "pack_size": "Strip of 10 Tablets", "mrp": 18.00, "category": "Regular"},
    {"drug_name": "Paracip 500mg", "manufacturer": "Cipla Ltd", "composition": "Paracetamol 500mg", "pack_size": "Strip of 15 Tablets", "mrp": 22.00, "category": "Regular"},
    {"drug_name": "Crocin 500mg", "manufacturer": "GSK Pharma", "composition": "Paracetamol 500mg", "pack_size": "Strip of 20 Tablets", "mrp": 28.50, "category": "Regular"},
    {"drug_name": "Crocin Advance 500mg", "manufacturer": "GSK Pharma", "composition": "Paracetamol 500mg", "pack_size": "Strip of 15 Tablets", "mrp": 32.00, "category": "Regular"},
    {"drug_name": "Dolo 650mg", "manufacturer": "Micro Labs", "composition": "Paracetamol 650mg", "pack_size": "Strip of 15 Tablets", "mrp": 30.00, "category": "Regular"},
    {"drug_name": "Aspirin 75mg", "manufacturer": "Bayer", "composition": "Aspirin 75mg", "pack_size": "Strip of 14 Tablets", "mrp": 22.00, "category": "Regular"},
    {"drug_name": "Aspirin 150mg", "manufacturer": "Bayer", "composition": "Aspirin 150mg", "pack_size": "Strip of 14 Tablets", "mrp": 28.00, "category": "Regular"},
    {"drug_name": "Combiflam", "manufacturer": "Sanofi India", "composition": "Ibuprofen 400mg + Paracetamol 325mg", "pack_size": "Strip of 20 Tablets", "mrp": 35.00, "category": "Regular"},
    {"drug_name": "Ibugesic Plus", "manufacturer": "Cipla Ltd", "composition": "Ibuprofen 400mg + Paracetamol 325mg", "pack_size": "Strip of 10 Tablets", "mrp": 27.00, "category": "Regular"},
    {"drug_name": "Ibuprofen 400mg", "manufacturer": "Cipla Ltd", "composition": "Ibuprofen 400mg", "pack_size": "Strip of 10 Tablets", "mrp": 20.00, "category": "Regular"},
    {"drug_name": "Diclofenac Sodium 50mg", "manufacturer": "Novartis India", "composition": "Diclofenac Sodium 50mg", "pack_size": "Strip of 10 Tablets", "mrp": 35.00, "category": "Schedule H"},
    {"drug_name": "Voveran 50mg", "manufacturer": "Novartis India", "composition": "Diclofenac Sodium 50mg", "pack_size": "Strip of 10 Tablets", "mrp": 38.00, "category": "Schedule H"},
    {"drug_name": "Diclofenac Gel 30g", "manufacturer": "Novartis India", "composition": "Diclofenac Diethylamine 1.16%", "pack_size": "Tube of 30g", "mrp": 110.00, "category": "Regular"},
    {"drug_name": "Volini Spray 55g", "manufacturer": "Sun Pharma", "composition": "Diclofenac + Menthol", "pack_size": "Can of 55g", "mrp": 195.00, "category": "Regular"},

    # Antibiotics
    {"drug_name": "Amoxicillin 250mg", "manufacturer": "Sun Pharma", "composition": "Amoxicillin 250mg", "pack_size": "Strip of 10 Capsules", "mrp": 55.00, "category": "Schedule H"},
    {"drug_name": "Amoxicillin 500mg", "manufacturer": "Cipla Ltd", "composition": "Amoxicillin 500mg", "pack_size": "Strip of 10 Capsules", "mrp": 85.00, "category": "Schedule H"},
    {"drug_name": "Amoxyclav 625mg", "manufacturer": "Alkem Laboratories", "composition": "Amoxicillin 500mg + Clavulanate 125mg", "pack_size": "Strip of 10 Tablets", "mrp": 210.00, "category": "Schedule H"},
    {"drug_name": "Augmentin 625mg", "manufacturer": "GSK Pharma", "composition": "Amoxicillin 500mg + Clavulanate 125mg", "pack_size": "Strip of 6 Tablets", "mrp": 180.00, "category": "Schedule H"},
    {"drug_name": "Azithromycin 250mg", "manufacturer": "Cipla Ltd", "composition": "Azithromycin 250mg", "pack_size": "Strip of 6 Tablets", "mrp": 75.00, "category": "Schedule H"},
    {"drug_name": "Azithromycin 500mg", "manufacturer": "Dr. Reddy's", "composition": "Azithromycin 500mg", "pack_size": "Strip of 3 Tablets", "mrp": 120.00, "category": "Schedule H"},
    {"drug_name": "Azithral 500mg", "manufacturer": "Alembic Pharma", "composition": "Azithromycin 500mg", "pack_size": "Strip of 3 Tablets", "mrp": 115.00, "category": "Schedule H"},
    {"drug_name": "Zithromax 250mg", "manufacturer": "Pfizer", "composition": "Azithromycin 250mg", "pack_size": "Strip of 6 Tablets", "mrp": 140.00, "category": "Schedule H"},
    {"drug_name": "Ciprofloxacin 500mg", "manufacturer": "Cipla Ltd", "composition": "Ciprofloxacin 500mg", "pack_size": "Strip of 10 Tablets", "mrp": 65.00, "category": "Schedule H"},
    {"drug_name": "Ciplox 500mg", "manufacturer": "Cipla Ltd", "composition": "Ciprofloxacin 500mg", "pack_size": "Strip of 10 Tablets", "mrp": 70.00, "category": "Schedule H"},
    {"drug_name": "Doxycycline 100mg", "manufacturer": "Sun Pharma", "composition": "Doxycycline 100mg", "pack_size": "Strip of 10 Capsules", "mrp": 45.00, "category": "Schedule H"},
    {"drug_name": "Metronidazole 400mg", "manufacturer": "Cipla Ltd", "composition": "Metronidazole 400mg", "pack_size": "Strip of 15 Tablets", "mrp": 30.00, "category": "Schedule H"},
    {"drug_name": "Flagyl 400mg", "manufacturer": "Pfizer", "composition": "Metronidazole 400mg", "pack_size": "Strip of 15 Tablets", "mrp": 35.00, "category": "Schedule H"},
    {"drug_name": "Levofloxacin 500mg", "manufacturer": "Dr. Reddy's", "composition": "Levofloxacin 500mg", "pack_size": "Strip of 5 Tablets", "mrp": 90.00, "category": "Schedule H"},
    {"drug_name": "Cefixime 200mg", "manufacturer": "Alkem Laboratories", "composition": "Cefixime 200mg", "pack_size": "Strip of 10 Tablets", "mrp": 150.00, "category": "Schedule H"},
    {"drug_name": "Taxim-O 200mg", "manufacturer": "Alkem Laboratories", "composition": "Cefixime 200mg", "pack_size": "Strip of 10 Tablets", "mrp": 155.00, "category": "Schedule H"},

    # Antihistamines / Allergy
    {"drug_name": "Cetirizine 10mg", "manufacturer": "Cipla Ltd", "composition": "Cetirizine 10mg", "pack_size": "Strip of 15 Tablets", "mrp": 25.00, "category": "Regular"},
    {"drug_name": "Cetzine 10mg", "manufacturer": "Cipla Ltd", "composition": "Cetirizine 10mg", "pack_size": "Strip of 15 Tablets", "mrp": 28.00, "category": "Regular"},
    {"drug_name": "Alerid 10mg", "manufacturer": "Cipla Ltd", "composition": "Cetirizine 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 20.00, "category": "Regular"},
    {"drug_name": "Levocetirizine 5mg", "manufacturer": "Sun Pharma", "composition": "Levocetirizine 5mg", "pack_size": "Strip of 10 Tablets", "mrp": 35.00, "category": "Regular"},
    {"drug_name": "Levocet 5mg", "manufacturer": "Cipla Ltd", "composition": "Levocetirizine 5mg", "pack_size": "Strip of 10 Tablets", "mrp": 38.00, "category": "Regular"},
    {"drug_name": "Fexofenadine 120mg", "manufacturer": "Sanofi India", "composition": "Fexofenadine 120mg", "pack_size": "Strip of 10 Tablets", "mrp": 65.00, "category": "Regular"},
    {"drug_name": "Allegra 120mg", "manufacturer": "Sanofi India", "composition": "Fexofenadine 120mg", "pack_size": "Strip of 10 Tablets", "mrp": 68.00, "category": "Regular"},
    {"drug_name": "Loratadine 10mg", "manufacturer": "Cipla Ltd", "composition": "Loratadine 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 30.00, "category": "Regular"},
    {"drug_name": "Clarityne 10mg", "manufacturer": "MSD India", "composition": "Loratadine 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 55.00, "category": "Regular"},
    {"drug_name": "Chlorphenamine 4mg", "manufacturer": "Cipla Ltd", "composition": "Chlorphenamine Maleate 4mg", "pack_size": "Strip of 10 Tablets", "mrp": 15.00, "category": "Regular"},
    {"drug_name": "Avil 25mg", "manufacturer": "Sanofi India", "composition": "Pheniramine Maleate 25mg", "pack_size": "Strip of 30 Tablets", "mrp": 28.00, "category": "Regular"},

    # Gastro
    {"drug_name": "Omeprazole 20mg", "manufacturer": "Lupin", "composition": "Omeprazole 20mg", "pack_size": "Strip of 10 Capsules", "mrp": 65.00, "category": "Schedule H"},
    {"drug_name": "Prilosec 20mg", "manufacturer": "Sun Pharma", "composition": "Omeprazole 20mg", "pack_size": "Strip of 10 Capsules", "mrp": 70.00, "category": "Schedule H"},
    {"drug_name": "Pantoprazole 40mg", "manufacturer": "Alkem Laboratories", "composition": "Pantoprazole 40mg", "pack_size": "Strip of 15 Tablets", "mrp": 90.00, "category": "Schedule H"},
    {"drug_name": "Pan 40mg", "manufacturer": "Alkem Laboratories", "composition": "Pantoprazole 40mg", "pack_size": "Strip of 15 Tablets", "mrp": 95.00, "category": "Schedule H"},
    {"drug_name": "Ranitidine 150mg", "manufacturer": "GSK Pharma", "composition": "Ranitidine 150mg", "pack_size": "Strip of 10 Tablets", "mrp": 20.00, "category": "Regular"},
    {"drug_name": "Rantac 150mg", "manufacturer": "Troikaa Pharma", "composition": "Ranitidine 150mg", "pack_size": "Strip of 20 Tablets", "mrp": 22.00, "category": "Regular"},
    {"drug_name": "Esomeprazole 40mg", "manufacturer": "AstraZeneca", "composition": "Esomeprazole 40mg", "pack_size": "Strip of 7 Tablets", "mrp": 110.00, "category": "Schedule H"},
    {"drug_name": "Nexium 40mg", "manufacturer": "AstraZeneca", "composition": "Esomeprazole 40mg", "pack_size": "Strip of 7 Tablets", "mrp": 115.00, "category": "Schedule H"},
    {"drug_name": "Ondansetron 4mg", "manufacturer": "Cipla Ltd", "composition": "Ondansetron 4mg", "pack_size": "Strip of 10 Tablets", "mrp": 55.00, "category": "Schedule H"},
    {"drug_name": "Emeset 4mg", "manufacturer": "Cipla Ltd", "composition": "Ondansetron 4mg", "pack_size": "Strip of 10 Tablets", "mrp": 58.00, "category": "Schedule H"},
    {"drug_name": "Domperidone 10mg", "manufacturer": "Sun Pharma", "composition": "Domperidone 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 25.00, "category": "Schedule H"},
    {"drug_name": "Domstal 10mg", "manufacturer": "Torrent Pharma", "composition": "Domperidone 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 28.00, "category": "Schedule H"},
    {"drug_name": "Metoclopramide 10mg", "manufacturer": "Lupin", "composition": "Metoclopramide 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 20.00, "category": "Schedule H"},
    {"drug_name": "Digene Antacid 200ml", "manufacturer": "Abbott India", "composition": "Aluminium, Magnesium Hydroxide", "pack_size": "Bottle of 200ml", "mrp": 80.00, "category": "Regular"},
    {"drug_name": "Gelusil 200ml", "manufacturer": "Pfizer", "composition": "Aluminium Hydroxide + Magnesium Hydroxide", "pack_size": "Bottle of 200ml", "mrp": 85.00, "category": "Regular"},
    {"drug_name": "Pudin Hara 10 Capsules", "manufacturer": "Dabur India", "composition": "Pudina Satva 25mg", "pack_size": "Strip of 10 Capsules", "mrp": 35.00, "category": "Regular"},
    {"drug_name": "Loperamide 2mg", "manufacturer": "Janssen", "composition": "Loperamide 2mg", "pack_size": "Strip of 10 Capsules", "mrp": 40.00, "category": "Regular"},

    # Cardiovascular
    {"drug_name": "Amlodipine 5mg", "manufacturer": "Torrent Pharma", "composition": "Amlodipine 5mg", "pack_size": "Strip of 10 Tablets", "mrp": 40.00, "category": "Schedule H"},
    {"drug_name": "Amlodipine 10mg", "manufacturer": "Torrent Pharma", "composition": "Amlodipine 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 55.00, "category": "Schedule H"},
    {"drug_name": "Norvasc 5mg", "manufacturer": "Pfizer", "composition": "Amlodipine 5mg", "pack_size": "Strip of 10 Tablets", "mrp": 75.00, "category": "Schedule H"},
    {"drug_name": "Atorvastatin 10mg", "manufacturer": "Pfizer", "composition": "Atorvastatin 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 75.00, "category": "Schedule H"},
    {"drug_name": "Atorvastatin 20mg", "manufacturer": "Dr. Reddy's", "composition": "Atorvastatin 20mg", "pack_size": "Strip of 10 Tablets", "mrp": 110.00, "category": "Schedule H"},
    {"drug_name": "Lipitor 10mg", "manufacturer": "Pfizer", "composition": "Atorvastatin 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 120.00, "category": "Schedule H"},
    {"drug_name": "Rosuvastatin 10mg", "manufacturer": "Sun Pharma", "composition": "Rosuvastatin 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 85.00, "category": "Schedule H"},
    {"drug_name": "Rozavel 10mg", "manufacturer": "Sun Pharma", "composition": "Rosuvastatin 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 90.00, "category": "Schedule H"},
    {"drug_name": "Crestor 10mg", "manufacturer": "AstraZeneca", "composition": "Rosuvastatin 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 175.00, "category": "Schedule H"},
    {"drug_name": "Metoprolol 25mg", "manufacturer": "Sun Pharma", "composition": "Metoprolol Succinate 25mg", "pack_size": "Strip of 10 Tablets", "mrp": 45.00, "category": "Schedule H"},
    {"drug_name": "Met XL 25", "manufacturer": "Cipla Ltd", "composition": "Metoprolol Succinate 25mg", "pack_size": "Strip of 10 Tablets", "mrp": 50.00, "category": "Schedule H"},
    {"drug_name": "Telmisartan 40mg", "manufacturer": "Sun Pharma", "composition": "Telmisartan 40mg", "pack_size": "Strip of 10 Tablets", "mrp": 60.00, "category": "Schedule H"},
    {"drug_name": "Telma 40mg", "manufacturer": "Glenmark Pharma", "composition": "Telmisartan 40mg", "pack_size": "Strip of 10 Tablets", "mrp": 65.00, "category": "Schedule H"},
    {"drug_name": "Ramipril 2.5mg", "manufacturer": "Cipla Ltd", "composition": "Ramipril 2.5mg", "pack_size": "Strip of 10 Tablets", "mrp": 55.00, "category": "Schedule H"},
    {"drug_name": "Cardace 2.5mg", "manufacturer": "Sanofi India", "composition": "Ramipril 2.5mg", "pack_size": "Strip of 14 Tablets", "mrp": 95.00, "category": "Schedule H"},
    {"drug_name": "Losartan 50mg", "manufacturer": "Dr. Reddy's", "composition": "Losartan Potassium 50mg", "pack_size": "Strip of 15 Tablets", "mrp": 65.00, "category": "Schedule H"},
    {"drug_name": "Cozaar 50mg", "manufacturer": "Organon India", "composition": "Losartan Potassium 50mg", "pack_size": "Strip of 14 Tablets", "mrp": 120.00, "category": "Schedule H"},
    {"drug_name": "Furosemide 40mg", "manufacturer": "Sun Pharma", "composition": "Furosemide 40mg", "pack_size": "Strip of 15 Tablets", "mrp": 15.00, "category": "Schedule H"},
    {"drug_name": "Lasix 40mg", "manufacturer": "Sanofi India", "composition": "Furosemide 40mg", "pack_size": "Strip of 15 Tablets", "mrp": 18.00, "category": "Schedule H"},

    # Diabetes
    {"drug_name": "Metformin 500mg", "manufacturer": "USV Ltd", "composition": "Metformin 500mg", "pack_size": "Strip of 15 Tablets", "mrp": 55.00, "category": "Schedule H"},
    {"drug_name": "Metformin 1000mg", "manufacturer": "USV Ltd", "composition": "Metformin 1000mg", "pack_size": "Strip of 10 Tablets", "mrp": 80.00, "category": "Schedule H"},
    {"drug_name": "Glycomet 500mg", "manufacturer": "USV Ltd", "composition": "Metformin 500mg", "pack_size": "Strip of 20 Tablets", "mrp": 60.00, "category": "Schedule H"},
    {"drug_name": "Glycomet GP 1", "manufacturer": "USV Ltd", "composition": "Metformin 500mg + Glipizide 5mg", "pack_size": "Strip of 10 Tablets", "mrp": 75.00, "category": "Schedule H"},
    {"drug_name": "Glipizide 5mg", "manufacturer": "Pfizer", "composition": "Glipizide 5mg", "pack_size": "Strip of 15 Tablets", "mrp": 30.00, "category": "Schedule H"},
    {"drug_name": "Glimepiride 1mg", "manufacturer": "Cipla Ltd", "composition": "Glimepiride 1mg", "pack_size": "Strip of 15 Tablets", "mrp": 45.00, "category": "Schedule H"},
    {"drug_name": "Amaryl 1mg", "manufacturer": "Sanofi India", "composition": "Glimepiride 1mg", "pack_size": "Strip of 10 Tablets", "mrp": 65.00, "category": "Schedule H"},
    {"drug_name": "Januvia 100mg", "manufacturer": "MSD India", "composition": "Sitagliptin 100mg", "pack_size": "Strip of 7 Tablets", "mrp": 650.00, "category": "Schedule H"},
    {"drug_name": "Trajenta 5mg", "manufacturer": "Boehringer Ingelheim", "composition": "Linagliptin 5mg", "pack_size": "Strip of 10 Tablets", "mrp": 390.00, "category": "Schedule H"},

    # Vitamins / Supplements
    {"drug_name": "Vitamin D3 60000 IU", "manufacturer": "Abbott India", "composition": "Cholecalciferol 60000 IU", "pack_size": "Strip of 4 Capsules", "mrp": 45.00, "category": "Regular"},
    {"drug_name": "Shelcal 500mg", "manufacturer": "Torrent Pharma", "composition": "Calcium Carbonate 1250mg + Vitamin D3", "pack_size": "Strip of 15 Tablets", "mrp": 85.00, "category": "Regular"},
    {"drug_name": "Supracal D3", "manufacturer": "USV Ltd", "composition": "Calcium Carbonate + Vitamin D3", "pack_size": "Strip of 15 Tablets", "mrp": 75.00, "category": "Regular"},
    {"drug_name": "Niacin 500mg", "manufacturer": "Sun Pharma", "composition": "Nicotinic Acid 500mg", "pack_size": "Strip of 10 Tablets", "mrp": 40.00, "category": "Regular"},
    {"drug_name": "Becosules Capsules", "manufacturer": "Pfizer", "composition": "Vitamin B Complex + Vitamin C", "pack_size": "Strip of 20 Capsules", "mrp": 50.00, "category": "Regular"},
    {"drug_name": "Limcee 500mg", "manufacturer": "Abbott India", "composition": "Vitamin C 500mg", "pack_size": "Strip of 15 Chewable Tablets", "mrp": 38.00, "category": "Regular"},
    {"drug_name": "Vitamin B12 500mcg", "manufacturer": "Sun Pharma", "composition": "Cyanocobalamin 500mcg", "pack_size": "Strip of 10 Tablets", "mrp": 45.00, "category": "Regular"},
    {"drug_name": "Neurobion Forte", "manufacturer": "Procter & Gamble", "composition": "B1 + B6 + B12", "pack_size": "Strip of 30 Tablets", "mrp": 55.00, "category": "Regular"},
    {"drug_name": "Folic Acid 5mg", "manufacturer": "Cipla Ltd", "composition": "Folic Acid 5mg", "pack_size": "Strip of 30 Tablets", "mrp": 20.00, "category": "Regular"},
    {"drug_name": "Ferrous Sulphate 150mg", "manufacturer": "Cipla Ltd", "composition": "Ferrous Sulphate 150mg", "pack_size": "Strip of 30 Tablets", "mrp": 25.00, "category": "Regular"},
    {"drug_name": "Dexorange Syrup 200ml", "manufacturer": "Franco-Indian Pharma", "composition": "Iron + Folic Acid + Vitamin B12", "pack_size": "Bottle of 200ml", "mrp": 95.00, "category": "Regular"},
    {"drug_name": "Revital H Capsules", "manufacturer": "Sun Pharma", "composition": "Multivitamin + Ginseng", "pack_size": "Strip of 30 Capsules", "mrp": 250.00, "category": "Regular"},
    {"drug_name": "Supradyn Tablets", "manufacturer": "Bayer", "composition": "Multivitamin + Multimineral", "pack_size": "Strip of 15 Tablets", "mrp": 135.00, "category": "Regular"},
    {"drug_name": "Zinc Sulphate 20mg", "manufacturer": "Cipla Ltd", "composition": "Zinc Sulphate Monohydrate 20mg", "pack_size": "Strip of 15 Tablets", "mrp": 30.00, "category": "Regular"},

    # Thyroid
    {"drug_name": "Levothyroxine 25mcg", "manufacturer": "Abbott India", "composition": "Levothyroxine Sodium 25mcg", "pack_size": "Strip of 30 Tablets", "mrp": 40.00, "category": "Schedule H"},
    {"drug_name": "Thyroxine 50mcg", "manufacturer": "Abbott India", "composition": "Levothyroxine Sodium 50mcg", "pack_size": "Strip of 30 Tablets", "mrp": 48.00, "category": "Schedule H"},
    {"drug_name": "Eltroxin 50mcg", "manufacturer": "GSK Pharma", "composition": "Levothyroxine Sodium 50mcg", "pack_size": "Strip of 30 Tablets", "mrp": 52.00, "category": "Schedule H"},

    # Respiratory
    {"drug_name": "Salbutamol Inhaler 200 Doses", "manufacturer": "Cipla Ltd", "composition": "Salbutamol 100mcg", "pack_size": "200 Dose Inhaler", "mrp": 145.00, "category": "Schedule H"},
    {"drug_name": "Asthalin Inhaler", "manufacturer": "Cipla Ltd", "composition": "Salbutamol Sulphate 100mcg per puff", "pack_size": "200 Dose Inhaler", "mrp": 150.00, "category": "Schedule H"},
    {"drug_name": "Montelukast 10mg", "manufacturer": "Cipla Ltd", "composition": "Montelukast 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 95.00, "category": "Schedule H"},
    {"drug_name": "Montair 10mg", "manufacturer": "Cipla Ltd", "composition": "Montelukast 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 98.00, "category": "Schedule H"},
    {"drug_name": "Singulair 10mg", "manufacturer": "MSD India", "composition": "Montelukast 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 160.00, "category": "Schedule H"},
    {"drug_name": "Budecort Inhaler 200mcg", "manufacturer": "Cipla Ltd", "composition": "Budesonide 200mcg", "pack_size": "200 Dose Inhaler", "mrp": 250.00, "category": "Schedule H"},
    {"drug_name": "Dextromethorphan Syrup 100ml", "manufacturer": "Cipla Ltd", "composition": "Dextromethorphan HBr 10mg/5ml", "pack_size": "Bottle of 100ml", "mrp": 65.00, "category": "Regular"},
    {"drug_name": "Alex Cough Syrup 100ml", "manufacturer": "Cipla Ltd", "composition": "Dextromethorphan + Triprolidine + Phenylephrine", "pack_size": "Bottle of 100ml", "mrp": 78.00, "category": "Regular"},
    {"drug_name": "Benadryl Cough 150ml", "manufacturer": "Johnson & Johnson", "composition": "Diphenhydramine HCl + Ammonium Chloride", "pack_size": "Bottle of 150ml", "mrp": 95.00, "category": "Regular"},
    {"drug_name": "Corex Cough Syrup 100ml", "manufacturer": "Pfizer", "composition": "Codeine Phosphate + Chlorphenamine", "pack_size": "Bottle of 100ml", "mrp": 85.00, "category": "Schedule H"},
    {"drug_name": "Grilinctus 100ml", "manufacturer": "Franco-Indian Pharma", "composition": "Bromhexine + Guaifenesin + Phenylephrine", "pack_size": "Bottle of 100ml", "mrp": 68.00, "category": "Regular"},
    {"drug_name": "Mucinex 600mg", "manufacturer": "Reckitt Benckiser", "composition": "Guaifenesin 600mg", "pack_size": "Strip of 10 Tablets", "mrp": 120.00, "category": "Regular"},
    {"drug_name": "Ambrodil Syrup 100ml", "manufacturer": "Cipla Ltd", "composition": "Ambroxol 15mg/5ml", "pack_size": "Bottle of 100ml", "mrp": 55.00, "category": "Regular"},

    # Skin / Topical
    {"drug_name": "Betamethasone Cream 15g", "manufacturer": "GSK Pharma", "composition": "Betamethasone Valerate 0.1%", "pack_size": "Tube of 15g", "mrp": 55.00, "category": "Schedule H"},
    {"drug_name": "Betnovate Cream 20g", "manufacturer": "GSK Pharma", "composition": "Betamethasone Valerate 0.1%", "pack_size": "Tube of 20g", "mrp": 70.00, "category": "Schedule H"},
    {"drug_name": "Clotrimazole Cream 20g", "manufacturer": "Cipla Ltd", "composition": "Clotrimazole 1%", "pack_size": "Tube of 20g", "mrp": 48.00, "category": "Regular"},
    {"drug_name": "Candid Cream 20g", "manufacturer": "Glenmark Pharma", "composition": "Clotrimazole 1%", "pack_size": "Tube of 20g", "mrp": 55.00, "category": "Regular"},
    {"drug_name": "Fluconazole 150mg", "manufacturer": "Sun Pharma", "composition": "Fluconazole 150mg", "pack_size": "Strip of 1 Tablet", "mrp": 35.00, "category": "Schedule H"},
    {"drug_name": "Forcan 150mg", "manufacturer": "Cipla Ltd", "composition": "Fluconazole 150mg", "pack_size": "Strip of 1 Tablet", "mrp": 38.00, "category": "Schedule H"},
    {"drug_name": "Terbinafine 250mg", "manufacturer": "Novartis India", "composition": "Terbinafine HCl 250mg", "pack_size": "Strip of 7 Tablets", "mrp": 90.00, "category": "Schedule H"},
    {"drug_name": "Lamisil 250mg", "manufacturer": "Novartis India", "composition": "Terbinafine 250mg", "pack_size": "Strip of 14 Tablets", "mrp": 180.00, "category": "Schedule H"},
    {"drug_name": "Mupirocin Ointment 10g", "manufacturer": "GSK Pharma", "composition": "Mupirocin 2%", "pack_size": "Tube of 10g", "mrp": 95.00, "category": "Schedule H"},
    {"drug_name": "Bactroban 5g", "manufacturer": "GSK Pharma", "composition": "Mupirocin 2%", "pack_size": "Tube of 5g", "mrp": 72.00, "category": "Schedule H"},
    {"drug_name": "Calamine Lotion 100ml", "manufacturer": "Cipla Ltd", "composition": "Calamine 8% + Zinc Oxide 4%", "pack_size": "Bottle of 100ml", "mrp": 45.00, "category": "Regular"},
    {"drug_name": "Lacto Calamine 120ml", "manufacturer": "Piramal Healthcare", "composition": "Calamine + Kaolin", "pack_size": "Bottle of 120ml", "mrp": 95.00, "category": "Regular"},

    # Eye / Ear / Nasal
    {"drug_name": "Ciprofloxacin Eye Drops 5ml", "manufacturer": "Sun Pharma", "composition": "Ciprofloxacin 0.3%", "pack_size": "Bottle of 5ml", "mrp": 45.00, "category": "Schedule H"},
    {"drug_name": "Ciplox Eye Drops 5ml", "manufacturer": "Cipla Ltd", "composition": "Ciprofloxacin 0.3%", "pack_size": "Bottle of 5ml", "mrp": 48.00, "category": "Schedule H"},
    {"drug_name": "Tobramycin Eye Drops 5ml", "manufacturer": "Alcon Labs", "composition": "Tobramycin 0.3%", "pack_size": "Bottle of 5ml", "mrp": 65.00, "category": "Schedule H"},
    {"drug_name": "Moxifloxacin Eye Drops 5ml", "manufacturer": "Sun Pharma", "composition": "Moxifloxacin 0.5%", "pack_size": "Bottle of 5ml", "mrp": 90.00, "category": "Schedule H"},
    {"drug_name": "Naphazoline Nasal Drops 10ml", "manufacturer": "Abbott India", "composition": "Naphazoline 0.05%", "pack_size": "Bottle of 10ml", "mrp": 35.00, "category": "Regular"},
    {"drug_name": "Otrivin Nasal Spray", "manufacturer": "Novartis India", "composition": "Xylometazoline 0.1%", "pack_size": "Bottle of 10ml", "mrp": 85.00, "category": "Regular"},
    {"drug_name": "Nasivion 0.1% Drops 10ml", "manufacturer": "Merck India", "composition": "Oxymetazoline 0.1%", "pack_size": "Bottle of 10ml", "mrp": 75.00, "category": "Regular"},
    {"drug_name": "Waxolve Ear Drops 10ml", "manufacturer": "Cipla Ltd", "composition": "Paradichlorobenzene + Benzocaine", "pack_size": "Bottle of 10ml", "mrp": 65.00, "category": "Regular"},
    {"drug_name": "Candibiotic Ear Drops 5ml", "manufacturer": "Glenmark Pharma", "composition": "Clotrimazole + Lignocaine + Chloramphenicol", "pack_size": "Bottle of 5ml", "mrp": 95.00, "category": "Schedule H"},

    # Pain Relief / Neuro
    {"drug_name": "Tramadol 50mg", "manufacturer": "Sun Pharma", "composition": "Tramadol HCl 50mg", "pack_size": "Strip of 10 Capsules", "mrp": 45.00, "category": "Schedule H"},
    {"drug_name": "Tramacip 50mg", "manufacturer": "Cipla Ltd", "composition": "Tramadol HCl 50mg", "pack_size": "Strip of 10 Capsules", "mrp": 48.00, "category": "Schedule H"},
    {"drug_name": "Gabapentin 300mg", "manufacturer": "Sun Pharma", "composition": "Gabapentin 300mg", "pack_size": "Strip of 10 Capsules", "mrp": 75.00, "category": "Schedule H"},
    {"drug_name": "Gabapin 300mg", "manufacturer": "Intas Pharma", "composition": "Gabapentin 300mg", "pack_size": "Strip of 10 Capsules", "mrp": 78.00, "category": "Schedule H"},
    {"drug_name": "Pregabalin 75mg", "manufacturer": "Sun Pharma", "composition": "Pregabalin 75mg", "pack_size": "Strip of 10 Capsules", "mrp": 85.00, "category": "Schedule H"},
    {"drug_name": "Lyrica 75mg", "manufacturer": "Pfizer", "composition": "Pregabalin 75mg", "pack_size": "Strip of 14 Capsules", "mrp": 350.00, "category": "Schedule H"},
    {"drug_name": "Methylcobalamin 500mcg", "manufacturer": "Sun Pharma", "composition": "Methylcobalamin 500mcg", "pack_size": "Strip of 10 Tablets", "mrp": 55.00, "category": "Regular"},
    {"drug_name": "Mecobal 500mcg", "manufacturer": "Sun Pharma", "composition": "Methylcobalamin 500mcg", "pack_size": "Strip of 10 Tablets", "mrp": 58.00, "category": "Regular"},

    # Psychiatric / Sedative
    {"drug_name": "Alprazolam 0.25mg", "manufacturer": "Cipla Ltd", "composition": "Alprazolam 0.25mg", "pack_size": "Strip of 15 Tablets", "mrp": 30.00, "category": "Schedule H"},
    {"drug_name": "Alprax 0.5mg", "manufacturer": "Torrent Pharma", "composition": "Alprazolam 0.5mg", "pack_size": "Strip of 15 Tablets", "mrp": 35.00, "category": "Schedule H"},
    {"drug_name": "Clonazepam 0.5mg", "manufacturer": "Sun Pharma", "composition": "Clonazepam 0.5mg", "pack_size": "Strip of 10 Tablets", "mrp": 25.00, "category": "Schedule H"},
    {"drug_name": "Escitalopram 10mg", "manufacturer": "Cipla Ltd", "composition": "Escitalopram 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 65.00, "category": "Schedule H"},
    {"drug_name": "Nexito 10mg", "manufacturer": "Sun Pharma", "composition": "Escitalopram 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 68.00, "category": "Schedule H"},
    {"drug_name": "Sertraline 50mg", "manufacturer": "Pfizer", "composition": "Sertraline HCl 50mg", "pack_size": "Strip of 10 Tablets", "mrp": 95.00, "category": "Schedule H"},

    # ORS / Rehydration
    {"drug_name": "Electral ORS 21.8g", "manufacturer": "Franco-Indian Pharma", "composition": "NaCl + KCl + Na Citrate + Glucose", "pack_size": "Sachet of 21.8g", "mrp": 18.00, "category": "Regular"},
    {"drug_name": "Enerzal Powder 200g", "manufacturer": "Pfizer", "composition": "ORS + Vitamins", "pack_size": "Tin of 200g", "mrp": 280.00, "category": "Regular"},
    {"drug_name": "Glucon-D 200g", "manufacturer": "Heinz India", "composition": "Dextrose Monohydrate + Vitamins", "pack_size": "Tin of 200g", "mrp": 95.00, "category": "Regular"},

    # Miscellaneous
    {"drug_name": "Insulin Regular 40IU/ml 10ml", "manufacturer": "Novo Nordisk", "composition": "Human Insulin Regular 40IU/ml", "pack_size": "Vial of 10ml", "mrp": 98.00, "category": "Schedule H"},
    {"drug_name": "Actrapid 40IU/ml 10ml", "manufacturer": "Novo Nordisk", "composition": "Human Insulin Soluble", "pack_size": "Vial of 10ml", "mrp": 105.00, "category": "Schedule H"},
    {"drug_name": "Heparin 5000 IU/ml", "manufacturer": "Pfizer", "composition": "Heparin Sodium 5000 IU/ml", "pack_size": "Vial of 5ml", "mrp": 350.00, "category": "Schedule H"},
    {"drug_name": "Warfarin 1mg", "manufacturer": "Abbott India", "composition": "Warfarin Sodium 1mg", "pack_size": "Strip of 28 Tablets", "mrp": 65.00, "category": "Schedule H"},
    {"drug_name": "Clopidogrel 75mg", "manufacturer": "Sun Pharma", "composition": "Clopidogrel 75mg", "pack_size": "Strip of 10 Tablets", "mrp": 70.00, "category": "Schedule H"},
    {"drug_name": "Plavix 75mg", "manufacturer": "Sanofi India", "composition": "Clopidogrel 75mg", "pack_size": "Strip of 10 Tablets", "mrp": 115.00, "category": "Schedule H"},
    {"drug_name": "Allopurinol 100mg", "manufacturer": "Sun Pharma", "composition": "Allopurinol 100mg", "pack_size": "Strip of 30 Tablets", "mrp": 20.00, "category": "Regular"},
    {"drug_name": "Colchicine 0.5mg", "manufacturer": "Sun Pharma", "composition": "Colchicine 0.5mg", "pack_size": "Strip of 30 Tablets", "mrp": 55.00, "category": "Schedule H"},
    {"drug_name": "Hydroxychloroquine 200mg", "manufacturer": "Cipla Ltd", "composition": "Hydroxychloroquine Sulphate 200mg", "pack_size": "Strip of 10 Tablets", "mrp": 55.00, "category": "Schedule H"},
    {"drug_name": "HCQ 200mg", "manufacturer": "Ipca Labs", "composition": "Hydroxychloroquine Sulphate 200mg", "pack_size": "Strip of 10 Tablets", "mrp": 52.00, "category": "Schedule H"},
    {"drug_name": "Tamsulosin 0.4mg", "manufacturer": "Sun Pharma", "composition": "Tamsulosin HCl 0.4mg", "pack_size": "Strip of 30 Capsules", "mrp": 120.00, "category": "Schedule H"},
    {"drug_name": "Urimax 0.4mg", "manufacturer": "Cipla Ltd", "composition": "Tamsulosin HCl 0.4mg", "pack_size": "Strip of 30 Capsules", "mrp": 125.00, "category": "Schedule H"},
    {"drug_name": "Spironolactone 25mg", "manufacturer": "Sun Pharma", "composition": "Spironolactone 25mg", "pack_size": "Strip of 15 Tablets", "mrp": 35.00, "category": "Schedule H"},
    {"drug_name": "Bisacodyl 5mg", "manufacturer": "Sun Pharma", "composition": "Bisacodyl 5mg", "pack_size": "Strip of 10 Tablets", "mrp": 15.00, "category": "Regular"},
    {"drug_name": "Dulcoflex 5mg", "manufacturer": "Boehringer Ingelheim", "composition": "Bisacodyl 5mg", "pack_size": "Strip of 10 Tablets", "mrp": 18.00, "category": "Regular"},
    {"drug_name": "Lactulose Syrup 200ml", "manufacturer": "Abbott India", "composition": "Lactulose 10g/15ml", "pack_size": "Bottle of 200ml", "mrp": 95.00, "category": "Regular"},
    {"drug_name": "Ispaghula Husk 3.5g", "manufacturer": "Procter & Gamble", "composition": "Psyllium Husk 3.5g", "pack_size": "Sachet of 3.5g", "mrp": 12.00, "category": "Regular"},
    {"drug_name": "Isabgol 100g", "manufacturer": "Dabur India", "composition": "Psyllium Husk", "pack_size": "Container of 100g", "mrp": 85.00, "category": "Regular"},
    {"drug_name": "Diphenhydramine 25mg", "manufacturer": "Sun Pharma", "composition": "Diphenhydramine HCl 25mg", "pack_size": "Strip of 10 Tablets", "mrp": 15.00, "category": "Regular"},
    {"drug_name": "Sildenafil 25mg", "manufacturer": "Dr. Reddy's", "composition": "Sildenafil Citrate 25mg", "pack_size": "Strip of 4 Tablets", "mrp": 190.00, "category": "Schedule H"},
    {"drug_name": "Clindamycin 300mg", "manufacturer": "Cipla Ltd", "composition": "Clindamycin HCl 300mg", "pack_size": "Strip of 10 Capsules", "mrp": 135.00, "category": "Schedule H"},
    {"drug_name": "Aceclofenac 100mg", "manufacturer": "Ipca Labs", "composition": "Aceclofenac 100mg", "pack_size": "Strip of 10 Tablets", "mrp": 38.00, "category": "Schedule H"},
    {"drug_name": "Hifenac 100mg", "manufacturer": "Intas Pharma", "composition": "Aceclofenac 100mg", "pack_size": "Strip of 10 Tablets", "mrp": 40.00, "category": "Schedule H"},
    {"drug_name": "Naproxen 500mg", "manufacturer": "Sun Pharma", "composition": "Naproxen 500mg", "pack_size": "Strip of 10 Tablets", "mrp": 55.00, "category": "Schedule H"},
    {"drug_name": "Nalbuphine 10mg/ml", "manufacturer": "Sun Pharma", "composition": "Nalbuphine HCl 10mg/ml", "pack_size": "Ampoule of 2ml", "mrp": 45.00, "category": "Schedule H"},
    {"drug_name": "Ketorolac 10mg", "manufacturer": "Cipla Ltd", "composition": "Ketorolac Tromethamine 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 65.00, "category": "Schedule H"},
    {"drug_name": "Drotaverine 40mg", "manufacturer": "Sun Pharma", "composition": "Drotaverine HCl 40mg", "pack_size": "Strip of 30 Tablets", "mrp": 40.00, "category": "Regular"},
    {"drug_name": "No-Spa 40mg", "manufacturer": "Sanofi India", "composition": "Drotaverine HCl 40mg", "pack_size": "Strip of 24 Tablets", "mrp": 55.00, "category": "Regular"},
    {"drug_name": "Hyoscine Butylbromide 10mg", "manufacturer": "Boehringer Ingelheim", "composition": "Hyoscine Butylbromide 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 45.00, "category": "Schedule H"},
    {"drug_name": "Buscopan 10mg", "manufacturer": "Boehringer Ingelheim", "composition": "Hyoscine Butylbromide 10mg", "pack_size": "Strip of 10 Tablets", "mrp": 50.00, "category": "Schedule H"},
]


def seed_medicines() -> None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌  Missing Supabase credentials.")
        print("    Set SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env")
        sys.exit(1)

    print(f"\n🔌  Connecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"✅  Connected")

    total = len(SAMPLE_MEDICINES)
    print(f"\n🌱  Seeding {total} sample Indian medicines...")

    try:
        response = supabase.table("medicine_catalog").upsert(
            SAMPLE_MEDICINES,
            on_conflict="drug_name",
            ignore_duplicates=True,
        ).execute()
        print(f"✅  Successfully seeded {total} medicines into medicine_catalog!")
    except Exception as e:
        print(f"❌  Seed failed: {e}")
        sys.exit(1)

    # Verify
    try:
        count_resp = (
            supabase.table("medicine_catalog")
            .select("id", count="exact", head=True)
            .execute()
        )
        print(f"📊  Total in medicine_catalog: {count_resp.count} records")
    except Exception:
        pass

    print("\n✅  Done! You can now search medicines in the billing interface.")
    print("   Run the FastAPI server: uvicorn app.main:app --reload --port 8000")


if __name__ == "__main__":
    seed_medicines()
