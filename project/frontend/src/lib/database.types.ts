export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      medicines: {
        Row: {
          id: string
          drug_name: string
          manufacturer: string
          batch_no: string
          expiry_date: string
          mrp: number
          current_stock: number
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          drug_name: string
          manufacturer: string
          batch_no: string
          expiry_date: string
          mrp: number
          current_stock?: number
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          drug_name?: string
          manufacturer?: string
          batch_no?: string
          expiry_date?: string
          mrp?: number
          current_stock?: number
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      medicine_catalog: {
        Row: {
          id: string
          drug_name: string
          manufacturer: string
          composition: string
          pack_size: string
          mrp: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          drug_name: string
          manufacturer?: string
          composition?: string
          pack_size?: string
          mrp?: number
          category?: string
          created_at?: string
        }
        Update: {
          id?: string
          drug_name?: string
          manufacturer?: string
          composition?: string
          pack_size?: string
          mrp?: number
          category?: string
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string
          phone?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          created_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string
          phone?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          created_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          serial_no: number
          bill_date: string
          customer_id: string | null
          customer_name: string
          customer_address: string
          customer_phone: string
          doctor_id: string | null
          doctor_name: string
          doctor_address: string
          doctor_phone: string
          subtotal: number
          tax_amount: number
          grand_total: number
          created_at: string
        }
        Insert: {
          id?: string
          serial_no?: number
          bill_date?: string
          customer_id?: string | null
          customer_name: string
          customer_address?: string
          customer_phone?: string
          doctor_id?: string | null
          doctor_name?: string
          doctor_address?: string
          doctor_phone?: string
          subtotal?: number
          tax_amount?: number
          grand_total?: number
          created_at?: string
        }
        Update: {
          id?: string
          serial_no?: number
          bill_date?: string
          customer_id?: string | null
          customer_name?: string
          customer_address?: string
          customer_phone?: string
          doctor_id?: string | null
          doctor_name?: string
          doctor_address?: string
          doctor_phone?: string
          subtotal?: number
          tax_amount?: number
          grand_total?: number
          created_at?: string
        }
      }
      bill_items: {
        Row: {
          id: string
          bill_id: string
          medicine_id: string | null
          drug_name: string
          manufacturer: string
          batch_no: string
          expiry_date: string
          quantity: number
          mrp: number
          row_total: number
          created_at: string
        }
        Insert: {
          id?: string
          bill_id: string
          medicine_id?: string | null
          drug_name: string
          manufacturer: string
          batch_no: string
          expiry_date: string
          quantity: number
          mrp: number
          row_total: number
          created_at?: string
        }
        Update: {
          id?: string
          bill_id?: string
          medicine_id?: string | null
          drug_name?: string
          manufacturer?: string
          batch_no?: string
          expiry_date?: string
          quantity?: number
          mrp?: number
          row_total?: number
          created_at?: string
        }
      }
    }
  }
}

export type Medicine = Database['public']['Tables']['medicines']['Row'];
export type MedicineCatalog = Database['public']['Tables']['medicine_catalog']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Doctor = Database['public']['Tables']['doctors']['Row'];
export type Bill = Database['public']['Tables']['bills']['Row'];
export type BillItem = Database['public']['Tables']['bill_items']['Row'];
