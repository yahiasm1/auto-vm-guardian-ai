
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'instructor' | 'student' | 'guest';
          department: string;
          status: 'active' | 'inactive' | 'suspended' | 'pending';
          last_active: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'admin' | 'instructor' | 'student' | 'guest';
          department: string;
          status?: 'active' | 'inactive' | 'suspended' | 'pending';
          last_active?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'instructor' | 'student' | 'guest';
          department?: string;
          status?: 'active' | 'inactive' | 'suspended' | 'pending';
          last_active?: string;
          created_at?: string;
        };
      };
      virtual_machines: {
        Row: {
          id: string;
          name: string;
          os: string;
          status: 'running' | 'stopped' | 'suspended' | 'creating' | 'error';
          cpu: number;
          ram: number;
          storage: number;
          ip: string | null;
          course: string | null;
          user_id: string;
          created_at: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          name: string;
          os: string;
          status?: 'running' | 'stopped' | 'suspended' | 'creating' | 'error';
          cpu: number;
          ram: number;
          storage: number;
          ip?: string | null;
          course?: string | null;
          user_id: string;
          created_at?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          name?: string;
          os?: string;
          status?: 'running' | 'stopped' | 'suspended' | 'creating' | 'error';
          cpu?: number;
          ram?: number;
          storage?: number;
          ip?: string | null;
          course?: string | null;
          user_id?: string;
          created_at?: string;
          last_updated?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          user_id: string;
          cpu_usage: number;
          ram_usage: number;
          storage_usage: number;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cpu_usage: number;
          ram_usage: number;
          storage_usage: number;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cpu_usage?: number;
          ram_usage?: number;
          storage_usage?: number;
          timestamp?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          title: string;
          description: string;
          course: string;
          due_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          course: string;
          due_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          course?: string;
          due_date?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
