import LeadForm from '@/components/LeadForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewLeadPage() {
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/leads" className="text-gray-500 hover:text-gray-700 text-sm"><ArrowLeft className="w-4 h-4 inline" /> Leads</Link>
        <h1 className="text-2xl font-bold">New lead</h1>
      </div>
      <div className="bg-white rounded-lg border p-6">
        <LeadForm />
      </div>
    </div>
  );
}
