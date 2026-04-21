import { supabase } from './supabase';

export async function seedDatabase() {
  try {
    const { data: existingMedicines } = await supabase
      .from('medicines')
      .select('id')
      .limit(1);

    if (existingMedicines && existingMedicines.length > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    const medicines = [
      {
        drug_name: 'Paracetamol 500mg',
        manufacturer: 'Cipla Ltd',
        batch_no: 'PC5001',
        expiry_date: '2025-12-31',
        mrp: 15.50,
        current_stock: 150,
        category: 'Regular',
      },
      {
        drug_name: 'Amoxicillin 250mg',
        manufacturer: 'Sun Pharma',
        batch_no: 'AM2501',
        expiry_date: '2025-06-30',
        mrp: 85.00,
        current_stock: 75,
        category: 'Schedule H',
      },
      {
        drug_name: 'Azithromycin 500mg',
        manufacturer: 'Dr. Reddy\'s',
        batch_no: 'AZ5001',
        expiry_date: '2025-09-15',
        mrp: 120.00,
        current_stock: 45,
        category: 'Schedule H',
      },
      {
        drug_name: 'Cetirizine 10mg',
        manufacturer: 'Cipla Ltd',
        batch_no: 'CT1001',
        expiry_date: '2026-03-20',
        mrp: 25.00,
        current_stock: 200,
        category: 'Regular',
      },
      {
        drug_name: 'Metformin 500mg',
        manufacturer: 'USV Ltd',
        batch_no: 'MF5001',
        expiry_date: '2025-11-10',
        mrp: 55.00,
        current_stock: 8,
        category: 'Schedule H',
      },
      {
        drug_name: 'Omeprazole 20mg',
        manufacturer: 'Lupin',
        batch_no: 'OM2001',
        expiry_date: '2025-08-25',
        mrp: 65.00,
        current_stock: 90,
        category: 'Schedule H',
      },
      {
        drug_name: 'Aspirin 75mg',
        manufacturer: 'Bayer',
        batch_no: 'AS7501',
        expiry_date: '2026-01-15',
        mrp: 30.00,
        current_stock: 120,
        category: 'Regular',
      },
      {
        drug_name: 'Vitamin D3 60K',
        manufacturer: 'Abbott',
        batch_no: 'VD6001',
        expiry_date: '2026-05-30',
        mrp: 45.00,
        current_stock: 60,
        category: 'Regular',
      },
      {
        drug_name: 'Amlodipine 5mg',
        manufacturer: 'Torrent Pharma',
        batch_no: 'AM5001',
        expiry_date: '2025-07-20',
        mrp: 40.00,
        current_stock: 5,
        category: 'Schedule H',
      },
      {
        drug_name: 'Cough Syrup',
        manufacturer: 'Dabur',
        batch_no: 'CS1001',
        expiry_date: '2024-12-31',
        mrp: 95.00,
        current_stock: 25,
        category: 'Regular',
      },
      {
        drug_name: 'Diclofenac Gel',
        manufacturer: 'Novartis',
        batch_no: 'DG3001',
        expiry_date: '2026-02-28',
        mrp: 110.00,
        current_stock: 40,
        category: 'Regular',
      },
      {
        drug_name: 'Atorvastatin 10mg',
        manufacturer: 'Pfizer',
        batch_no: 'AT1001',
        expiry_date: '2025-10-15',
        mrp: 75.00,
        current_stock: 65,
        category: 'Schedule H',
      },
    ];

    const { error: medicinesError } = await supabase
      .from('medicines')
      .insert(medicines);

    if (medicinesError) throw medicinesError;

    const doctors = [
      {
        name: 'Dr. Ramesh Kumar',
        address: 'Govt Hospital, Nuzvid',
        phone: '9876543210',
      },
      {
        name: 'Dr. Lakshmi Devi',
        address: 'Krishna Multi-Specialty, Vijayawada',
        phone: '9876543211',
      },
    ];

    const { error: doctorsError } = await supabase
      .from('doctors')
      .insert(doctors);

    if (doctorsError) throw doctorsError;

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}
