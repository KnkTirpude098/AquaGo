import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { PUNE_AREAS } from '../types';
import { Phone, Lock, User as UserIcon, Shield, ChevronRight, Droplet, Store, Compass, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const { language, login, signup } = useApp();
  const t = translations[language];

  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'supplier'>('customer');
  const [area, setArea] = useState('Kothrud');
  
  // OTP flow simulation states
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert(language === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका' : language === 'hi' ? 'कृपया वैध 10 अंकीय मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (isSignUp && !name) {
      alert(language === 'mr' ? 'कृपया पूर्ण नाव टाका' : language === 'hi' ? 'कृपया पूरा नाम दर्ज करें' : 'Please enter your full name');
      return;
    }
    
    // Simulate OTP sent
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
    }, 800);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      alert(language === 'mr' ? 'कृपया ६ अंकी ओटीपी प्रविष्ट करा' : language === 'hi' ? 'कृपया 6 अंकीय ओटीपी दर्ज करें' : 'Please enter a 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setTimeout(async () => {
      let success = false;
      if (isSignUp) {
        success = await signup(name, phone, role, area);
      } else {
        success = await login(phone);
        if (!success) {
          alert(language === 'mr' ? 'हा मोबाईल नंबर नोंदणीकृत नाही. कृपया साइन अप करा!' : language === 'hi' ? 'यह मोबाइल नंबर पंजीकृत नहीं है। कृपया साइन अप करें!' : 'This number is not registered. Please Sign Up first!');
          setIsSignUp(true);
          setStep('details');
        }
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 to-white" id="auth-screen-container">
      <div className="w-full max-w-md" id="auth-card-wrapper">
        
        {/* Top Branding Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-3.5 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/20 mb-3"
          >
            <Droplet className="h-8 w-8 fill-blue-100/10 text-white animate-bounce" />
          </motion.div>
          <h1 className="text-3xl font-display font-extrabold text-blue-900 tracking-tight">
            {t.appName}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {t.slogan}
          </p>
        </div>

        {/* Form Container Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border border-blue-50 shadow-xl rounded-3xl p-6 sm:p-8"
        >
          {step === 'details' ? (
            <div>
              {/* Login / Sign Up Tabs */}
              <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setPhone('');
                    setName('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    !isSignUp 
                      ? 'bg-white text-blue-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  id="auth-tab-login"
                >
                  {t.login}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setPhone('');
                    setName('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isSignUp 
                      ? 'bg-white text-blue-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                  id="auth-tab-signup"
                >
                  {t.signup}
                </button>
              </div>

              <h2 className="text-xl font-display font-bold text-gray-800 mb-2">
                {isSignUp ? t.authTitle : t.welcome}
              </h2>
              <p className="text-xs text-gray-400 mb-6 font-medium">
                {t.authSubtitle}
              </p>

              <form onSubmit={handleSendOtp} className="space-y-4">
                
                {/* Sign Up Fields */}
                {isSignUp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t.fullname}
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t.fullnamePlaceholder}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl text-gray-800 font-medium text-sm transition-all focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Role Picker */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t.roleSelector}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('customer')}
                          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                            role === 'customer'
                              ? 'border-blue-500 bg-blue-50/40 text-blue-800'
                              : 'border-gray-150 hover:border-gray-300 bg-white text-gray-600'
                          }`}
                        >
                          <Droplet className={`h-4.5 w-4.5 ${role === 'customer' ? 'text-blue-500' : 'text-gray-400'}`} />
                          <span>{t.customer}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('supplier')}
                          className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                            role === 'supplier'
                              ? 'border-green-500 bg-green-50/40 text-green-800'
                              : 'border-gray-150 hover:border-gray-300 bg-white text-gray-600'
                          }`}
                        >
                          <Store className={`h-4.5 w-4.5 ${role === 'supplier' ? 'text-green-500' : 'text-gray-400'}`} />
                          <span>{t.supplier}</span>
                        </button>
                      </div>
                    </div>

                    {/* Pune Area Selector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        {t.selectArea}
                      </label>
                      <div className="relative">
                        <Compass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <select
                          value={area}
                          onChange={(e) => setArea(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl text-gray-800 font-medium text-sm transition-all focus:outline-none appearance-none"
                        >
                          {PUNE_AREAS.map((a) => (
                            <option key={a.name} value={a.name}>
                              {a.name} ({a.pincode})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Mobile Input (Both Login/Signup) */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    {t.enterMobile}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder={t.mobilePlaceholder}
                      className="w-full pl-13 pr-4 py-3 bg-gray-50/50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl text-gray-800 font-medium text-sm transition-all focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-md shadow-blue-500/10 transition-colors cursor-pointer mt-2"
                >
                  <span>{isSubmitting ? '...' : t.sendOtp}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </form>

              {/* Toggle Switch helper */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors"
                >
                  {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex items-center space-x-1.5 text-gray-500 hover:text-gray-800 text-xs font-bold mb-6 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Go Back</span>
              </button>

              <h2 className="text-xl font-display font-bold text-gray-800 mb-2">
                {t.verifyOtp}
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                {t.enterOtp} <strong className="text-blue-900">+91 {phone}</strong>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    OTP Code
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder={t.otpPlaceholder}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-150 focus:border-blue-500 focus:bg-white rounded-xl text-gray-800 font-mono tracking-widest text-center text-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl flex items-start space-x-2 text-[11px] text-blue-800 font-medium">
                  <Shield className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>{t.demootp}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-md shadow-blue-500/10 transition-colors cursor-pointer mt-2"
                >
                  {isSubmitting ? '...' : t.verifyOtp}
                </button>
              </form>
            </div>
          )}
        </motion.div>
        
        {/* Footer Area notes */}
        <div className="text-center mt-6 text-[11px] text-gray-400 font-medium">
          Secure water delivery platform in association with verified water plants in Pune, MH.
        </div>
      </div>
    </div>
  );
};
