import { createClient } from '@/lib/supabase/server';
import BusinessProfileForm from '@/components/BusinessProfileForm';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .maybeSingle();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Business profile</h1>
      <p className="text-sm text-gray-500 mb-6">
        This info appears on your quotes and PDFs.
      </p>
      <div className="bg-white rounded-lg border p-6">
        <BusinessProfileForm profile={profile ?? null} />
      </div>
    </div>
  );
}
