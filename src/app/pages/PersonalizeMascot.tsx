import { useState, useEffect } from "react";
import { ArrowLeft, Sparkles, User, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { getUserSettings, saveUserSettings, UserSettings } from "@/app/utils/userSettings";
import { JournalMascot } from "@/app/components/JournalMascot";

export default function PersonalizeMascot() {
  const [settings, setSettings] = useState<UserSettings>(getUserSettings());
  const [saved, setSaved] = useState(false);

  const mascotStyles = [
    { value: 'encouraging', label: 'Encouraging', description: 'Supportive and uplifting' },
    { value: 'reflective', label: 'Reflective', description: 'Thoughtful and introspective' },
    { value: 'playful', label: 'Playful', description: 'Light-hearted and fun' },
  ] as const;

  const mascotVoices = [
    { value: 'warm', label: 'Warm', description: 'Gentle and comforting' },
    { value: 'professional', label: 'Professional', description: 'Clear and structured' },
    { value: 'friendly', label: 'Friendly', description: 'Casual and approachable' },
  ] as const;

  const handleSave = () => {
    saveUserSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col px-4 md:px-6 pb-24 pt-6 md:pt-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-foreground/70" />
        </Link>
        <div>
          <h1 className="text-2xl text-foreground/90">Personalize Your Experience</h1>
          <p className="text-sm text-muted-foreground/70">
            Customize your journal companion
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-8">
        {/* Your Name */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary/60" />
            <h2 className="text-lg text-foreground/80">Your Name</h2>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-[24px] border border-primary/10 p-6">
            <label className="block text-sm text-muted-foreground/70 mb-3">
              How should we address you?
            </label>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              className="w-full px-4 py-3 bg-background/50 rounded-[16px] border border-primary/10 focus:border-primary/30 focus:outline-none text-foreground/90"
              placeholder="Enter your name"
            />
          </div>
        </section>

        {/* Mascot Settings */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary/60" />
            <h2 className="text-lg text-foreground/80">Your Companion</h2>
          </div>

          <div className="space-y-4">
            {/* Mascot Name */}
            <div className="bg-card/60 backdrop-blur-sm rounded-[24px] border border-primary/10 p-6">
              <label className="block text-sm text-muted-foreground/70 mb-3">
                Companion Name
              </label>
              <input
                type="text"
                value={settings.mascotName}
                onChange={(e) => setSettings({ ...settings, mascotName: e.target.value })}
                className="w-full px-4 py-3 bg-background/50 rounded-[16px] border border-primary/10 focus:border-primary/30 focus:outline-none text-foreground/90"
                placeholder="Give your companion a name"
              />
            </div>

            {/* Mascot Style */}
            <div className="bg-card/60 backdrop-blur-sm rounded-[24px] border border-primary/10 p-6">
              <label className="block text-sm text-muted-foreground/70 mb-4">
                Conversation Style
              </label>
              <div className="space-y-3">
                {mascotStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSettings({ ...settings, mascotStyle: style.value })}
                    className={`w-full text-left p-4 rounded-[16px] border transition-all ${
                      settings.mascotStyle === style.value
                        ? 'bg-primary/10 border-primary/30 shadow-sm'
                        : 'bg-background/30 border-primary/10 hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-foreground/90 font-medium mb-1">{style.label}</div>
                        <div className="text-sm text-muted-foreground/60">{style.description}</div>
                      </div>
                      {settings.mascotStyle === style.value && (
                        <div className="w-5 h-5 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mascot Voice */}
            <div className="bg-card/60 backdrop-blur-sm rounded-[24px] border border-primary/10 p-6">
              <label className="block text-sm text-muted-foreground/70 mb-4">
                Voice Tone
              </label>
              <div className="space-y-3">
                {mascotVoices.map((voice) => (
                  <button
                    key={voice.value}
                    onClick={() => setSettings({ ...settings, mascotVoice: voice.value })}
                    className={`w-full text-left p-4 rounded-[16px] border transition-all ${
                      settings.mascotVoice === voice.value
                        ? 'bg-primary/10 border-primary/30 shadow-sm'
                        : 'bg-background/30 border-primary/10 hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-foreground/90 font-medium mb-1">{voice.label}</div>
                        <div className="text-sm text-muted-foreground/60">{voice.description}</div>
                      </div>
                      {settings.mascotVoice === voice.value && (
                        <div className="w-5 h-5 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full px-6 py-4 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 rounded-[24px] border border-primary/30 text-primary font-medium transition-all hover:scale-[1.02] hover:shadow-lg"
        >
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>

        {/* Mascot Color Customization */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary/60" />
            <h2 className="text-lg text-foreground/80">Mascot Colors</h2>
          </div>
          <div className="bg-card/60 backdrop-blur-sm rounded-[24px] border border-primary/10 p-6">
            <div className="flex justify-center">
              <JournalMascot size={280} showCustomization={true} />
            </div>
          </div>
        </section>

        {/* Preview */}
        <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-[24px] border border-primary/10 p-6">
          <h3 className="text-foreground/80 font-medium mb-4">Preview</h3>
          <div className="bg-card/60 backdrop-blur-sm rounded-[20px] p-5 border border-primary/10">
            <p className="text-foreground/85 leading-relaxed">
              <span className="font-medium text-primary">{settings.mascotName}:</span>{' '}
              {settings.mascotStyle === 'encouraging' && `"Hey ${settings.username}! You've got this! 💪 I'm here to support you every step of the way."`}
              {settings.mascotStyle === 'reflective' && `"${settings.username}, let's take a moment to reflect on your thoughts. What's truly on your mind today?"`}
              {settings.mascotStyle === 'playful' && `"Hey ${settings.username}! ✨ What awesome things are happening in your world today?"`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}