import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, Moon } from 'lucide-react';

const peso = (n) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function DailyEntry({ items, date, onSaved, onAdvanceDate }) {
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setEntries({});
      const records = await base44.entities.SalesRecord.filter({ date });
      const map = {};
      records.forEach((r) => { map[r.item_name] = r.quantity_sold || 0; });
      setEntries(map);
      setLoading(false);
    })();
  }, [date]);

  const setQty = (name, qty) => setEntries((e) => ({ ...e, [name]: qty }));

  const totalPcs = items.reduce((s, it) => s + (Number(entries[it.name]) || 0), 0);
  const totalProfit = items.reduce((s, it) => s + (Number(entries[it.name]) || 0) * (it.menu_price || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.SalesRecord.deleteMany({ date });
      await base44.entities.DayStatus.deleteMany({ date });
      const toCreate = items
        .filter((it) => Number(entries[it.name]) > 0)
        .map((it) => ({
          date,
          item_name: it.name,
          quantity_sold: Number(entries[it.name]),
          amount: Number(entries[it.name]) * (it.menu_price || 0),
        }));
      if (toCreate.length) await base44.entities.SalesRecord.bulkCreate(toCreate);
      setEntries({});
      onSaved?.();
      onAdvanceDate?.();
    } finally {
      setSaving(false);
    }
  };

  const handleNoTinda = async () => {
    setSaving(true);
    try {
      await base44.entities.SalesRecord.deleteMany({ date });
      await base44.entities.DayStatus.deleteMany({ date });
      await base44.entities.DayStatus.create({ date, no_tinda: true });
      setEntries({});
      onSaved?.();
      onAdvanceDate?.();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="hidden sm:grid grid-cols-12 gap-2 px-2 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-3 text-right">Qty sold</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        <div className="space-y-2 sm:space-y-1">
          {items.map((it) => {
            const qty = Number(entries[it.name]) || 0;
            const amt = qty * (it.menu_price || 0);
            return (
              <div key={it.id} className="grid grid-cols-2 gap-2 items-center rounded-xl border border-border p-3 sm:grid-cols-12 sm:gap-2 sm:rounded-lg sm:border-0 sm:p-2 sm:px-2 hover:bg-muted/40">
                <div className="col-span-2 min-w-0 flex items-baseline justify-between gap-2 sm:col-span-5 sm:block">
                  <span className="font-medium truncate">{it.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0 sm:hidden">{peso(it.menu_price)}</span>
                </div>
                <div className="hidden sm:block sm:col-span-2 text-right text-sm text-muted-foreground">{peso(it.menu_price)}</div>
                <div className="flex flex-col gap-1 sm:col-span-3 sm:items-end">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground sm:hidden">Qty sold</span>
                  <Input
                    type="number"
                    min="0"
                    value={entries[it.name] ?? ''}
                    onChange={(e) => setQty(it.name, e.target.value)}
                    className="h-11 w-full text-right text-base sm:h-9 sm:w-24 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="text-right font-medium sm:col-span-2">{peso(amt)}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total pieces</div>
            <div className="font-heading text-xl font-semibold">{totalPcs}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total profit</div>
            <div className="font-heading text-xl font-semibold">{peso(totalProfit)}</div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
        <Button variant="outline" onClick={handleNoTinda} disabled={saving} className="gap-2 w-full sm:w-auto">
          <Moon className="w-4 h-4" /> No Tinda
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save day'}
        </Button>
      </div>
    </div>
  );
}