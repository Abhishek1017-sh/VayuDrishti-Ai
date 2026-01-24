import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Shield, Home, Wind, HeartPulse, Activity, Brain, Baby, AlertTriangle } from 'lucide-react';

function HealthAdvice({ aqi = 0, location = 'Your Area' }) {
  const { pm25, cigsPerDay } = useMemo(() => {
    const pm = aqiToPM25(aqi);
    const cigs = pm > 0 ? pm / 22 : 0; // Berkeley Earth (approx.): 1 cigarette/day ≈ 22 µg/m³ PM2.5
    return { pm25: pm, cigsPerDay: Number(cigs.toFixed(1)) };
  }, [aqi]);

  const weekly = (cigsPerDay * 7).toFixed(1);
  const monthly = (cigsPerDay * 30).toFixed(1);

  const category = getAQICategory(aqi);

  const tabs = [
    {
      id: 'asthma',
      label: 'Asthma',
      description: 'Risk of asthma symptoms increases when AQI is elevated',
      dos: [
        'Use prescribed inhalers as advised by your doctor',
        'Keep windows closed and run air purifiers (HEPA)',
        'Limit outdoor exposure, especially near traffic',
        'Wear a properly fitted N95 mask if you need to go out'
      ],
      donts: [
        'Avoid strenuous outdoor exercise',
        'Avoid smoke and incense indoors',
        'Do not skip prescribed medication'
      ]
    },
    {
      id: 'heart',
      label: 'Heart Issues',
      description: 'People with cardiovascular disease are more sensitive to air pollution',
      dos: [
        'Monitor symptoms like chest discomfort or breathlessness',
        'Take medications on schedule and stay hydrated',
        'Plan indoor activities during high AQI periods'
      ],
      donts: [
        'Avoid outdoor exertion when AQI is high',
        'Don’t ignore warning signs; seek medical help if needed'
      ]
    },
    {
      id: 'allergies',
      label: 'Allergies',
      description: 'High AQI can worsen allergic rhinitis and sinusitis',
      dos: [
        'Use air purifiers and keep indoor air clean',
        'Consider saline nasal rinse to reduce irritation'
      ],
      donts: [
        'Avoid dusty/outdoor environments when AQI is high'
      ]
    },
    {
      id: 'copd',
      label: 'Chronic (COPD)',
      description: 'COPD patients should be extra cautious during high pollution',
      dos: [
        'Keep rescue inhaler accessible',
        'Avoid outdoor travel; use N95 when necessary',
        'Use prescribed long-term therapy regularly'
      ],
      donts: [
        'Avoid exposure to smoke or fumes',
        'Do not skip maintenance therapy'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white">Health Advice For People Living In</h3>
        <p className="text-cyan-300 text-sm">{location}</p>
      </div>

      {/* Risk Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-white/10 backdrop-blur"
        style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Metric title="Cigarettes per day (approx.)" value={cigsPerDay} suffix="" color="text-red-400" />
          <Metric title="Weekly" value={weekly} suffix=" cigarettes" color="text-yellow-300" />
          <Metric title="Monthly" value={monthly} suffix=" cigarettes" color="text-orange-300" />
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Approximation based on PM2.5 derived from AQI using EPA breakpoints; 1 cigarette/day ≈ 22 µg/m³ PM2.5 (Berkeley Earth). Actual risk varies.
        </p>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Solution icon={<Shield className="w-4 h-4" />} title="N95 Mask" note="Recommended" />
          <Solution icon={<Home className="w-4 h-4" />} title="Stay Indoor" note="Limit exposure" />
          <Solution icon={<Wind className="w-4 h-4" />} title="Air Purifier" note="HEPA filter" />
          <Solution icon={<ShieldAlert className="w-4 h-4" />} title="Avoid Strenuous Activity" note="During high AQI" />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 border border-white/10 backdrop-blur"
        style={{ background: 'linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map(t => (
            <span key={t.id} className="px-3 py-1 rounded-full bg-white/5 text-gray-300 text-xs border border-white/10">
              {t.label}
            </span>
          ))}
        </div>

        {/* Default view: Asthma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-1">Asthma</h4>
            <p className="text-gray-400 text-sm mb-3">Risk may be <span className="text-red-400 font-semibold">high</span> when AQI is {category.label} ({aqi}).</p>
            <h5 className="text-gray-300 font-medium mb-2">Do's</h5>
            <ul className="space-y-2 text-sm text-gray-300">
              {tabs[0].dos.map((d, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-cyan-400 mt-1">✓</span>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-gray-300 font-medium mb-2">Don'ts</h5>
            <ul className="space-y-2 text-sm text-gray-300">
              {tabs[0].donts.map((d, i) => (
                <li key={i} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />{d}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          This guidance is educational and based on general public health recommendations. Consult your healthcare provider for personalized medical advice.
        </p>
      </motion.div>
    </div>
  );
}

function Metric({ title, value, suffix, color }) {
  return (
    <div className="relative overflow-hidden rounded-xl p-4 border border-white/10 bg-white/5">
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}{suffix}</p>
    </div>
  );
}

function Solution({ icon, title, note }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
      <div className="text-cyan-300">{icon}</div>
      <div>
        <p className="text-sm text-white font-medium">{title}</p>
        <p className="text-xs text-gray-400">{note}</p>
      </div>
    </div>
  );
}

// Helper: Convert AQI to PM2.5 (µg/m³) using EPA breakpoints
function aqiToPM25(aqi) {
  const ranges = [
    { I_low: 0, I_high: 50, C_low: 0.0, C_high: 12.0 },
    { I_low: 51, I_high: 100, C_low: 12.1, C_high: 35.4 },
    { I_low: 101, I_high: 150, C_low: 35.5, C_high: 55.4 },
    { I_low: 151, I_high: 200, C_low: 55.5, C_high: 150.4 },
    { I_low: 201, I_high: 300, C_low: 150.5, C_high: 250.4 },
    { I_low: 301, I_high: 400, C_low: 250.5, C_high: 350.4 },
    { I_low: 401, I_high: 500, C_low: 350.5, C_high: 500.4 },
  ];
  const r = ranges.find(r => aqi >= r.I_low && aqi <= r.I_high);
  if (!r) return 0;
  const C = (aqi - r.I_low) * (r.C_high - r.C_low) / (r.I_high - r.I_low) + r.C_low;
  return Number(C.toFixed(1));
}

function getAQICategory(aqi) {
  if (aqi <= 50) return { label: 'Good', color: '#00E400' };
  if (aqi <= 100) return { label: 'Moderate', color: '#FFFF00' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#FF7E00' };
  if (aqi <= 200) return { label: 'Unhealthy', color: '#FF0000' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#8F3F97' };
  return { label: 'Hazardous', color: '#7E0023' };
}

export default HealthAdvice;
