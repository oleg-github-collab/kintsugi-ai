'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Card } from '../ui/Card';
import api from '@/lib/api';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'uk', name: 'Українська' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'pl', name: 'Polski' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
];

const SERVICES = [
  {
    id: 'deepl',
    name: 'DeepL',
    plan: 'Kintsugi Basic',
    description: 'High-quality translation for documents up to 30MB',
    color: 'kintsugi-gold',
  },
  {
    id: 'otranslator',
    name: 'o.translator',
    plan: 'Kintsugi Epic',
    description: 'Advanced AI translation with context understanding',
    color: 'cyber-pink',
  },
];

export const TranslationInterface: React.FC = () => {
  const { accessToken } = useAuthStore();
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('uk');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedService, setSelectedService] = useState('deepl');
  const [pricing, setPricing] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleCalculatePricing = async () => {
    if (!sourceText.trim() || !accessToken) return;

    try {
      const data: any = await api.translation.getPricing(
        selectedService,
        sourceText.length,
        accessToken
      );
      setPricing(data);
    } catch (error) {
      console.error('Calculate pricing error:', error);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim() || !accessToken) return;

    setIsTranslating(true);
    try {
      const result: any = await api.translation.translate(
        {
          source_language: sourceLanguage,
          target_language: targetLanguage,
          text: sourceText,
          service: selectedService,
        },
        accessToken
      );
      setTranslatedText(result.translated_text);
      setPricing({
        estimated_cost: result.cost,
        estimated_chunks: result.chunk_count,
      });
    } catch (error: any) {
      console.error('Translation error:', error);
      alert(error.message || 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const charCount = sourceText.length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-mono font-bold text-kintsugi-gold mb-2">
          🌐 Translation
        </h1>
        <p className="text-digital-white/60 font-mono">
          Translate large texts and books with AI-powered translation services
        </p>
      </div>

      {/* Service Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {SERVICES.map((service) => (
          <Card
            key={service.id}
            variant={selectedService === service.id ? 'pink' : 'default'}
            className="cursor-pointer"
            onClick={() => setSelectedService(service.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-mono font-bold text-digital-white">
                  {service.name}
                </h3>
                <p className={`text-sm font-mono text-${service.color} mt-1`}>
                  {service.plan}
                </p>
                <p className="text-sm font-mono text-digital-white/60 mt-2">
                  {service.description}
                </p>
              </div>
              {selectedService === service.id && (
                <span className="text-2xl">✓</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Language Selection */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block font-mono font-bold text-kintsugi-gold mb-2">
            Source Language
          </label>
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="w-full px-4 py-3 font-mono bg-digital-black border-3 border-kintsugi-gold text-digital-white shadow-neo outline-none min-h-[48px]"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-mono font-bold text-kintsugi-gold mb-2">
            Target Language
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full px-4 py-3 font-mono bg-digital-black border-3 border-kintsugi-gold text-digital-white shadow-neo outline-none min-h-[48px]"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Translation Area */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <Textarea
            label="Source Text"
            placeholder="Enter text to translate..."
            value={sourceText}
            onChange={(e) => {
              setSourceText(e.target.value);
              if (e.target.value.length > 0) {
                handleCalculatePricing();
              }
            }}
            className="min-h-[400px] font-mono"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-mono text-digital-white/60">
              {charCount.toLocaleString()} characters
            </span>
            {pricing && (
              <span className="text-sm font-mono text-kintsugi-gold">
                ~{pricing.estimated_chunks} chunks · ${pricing.estimated_cost.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div>
          <Textarea
            label="Translated Text"
            placeholder="Translation will appear here..."
            value={translatedText}
            readOnly
            className="min-h-[400px] font-mono bg-digital-black/50"
          />
        </div>
      </div>

      {/* Pricing Info */}
      {pricing && (
        <Card variant="cyan" className="mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-mono text-digital-white/60 mb-1">
                Service Plan
              </p>
              <p className="text-lg font-mono font-bold text-cyber-cyan">
                {SERVICES.find((s) => s.id === selectedService)?.plan}
              </p>
            </div>
            <div>
              <p className="text-sm font-mono text-digital-white/60 mb-1">
                Price per 1800 chars
              </p>
              <p className="text-lg font-mono font-bold text-cyber-cyan">
                ${pricing.price_per_1800?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm font-mono text-digital-white/60 mb-1">
                Estimated Cost
              </p>
              <p className="text-lg font-mono font-bold text-cyber-cyan">
                ${pricing.estimated_cost?.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || isTranslating}
          className="flex-1"
        >
          {isTranslating ? '⏳ Translating...' : '🌐 Translate'}
        </Button>
        <Button variant="ghost" onClick={() => setShowHistory(!showHistory)}>
          📜 History
        </Button>
      </div>

      {/* Translation History */}
      {showHistory && <TranslationHistory />}
    </div>
  );
};

const TranslationHistory: React.FC = () => {
  const { accessToken } = useAuthStore();
  const [translations, setTranslations] = useState<any[]>([]);

  React.useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!accessToken) return;

    try {
      const data: any = await api.translation.list(accessToken);
      setTranslations(data);
    } catch (error) {
      console.error('Load history error:', error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-mono font-bold text-cyber-pink mb-4">
        Translation History
      </h2>
      <div className="space-y-4">
        {translations.length === 0 ? (
          <p className="text-center text-digital-white/40 font-mono">
            No translations yet
          </p>
        ) : (
          translations.map((t) => (
            <Card key={t.id} variant="pink">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-mono text-cyber-pink">
                      {t.source_language.toUpperCase()} → {t.target_language.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-digital-white/40">
                      {t.plan}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-digital-white/80 line-clamp-2">
                    {t.source_text}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs font-mono text-digital-white/60">
                    <span>{t.char_count.toLocaleString()} chars</span>
                    <span>${t.cost.toFixed(2)}</span>
                    <span className={`${
                      t.status === 'completed' ? 'text-matrix-green' :
                      t.status === 'failed' ? 'text-neon-orange' :
                      'text-cyber-cyan'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
