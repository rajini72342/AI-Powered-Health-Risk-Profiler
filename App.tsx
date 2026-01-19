
import React, { useState, useCallback, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { ProfilePipelineResult, RiskLevel } from './types';
import { 
  Heart, 
  Upload, 
  Camera, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  ArrowRight,
  RefreshCw,
  ClipboardCheck,
  Stethoscope
} from 'lucide-react';

const gemini = new GeminiService();

const App: React.FC = () => {
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [inputText, setInputText] = useState<string>('{"age":42,"smoker":true,"exercise":"rarely","diet":"high sugar"}');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProfilePipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const runPipeline = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let finalResult: ProfilePipelineResult;
      
      if (inputMode === 'image' && imageFile) {
        const base64 = await fileToBase64(imageFile);
        finalResult = await gemini.processHealthForm({
          data: base64,
          mimeType: imageFile.type
        });
      } else {
        finalResult = await gemini.processHealthForm(inputText);
      }

      setResult(finalResult);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setImageFile(null);
    setImagePreview(null);
    setInputText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 text-slate-800">
      {/* Header */}
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
          <Heart className="text-white w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          VitalScan <span className="text-blue-600">Health Profiler</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Intelligent health risk analysis from lifestyle surveys. 
          Upload a photo of your form or enter data manually.
        </p>
      </header>

      {/* Main UI Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
        {!result && !isLoading && (
          <div className="p-8">
            {/* Input Mode Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-8 w-fit mx-auto">
              <button
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                  inputMode === 'text' 
                    ? 'bg-white text-blue-600 shadow-sm font-semibold' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText size={18} />
                Text Input
              </button>
              <button
                onClick={() => setInputMode('image')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                  inputMode === 'image' 
                    ? 'bg-white text-blue-600 shadow-sm font-semibold' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Camera size={18} />
                Scan Form
              </button>
            </div>

            {/* Input Area */}
            {inputMode === 'text' ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Lifestyle Data (JSON or Raw Text)</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder='e.g. Age: 42, Smoker: Yes, Exercise: Rarely, Diet: High Sugar'
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700 text-center">Upload Form Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl shadow-md" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <Upload className="text-white w-8 h-8" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <Upload size={32} />
                      </div>
                      <p className="text-slate-600 font-medium">Click to upload or drag & drop</p>
                      <p className="text-slate-400 text-sm mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-10 flex justify-center">
              <button
                disabled={inputMode === 'image' ? !imageFile : !inputText.trim()}
                onClick={runPipeline}
                className="group relative flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Start Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="p-20 text-center">
            <div className="relative inline-block mb-6">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              <Activity className="absolute inset-0 m-auto w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Health Profile</h3>
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Performing OCR & Text Parsing...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Extracting Health Risk Factors...</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Classifying Risks & Scoring...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={reset}
              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results State */}
        {result && (
          <div className="divide-y divide-slate-100">
            {/* Header Result */}
            <div className="p-8 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
                <p className="text-slate-500">Comprehensive Health Risk Profile</p>
              </div>
              <button 
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
              >
                <RefreshCw size={16} />
                New Scan
              </button>
            </div>

            {/* Step 1: Parsing & Guardrails */}
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <ClipboardCheck size={20} />
                  </div>
                  <h3 className="font-bold text-lg">Step 1: Data Parsing</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confidence</span>
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                    {Math.round(result.parsing.confidence * 100)}%
                  </div>
                </div>
              </div>

              {result.parsing.status === 'incomplete_profile' ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
                  <AlertTriangle className="text-amber-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-amber-900">Incomplete Profile</h4>
                    <p className="text-amber-700 text-sm">{result.parsing.reason}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.parsing.answers).map(([key, value]) => (
                    <div key={key} className="p-3 bg-white border border-slate-200 rounded-xl">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-1">{key}</div>
                      <div className="text-slate-800 font-semibold truncate capitalize">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                      </div>
                    </div>
                  ))}
                  {result.parsing.missing_fields.map((field) => (
                    <div key={field} className="p-3 bg-red-50 border border-red-100 rounded-xl">
                      <div className="text-xs text-red-400 uppercase font-bold mb-1">{field}</div>
                      <div className="text-red-600 italic text-sm">Missing</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2 & 3: Factors & Risk */}
            {result.factors && result.classification && result.parsing.status !== 'incomplete_profile' && (
              <div className="p-8 grid md:grid-cols-2 gap-8 bg-white">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <Activity size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Step 2: Risk Factors</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.factors.factors.map((factor, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                      <Stethoscope size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Step 3: Risk Classification</h3>
                  </div>
                  <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-center">
                      <div className={`text-3xl font-black mb-1 ${
                        result.classification.risk_level === 'high' ? 'text-red-600' :
                        result.classification.risk_level === 'medium' ? 'text-orange-500' :
                        'text-green-600'
                      }`}>
                        {result.classification.score}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Risk Score</div>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-200" />
                    <div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${
                        result.classification.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                        result.classification.risk_level === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {result.classification.risk_level} Risk
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic">
                        Non-diagnostic heuristic analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Recommendations */}
            {result.final && result.parsing.status !== 'incomplete_profile' && (
              <div className="p-8 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-200">
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900">Step 4: Wellness Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {result.final.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md">
                      <div className="w-8 h-8 shrink-0 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {i + 1}
                      </div>
                      <p className="text-slate-700 font-medium pt-1 leading-snug">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-white/50 border border-slate-200 rounded-xl text-[10px] text-slate-400 uppercase tracking-widest text-center">
                  Disclaimer: This is an AI-generated profile and does not constitute medical advice or diagnosis. Consult a healthcare professional.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-8 text-center text-slate-400 text-sm">
        <p>&copy; 2024 VitalScan AI Systems. Built for secure health form analysis.</p>
      </footer>
    </div>
  );
};

export default App;
