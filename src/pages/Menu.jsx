import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Lock, Unlock, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const peso = (n) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [prices, setPrices] = useState({});
  const [savedId, setSavedId] = useState(null);

  const load = async () => {
    const [itemList, catList, me] = await Promise.all([
      base44.entities.InventoryItem.list(),
      base44.entities.Category.list(),
      base44.auth.me().catch(() => null),
    ]);
    setItems(itemList);
    setCategories(catList);
    setUser(me);
    const p = {};
    itemList.forEach((i) => { p[i.id] = i.menu_price ?? ''; });
    setPrices(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const hasPasscode = !!(user && user.passcode);

  const handleUnlock = () => {
    if (!hasPasscode) return;
    if (pwInput === user.passcode) {
      setUnlocked(true);
      setPwOpen(false);
      setPwInput('');
      setPwError('');
    } else {
      setPwError('Wrong passcode');
    }
  };

  const savePrice = async (item) => {
    const val = Number(prices[item.id]);
    if (Number.isNaN(val)) return;
    await base44.entities.InventoryItem.update(item.id, { menu_price: val });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, menu_price: val } : i)));
    setSavedId(item.id);
    setTimeout(() => setSavedId(null), 1200);
  };

  const menuItems = items.filter((i) => i.available_on_menu && i.menu_price != null);
  const seen = new Set();
  const orderedCats = [];
  [...categories.map((c) => c.name), ...menuItems.map((i) => i.category || 'Other')].forEach((n) => {
    if (!seen.has(n) && menuItems.some((i) => (i.category || 'Other') === n)) {
      seen.add(n);
      orderedCats.push(n);
    }
  });

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="text-center sm:text-left">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">Menu</h1>
          <p className="text-muted-foreground text-sm mt-1">Items marked to show on the menu.</p>
        </div>
        {unlocked ? (
          <Button variant="outline" className="gap-2" onClick={() => setUnlocked(false)}><Lock className="w-4 h-4" /> Lock editing</Button>
        ) : (
          <Button variant="outline" className="gap-2" onClick={() => setPwOpen(true)} disabled={!hasPasscode}><Unlock className="w-4 h-4" /> Edit prices</Button>
        )}
      </div>
      {!hasPasscode && !loading && (
        <p className="text-sm text-muted-foreground mb-6 text-center sm:text-left">Set a passcode in Settings to enable price editing.</p>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading…</div>
      ) : menuItems.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">No menu items yet. Open an inventory item and enable "Show on menu".</p>
        </Card>
      ) : (
        <div className="space-y-10">
          {orderedCats.map((catName) => {
            const catItems = menuItems.filter((i) => (i.category || 'Other') === catName);
            return (
              <section key={catName}>
                <h2 className="font-heading text-xl font-semibold mb-4 pb-2 border-b border-border">{catName}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {catItems.map((item) => {
                    const inStock = (item.quantity || 0) > 0;
                    return (
                      <Card key={item.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{item.name}</div>
                          {item.quantity != null && (
                            <span className={`text-xs ${inStock ? 'text-muted-foreground' : 'text-brand'}`}>
                              {inStock ? 'Available' : 'Out of stock'}
                            </span>
                          )}
                        </div>
                        {unlocked ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <Input
                              type="number"
                              min="0"
                              value={prices[item.id] ?? ''}
                              onChange={(e) => setPrices((p) => ({ ...p, [item.id]: e.target.value }))}
                              onBlur={() => savePrice(item)}
                              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                              className="w-24 text-right"
                            />
                            {savedId === item.id && <Check className="w-4 h-4 text-emerald-600" />}
                          </div>
                        ) : (
                          <span className="font-heading font-semibold text-lg shrink-0">{peso(item.menu_price)}</span>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Enter passcode</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              placeholder="Passcode"
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              autoFocus
            />
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            <Button className="w-full" onClick={handleUnlock}>Unlock</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}