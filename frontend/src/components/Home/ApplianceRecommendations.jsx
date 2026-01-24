import React, { useState } from 'react';
import { Wind, Droplet, Fan, Leaf, ShoppingCart, Zap, Star, TrendingUp, ExternalLink, Clock, MapPin } from 'lucide-react';

const ApplianceRecommendations = ({ currentAQI, roomType }) => {
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Smart appliance recommendations based on AQI
  const appliances = [
    {
      id: 1,
      name: 'Mi Air Purifier 3 (HEPA Filter)',
      brand: 'Xiaomi',
      category: 'Air Purifier',
      icon: Wind,
      price: 9999,
      originalPrice: 12999,
      discount: 23,
      rating: 4.5,
      reviews: 12453,
      delivery: '10 mins',
      coverage: '484 sq ft',
      features: [
        'True HEPA Filter',
        'Removes 99.97% pollutants',
        'Real-time AQI display',
        'App control & scheduling',
        'Auto mode with sensors',
        'Low noise (32 dB)',
      ],
      blinkitUrl: 'https://blinkit.com/prn/mi-air-purifier-3/prid/449041',
      recommended: currentAQI > 100,
      urgency: currentAQI > 150 ? 'HIGH' : currentAQI > 100 ? 'MEDIUM' : 'LOW',
      image: '🌬️',
    },
    {
      id: 2,
      name: 'Philips AC1215/20 Air Purifier',
      brand: 'Philips',
      category: 'Air Purifier',
      icon: Wind,
      price: 12999,
      originalPrice: 16999,
      discount: 24,
      rating: 4.6,
      reviews: 8234,
      delivery: '15 mins',
      coverage: '678 sq ft',
      features: [
        'VitaShield IPS technology',
        'Removes 99.97% particles',
        'PM2.5 & allergen sensor',
        'Sleep mode',
        'Filter replacement indicator',
        'Child lock',
      ],
      blinkitUrl: 'https://blinkit.com/prn/philips-air-purifier/prid/449042',
      recommended: currentAQI > 120,
      urgency: currentAQI > 150 ? 'HIGH' : currentAQI > 120 ? 'MEDIUM' : 'LOW',
      image: '💨',
    },
    {
      id: 3,
      name: 'Honeywell Air Touch i8 Purifier',
      brand: 'Honeywell',
      category: 'Air Purifier',
      icon: Wind,
      price: 8999,
      originalPrice: 11999,
      discount: 25,
      rating: 4.4,
      reviews: 6789,
      delivery: '10 mins',
      coverage: '387 sq ft',
      features: [
        'HEPA + Pre-filter',
        'Removes smoke & odor',
        'Touch control panel',
        '3-stage filtration',
        'Energy efficient',
        'Compact design',
      ],
      blinkitUrl: 'https://blinkit.com/prn/honeywell-air-purifier/prid/449043',
      recommended: currentAQI > 80,
      urgency: currentAQI > 100 ? 'MEDIUM' : 'LOW',
      image: '🌪️',
    },
    {
      id: 4,
      name: 'Atomberg Efficio Plus Ceiling Fan',
      brand: 'Atomberg',
      category: 'Smart Fan',
      icon: Fan,
      price: 3499,
      originalPrice: 4999,
      discount: 30,
      rating: 4.7,
      reviews: 15234,
      delivery: '20 mins',
      coverage: 'Up to 400 sq ft',
      features: [
        'Remote control',
        'BLDC motor (65% energy savings)',
        'Boost mode for instant cooling',
        'Timer function',
        'Reversible for ventilation',
        '2-year warranty',
      ],
      blinkitUrl: 'https://blinkit.com/prn/atomberg-fan/prid/449044',
      recommended: currentAQI < 100,
      urgency: 'LOW',
      image: '🌀',
    },
    {
      id: 5,
      name: 'Green Indoor Plant Pack (Set of 3)',
      brand: 'Nurserylive',
      category: 'Air Purifying Plants',
      icon: Leaf,
      price: 599,
      originalPrice: 899,
      discount: 33,
      rating: 4.3,
      reviews: 3421,
      delivery: '30 mins',
      coverage: 'Natural air filtration',
      features: [
        'Snake Plant + Areca Palm + Money Plant',
        'Removes formaldehyde & benzene',
        'Low maintenance',
        'NASA recommended',
        'Includes ceramic pots',
        'Care guide included',
      ],
      blinkitUrl: 'https://blinkit.com/prn/air-purifying-plants/prid/449045',
      recommended: true,
      urgency: 'LOW',
      image: '🪴',
    },
    {
      id: 6,
      name: 'Dyson Pure Cool TP04 Tower Fan',
      brand: 'Dyson',
      category: 'Air Purifier + Fan',
      icon: Wind,
      price: 39900,
      originalPrice: 49900,
      discount: 20,
      rating: 4.8,
      reviews: 2341,
      delivery: '25 mins',
      coverage: '1000+ sq ft',
      features: [
        'HEPA + Activated Carbon filter',
        'Air Multiplier technology',
        'Oscillation & tilt',
        'App & Alexa control',
        'Real-time air quality reports',
        'Bladeless design',
      ],
      blinkitUrl: 'https://blinkit.com/prn/dyson-pure-cool/prid/449046',
      recommended: currentAQI > 150,
      urgency: currentAQI > 200 ? 'HIGH' : 'MEDIUM',
      image: '💨',
    },
    {
      id: 7,
      name: 'Room Dehumidifier & Air Purifier',
      brand: 'Havells',
      category: 'Dehumidifier',
      icon: Droplet,
      price: 7999,
      originalPrice: 10999,
      discount: 27,
      rating: 4.2,
      reviews: 1876,
      delivery: '18 mins',
      coverage: '300 sq ft',
      features: [
        'Removes excess moisture',
        'Prevents mold & bacteria',
        'HEPA filtration',
        'Auto shut-off',
        'Portable design',
        'Low energy consumption',
      ],
      blinkitUrl: 'https://blinkit.com/prn/dehumidifier/prid/449047',
      recommended: roomType === 'BATHROOM' || roomType === 'KITCHEN',
      urgency: 'LOW',
      image: '💧',
    },
    {
      id: 8,
      name: 'N95 Mask Pack (50 masks)',
      brand: '3M',
      category: 'Personal Protection',
      icon: Wind,
      price: 1299,
      originalPrice: 1799,
      discount: 28,
      rating: 4.6,
      reviews: 8765,
      delivery: '8 mins',
      coverage: 'Personal use',
      features: [
        'Filters 95% of airborne particles',
        'Adjustable nose clip',
        'Comfortable fit',
        'FDA approved',
        'Individual packaging',
        'Long shelf life',
      ],
      blinkitUrl: 'https://blinkit.com/prn/n95-masks/prid/449048',
      recommended: currentAQI > 150,
      urgency: currentAQI > 200 ? 'HIGH' : 'MEDIUM',
      image: '😷',
    },
  ];

  // Sort appliances: recommended first, then by urgency
  const sortedAppliances = appliances.sort((a, b) => {
    const urgencyOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
  });

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'MEDIUM':
        return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'LOW':
        return 'bg-green-500/20 text-green-400 border-green-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const handleBlinkitOrder = (appliance) => {
    // Direct Blinkit integration - open product page
    window.open(appliance.blinkitUrl, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            Smart Appliances
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            AQI-based recommendations • Quick delivery via Blinkit
          </p>
        </div>
        <div className="flex items-center gap-1 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/30">
          <Clock className="w-3 h-3 text-green-400" />
          <span className="text-green-400 text-xs font-semibold">10-30 min</span>
        </div>
      </div>

      {/* AQI Alert */}
      {currentAQI > 100 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <Wind className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-400 text-sm mb-0.5">⚠️ Poor Air Quality</h3>
              <p className="text-slate-300 text-xs">
                AQI {currentAQI} - Consider using an air purifier
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Appliances Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sortedAppliances.slice(0, 4).map((appliance) => {
          const Icon = appliance.icon;
          
          return (
            <div
              key={appliance.id}
              className={`bg-slate-800/50 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer ${
                appliance.recommended
                  ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => handleBlinkitOrder(appliance)}
            >
              {/* Product Image/Icon */}
              <div className="relative p-3 text-center bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-t-lg">
                <div className="text-4xl mb-1">{appliance.image}</div>
                
                {/* Badges */}
                {appliance.recommended && (
                  <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                    Recommended
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="p-2">
                <div className="mb-2">
                  <p className="text-[10px] text-slate-400 uppercase">{appliance.brand}</p>
                  <h3 className="text-xs font-bold text-white mb-1 line-clamp-2 leading-tight">{appliance.name}</h3>
                  <div className="flex items-center gap-1 text-[10px]">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-white">{appliance.rating}</span>
                    <span className="text-slate-400">({appliance.reviews.toLocaleString()})</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-white">₹{appliance.price.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 line-through">₹{appliance.originalPrice.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-semibold">
                    {appliance.discount}% OFF
                  </span>
                </div>

                {/* Delivery Badge */}
                <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded mb-2">
                  <Zap className="w-2.5 h-2.5 text-green-400" />
                  <span className="text-green-400 text-[10px] font-semibold">{appliance.delivery}</span>
                </div>

                {/* Order Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlinkitOrder(appliance);
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-all text-[11px]"
                >
                  <ShoppingCart className="w-3 h-3" />
                  Order
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="mt-3 text-center">
        <button
          onClick={() => setShowAllProducts(true)}
          className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
        >
          View All {sortedAppliances.length} Products →
        </button>
      </div>

      {/* All Products Modal */}
      {showAllProducts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAllProducts(false)}>
          <div className="bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex items-center justify-between z-10 border-b border-cyan-400">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  All Smart Appliances
                </h2>
                <p className="text-white/80 text-xs mt-1">
                  {sortedAppliances.length} products • AQI-based recommendations
                </p>
              </div>
              <button
                onClick={() => setShowAllProducts(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Products Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sortedAppliances.map((appliance) => (
                  <div
                    key={appliance.id}
                    className={`bg-slate-800/50 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer ${
                      appliance.recommended
                        ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => handleBlinkitOrder(appliance)}
                  >
                    {/* Product Image/Icon */}
                    <div className="relative p-3 text-center bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-t-lg">
                      <div className="text-4xl mb-1">{appliance.image}</div>
                      
                      {/* Badges */}
                      {appliance.recommended && (
                        <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
                          Recommended
                        </span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-2">
                      <div className="mb-2">
                        <p className="text-[10px] text-slate-400 uppercase">{appliance.brand}</p>
                        <h3 className="text-xs font-bold text-white mb-1 line-clamp-2 leading-tight">{appliance.name}</h3>
                        <div className="flex items-center gap-1 text-[10px]">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-white">{appliance.rating}</span>
                          <span className="text-slate-400">({appliance.reviews.toLocaleString()})</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-white">₹{appliance.price.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 line-through">₹{appliance.originalPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-semibold">
                          {appliance.discount}% OFF
                        </span>
                      </div>

                      {/* Delivery Badge */}
                      <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded mb-2">
                        <Zap className="w-2.5 h-2.5 text-green-400" />
                        <span className="text-green-400 text-[10px] font-semibold">{appliance.delivery}</span>
                      </div>

                      {/* Order Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlinkitOrder(appliance);
                        }}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-all text-[11px]"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Order
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-4 flex justify-end">
              <button
                onClick={() => setShowAllProducts(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Appliance Modal */}
      {selectedAppliance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAppliance(null)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full p-6 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-6xl mb-2">{selectedAppliance.image}</div>
                <h3 className="text-2xl font-bold text-white">{selectedAppliance.name}</h3>
                <p className="text-slate-400">{selectedAppliance.brand} • {selectedAppliance.category}</p>
              </div>
              <button
                onClick={() => setSelectedAppliance(null)}
                className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white mb-2">All Features:</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {selectedAppliance.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white">₹{selectedAppliance.price.toLocaleString()}</span>
                <span className="text-lg text-slate-400 line-through">₹{selectedAppliance.originalPrice.toLocaleString()}</span>
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-semibold">
                  Save ₹{(selectedAppliance.originalPrice - selectedAppliance.price).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => handleBlinkitOrder(selectedAppliance)}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg text-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Order Now from Blinkit • Delivery in {selectedAppliance.delivery}
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplianceRecommendations;
