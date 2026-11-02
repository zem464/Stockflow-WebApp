import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Lock, Unlock, Pencil } from 'lucide-react';
import DailyEntry from '@/components/tinda/DailyEntry';

const peso = (n) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const EDIT_PASSWORD = 'ihawan2026';

export default function MonthlyHistory({ items }) {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [records, setRecords] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [editDay, setEditDay] = useState(null);

  const monthStart = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-01`;
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const monthEnd = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const load = async () => {
    setLoading(true);
    const [recs, stats] = await Promise.all([
      base44.entities.SalesRecord.list('-date'),
      base44.entities.DayStatus.list(),
    ]);
    setRecords(recs);
    setStatuses(stats);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const inMonth = (d) => d && d >= monthStart && d <= monthEnd;
  const monthRecs = records.filter((r) => inMonth(r.date ? r.date.slice(0, 10) : ''));
  const monthStats = statuses.filter((s) => inMonth(s.date ? s.date.slice(0, 10) : ''));

  const byDay = {};
  monthRecs.forEach((r) => {
    const d = r.date ? r.date.slice(0, 10) : '';
    byDay[d] = byDay[d] || { pcs: 0, profit: 0 };
    byDay[d].pcs += r.quantity_sold || 0;
    byDay[d].profit += r.amount || 0;
  });
  const noTindaSet = new Set(monthStats.filter((s) => s.no_tinda).map((s) => (s.date ? s.date.slice(0, 10) : '')));
  const days = Array.from(new Set([...Object.keys(byDay), ...noTindaSet])).sort();

  const monthPcs = days.reduce((s, d) => s + (byDay[d]?.pcs || 0), 0);
  const monthProfit = days.reduce((s, d) => s + (byDay[d]?.profit || 0), 0);

  const prevMonth = () => setCursor((c) => {
    let m = c.m - 1, y = c.y;
    if (m < 0) { m = 11; y--; }
    return { y, m };
  });
  const nextMonth = () => setCursor((c) => {
    let m = c.m + 1, y = c.y;
    if (m > 11) { m = 0; y++; }
    return { y, m };
  });

  const handleUnlock = () => {
    if (pwInput === EDIT_PASSWORD) {
      setUnlocked(true);
      setPwOpen(false);
      setPwInput('');
      setPwError('');
    } else {
      setPwError('Wrong password');
    }
  };

  const fmtDay = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-heading font-semibold">Monthly History</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm font-medium min-w-[120px] text-center">{monthLabel}</span>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
          {unlocked ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setUnlocked(false)}><Lock className="w-4 h-4" /> Lock</Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setPwOpen(true)}><Unlock className="w-4 h-4" /> Unlock</Button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
      ) : days.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No sales recorded this month.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-2 py-2">Day</th>
                <th className="text-right font-medium px-2 py-2">Total pcs</th>
                <th className="text-right font-medium px-2 py-2">Total profit</th>
                {unlocked && <th className="px-2 py-2"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {days.map((d) => {
                const noTinda = noTindaSet.has(d) && !byDay[d];
                return (
                  <tr key={d}>
                    <td className="px-2 py-2 font-medium">{fmtDay(d)}</td>
                    <td className="px-2 py-2 text-right">{noTinda ? <span className="italic text-muted-foreground">No Tinda</span> : (byDay[d]?.pcs || 0)}</td>
                    <td className="px-2 py-2 text-right">{noTinda ? '—' : peso(byDay[d]?.profit || 0)}</td>
                    {unlocked && (
                      <td className="px-2 py-2 text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditDay(d)}><Pencil className="w-4 h-4" /></Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <td className="px-2 py-2 font-semibold">Month total</td>
                <td className="px-2 py-2 text-right font-semibold">{monthPcs}</td>
                <td className="px-2 py-2 text-right font-semibold">{peso(monthProfit)}</td>
                {unlocked && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Unlock editing</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input type="password" value={pwInput} onChange={(e) => setPwInput(e.target.value)} placeholder="Enter password" onKeyDown={(e) => e.key === 'Enter' && handleUnlock()} />
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            <Button className="w-full" onClick={handleUnlock}>Unlock</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editDay} onOpenChange={(o) => !o && setEditDay(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Edit {editDay ? fmtDay(editDay) : ''}</DialogTitle></DialogHeader>
          {editDay && (
            <DailyEntry items={items} date={editDay} onSaved={() => { load(); setEditDay(null); }} />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}