import { type Lead, type LeadStatus, LEAD_STATUSES } from '../types/lead';
import { Button } from './ui/Button';

interface LeadCardProps {
  lead: Lead;
  onConvert: (lead: Lead) => void;
  onAssignment: (leadId: string, advisorId: string) => void;
  onStatusChange: (lead: Lead, status: LeadStatus) => void;
  advisors: any[];
  userRole: string | undefined;
}

export function LeadCard({ lead, onConvert, onAssignment, onStatusChange, advisors, userRole }: LeadCardProps) {
  return (
    <article className="border border-border bg-card p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h4 className="break-words text-sm font-semibold text-foreground">{lead.firstName} {lead.lastName}</h4>
      <p className="mt-1 break-all text-xs text-muted-foreground">{lead.email}</p>
      <p className="text-xs text-muted-foreground">{lead.phone}</p>
      <p className="mt-2 font-mono text-[10px] uppercase text-primary font-bold">{lead.source}</p>
      
      {lead.convertedCaseId ? (
        <span className="mt-2 inline-block text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Converted</span>
      ) : (
        (userRole === 'BROKERAGE_ADMIN' || userRole === 'ADVISOR') && (
          <Button variant="outline" className="mt-3 w-full text-xs" onClick={() => onConvert(lead)}>
            Convert to client
          </Button>
        )
      )}
      
      <div className="mt-4 space-y-3">
        <label className="block text-[11px] text-muted-foreground">
          Advisor
          <select value={lead.assignedAdvisorId ?? ''} onChange={(e) => onAssignment(lead.id, e.target.value)} className="w-full mt-1 bg-background border border-border p-1.5 rounded text-xs text-foreground">
            <option value="">Unassigned</option>
            {advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.name}</option>)}
          </select>
        </label>
        
        <label className="block text-[11px] text-muted-foreground">
          Status
          <select value={lead.status} onChange={(e) => onStatusChange(lead, e.target.value as LeadStatus)} className="w-full mt-1 bg-background border border-border p-1.5 rounded text-xs text-foreground">
            {LEAD_STATUSES.map((option: LeadStatus) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>
    </article>
  );
}


