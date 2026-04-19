'use client';
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installation accepted');
    } else {
      console.log('PWA installation dismissed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-sm bg-primary-600 text-white rounded-xl p-4 shadow-lg z-50 animate-in slide-in-from-bottom">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Download size={16} />
            <span className="font-medium text-sm">Install Silah</span>
          </div>
          <p className="text-xs opacity-90">
            Add Silah to your home screen for quick access to daily Quran readings and circle updates.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="bg-white text-primary-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-primary-50 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors text-xs"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
