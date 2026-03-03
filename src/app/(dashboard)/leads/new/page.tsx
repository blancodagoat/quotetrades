import LeadForm from '@/components/LeadForm';

export default function NewLeadPage() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/leads" className="text-gray-500 hover:text-gray-700 text-sm">← Leads</a>
        <h1 className="text-2xl font-bold">New lead</h1>
      </div>
      <div className="bg-white rounded-lg border p-6">
        <LeadForm />
      </div>
    </div>
  );
}
