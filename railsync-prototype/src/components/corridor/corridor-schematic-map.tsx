'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrainFront,
  Clock,
  Wrench,
  Zap,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StationNode {
  id: string;
  code: string;
  name: string;
  x: number; // percentage along horizontal line
  isDivisionHQ?: boolean;
}

interface CorridorSegment {
  id: string;
  code: string;
  name: string;
  startStation: string;
  endStation: string;
  startX: number;
  endX: number;
  activeBlock: {
    id: string;
    window: string;
    departments: Array<'Engineering' | 'Signal' | 'Traction'>;
    tasksCount: number;
    impact: 'Low' | 'Medium' | 'High';
    cautionSpeed: string;
  } | null;
  trains: Array<{
    id: string;
    name: string;
    time: string;
    status: 'CLEAR' | 'INSIDE_BLOCK' | 'DELAYED';
  }>;
}

const stations: StationNode[] = [
  { id: 'ADI', code: 'ADI', name: 'Ahmedabad Jn', x: 8 },
  { id: 'ND', code: 'ND', name: 'Nadiad Jn', x: 24 },
  { id: 'ANND', code: 'ANND', name: 'Anand Jn', x: 38 },
  { id: 'BRC', code: 'BRC', name: 'Vadodara Jn', x: 54, isDivisionHQ: true },
  { id: 'BH', code: 'BH', name: 'Bharuch Jn', x: 70 },
  { id: 'ST', code: 'ST', name: 'Surat', x: 84 },
  { id: 'MMCT', code: 'MMCT', name: 'Mumbai Central', x: 96 },
];

const corridors: CorridorSegment[] = [
  {
    id: 'C001',
    code: 'C001',
    name: 'Ahmedabad → Nadiad',
    startStation: 'ADI',
    endStation: 'ND',
    startX: 8,
    endX: 24,
    activeBlock: {
      id: 'BLOCK-001',
      window: '01:00 – 03:00',
      departments: ['Engineering', 'Signal'],
      tasksCount: 2,
      impact: 'Low',
      cautionSpeed: '30 km/h (Track tamping)',
    },
    trains: [
      { id: '12952', name: 'Mumbai Rajdhani', time: '02:15', status: 'INSIDE_BLOCK' },
      { id: '19038', name: 'Avadh Express', time: '03:45', status: 'CLEAR' },
    ],
  },
  {
    id: 'C002',
    code: 'C002',
    name: 'Nadiad → Vadodara',
    startStation: 'ND',
    endStation: 'BRC',
    startX: 24,
    endX: 54,
    activeBlock: {
      id: 'BLOCK-003',
      window: '00:30 – 02:30',
      departments: ['Engineering', 'Signal'],
      tasksCount: 2,
      impact: 'Low',
      cautionSpeed: '45 km/h (Point machine replacement)',
    },
    trains: [
      { id: '22954', name: 'Gujarat SF Express', time: '01:10', status: 'DELAYED' },
      { id: '12010', name: 'Shatabdi Express', time: '04:15', status: 'CLEAR' },
    ],
  },
  {
    id: 'C003',
    code: 'C003',
    name: 'Vadodara → Surat',
    startStation: 'BRC',
    endStation: 'ST',
    startX: 54,
    endX: 84,
    activeBlock: {
      id: 'BLOCK-005',
      window: '00:00 – 02:00',
      departments: ['Signal', 'Traction'],
      tasksCount: 2,
      impact: 'Low',
      cautionSpeed: '20 km/h (OHE insulator wash)',
    },
    trains: [
      { id: '12904', name: 'Golden Temple Mail', time: '01:40', status: 'CLEAR' },
      { id: '22944', name: 'Indore Daund SF', time: '02:20', status: 'CLEAR' },
    ],
  },
  {
    id: 'C004',
    code: 'C004',
    name: 'Surat → Mumbai Central',
    startStation: 'ST',
    endStation: 'MMCT',
    startX: 84,
    endX: 96,
    activeBlock: {
      id: 'BLOCK-007',
      window: '00:00 – 02:00',
      departments: ['Engineering', 'Signal'],
      tasksCount: 2,
      impact: 'Low',
      cautionSpeed: 'Normal 110 km/h (Post-clearance)',
    },
    trains: [
      { id: '12954', name: 'August Kranti Tejas', time: '03:10', status: 'CLEAR' },
    ],
  },
];

