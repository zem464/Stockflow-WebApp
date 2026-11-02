import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Package, Wallet, CalendarDays, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MonthlyHistory from '@/components/dashboard/MonthlyHistory';

const peso = (n) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [itemList, recs] = await Promise.all([
        base44.entities.InventoryItem.list(),
        base44.entities.SalesRecord.list('-date'),
      ]);
      itemList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setItems(itemList);
      setRecords(recs);
      setLoading(false);
    })();
  }, []);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
  const inMonth = (d) => d && d >= monthStart && d <= monthEnd;

  const todayRecs = records.filter((r) => (r.date ? r.date.slice(0, 10) : '') === today);
  const monthRecs = records.filter((r) => inMonth(r.date ? r.date.slice(0, 10) : ''));
  const todayPcs = todayRecs.reduce((s, r) => s + (r.quantity_sold || 0), 0);
  const todayProfit = todayRecs.reduce((s, r) => s + (r.amount || 0), 0);
  const monthPcs = monthRecs.reduce((s, r) => s + (r.quantity_sold || 0), 0);
  const monthProfit = monthRecs.reduce((s, r) => s + (r.amount || 0), 0);

  const stats = [
    { label: "Today's pieces", value: loading ? '—' : todayPcs, icon: Package },
    { label: "Today's profit", value: loading ? '—' : peso(todayProfit), icon: Wallet },
    { label: 'Month pieces', value: loading ? '—' : monthPcs, icon: CalendarDays },
    { label: 'Month profit', value: loading ? '—' : peso(monthProfit), icon: Coins },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your ihawan sales.</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/inventory"><Package className="w-4 h-4" /> Manage inventory</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="font-heading text-2xl font-semibold">{value}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="font-heading font-semibold mb-4">Today's Inventory</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
          ) : todayRecs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No sales recorded today.</p>
          ) : (
            <div className="space-y-2">
              {todayRecs.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.item_name}</span>
                  <span className="text-muted-foreground">{r.quantity_sold} pcs · {peso(r.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">{todayPcs} pcs · {peso(todayProfit)}</span>
              </div>
            </div>
          )}
        </Card>

        <MonthlyHistory items={items} />
      </div>
    </div>
  );
}