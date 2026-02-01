import { useState } from "react";
import { ArrowLeft, Shield, Lock, Eye, EyeOff, Trash2, Download, Key, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteAllEntries, getAllEntries } from "@/app/utils/journalStorage";

export default function PrivacySettings() {
  // Privacy settings state
  const [biometricLock, setBiometricLock] = useState(true);
  const [autoLock, setAutoLock] = useState(true);
  const [lockTimeout, setLockTimeout] = useState("5");
  const [cloudBackup, setCloudBackup] = useState(false);
  const [hideOnScreenshots, setHideOnScreenshots] = useState(true);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  return (
    <div className="flex-1 flex flex-col px-6 pb-24 pt-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-foreground/70" />
        </Link>
        <div>
          <h1 className="text-2xl text-foreground/90">Privacy & Security</h1>
          <p className="text-sm text-muted-foreground/70">
            Manage your data and security preferences
          </p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-primary/5 backdrop-blur-sm rounded-[24px] p-6 mb-8 border border-primary/15">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary/80" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-foreground/90 font-medium mb-2">Your Privacy Matters</h3>
            <p className="text-sm text-muted-foreground/70 leading-relaxed">
              All your journal entries are stored locally on your device. We never access, read, or share your personal thoughts.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Security Section */}
        <section>
          <h2 className="text-lg text-foreground/80 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary/60" />
            Security
          </h2>
          <div className="bg-card/60 backdrop-blur-sm rounded-[24px] border border-primary/10 overflow-hidden">
            {/* Biometric Lock */}
            <div className="p-5 border-b border-primary/8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-foreground/90 font-medium mb-1">Biometric Lock</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Use fingerprint or face ID to unlock
                  </p>
                </div>
                <button
                  onClick={() => setBiometricLock(!biometricLock)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    biometricLock ? "bg-primary/80" : "bg-muted-foreground/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                      biometricLock ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Auto-Lock */}
            <div className="p-5 border-b border-primary/8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-foreground/90 font-medium mb-1">Auto-Lock</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Lock app when inactive
                  </p>
                </div>
                <button
                  onClick={() => setAutoLock(!autoLock)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    autoLock ? "bg-primary/80" : "bg-muted-foreground/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                      autoLock ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
              
              {autoLock && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm text-muted-foreground/70 mb-2 block">
                    Lock after
                  </label>
                  <select
                    value={lockTimeout}
                    onChange={(e) => setLockTimeout(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background/50 rounded-[16px] border border-primary/10 focus:border-primary/30 focus:outline-none text-foreground/90 text-sm"
                  >
                    <option value="1">1 minute</option>
                    <option value="5">5 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>
              )}
            </div>

            {/* Hide on Screenshots */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-foreground/90 font-medium mb-1">Hide on Screenshots</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Blur content when taking screenshots
                  </p>
                </div>
                <button
                  onClick={() => setHideOnScreenshots(!hideOnScreenshots)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    hideOnScreenshots ? "bg-primary/80" : "bg-muted-foreground/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                      hideOnScreenshots ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-lg text-foreground/80 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary/60" />
            Data Management
          </h2>
          <div className="bg-card/60 backdrop-blur-sm rounded-[24px] border border-primary/10 overflow-hidden">
            {/* Cloud Backup */}
            <div className="p-5 border-b border-primary/8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-foreground/90 font-medium mb-1">Cloud Backup</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Encrypted backup to your private cloud
                  </p>
                </div>
                <button
                  onClick={() => setCloudBackup(!cloudBackup)}
                  className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                    cloudBackup ? "bg-primary/80" : "bg-muted-foreground/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                      cloudBackup ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Export Data */}
            <div className="p-5 border-b border-primary/8">
              <button 
                onClick={() => {
                  // Export all entries as JSON
                  const entries = getAllEntries();
                  const dataStr = JSON.stringify(entries, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `journal-backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="w-full flex items-center gap-4 text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/15 transition-colors">
                  <Download className="w-5 h-5 text-secondary/70" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground/90 font-medium mb-1">Export All Data</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Download your journal as JSON or PDF
                  </p>
                </div>
              </button>
            </div>

            {/* Delete All Data */}
            <div className="p-5">
              <button
                onClick={() => setShowDeleteWarning(!showDeleteWarning)}
                className="w-full flex items-center gap-4 text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/15 transition-colors">
                  <Trash2 className="w-5 h-5 text-red-500/70" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-500/90 font-medium mb-1">Delete All Data</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Permanently erase all journal entries
                  </p>
                </div>
              </button>

              {/* Delete Warning */}
              {showDeleteWarning && (
                <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-[16px] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-500/80 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-red-500/90 font-medium mb-1">Are you absolutely sure?</h4>
                      <p className="text-sm text-muted-foreground/70">
                        This action cannot be undone. All your journal entries will be permanently deleted.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteWarning(false)}
                      className="flex-1 px-4 py-2.5 bg-background/80 rounded-[16px] text-sm text-foreground/80 hover:bg-background transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Handle delete
                        deleteAllEntries();
                        setShowDeleteWarning(false);
                      }}
                      className="flex-1 px-4 py-2.5 bg-red-500/20 rounded-[16px] text-sm text-red-500 hover:bg-red-500/30 transition-colors font-medium"
                    >
                      Delete Everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Privacy Information */}
        <div className="bg-card/40 backdrop-blur-sm rounded-[24px] p-6 border border-primary/8">
          <h3 className="text-foreground/80 font-medium mb-3">Privacy Commitment</h3>
          <ul className="space-y-2 text-sm text-muted-foreground/70">
            <li className="flex gap-2">
              <span className="text-primary/60">•</span>
              <span>Your data never leaves your device unless you enable cloud backup</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary/60">•</span>
              <span>We don't track, analyze, or monetize your journal content</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary/60">•</span>
              <span>No third-party analytics or advertising partners</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary/60">•</span>
              <span>End-to-end encryption for all cloud backups</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}