export function CorridorSchematicMap() {
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorSegment>(corridors[1]);
  const [filterLayer, setFilterLayer] = useState<'all' | 'blocks' | 'trains'>('all');

  return (
    <Card className="border-slate-200/90 shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                Live Division Schematic
              </span>
              <Badge variant="outline" className="text-xs text-sky-700 border-sky-300 bg-sky-50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Western Railway Mainline
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Vadodara Division Corridor Track Diagram
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Interactive track schematic showing bundled maintenance block zones, caution orders, and corridor movements.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Bundled Block Zone</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Clear Section</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Schematic SVG Canvas */}
        <div className="relative py-8 px-4 bg-slate-900 rounded-xl overflow-x-auto shadow-inner border border-slate-800 mb-6">
          <div className="min-w-[760px] relative h-36">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 opacity-10 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-sky-400" />
              <div className="border-b border-sky-400" />
              <div className="border-b border-sky-400" />
            </div>

            {/* UP and DOWN Mainlines */}
            <div className="absolute top-[42px] left-[5%] right-[5%] h-[2px] bg-slate-700" />
            <div className="absolute top-[58px] left-[5%] right-[5%] h-[2px] bg-slate-700" />

            {/* UP and DOWN Line Labels */}
            <span className="absolute top-[34px] left-[1%] text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
              UP LINE
            </span>
            <span className="absolute top-[54px] left-[1%] text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
              DN LINE
            </span>

            {/* Corridor Segment Blocks on Tracks */}
            {corridors.map((c) => {
              const isSelected = selectedCorridor.id === c.id;
              const hasBlock = !!c.activeBlock;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCorridor(c)}
                  className={`absolute top-[38px] h-[26px] rounded-md cursor-pointer transition-all ${
                    hasBlock
                      ? isSelected
                        ? 'bg-sky-500/40 border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                        : 'bg-sky-500/20 border border-sky-500/60 hover:bg-sky-500/30'
                      : 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                  style={{
                    left: `${c.startX}%`,
                    width: `${c.endX - c.startX}%`,
                  }}
                >
                  <div className="flex items-center justify-between h-full px-2">
                    <span className="text-[10px] font-mono font-bold text-sky-200 truncate">
                      {c.code}
                    </span>
                    {hasBlock && (
                      <span className="flex items-center gap-1 text-[9px] font-bold bg-sky-950/80 text-sky-300 border border-sky-600/50 px-1.5 py-0.2 rounded">
                        <Clock className="w-2.5 h-2.5" />
                        {c.activeBlock?.window}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Station Nodes */}
            {stations.map((st) => (
              <div
                key={st.id}
                className="absolute top-[34px] -translate-x-1/2 flex flex-col items-center pointer-events-none"
                style={{ left: `${st.x}%` }}
              >
                {/* Station Node Marker */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                    st.isDivisionHQ
                      ? 'bg-sky-500 border-white shadow-[0_0_12px_#38bdf8]'
                      : 'bg-slate-900 border-slate-400'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      st.isDivisionHQ ? 'bg-white' : 'bg-slate-400'
                    }`}
                  />
                </div>

                {/* Station Names & Codes */}
                <div className="mt-7 text-center">
                  <span
                    className={`text-xs font-bold block ${
                      st.isDivisionHQ ? 'text-sky-300' : 'text-slate-200'
                    }`}
                  >
                    {st.code}
                  </span>
                  <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                    {st.name}
                  </span>
                  {st.isDivisionHQ && (
                    <span className="text-[9px] font-bold text-emerald-400 block uppercase tracking-wider">
                      ★ Division HQ
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Corridor Inspection Panel */}
        <AnimatePresence mode="wait">
          {selectedCorridor && (
            <motion.div
              key={selectedCorridor.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
                    <TrainFront className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                        {selectedCorridor.code}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">
                        {selectedCorridor.name} Section
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Double line electrified track · Indian Railways High-Density Network (HDN-1)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-sky-100 text-sky-900 border border-sky-300 text-xs">
                    {selectedCorridor.activeBlock ? 'Bundled Block Scheduled' : 'Normal Running'}
                  </Badge>
                </div>
              </div>

              {/* Corridor Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Active Maintenance Window */}
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider">Active Block</span>
                    <Clock className="w-4 h-4 text-sky-600" />
                  </div>
                  {selectedCorridor.activeBlock ? (
                    <div>
                      <span className="text-base font-bold font-mono text-slate-900 block">
                        {selectedCorridor.activeBlock.window}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedCorridor.activeBlock.id} · {selectedCorridor.activeBlock.tasksCount} integrated tasks
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedCorridor.activeBlock.departments.map((d) => (
                          <Badge
                            key={d}
                            variant="outline"
                            className="text-[10px] font-semibold bg-sky-50 text-sky-700 border-sky-200"
                          >
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700 font-medium">No block planned. Track fully open.</p>
                  )}
                </div>

                {/* Safety Caution Order */}
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider">Caution Order</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {selectedCorridor.activeBlock?.cautionSpeed || 'Speed: Max Permissible (130 km/h)'}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Integrated safety clearances enforced by Vadodara Section Controller.
                  </p>
                  <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Interlocking protection active
                  </div>
                </div>

                {/* Train Movements */}
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider">Train Coordination</span>
                    <TrainFront className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="space-y-1.5">
                    {selectedCorridor.trains.map((tr) => (
                      <div key={tr.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                        <div>
                          <span className="font-bold font-mono text-slate-800">{tr.id}</span>
                          <span className="text-slate-500 ml-1.5">{tr.name}</span>
                        </div>
                        <Badge
                          className={`text-[10px] ${
                            tr.status === 'INSIDE_BLOCK'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : tr.status === 'DELAYED'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {tr.status === 'INSIDE_BLOCK' ? 'Held at Outer' : tr.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
