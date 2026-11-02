import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export default function InventoryForm({ item, categories, onSubmit, onCancel, saving }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    name: '',
    date: today,
    quantity: '',
    cost_per_item: '',
    category: '',
    menu_price: '',
    available_on_menu: false,
    low_stock_threshold: 5,
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        date: item.date ? item.date.slice(0, 10) : today,
        quantity: item.quantity ?? '',
        cost_per_item: item.cost_per_item ?? '',
        category: item.category || '',
        menu_price: item.menu_price ?? '',
        available_on_menu: item.available_on_menu ?? false,
        low_stock_threshold: item.low_stock_threshold ?? 5,
      });
    }
  }, [item]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const total = (Number(form.quantity) || 0) * (Number(form.cost_per_item) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      date: form.date,
      quantity: Number(form.quantity) || 0,
      cost_per_item: Number(form.cost_per_item) || 0,
      category: form.category || '',
      menu_price: form.menu_price === '' ? null : Number(form.menu_price),
      available_on_menu: form.available_on_menu,
      low_stock_threshold: Number(form.low_stock_threshold) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item name</Label>
        <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Bottled Water 500ml" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={form.category || '__none'} onValueChange={(v) => set('category', v === '__none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Uncategorized</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" min="0" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost_per_item">Est. cost per item (₱)</Label>
          <Input id="cost_per_item" type="number" min="0" step="0.01" value={form.cost_per_item} onChange={(e) => set('cost_per_item', e.target.value)} required />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
        <span className="text-sm text-muted-foreground">Total value</span>
        <span className="font-heading text-lg font-semibold">
          ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-3">Menu settings</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="menu_price">Selling price (₱)</Label>
            <Input id="menu_price" type="number" min="0" step="0.01" value={form.menu_price} onChange={(e) => set('menu_price', e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="low_stock_threshold">Low-stock alert at</Label>
            <Input id="low_stock_threshold" type="number" min="0" value={form.low_stock_threshold} onChange={(e) => set('low_stock_threshold', e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <Label htmlFor="available_on_menu" className="cursor-pointer">Show on menu</Label>
            <p className="text-xs text-muted-foreground">Display this item on your menu page</p>
          </div>
          <Switch id="available_on_menu" checked={form.available_on_menu} onCheckedChange={(v) => set('available_on_menu', v)} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : item ? 'Save changes' : 'Add item'}</Button>
      </div>
    </form>
  );
}