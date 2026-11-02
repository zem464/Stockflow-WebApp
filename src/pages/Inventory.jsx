import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DailyEntry from '@/components/tinda/DailyEntry';
import SalesLog from '@/components/tinda/SalesLog';
import InventoryForm from '@/components/inventory/InventoryForm';

const peso = (n) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [itemList, catList] = await Promise.all([
      base44.entities.InventoryItem.list('-updated_date'),
      base44.entities.Category.list(),
    ]);
    itemList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    setItems(itemList);
    setCategories(catList);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (item) => { setEditing(item); setDialogOpen(true); };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editing) await base44.entities.InventoryItem.update(editing.id, data);
      else await base44.entities.InventoryItem.create(data);
      setDialogOpen(false);
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await base44.entities.InventoryItem.delete(id);
    await load();
  };

  const filtered = items.filter((i) => (i.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">{items.length} items · daily sales, log, and catalog.</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : (
        <Tabs defaultValue="entry">
          <TabsList>
            <TabsTrigger value="entry">Daily Entry</TabsTrigger>
            <TabsTrigger value="log">Sales Log</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
          </TabsList>

          <TabsContent value="entry" className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-48" />
            </div>
            <DailyEntry key={date} items={items} date={date} onSaved={() => setRefreshKey((k) => k + 1)} />
          </TabsContent>

          <TabsContent value="log" className="mt-4">
            <SalesLog key={refreshKey} items={items} />
          </TabsContent>

          <TabsContent value="items" className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items…" className="pl-9" />
              </div>
              <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Add item</Button>
            </div>
            {filtered.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No items found.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
                      <tr>
                        <th className="text-left font-medium px-4 py-3">Item</th>
                        <th className="text-right font-medium px-4 py-3">Price</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-right">{peso(item.menu_price)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit item' : 'Add item'}</DialogTitle>
          </DialogHeader>
          <InventoryForm item={editing} categories={categories} onSubmit={handleSave} onCancel={() => setDialogOpen(false)} saving={saving} />
        </DialogContent>
      </Dialog>
    </div>
  );
}