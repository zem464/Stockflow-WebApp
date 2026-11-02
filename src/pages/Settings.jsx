import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, KeyRound, Mail, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPasscode, setSavingPasscode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        setName(me.display_name || me.full_name || '');
        setPasscode(me.passcode || '');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveName = async () => {
    setSavingName(true);
    try {
      await base44.auth.updateMe({ display_name: name });
      toast({ title: 'Name saved' });
    } finally {
      setSavingName(false);
    }
  };

  const savePasscode = async () => {
    if (passcode.length < 4) {
      toast({ title: 'Passcode must be at least 4 characters', variant: 'destructive' });
      return;
    }
    setSavingPasscode(true);
    try {
      await base44.auth.updateMe({ passcode });
      toast({ title: 'Passcode saved' });
    } finally {
      setSavingPasscode(false);
    }
  };

  const sendReset = async () => {
    if (!user?.email) return;
    try {
      await base44.auth.resetPasswordRequest(user.email);
    } catch {}
    setResetSent(true);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-heading font-semibold">Profile</h2>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <Button onClick={saveName} disabled={savingName} size="sm">Save name</Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <p className="text-xs text-muted-foreground">Email is your login and can't be changed.</p>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-heading font-semibold">Menu passcode</h2>
          </div>
          <p className="text-sm text-muted-foreground">Used to unlock price editing in the Menu tab.</p>
          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input id="passcode" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Set a passcode" />
            <Button onClick={savePasscode} disabled={savingPasscode} size="sm">Save passcode</Button>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-heading font-semibold">Password</h2>
          </div>
          <p className="text-sm text-muted-foreground">Reset your password via email.</p>
          {resetSent ? (
            <p className="text-sm text-muted-foreground">If an account exists for {user?.email}, a reset link has been sent.</p>
          ) : (
            <Button onClick={sendReset} variant="outline" size="sm">Send reset email</Button>
          )}
        </Card>
      </div>
    </div>
  );
}