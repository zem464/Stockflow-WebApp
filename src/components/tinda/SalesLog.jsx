import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Pencil, Trash2, Download, ArrowDown } from 'lucide-react';

const peso = (n) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const monthLabel = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

export default function SalesLog({ items, onEditDate }) {
  const [records, setRecords] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('date');

  const load = async () => {
    const [recs, stats] = await Promise.all([
      base44.entities.SalesRecord.list('-date'),
      base44.entities.DayStatus.list(),
    ]);
    setRecords(recs);
    setStatuses(stats);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading…</div>;

  const byDate = {};
  records.forEach((r) => {
    const d = r.date ? r.date.slice(0, 10) : '';
    if (!d) return;
    const day = byDate[d] || (byDate[d] = { date: d, cells: {}, pcs: 0, profit: 0, noTinda: false });
    day.cells[r.item_name] = { qty: r.quantity_sold || 0, amount: r.amount || 0 };
    day.pcs += r.quantity_sold || 0;
    day.profit += r.amount || 0;
  });
  statuses.forEach((s) => {
    if (!s.no_tinda) return;
    const d = s.date ? s.date.slice(0, 10) : '';
    if (!d) return;
    const day = byDate[d] || (byDate[d] = { date: d, cells: {}, pcs: 0, profit: 0, noTinda: true });
    day.noTinda = day.pcs === 0;
  });

  const days = Object.values(byDate);

  if (days.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Receipt className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">No sales recorded yet.</p>
      </Card>
    );
  }

  const months = {};
  days.forEach((d) => {
    const key = d.date.slice(0, 7);
    (months[key] = months[key] || []).push(d);
  });
  const monthKeys = Object.keys(months).sort();

  const sortDays = (list) => [...list].sort((a, b) => {
    if (sort === 'pcs') return b.pcs - a.pcs || a.date.localeCompare(b.date);
    if (sort === 'profit') return b.profit - a.profit || a.date.localeCompare(b.date);
    return a.date.localeCompare(b.date);
  });

  const handleDelete = async (day) => {
    if (!window.confirm(`Delete all sales for ${fmtDate(day.date)}?`)) return;
    await base44.entities.SalesRecord.deleteMany({ date: day.date });
    await base44.entities.DayStatus.deleteMany({ date: day.date });
    await load();
  };

  const exportCsv = () => {
    const header = ['Date', ...items.map((i) => i.name), 'Total pcs', 'Total profit'];
    const rows = [];
    monthKeys.forEach((key) => {
      sortDays(months[key]).forEach((d) => {
        rows.push([
          d.date,
          ...items.map((i) => d.cells[i.name]?.qty ?? 0),
          d.pcs,
          Number(d.profit || 0).toFixed(2),
        ]);
      });
    });
    const csv = [header, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortButton = ({ field, children }) => (
    <button type="button" onClick={() => setSort(field)} className="inline-flex items-center gap-1">
      {children}
      {sort === field && <ArrowDown className="w-3 h-3" />}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={exportCsv}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {monthKeys.map((key) => {
        const monthDays = sortDays(months[key]);
        const monthPcs = monthDays.reduce((s, d) => s + d.pcs, 0);
        const monthProfit = monthDays.reduce((s, d) => s + d.profit, 0);
        return (
          <Card key={key} className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-muted/60 border-b border-border">
              <h3 className="font-heading font-semibold">{monthLabel(key)}</h3>
              <span className="text-xs sm:text-sm text-muted-foreground">{monthPcs} pcs · {peso(monthProfit)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary text-secondary-foreground">
                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap">
                      <SortButton field="date">Date</SortButton>
                    </th>
                    {items.map((it) => (
                      <th key={it.id} className="px-2 py-2 text-center font-semibold whitespace-nowrap min-w-[68px]">{it.name}</th>
                    ))}
                    <th className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                      <SortButton field="pcs">Total (pcs)</SortButton>
                    </th>
                    <th className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                      <SortButton field="profit">Total (Profit)</SortButton>
                    </th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {monthDays.map((d, idx) => (
                    <tr key={d.date} className={idx % 2 ? 'bg-muted/40' : 'bg-card'}>
                      <td className="px-3 py-2 font-medium whitespace-nowrap">
                        {fmtDate(d.date)}
                        {d.noTinda && <span className="ml-2 text-xs italic text-muted-foreground">No Tinda</span>}
                      </td>
                      {items.map((it) => {
                        const cell = d.cells[it.name];
                        return (
                          <td key={it.id} className="px-2 py-2 text-center whitespace-nowrap">
                            {d.noTinda ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <>
                                <div className="font-medium">{cell?.qty ?? 0}</div>
                                <div className="text-xs text-muted-foreground">{peso(cell?.amount ?? 0)}</div>
                              </>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right font-semibold whitespace-nowrap bg-accent/10">{d.noTinda ? '—' : d.pcs}</td>
                      <td className="px-3 py-2 text-right font-semibold whitespace-nowrap bg-accent/10">{d.noTinda ? '—' : peso(d.profit)}</td>
                      <td className="px-2 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Edit this day" onClick={() => onEditDate?.(d.date)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete this day" onClick={() => handleDelete(d)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}