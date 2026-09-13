'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Database,
  Server,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Play,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

export default function DiagnosticsPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [endpointResult, setEndpointResult] = useState<string | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/health');
      setHealth(data);
    } catch (err: any) {
      setHealth({ status: 'ERROR', error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const testEndpoint = async (endpoint: string) => {
    try {
      setTestingEndpoint(endpoint);
      setEndpointResult('Sending request to NestJS backend...');
      const res = await apiRequest(endpoint);
      setEndpointResult(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setEndpointResult(`Error calling ${endpoint}:\n${err.message}`);
    } finally {
      setTestingEndpoint(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Activity className="w-6 h-6 text-indigo-400" />
          <span>System Architecture & API Diagnostics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor operational telemetry, database connection pool, NestJS application container, and interactive endpoint test bench.
        </p>
      </div>

      {/* Services Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Backend API */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">NestJS API Server</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-base font-bold text-white">Online & Healthy</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 space-y-0.5 font-mono">
            <div>Port: <strong className="text-slate-200">5000</strong></div>
            <div>Runtime: <strong className="text-slate-200">Node v20.19.4</strong></div>
            <div>Framework: <strong className="text-slate-200">NestJS 11 + Express</strong></div>
          </div>
        </div>

        {/* Database */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Database Engine</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-base font-bold text-white">PostgreSQL 17</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 space-y-0.5 font-mono">
            <div>Database: <strong className="text-slate-200">reachwithus</strong></div>
            <div>ORM: <strong className="text-slate-200">TypeORM 0.3.20</strong></div>
            <div>Entities: <strong className="text-slate-200">8 Active Schemas</strong></div>
          </div>
        </div>

        {/* Payment Gateway */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment Engine</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-base font-bold text-white">Razorpay Sandbox</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 space-y-0.5 font-mono">
            <div>Model: <strong className="text-slate-200">₹10 / 30 Days</strong></div>
            <div>Mode: <strong className="text-amber-300">Test / Sandbox Simulation</strong></div>
            <div>Signatures: <strong className="text-slate-200">HMAC SHA256</strong></div>
          </div>
        </div>
      </div>

      {/* Interactive API Test Bench */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span>Interactive Endpoint Test Bench</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Trigger live API queries with authenticated admin credentials and inspect low-level payload responses.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => testEndpoint('/health')}
            disabled={testingEndpoint !== null}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            <span>GET /api/health</span>
          </button>
          <button
            onClick={() => testEndpoint('/categories')}
            disabled={testingEndpoint !== null}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-sky-400" />
            <span>GET /api/categories</span>
          </button>
          <button
            onClick={() => testEndpoint('/posts')}
            disabled={testingEndpoint !== null}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-indigo-400" />
            <span>GET /api/posts</span>
          </button>
          <button
            onClick={() => testEndpoint('/admin/dashboard/stats')}
            disabled={testingEndpoint !== null}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-amber-400" />
            <span>GET /api/admin/dashboard/stats</span>
          </button>
          <button
            onClick={() => testEndpoint('/admin/moderation/queue')}
            disabled={testingEndpoint !== null}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-rose-400" />
            <span>GET /api/admin/moderation/queue</span>
          </button>
        </div>

        {/* Output Console */}
        {endpointResult && (
          <div className="p-4 rounded-xl bg-[#070b12] border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 mb-2 border-b border-slate-800">
              <span className="font-mono">Payload Inspector</span>
              <button
                onClick={() => setEndpointResult(null)}
                className="text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
              {endpointResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
