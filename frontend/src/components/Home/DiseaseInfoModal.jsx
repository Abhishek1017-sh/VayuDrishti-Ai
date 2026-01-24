import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Heart, Wind, Activity, Thermometer, Video, Phone, Calendar, Clock } from 'lucide-react';

const diseaseInfo = {
  asthma: {
    name: 'Asthma',
    icon: Wind,
    color: 'blue',
    description: 'A chronic respiratory condition where airways become inflamed and narrowed, making breathing difficult.',
    aqiThresholds: {
      good: { range: '0-50', risk: 'low', message: 'Safe for asthma patients' },
      moderate: { range: '51-100', risk: 'medium', message: 'May cause minor breathing issues' },
      unhealthy: { range: '101-200', risk: 'high', message: 'Can trigger asthma attacks' },
      hazardous: { range: '201+', risk: 'critical', message: 'Severe risk of asthma attacks' },
    },
    dos: [
      'Use prescribed inhalers as advised by your doctor',
      'Keep windows closed and run air purifiers (HEPA)',
      'Limit outdoor exposure, especially near traffic',
      'Wear a properly fitted N95 mask if you need to go out',
      'Monitor peak flow readings regularly',
      'Keep emergency medication readily accessible',
    ],
    donts: [
      'Avoid strenuous outdoor exercise',
      'Avoid smoke and incense indoors',
      'Do not skip prescribed medication',
      'Avoid cold air exposure without covering nose/mouth',
      'Do not ignore early warning signs (coughing, wheezing)',
    ],
    symptoms: [
      'Wheezing or whistling sound when breathing',
      'Shortness of breath',
      'Chest tightness or pain',
      'Coughing, especially at night',
      'Difficulty sleeping due to breathing problems',
    ],
    emergencyActions: [
      'Use quick-relief inhaler immediately',
      'Sit upright and try to stay calm',
      'Take slow, deep breaths',
      'Call emergency services if symptoms worsen',
      'Have someone stay with you until help arrives',
    ],
  },
  heartIssues: {
    name: 'Heart Issues (Cardiovascular)',
    icon: Heart,
    color: 'red',
    description: 'Air pollution increases risk of heart attacks, strokes, and other cardiovascular problems.',
    aqiThresholds: {
      good: { range: '0-50', risk: 'low', message: 'Safe for heart patients' },
      moderate: { range: '51-100', risk: 'medium', message: 'May increase blood pressure' },
      unhealthy: { range: '101-200', risk: 'high', message: 'Risk of heart complications' },
      hazardous: { range: '201+', risk: 'critical', message: 'Severe cardiac risk' },
    },
    dos: [
      'Take prescribed heart medication regularly',
      'Monitor blood pressure and heart rate daily',
      'Stay indoors during high pollution hours',
      'Use air purifiers with HEPA filters',
      'Maintain a heart-healthy diet (low sodium, high fiber)',
      'Practice stress-reduction techniques (meditation, yoga)',
      'Keep emergency contact numbers handy',
    ],
    donts: [
      'Avoid vigorous physical activity outdoors',
      'Do not smoke or be near smokers',
      'Avoid heavy meals that can strain the heart',
      'Do not ignore chest pain or irregular heartbeat',
      'Avoid exposure to extreme temperatures',
    ],
    symptoms: [
      'Chest pain or discomfort',
      'Shortness of breath',
      'Irregular heartbeat (palpitations)',
      'Fatigue or weakness',
      'Dizziness or lightheadedness',
      'Swelling in legs, ankles, or feet',
    ],
    emergencyActions: [
      'Call emergency services immediately if experiencing chest pain',
      'Chew aspirin if advised by doctor (only if not allergic)',
      'Sit or lie down in a comfortable position',
      'Loosen tight clothing',
      'Do not drive yourself to the hospital',
    ],
  },
  allergies: {
    name: 'Allergies & Respiratory Allergies',
    icon: Activity,
    color: 'green',
    description: 'Air pollutants can trigger allergic reactions, hay fever, and respiratory irritation.',
    aqiThresholds: {
      good: { range: '0-50', risk: 'low', message: 'Safe for allergy sufferers' },
      moderate: { range: '51-100', risk: 'medium', message: 'May cause mild allergic reactions' },
      unhealthy: { range: '101-200', risk: 'high', message: 'High risk of severe allergies' },
      hazardous: { range: '201+', risk: 'critical', message: 'Severe allergic reactions likely' },
    },
    dos: [
      'Take antihistamines as prescribed',
      'Use saline nasal rinses to clear irritants',
      'Keep windows and doors closed during high pollen/pollution days',
      'Shower and change clothes after being outdoors',
      'Use allergen-proof bedding covers',
      'Run air purifiers continuously',
      'Wear sunglasses to protect eyes from allergens',
    ],
    donts: [
      'Avoid outdoor activities during peak pollution hours (morning/evening)',
      'Do not dry clothes outdoors',
      'Avoid contact with known allergens (pollen, dust, pet dander)',
      'Do not rub itchy eyes (can worsen symptoms)',
      'Avoid scented products and strong perfumes',
    ],
    symptoms: [
      'Sneezing and runny nose',
      'Itchy, watery eyes',
      'Nasal congestion',
      'Scratchy throat',
      'Skin rashes or hives',
      'Coughing',
    ],
    emergencyActions: [
      'Use prescribed epinephrine auto-injector (EpiPen) if severe reaction',
      'Take antihistamine immediately',
      'Seek medical help if breathing becomes difficult',
      'Remove yourself from allergen source',
      'Rinse eyes with clean water if irritated',
    ],
  },
  copd: {
    name: 'Chronic COPD (Obstructive Pulmonary Disease)',
    icon: Thermometer,
    color: 'orange',
    description: 'A progressive lung disease causing breathing difficulties. Air pollution significantly worsens symptoms.',
    aqiThresholds: {
      good: { range: '0-50', risk: 'low', message: 'Relatively safe for COPD patients' },
      moderate: { range: '51-100', risk: 'medium', message: 'May cause breathing discomfort' },
      unhealthy: { range: '101-200', risk: 'high', message: 'High risk of exacerbation' },
      hazardous: { range: '201+', risk: 'critical', message: 'Life-threatening for COPD patients' },
    },
    dos: [
      'Use oxygen therapy as prescribed',
      'Practice pursed-lip breathing techniques',
      'Take bronchodilators and medications on schedule',
      'Stay hydrated (drink plenty of water)',
      'Use a humidifier to keep air moist',
      'Perform pulmonary rehabilitation exercises indoors',
      'Get annual flu and pneumonia vaccinations',
    ],
    donts: [
      'Do not smoke or be near secondhand smoke',
      'Avoid outdoor activities when AQI is high',
      'Do not skip oxygen therapy sessions',
      'Avoid dusty or chemical-laden environments',
      'Do not overexert yourself physically',
    ],
    symptoms: [
      'Chronic cough with mucus production',
      'Shortness of breath, especially during activities',
      'Wheezing',
      'Chest tightness',
      'Frequent respiratory infections',
      'Fatigue',
      'Bluish lips or fingernails (low oxygen)',
    ],
    emergencyActions: [
      'Use rescue inhaler immediately',
      'Increase oxygen flow if on oxygen therapy (as per doctor\'s instructions)',
      'Sit upright and lean forward slightly',
      'Call emergency services if symptoms are severe',
      'Have someone monitor your condition until help arrives',
    ],
  },
};

