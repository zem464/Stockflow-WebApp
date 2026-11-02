import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

const peso = (n) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function SalesLog({ items }) {
  const [records, setRecords] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [recs, stats] = await Promise.all([
        base44.entities.SalesRecord.list('-date'),
        base44.entities.DayStatus.list(),
      ]);
      setRecords(recs);
      setStatuses(stats);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading…</div>;

  const byDate = {};
  records.forEach((r) => {
    const d = r.date ? r.date.slice(0, 10) : '';
    (byDate[d] = byDate[d] || {})[r.item_name] = { qty: r.quantity_sold || 0, amount: r.amount || 0 };
  });
  const noTinda = new Set(statuses.filter((s) => s.no_tinda).map((s) => (s.date ? s.date.slice(0, 10) : '')));
  const dates = Array.from(new Set([...Object.keys(byDate), ...noTinda])).sort((a, b) => (a < b ? 1 : -1));

  if (dates.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Receipt className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">No sales recorded yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-sky-100 text-sky-900">
              <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Date</th>
              {items.map((it) => (
                <th key={it.id} className="px-2 py-2 text-center font-semibold whitespace-nowrap min-w-[68px]">{it.name}</th>
              ))}
              <th className="px-3 py-2 text-right font-semibold whitespace-nowrap bg-amber-200/70">Total (pcs)</th>
              <th className="px-3 py-2 text-right font-semibold whitespace-nowrap bg-amber-200/70">Total (Profit)</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((d, idx) => {
              const day = byDate[d] || {};
              const noRecords = Object.keys(day).length === 0;
              const rowBg = idx % 2 ? 'bg-orange-50' : 'bg-white';
              if (noRecords) {
                return (
                  <tr key={d} className={rowBg}>
                    <td className="px-3 py-2 font-medium whitespace-nowrap">{fmtDate(d)}</td>
                    <td colSpan={items.length + 2} className="px-3 py-3 text-center text-muted-foreground italic bg-sky-50">
                      No Tinda
                    </td>
                  </tr>
                );
              }
              const totalPcs = items.reduce((s, it) => s + (day[it.name]?.qty || 0), 0);
              const totalProfit = items.reduce((s, it) => s + (day[it.name]?.amount || 0), 0);
              return (
                <tr key={d} className={rowBg}>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{fmtDate(d)}</td>
                  {items.map((it) => {
                    const cell = day[it.name];
                    return (
                      <td key={it.id} className="px-2 py-2 text-center whitespace-nowrap">
                        <div className="font-medium">{cell?.qty ?? 0}</div>
                        <div className="text-xs text-muted-foreground">{peso(cell?.amount ?? 0)}</div>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right font-semibold whitespace-nowrap bg-amber-50">{totalPcs}</td>
                  <td className="px-3 py-2 text-right font-semibold whitespace-nowrap bg-amber-50">{peso(totalProfit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}