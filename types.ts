
export type PetCategory = 'MISSING' | 'RAINBOW' | 'TOGETHER' | 'GROWTH' | 'ADOPTION';

export interface FactSummary {
  name: string;
  subInfo: string; // Generic date info (Missing Date, Birthday, Passing Date)
  location: string;
  breedAndFeatures: string;
  situation: string; // Generic context (Missing details, Memorial message, Funny habit)
  ownerMessage: string;
}

export interface MusicDirection {
  genre: string;
  bpmRange: string;
  instruments: string;
  vocalStyle: string;
}

export interface SongTrack {
  titleKO: string;
  titleEN: string;
  stylePrompt: string;
  lyrics: string;
}

export interface YoutubePackage {
  title: string;
  descriptionKR: string;
  descriptionEN: string;
  tags: string[];
  hashtags: string[];
}

export interface ImagePrompt {
  section: string;
  imagePromptEN: string;
  negativePromptEN: string;
  aspectRatio: string;
  styleKeywords: string;
  generatedImage?: string; 
}

export interface VisualSettings {
  lighting: string;
  angle: string;
  background: string;
  style: string;
}

export interface MusicSettings {
  genre: string;
  mood: string;
  instruments: string;
  tempo: string;
}

export interface GenerationResult {
  category: PetCategory; // Added category to result
  factSummary: FactSummary;
  storyType: string;
  emotionalIntent: string;
  musicDirection: MusicDirection;
  track1: SongTrack;
  track2: SongTrack;
  youtubePackage: YoutubePackage;
  imagePrompts: ImagePrompt[];
}

export interface UploadedMedia {
  type: 'image' | 'video';
  data: string; // base64
  name: string;
}

export interface GenerationOptions {
  apiKey?: string;
  sourceText: string;
  category: PetCategory; // Added category to input options
  manualMusicStyle?: string;
  manualVisualStyle?: string; // Added manual visual style
  autoGenerateImages: boolean;
  aspectRatio: "1:1" | "4:3" | "16:9" | "9:16";
  visualSettings: VisualSettings;
  musicSettings: MusicSettings;
  referenceImages?: string[]; // Kept for backward compatibility/AI logic
  uploadedMedia?: UploadedMedia[]; // New field for mixed media
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: GenerationResult;
  sourceText: string;
}

export enum AppStep {
  INPUT = 'INPUT',
  CONFIRMATION = 'CONFIRMATION',
  GENERATING = 'GENERATING',
  RESULTS = 'RESULTS',
}