const DiseaseInfoModal = ({ disease, currentAQI, onClose }) => {
  const [showDoctorConnect, setShowDoctorConnect] = useState(false);

  if (!disease || !diseaseInfo[disease]) return null;

  const info = diseaseInfo[disease];
  const Icon = info.icon;

  // Determine current risk level based on AQI
  const getCurrentRisk = () => {
    if (currentAQI <= 50) return info.aqiThresholds.good;
    if (currentAQI <= 100) return info.aqiThresholds.moderate;
    if (currentAQI <= 200) return info.aqiThresholds.unhealthy;
    return info.aqiThresholds.hazardous;
  };

  const currentRisk = getCurrentRisk();

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'critical': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getHeaderGradient = (color) => {
    const gradients = {
      blue: 'from-blue-600 to-blue-700',
      red: 'from-red-600 to-red-700',
      green: 'from-green-600 to-green-700',
      orange: 'from-orange-600 to-orange-700',
    };
    return gradients[color] || 'from-slate-600 to-slate-700';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
        {/* Header */}
        <div className={`sticky top-0 bg-gradient-to-r ${getHeaderGradient(info.color)} p-6 flex items-center justify-between z-10`}>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{info.name}</h2>
              <p className="text-white/80 text-sm">{info.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Risk Banner */}
        <div className={`mx-6 mt-6 p-4 rounded-xl border ${getRiskColor(currentRisk.risk)} border-current`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Current AQI: {currentAQI} - Risk Level: {currentRisk.risk.toUpperCase()}</p>
                <p className="text-sm opacity-80">{currentRisk.message}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-sm font-mono">
              AQI {currentRisk.range}
            </span>
          </div>
        </div>

        {/* Doctor Connect Banner */}
        <div className="mx-6 mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 p-5 rounded-xl border border-blue-400 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl animate-pulse">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  🩺 Connect with Specialist Doctor
                  <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full font-bold">NEW</span>
                </h3>
                <p className="text-white/90 text-sm mt-1">
                  Get instant medical consultation via video call • Available 24/7
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-white/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Avg. Wait: 2 min
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified Specialists
                  </span>
                  <span className="flex items-center gap-1">
                    🔒 HIPAA Compliant
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDoctorConnect(true)}
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
            >
              <Video className="w-5 h-5" />
              Connect Now
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Symptoms */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Symptoms to Watch For
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {info.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-red-400 mt-1">⚠️</span>
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Do's */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Do's - Recommended Actions
            </h3>
            <ul className="space-y-2">
              {info.dos.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-green-500/5 p-3 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{action}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Don'ts */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Don'ts - Avoid These Actions
            </h3>
            <ul className="space-y-2">
              {info.donts.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-red-500/5 p-3 rounded-lg border border-red-500/20">
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">{action}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Emergency Actions */}
          <section className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Emergency Response Steps
            </h3>
            <ol className="space-y-2">
              {info.emergencyActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-300">
                  <span className="bg-red-500/20 text-red-400 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* AQI Risk Thresholds */}
          <section>
            <h3 className="text-xl font-bold text-white mb-3">AQI Risk Levels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(info.aqiThresholds).map(([level, data]) => (
                <div
                  key={level}
                  className={`p-3 rounded-lg border ${getRiskColor(data.risk)} border-current`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold capitalize">{level}</span>
                    <span className="text-xs font-mono">{data.range}</span>
                  </div>
                  <p className="text-sm opacity-80">{data.message}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
            <p className="text-xs text-slate-400 italic">
              ⚠️ <strong>Disclaimer:</strong> This guidance is educational and based on general public health recommendations. 
              Consult your healthcare provider for personalized medical advice. In case of severe symptoms, call emergency services immediately.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🖨️</span>
            Print Guide
          </button>
        </div>
      </div>

      {/* Doctor Connect Modal */}
      {showDoctorConnect && (
        <DoctorConnectModal
          disease={info.name}
          currentAQI={currentAQI}
          riskLevel={currentRisk.risk}
          onClose={() => setShowDoctorConnect(false)}
        />
      )}
    </div>
  );
};

// Doctor Connect Modal Component
const DoctorConnectModal = ({ disease, currentAQI, riskLevel, onClose }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentType, setAppointmentType] = useState('instant'); // 'instant' or 'scheduled'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Sample specialist doctors (in production, fetch from API)
  const specialists = [
    {
      id: 1,
      name: 'Dr. Priya Sharma',
      specialty: 'Pulmonologist',
      experience: '15 years',
      rating: 4.9,
      reviews: 1247,
      languages: ['English', 'Hindi'],
      available: true,
      nextAvailable: 'Now',
      consultationFee: 500,
      image: '👩‍⚕️',
    },
    {
      id: 2,
      name: 'Dr. Rajesh Kumar',
      specialty: 'Cardiologist',
      experience: '20 years',
      rating: 4.8,
      reviews: 2134,
      languages: ['English', 'Hindi', 'Tamil'],
      available: true,
      nextAvailable: '5 min',
      consultationFee: 800,
      image: '👨‍⚕️',
    },
    {
      id: 3,
      name: 'Dr. Anjali Mehta',
      specialty: 'Allergist & Immunologist',
      experience: '12 years',
      rating: 4.9,
      reviews: 892,
      languages: ['English', 'Hindi', 'Gujarati'],
      available: false,
      nextAvailable: 'Today 4:00 PM',
      consultationFee: 600,
      image: '👩‍⚕️',
    },
    {
      id: 4,
      name: 'Dr. Vikram Singh',
      specialty: 'General Physician',
      experience: '10 years',
      rating: 4.7,
      reviews: 1556,
      languages: ['English', 'Hindi', 'Punjabi'],
      available: true,
      nextAvailable: 'Now',
      consultationFee: 400,
      image: '👨‍⚕️',
    },
  ];

  const handleStartVideoCall = (doctor) => {
    // In production, integrate with telemedicine API (Twilio, Doxy.me, etc.)
    alert(`Starting video call with ${doctor.name}...\n\nIn production, this would:\n1. Initialize secure video connection\n2. Notify doctor\n3. Open video call interface\n4. Record consultation notes\n5. Process payment`);
    // window.open('/video-call?doctorId=' + doctor.id, '_blank');
  };

  const handleScheduleAppointment = (doctor) => {
    if (!scheduledDate || !scheduledTime) {
      alert('Please select date and time');
      return;
    }
    alert(`Appointment scheduled with ${doctor.name}\nDate: ${scheduledDate}\nTime: ${scheduledTime}\n\nYou will receive confirmation via email and SMS.`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-500/50">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 p-6 flex items-center justify-between z-10 border-b border-blue-400">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Video className="w-8 h-8" />
              Connect with Specialist Doctor
            </h2>
            <p className="text-white/80 text-sm mt-1">
              For {disease} • Current AQI: {currentAQI} ({riskLevel})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Appointment Type Selector */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex gap-4">
            <button
              onClick={() => setAppointmentType('instant')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                appointmentType === 'instant'
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Video className="w-6 h-6 mx-auto mb-2" />
              <p className="font-bold">Instant Video Call</p>
              <p className="text-xs mt-1 opacity-80">Connect now (2-5 min wait)</p>
            </button>
            <button
              onClick={() => setAppointmentType('scheduled')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                appointmentType === 'scheduled'
                  ? 'bg-blue-600 border-blue-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Calendar className="w-6 h-6 mx-auto mb-2" />
              <p className="font-bold">Schedule Appointment</p>
              <p className="text-xs mt-1 opacity-80">Book for later</p>
            </button>
          </div>
        </div>

        {/* Doctor List */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Available Specialists</h3>
          <div className="space-y-4">
            {specialists.map((doctor) => (
              <div
                key={doctor.id}
                className={`bg-slate-800 border rounded-xl p-4 transition-all ${
                  selectedDoctor?.id === doctor.id
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Doctor Avatar */}
                  <div className="text-6xl">{doctor.image}</div>

                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-white">{doctor.name}</h4>
                        <p className="text-blue-400 text-sm">{doctor.specialty}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>🩺 {doctor.experience} exp.</span>
                          <span>⭐ {doctor.rating} ({doctor.reviews} reviews)</span>
                          <span>🗣️ {doctor.languages.join(', ')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">₹{doctor.consultationFee}</p>
                        <p className="text-xs text-slate-400">per consultation</p>
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <div className="mt-3">
                      {doctor.available ? (
                        <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          Available {doctor.nextAvailable}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          Next: {doctor.nextAvailable}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      {appointmentType === 'instant' && doctor.available ? (
                        <button
                          onClick={() => handleStartVideoCall(doctor)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all hover:scale-105"
                        >
                          <Video className="w-4 h-4" />
                          Start Video Call
                        </button>
                      ) : appointmentType === 'scheduled' ? (
                        <>
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
                          />
                          <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
                          />
                          <button
                            onClick={() => handleScheduleAppointment(doctor)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                          >
                            <Calendar className="w-4 h-4" />
                            Book Appointment
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-500 rounded-lg cursor-not-allowed"
                        >
                          Not Available Now
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedDoctor(doctor)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-slate-800/50 p-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-6">
              <span>🔒 End-to-end encrypted</span>
              <span>💳 Secure payment gateway</span>
              <span>📧 Email & SMS confirmation</span>
              <span>🩺 Prescription delivered digitally</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseInfoModal;
