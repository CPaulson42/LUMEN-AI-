import { createClient } from '@/utils/supabase/client';

export interface Campaign {
  id: string;
  name: string;
  lead_source: string;
  daily_volume: number;
  agent: string;
  goal: string;
  concurrency: number;
  status: 'Running' | 'Paused';
  created_at: string;
  progress: number;
  leads: number;
}

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
  return data || [];
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
  return data;
}

export async function saveCampaign(campaign: Campaign): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase
    .from('campaigns')
    .upsert({
      id: campaign.id,
      user_id: user.id,
      name: campaign.name,
      lead_source: campaign.lead_source,
      daily_volume: campaign.daily_volume,
      agent: campaign.agent,
      goal: campaign.goal,
      concurrency: campaign.concurrency,
      status: campaign.status,
      created_at: campaign.created_at,
      progress: campaign.progress,
      leads: campaign.leads
    });

  if (error) {
    console.error('Error saving campaign:', error);
    return false;
  }
  return true;
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting campaign:', error);
    return false;
  }
  return true;
}
