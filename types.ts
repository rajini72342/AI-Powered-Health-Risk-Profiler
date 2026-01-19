
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface HealthSurveyAnswers {
  age?: number;
  smoker?: boolean;
  exercise?: string;
  diet?: string;
  [key: string]: any;
}

export interface ParsingResult {
  answers: HealthSurveyAnswers;
  missing_fields: string[];
  confidence: number;
  status: 'ok' | 'incomplete_profile';
  reason?: string;
}

export interface FactorExtractionResult {
  factors: string[];
  confidence: number;
}

export interface RiskClassificationResult {
  risk_level: RiskLevel;
  score: number;
  rationale: string[];
}

export interface FinalRecommendationResult {
  risk_level: RiskLevel;
  factors: string[];
  recommendations: string[];
  status: 'ok' | 'error';
}

export interface ProfilePipelineResult {
  parsing: ParsingResult;
  factors?: FactorExtractionResult;
  classification?: RiskClassificationResult;
  final?: FinalRecommendationResult;
}
