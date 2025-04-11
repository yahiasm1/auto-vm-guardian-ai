
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type Resource = Database['public']['Tables']['resources']['Row'];
export type ResourceInsert = Database['public']['Tables']['resources']['Insert'];
export type ResourceUpdate = Database['public']['Tables']['resources']['Update'];

export const resourceService = {
  getResourcesByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getResourceTimeline: async (userId: string, hours: number = 24) => {
    // Get resources for the last X hours
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);
    
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  recordResourceUsage: async (resource: ResourceInsert) => {
    // Ensure timestamp is present
    const resourceWithTimestamp = {
      ...resource,
      timestamp: resource.timestamp || new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('resources')
      .insert(resourceWithTimestamp)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getAggregatedResources: async (userId: string) => {
    // Get the latest resource usage
    const { data: latestData, error: latestError } = await supabase
      .from('resources')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (latestError) throw latestError;
    
    // Get the max values over the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { data: maxData, error: maxError } = await supabase
      .rpc('get_max_resources', { 
        p_user_id: userId,
        p_start_time: oneDayAgo.toISOString()
      });
    
    if (maxError) throw maxError;
    
    // Get the average values over the last 24 hours
    const { data: avgData, error: avgError } = await supabase
      .rpc('get_avg_resources', { 
        p_user_id: userId,
        p_start_time: oneDayAgo.toISOString()
      });
    
    if (avgError) throw avgError;
    
    return {
      current: latestData[0],
      max: maxData[0],
      average: avgData[0]
    };
  }
};
