import { LEAD_STATUSES } from '../types/lead';

export interface PipelineSummaryProps {
  counts: Record<string, number>;
}

const statusLabels: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  APPLICATION: 'Application',
  WON: 'Won',
  LOST: 'Lost',
};

export function PipelineSummary({ counts }: PipelineSummaryProps) {
  const totalLeads = counts.total || 0;

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
      <div className="border border-[#d5d8ce] bg-white p-4">
        <p className="text-xs text-[#687269]">Total Leads</p>
        <p className="text-2xl font-bold">{totalLeads}</p>
      </div>
      {LEAD_STATUSES.map((status) => (
        <div key={status} className="border border-[#d5d8ce] bg-white p-4">
          <p className="text-xs text-[#687269]">{statusLabels[status]}</p>
          <p className="text-2xl font-bold">{counts[status] || 0}</p>
        </div>
      ))}
    </div>
  );
}
