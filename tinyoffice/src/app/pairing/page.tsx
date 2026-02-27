"use client";

import { useState } from "react";
import { usePolling } from "@/lib/hooks";
import {
  getPairing,
  approvePairing,
  unpairSender,
  type PairingData,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Clock, CheckCircle, XCircle, UserCheck } from "lucide-react";

export default function PairingPage() {
  const { data, refresh } = usePolling<PairingData>(getPairing, 5000);
  const [approveCode, setApproveCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pending = data?.pending ?? [];
  const approved = data?.approved ?? [];

  const handleApprove = async (code: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await approvePairing(code);
      setSuccess(`Approved pairing code: ${code.toUpperCase()}`);
      setApproveCode("");
      refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpair = async (channel: string, senderId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await unpairSender(channel, senderId);
      setSuccess(`Unpaired ${channel}:${senderId}`);
      refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Pairing Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage access to your TinyClaw agents via messaging channels
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 text-primary text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Quick Approve */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Approve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter pairing code"
              value={approveCode}
              onChange={(e) => setApproveCode(e.target.value)}
              className="flex-1 text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && approveCode.trim()) {
                  handleApprove(approveCode.trim());
                }
              }}
            />
            <Button
              onClick={() => handleApprove(approveCode.trim())}
              disabled={!approveCode.trim() || loading}
              className="shrink-0"
            >
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-yellow-500" />
            Pending Requests
            {pending.length > 0 && (
              <Badge variant="secondary">{pending.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length > 0 ? (
            <div className="space-y-3">
              {pending.map((entry) => (
                <div
                  key={entry.code}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-primary">
                        {entry.code}
                      </span>
                      <Badge variant="outline">{entry.channel}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {entry.sender} ({entry.senderId})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(entry.code)}
                    disabled={loading}
                    className="shrink-0 self-end sm:self-auto"
                  >
                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                    Approve
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No pending requests</p>
          )}
        </CardContent>
      </Card>

      {/* Approved Senders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Approved Senders
            {approved.length > 0 && (
              <Badge variant="secondary">{approved.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approved.length > 0 ? (
            <div className="space-y-3">
              {approved.map((entry) => (
                <div
                  key={`${entry.channel}-${entry.senderId}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{entry.sender}</span>
                      <Badge variant="outline">{entry.channel}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.senderId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Approved: {new Date(entry.approvedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnpair(entry.channel, entry.senderId)}
                    disabled={loading}
                    className="shrink-0 self-end sm:self-auto text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Unpair
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No approved senders</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
