import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  useColorScheme,
  Dimensions,
  Animated,
  Easing,
  UIManager,
  Switch,
  Keyboard,
  ToastAndroid,
  ActivityIndicator,
  BackHandler,
  Share,
  Linking
} from 'react-native';
import {
  Type,
  ArrowRight,
  Copy,
  X,
  Volume2,
  ChevronDown,
  Moon,
  Sun,
  Image as LucideImage,
  History,
  Search,
  Zap,
  ZapOff,
  Settings,
  Mic,
  Cpu,
  ChevronRight,
  Cloud,
  ChevronLeft,
  Server,
  Aperture,
  Camera,
  Square,
  Loader2,
  Speaker,
  Maximize,
  Minimize,
  ScanEye,
  FileText,
  MicOff,
  Clock,
  RotateCcw,
  Palette,
  Trash2,
  Triangle, 
  Ban,      
  Beaker,   
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Share2,
  MapPin
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { decode, encode } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- POLYFILLS ---
if (typeof atob === 'undefined') global.atob = decode;
if (typeof btoa === 'undefined') global.btoa = encode;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------------------------------------------------------
// 💾 STORAGE KEYS
// ---------------------------------------------------------
const STORAGE_KEYS = {
  history: '@scriptify_history',
  settings: '@scriptify_settings',
};

// ---------------------------------------------------------
// 📚 OFFICIAL INDIAN ROAD SIGNS DATABASE
// ---------------------------------------------------------
const ROAD_SIGNS_DB = [
  // --- MANDATORY SIGNS ---
  { label: "Stop", desc: "Driver should immediately stop." },
  { label: "Give Way", desc: "Give way to traffic on your right." },
  { label: "No Entry", desc: "Entry prohibited for all vehicles." },
  { label: "One Way", desc: "Traffic allowed in only one direction." },
  { label: "No Parking", desc: "Parking is prohibited in this area." },
  { label: "No Stopping", desc: "Stopping or standing is prohibited." },
  { label: "Speed Limit", desc: "Do not exceed the speed limit shown." },
  { label: "Right Turn Prohibited", desc: "Do not turn right." },
  { label: "Left Turn Prohibited", desc: "Do not turn left." },
  { label: "U-Turn Prohibited", desc: "Do not take a U-Turn." },
  { label: "Horn Prohibited", desc: "Silence Zone. Do not blow horn." },
    
  // --- CAUTIONARY SIGNS ---
  { label: "School Ahead", desc: "School nearby, drive slow." },
  { label: "Men at Work", desc: "Repair work in progress." },
  { label: "Cattle", desc: "Possibility of cattle on road." },
  { label: "Falling Rocks", desc: "Risk of falling rocks." },
  { label: "Cross Road", desc: "Road crossing ahead." },
  { label: "Roundabout", desc: "Roundabout ahead." },
  { label: "Hump", desc: "Speed breaker ahead." },
  { label: "Narrow Bridge", desc: "Bridge ahead is narrow." },
    
  // --- INFORMATORY SIGNS ---
  { label: "Petrol Pump", desc: "Petrol pump nearby." },
  { label: "Hospital", desc: "Hospital nearby." },
  { label: "Eating Place", desc: "Eating place nearby." },
  { label: "Parking", desc: "Authorized parking area." }
];

// ---------------------------------------------------------
// 📖 OFFLINE CORRECTION DICTIONARY (English -> Marathi/Devanagari)
// ---------------------------------------------------------
const WORD_CORRECTION_DB = {
  "as": "अॅज", "i": "आय", "his": "हिज़", "that": "दॅट", "he": "ही",
  "was": "वॉज", "for": "फॉर", "on": "ऑन", "are": "आर", "with": "विथ",
  "they": "दे", "be": "बी", "at": "ऍट", "one": "वन", "have": "हॅव",
  "this": "दिस", "from": "फ्रॉम", "by": "बाय", "hot": "हॉट", "word": "वर्ड",
  "but": "बट", "what": "वॉट", "some": "सम", "is": "इज", "it": "इट",
  "you": "यू", "or": "ऑर", "had": "हॅड", "the": "द", "of": "ऑव",
  "to": "टू", "and": "ऍंड", "a": "ए", "in": "इन", "we": "वी",
  "can": "कॅन", "out": "आऊट", "other": "अदर", "were": "वेअर", "which": "विच",
  "do": "डू", "their": "देअर", "time": "टाईम", "if": "इफ", "will": "विल",
  "how": "हाउ", "said": "सेड", "an": "ऍन", "each": "ईच", "tell": "टेल",
  "does": "डज", "set": "सेट", "three": "थ्री", "want": "वॉंट", "air": "एअर",
  "well": "वेल", "also": "ऑल्सो", "play": "प्ले", "small": "स्मॉल", "end": "एंड",
  "put": "पुट", "home": "होम", "read": "रीड", "hand": "हँड", "port": "पोर्ट",
  "large": "लार्ज", "spell": "स्पेल", "add": "ऍड", "even": "ईवन", "land": "लँड",
  "here": "हियर", "must": "मस्ट", "big": "बिग", "high": "हाई", "such": "सच",
  "follow": "फॉलो", "act": "ऍक्ट", "why": "वाई", "ask": "आस्क", "men": "मेन",
  "change": "चेंज", "went": "वेंट", "light": "लाईट", "kind": "काईंड", "off": "ऑफ",
  "need": "नीड", "house": "हाउस", "picture": "पिक्चर", "try": "ट्राय", "us": "अस"
};

// ---------------------------------------------------------
// 🧪 TEST PARAGRAPHS
// ---------------------------------------------------------
const TEST_PARAGRAPHS = {
  P1_ASCII: "Akshar aur dhvani har bhasha mein alag alag tarike se milkar shabd banate hain.",
  P2_HINDI: "भारत एक विशाल देश है और यहाँ अनेक भाषाएँ बोली जाती हैं।",
  P3_BENGALI: "আমার নাম রুদ্র এবং আমি অফলাইনে কাজ করি।",
  P4_MIXED: "Delhi Metro, Mumbai Local aur Kolkata Tram."
};

// ---------------------------------------------------------
// 🎨 DESIGN SYSTEM
// ---------------------------------------------------------
const THEME = {
  colors: {
    white: '#FFFFFF',
    black: '#000000',
    offWhite: '#F9FAFB',
    darkBg: '#000000',      
    darkCard: '#262626',    
    darkInput: '#171717',   
    pastelPeach: '#ffedd5',  
    pastelGreen: '#dcfce7',  
    pastelPurple: '#f3e8ff', 
    pastelBlue: '#e0f2fe',
    pastelPink: '#fce7f3',
    pastelYellow: '#fef9c3',
    pastelCyan: '#cffafe',
    gray: '#94a3b8',
    success: '#22c55e',
    error: '#ef4444',
  },
  borders: {
    width: 3,
    radius: 20, 
  },
};

const get3DStyle = (bgColor) => ({
  backgroundColor: bgColor,
  borderWidth: THEME.borders.width,
  borderColor: THEME.colors.black,
  borderRadius: THEME.borders.radius,
  borderBottomWidth: 6, 
  borderRightWidth: 4, 
});

// ---------------------------------------------------------
// ⚙️ CONFIGURATION CONSTANTS
// ---------------------------------------------------------
const PROVIDER_OPTIONS = [
    { 
        code: 'google', 
        name: 'Gemini AI', 
        desc: 'Online • Smart Translation', 
        detail: "Understands sentences & context.\nGives natural translation + transliteration.\n\nExample: \"My name is Rudra\"\n→ \"मेरा नाम रुद्र है\" (Translated)", 
        icon: Cloud 
    },
    { 
        code: 'offline', 
        name: 'Script-Shift', 
        desc: 'Offline • Phonetic Only', 
        detail: "Works without internet.\nGives pronunciation-style script conversion (no full translation).\n\nExample: \"My name is Rudra\"\n→ \"माइ नेम इज़ रुद्रा\" (Phonetic)", 
        icon: Zap 
    },
];

const TTS_OPTIONS = [
    { code: 'gemini', name: 'Gemini AI', desc: 'Realistic • Slower', icon: Cloud },
    { code: 'native', name: 'System', desc: 'Robotic • Instant', icon: Zap },
];

const THEME_OPTIONS = [
    { code: 'genz', name: 'Gen-Z Style', desc: 'Bold • Colorful • 3D', icon: Zap },
    { code: 'minimal', name: 'Minimal', desc: 'Clean • Simple • Flat', icon: Square },
];

// ---------------------------------------------------------
// 🌐 LANGUAGES & SCRIPTS
// ---------------------------------------------------------
const LANGUAGES = [
  // --- INDIC SCRIPTS (ISCII ALIGNED) ---
  { code: 'dev', name: 'Hindi',     desc: 'Devanagari',  script: 'devanagari', offset: 0x0900 },
  { code: 'mr',  name: 'Marathi',   desc: 'Devanagari',  script: 'devanagari', offset: 0x0900 },
  { code: 'bn',  name: 'Bengali',   desc: 'Bangla',      script: 'bengali',    offset: 0x0980 },
  { code: 'or',  name: 'Odia',      desc: 'Odia',        script: 'odia',       offset: 0x0B00 },
  { code: 'gu',  name: 'Gujarati',  desc: 'Gujarati',    script: 'gujarati',   offset: 0x0A80 },
  { code: 'pa',  name: 'Punjabi',   desc: 'Gurmukhi',    script: 'gurmukhi',   offset: 0x0A00 },
  { code: 'ta',  name: 'Tamil',     desc: 'Tamil',       script: 'tamil',      offset: 0x0B80 },
  { code: 'te',  name: 'Telugu',    desc: 'Telugu',      script: 'telugu',     offset: 0x0C00 },
  { code: 'kn',  name: 'Kannada',   desc: 'Kannada',     script: 'kannada',    offset: 0x0C80 },
  { code: 'ml',  name: 'Malayalam', desc: 'Malayalam',   script: 'malayalam',  offset: 0x0D00 },

  // --- PERSO-ARABIC SCRIPTS ---
  { code: 'ur',  name: 'Urdu',      desc: 'Nastaliq',    script: 'arabic',     offset: 0x0600 },
  { code: 'ks',  name: 'Kashmiri',  desc: 'Perso-Arabic',script: 'arabic',     offset: 0x0600 },

  // --- MEITEI MAYEK ---
  { code: 'mni', name: 'Meitei',    desc: 'Meitei Mayek',script: 'meitei',     offset: 0xABC0 },

  // --- LATIN ---
  { code: 'en',  name: 'English',   desc: 'Latin',       script: 'latin',      offset: 0 },
];

const SOURCE_OPTIONS = [{ code: 'auto', name: 'Auto Detect', desc: 'Magic' }, ...LANGUAGES];

// ---------------------------------------------------------
// 🔧 OFFLINE ENGINE - MULTI-SCRIPT MAPS
// ---------------------------------------------------------

const SCRIPT_PHONETIC_MAP = {
  // 1. DEVANAGARI (Template for most Indic scripts)
  devanagari: {
    halant: 0x4D,
    vowels: {
      'a':  { v: 0x05, m: 0x00 }, 'aa': { v: 0x06, m: 0x3E }, 'i':  { v: 0x07, m: 0x3F },
      'ee': { v: 0x08, m: 0x40 }, 'u':  { v: 0x09, m: 0x41 }, 'oo': { v: 0x0A, m: 0x42 },
      'e':  { v: 0x0F, m: 0x47 }, 'ai': { v: 0x10, m: 0x48 }, 'o':  { v: 0x13, m: 0x4B }, 'au': { v: 0x14, m: 0x4C }
    },
    consonants: {
      'k': 0x15, 'kh': 0x16, 'g': 0x17, 'gh': 0x18, 'c': 0x15, 'q': 0x15,
      'ch': 0x1A, 'chh': 0x1B, 'j': 0x1C, 'jh': 0x1D, 'z': 0x5B,
      't': 0x24, 'th': 0x25, 'd': 0x26, 'dh': 0x27, // dental
      'T': 0x1F, 'Th': 0x20, 'D': 0x21, 'Dh': 0x22, // retroflex
      'n': 0x28, 'p': 0x2A, 'ph': 0x2B, 'f': 0x5E, 'b': 0x2C, 'bh': 0x2D, 'm': 0x2E,
      'y': 0x2F, 'r': 0x30, 'l': 0x32, 'v': 0x35, 'w': 0x35,
      'sh': 0x36, 's': 0x38, 'h': 0x39
    },
    clusters: {
      'ksha': [0x15, 0x4D, 0x37], 'gya': [0x1C, 0x4D, 0x1E], 'str': [0x38, 0x4D, 0x24, 0x4D, 0x30]
    }
  },
    
  // 2. ARABIC (Urdu/Kashmiri) - String based mapping
  arabic: {
    rtl: true,
    vowels: {
      'a': 'ا', 'aa': 'آ', 'i': 'ی', 'ee': 'ی', 'u': 'و', 'oo': 'و', 'e': 'ے', 'o': 'و', 'au': 'او'
    },
    consonants: {
      'k': 'ک', 'kh': 'خ', 'g': 'گ', 'gh': 'غ', 'q': 'ق',
      'ch': 'چ', 'j': 'ج', 'z': 'ز',
      't': 'ت', 'T': 'ٹ', 'd': 'د', 'D': 'ڈ',
      'n': 'ن', 'p': 'پ', 'f': 'ف', 'b': 'ب', 'm': 'م',
      'y': 'ی', 'r': 'ر', 'l': 'ل', 'v': 'و', 'w': 'و',
      's': 'س', 'sh': 'ش', 'h': 'ہ'
    }
  },

  // 3. MEITEI MAYEK - String based mapping
  meitei: {
    vowels: {
      'a': 'ꯑ', 'aa': 'ꯑꯥ', 'i': 'ꯏ', 'ee': 'ꯢ', 'u': 'ꯎ', 'e': 'ꯑꯦ', 'o': 'ꯑꯣ'
    },
    consonants: {
      'k': 'ꯀ', 'kh': 'ꯈ', 'g': 'ꯒ', 'ch': 'ꯆ', 'j': 'ꯖ',
      't': 'ꯇ', 'th': 'ꯊ', 'd': 'ꯗ', 'n': 'ꯅ',
      'p': 'ꯄ', 'ph': 'ꯐ', 'b': 'ꯕ', 'm': 'ꯃ',
      'y': 'ꯌ', 'r': 'ꯔ', 'l': 'ꯂ', 'w': 'ꯋ',
      's': 'ꯁ', 'h': 'ꯍ'
    }
  }
};

// Aliases for inherited scripts
SCRIPT_PHONETIC_MAP.bengali = { base: 'devanagari' };
SCRIPT_PHONETIC_MAP.gurmukhi = { base: 'devanagari' };
SCRIPT_PHONETIC_MAP.gujarati = { base: 'devanagari' };
SCRIPT_PHONETIC_MAP.odia = { base: 'devanagari' };
SCRIPT_PHONETIC_MAP.tamil = { base: 'devanagari' };
SCRIPT_PHONETIC_MAP.telugu = { base: 'devanagari' };
SCRIPT_PHONETIC_MAP.kannada = { base: 'devanagari' };
SCRIPT_PHONETIC_MAP.malayalam = { base: 'devanagari' };

// ---------------------------------------------------------
// 🕵️ DETECT SCRIPT HELPER
// ---------------------------------------------------------
const detectScriptFromText = (text) => {
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    // ISCII / Indic Blocks
    if (code >= 0x0900 && code <= 0x097F) return { script: 'devanagari', label: 'Hindi/Marathi', baseBlock: 0x0900 };
    if (code >= 0x0980 && code <= 0x09FF) return { script: 'bengali',    label: 'Bengali',       baseBlock: 0x0980 };
    if (code >= 0x0A00 && code <= 0x0A7F) return { script: 'gurmukhi',   label: 'Gurmukhi',      baseBlock: 0x0A00 };
    if (code >= 0x0A80 && code <= 0x0AFF) return { script: 'gujarati',   label: 'Gujarati',      baseBlock: 0x0A80 };
    if (code >= 0x0B00 && code <= 0x0B7F) return { script: 'odia',       label: 'Odia',          baseBlock: 0x0B00 };
    if (code >= 0x0B80 && code <= 0x0BFF) return { script: 'tamil',      label: 'Tamil',         baseBlock: 0x0B80 };
    if (code >= 0x0C00 && code <= 0x0C7F) return { script: 'telugu',     label: 'Telugu',        baseBlock: 0x0C00 };
    if (code >= 0x0C80 && code <= 0x0CFF) return { script: 'kannada',    label: 'Kannada',       baseBlock: 0x0C80 };
    if (code >= 0x0D00 && code <= 0x0D7F) return { script: 'malayalam',  label: 'Malayalam',     baseBlock: 0x0D00 };
      
    // Other Scripts
    if (code >= 0x0600 && code <= 0x06FF) return { script: 'arabic',     label: 'Urdu/Kashmiri', baseBlock: 0x0600 };
    if (code >= 0xABC0 && code <= 0xABFF) return { script: 'meitei',     label: 'Meitei Mayek',  baseBlock: 0xABC0 };
      
    // Latin
    if (code >= 65 && code <= 122)        return { script: 'latin',      label: 'Latin',         baseBlock: 0 }; 
  }
  return { script: 'unknown', label: 'Unknown', baseBlock: 0 };
};

// ---------------------------------------------------------
// 🔧 UTILITIES & OFFLINE ENGINE
// ---------------------------------------------------------

const cleanAndParseJSON = (responseText) => {
  try { return JSON.parse(responseText); } catch (e) {
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonString = responseText.substring(firstBrace, lastBrace + 1);
      try { return JSON.parse(jsonString); } catch (e2) {
        return JSON.parse(jsonString.replace(/```json/g, '').replace(/```/g, '').replace(/\\n/g, ' ').trim());
      }
    }
    throw new Error("AI did not return valid JSON data.");
  }
};

// Helper: The core algorithmic character mapping
const algorithmicConvert = (text, target) => {
    let result = [];
    let i = 0;
    let lastWasConsonant = false;
    
    // Determine configuration based on script
    let config = SCRIPT_PHONETIC_MAP[target.script];
    if (config && config.base) config = SCRIPT_PHONETIC_MAP[config.base]; // Inherit
    if (!config) return text; // Fallback

    const isIndic = !config.rtl && target.script !== 'meitei';
    const HALANT = isIndic ? config.halant : null;
    const allKeys = { ...config.vowels, ...config.consonants, ...(config.clusters || {}) };
    const sortedKeys = Object.keys(allKeys).sort((a, b) => b.length - a.length);

    while (i < text.length) {
        const charCode = text.charCodeAt(i);
        // Only process Latin characters
        if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
            let matchKey = null;
            let matchVal = null;
            let consumed = 0;

            for (const key of sortedKeys) {
                if (text.substring(i, i + key.length).toLowerCase() === key) {
                    matchKey = key;
                    matchVal = allKeys[key];
                    consumed = key.length;
                    break;
                }
            }

            if (!matchVal) { lastWasConsonant = false; i++; continue; }

            if (isIndic) {
                if (Array.isArray(matchVal)) {
                    if (lastWasConsonant) result.push(String.fromCharCode(target.offset + HALANT));
                    matchVal.forEach(c => result.push(String.fromCharCode(target.offset + c)));
                    lastWasConsonant = true;
                } else if (matchVal.v !== undefined) {
                    if (lastWasConsonant && matchVal.m !== undefined) {
                        if (matchVal.m > 0) result.push(String.fromCharCode(target.offset + matchVal.m));
                    } else {
                        result.push(String.fromCharCode(target.offset + matchVal.v));
                    }
                    lastWasConsonant = false;
                } else {
                    if (lastWasConsonant) result.push(String.fromCharCode(target.offset + HALANT));
                    result.push(String.fromCharCode(target.offset + matchVal));
                    lastWasConsonant = true;
                }
            } else {
                result.push(matchVal);
                lastWasConsonant = false;
            }
            i += consumed;
        } else {
            result.push(text[i]);
            lastWasConsonant = false;
            i++;
        }
    }
    if (config.rtl) return result.reverse().join('');
    return result.join('');
};

const offlineTransliterate = (text, targetLangCode) => {
  const target = LANGUAGES.find(l => l.code === targetLangCode);
  if (!target) return text;

  // 1. Detect Source Script
  const sourceInfo = detectScriptFromText(text);

  // 2. Scenario: Source is Latin (English) -> Apply Dictionary + Algorithm
  if (sourceInfo.script === 'latin') {
      if (target.script === 'latin') return text;

      // Split into words to check the Correction DB
      const words = text.split(/(\s+)/); // Split by whitespace but keep delimiters

      const processedWords = words.map(word => {
          const cleanWord = word.toLowerCase().trim().replace(/[^\w]/g, ''); // Remove punctuation for lookup
          
          // CHECK DICTIONARY (Only if target is Devanagari based, like Hindi/Marathi)
          // Since your JSON is specifically English -> Marathi (Devanagari)
          if (target.script === 'devanagari' && WORD_CORRECTION_DB[cleanWord]) {
              return WORD_CORRECTION_DB[cleanWord];
          }

          // If not in dictionary, or just whitespace/punctuation, run algorithm
          return algorithmicConvert(word, target);
      });

      return processedWords.join('');
  }

  // 3. Scenario: Source is Indic AND Target is Indic (Block Shift)
  const isSourceIndic = sourceInfo.baseBlock >= 0x0900 && sourceInfo.baseBlock <= 0x0D00;
  const isTargetIndic = target.offset >= 0x0900 && target.offset <= 0x0D00;

  if (isSourceIndic && isTargetIndic && sourceInfo.script !== target.script) {
      let result = '';
      for (const ch of text) {
          const code = ch.charCodeAt(0);
          if (code >= sourceInfo.baseBlock && code <= sourceInfo.baseBlock + 127) {
              const relative = code - sourceInfo.baseBlock;
              result += String.fromCharCode(target.offset + relative);
          } else {
              result += ch;
          }
      }
      return result;
  }

  return text;
};

// ---------------------------------------------------------
// 📸 OFFLINE OCR (SIMULATION)
// ---------------------------------------------------------
const performOfflineOCR = async (uri) => {
    // 💡 REAL WORLD NOTE:
    // In a real production build, you would install `@react-native-ml-kit/text-recognition`
    // and use `TextRecognition.recognize(uri)` here.
    //
    // Since we are in a single-file environment without native dependencies, 
    // we simulate the OCR result to prove the Transliteration Engine works.
    
    await new Promise(r => setTimeout(r, 800)); // Simulate processing delay

    const sampleTexts = [
        "NO PARKING",       // Case 1: English Sign
        "SCHOOL AHEAD",     // Case 2: English Sign
        "Medical Store",    // Case 3: Latin Text
        "स्कूल आगे",          // Case 4: Hindi Sign
        "Delhi Metro",      // Case 5: Mixed
        "My name is Rudra", // Case 6: Sentence
        "नमस्ते भारत"         // Case 7: Indic Text
    ];
    
    // Pick a random sample to demonstrate engine capabilities
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
};

const getOfflineMeaning = (text) => {
  const lowerText = text.toLowerCase();
  const match = ROAD_SIGNS_DB.find(sign => 
    lowerText.includes(sign.label.toLowerCase()) || 
    sign.label.toLowerCase().includes(lowerText)
  );
  if (match) return match.desc;
  return "Translation unavailable offline.";
};

const offlineAnalyze = async (text, targetLang, isImage) => {
  // If this is an Image scan, we assume 'text' contains the OCR result passed from handleProcess
  // If this is Text mode, 'text' is what the user typed.
  
  if (!text) {
      return { hasText: false, detected: "Unknown", contentType: "sign_symbol", transliterated: "" };
  }

  // 1. Detect Script (Correctly Identify if it's Latin, Hindi, etc.)
  let detectedLabel = "Detected";
  const detection = detectScriptFromText(text);
  if (detection.label) detectedLabel = detection.label;

  // 2. Perform Transliteration (The heavy lifting)
  const transliteratedText = offlineTransliterate(text, targetLang.code);

  // 3. Lookup Meaning (Simple DB check)
  const meaning = getOfflineMeaning(text);
  const isSign = ROAD_SIGNS_DB.some(s => s.label.toLowerCase() === text.toLowerCase());

  return {
    original: text,
    transliterated: transliteratedText,
    translated: meaning,
    detected: detectedLabel,
    contentType: isSign || isImage ? 'sign_text' : 'text',
    hasText: true
  };
};

const GEMINI_API_KEY = 'Enter ur api key'; 

const callGeminiAPI = async (prompt, imageBase64 = null) => {
  if (!GEMINI_API_KEY) throw new Error('API Key Missing');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
  const parts = [{ text: prompt }];
  if (imageBase64) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
  const payload = { contents: [{ parts }], generationConfig: { temperature: 0.1, responseMimeType: 'application/json' } };
  
  // Backoff strategy specifically for 429
  let delay = 1500; 

  for (let i = 0; i < 4; i++) { // Increased retries to 4
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      
      // 429 HANDLING (Rate Limit)
      if (response.status === 429) {
          console.log(`Rate limit hit (429). Waiting ${delay}ms...`);
          if (i === 3) throw new Error("API Quota Exceeded. Please try again in a minute.");
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2.5; // Exponential backoff (1.5s -> 3.75s -> 9s)
          continue; 
      }

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No content from AI');
      return cleanAndParseJSON(rawText);

    } catch (error) {
      if (i === 3) throw error;
      // General error retry
      console.log(`Retrying API (Attempt ${i+1})...`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2; 
    }
  }
};

const callGeminiTTS = async (text) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
        contents: [{ parts: [{ text: text.trim() }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
    };
    
    // Added Retry for TTS as well
    let delay = 1000;
    for (let i = 0; i < 2; i++) {
        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (response.status === 429) {
                 await new Promise((r) => setTimeout(r, 2000));
                 continue;
            }
            if (!response.ok) throw new Error("TTS Error");
            const data = await response.json();
            return data.candidates[0].content.parts[0].inlineData.data; 
        } catch(e) {
            if (i===1) throw e;
            await new Promise((r) => setTimeout(r, delay));
        }
    }
};

// ---------------------------------------------------------
// 🧪 DIAGNOSTICS SCREEN COMPONENT
// ---------------------------------------------------------
const DiagnosticsScreen = ({ onClose, isDarkMode }) => {
  const [selectedParagraph, setSelectedParagraph] = useState('P1_ASCII');
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    const inputText = TEST_PARAGRAPHS[selectedParagraph];
    
    const newResults = [];
    for (const lang of LANGUAGES) {
      if (lang.code === 'auto' || lang.code === 'en') continue;
      const offlineStart = Date.now();
      const offlineRes = offlineTransliterate(inputText, lang.code);
      const offlineTime = Date.now() - offlineStart;

      newResults.push({
        lang: lang.name,
        offline: offlineRes,
        time: offlineTime
      });
    }
    setResults(newResults);
    setIsRunning(false);
  };

  const bg = isDarkMode ? '#171717' : '#f9fafb';
  const text = isDarkMode ? '#fff' : '#000';
  const card = isDarkMode ? '#262626' : '#fff';

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{flex:1, backgroundColor: bg}}>
        <View style={{padding: 20, flexDirection:'row', justifyContent:'space-between', alignItems:'center', borderBottomWidth:1, borderColor:'#333'}}>
          <Text style={{fontSize:20, fontWeight:'bold', color: text}}>Diagnostics Lab</Text>
          <TouchableOpacity onPress={onClose}><X size={24} color={text} /></TouchableOpacity>
        </View>
        <ScrollView style={{flex:1, padding: 20}}>
          <Text style={{color: text, marginBottom: 10, fontWeight:'bold'}}>Select Test Input:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
            {Object.keys(TEST_PARAGRAPHS).map(key => (
              <TouchableOpacity key={key} onPress={() => setSelectedParagraph(key)} style={{padding: 10, backgroundColor: selectedParagraph === key ? THEME.colors.success : card, marginRight: 10, borderRadius: 8}}>
                <Text style={{color: selectedParagraph === key ? '#fff' : text, fontWeight:'bold'}}>{key}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
            
          <View style={{padding: 15, backgroundColor: card, borderRadius: 10, marginBottom: 20}}>
            <Text style={{color: text, fontStyle:'italic'}}>{TEST_PARAGRAPHS[selectedParagraph]}</Text>
          </View>

          <TouchableOpacity onPress={runDiagnostics} style={{backgroundColor: THEME.colors.success, padding: 15, borderRadius: 10, alignItems:'center', marginBottom: 20}}>
            {isRunning ? <ActivityIndicator color="#fff" /> : <Text style={{color:'#fff', fontWeight:'bold'}}>Run Transliteration Suite</Text>}
          </TouchableOpacity>

          {results.map((res, idx) => (
            <View key={idx} style={{backgroundColor: card, padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#333'}}>
              <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 5}}>
                <Text style={{color: THEME.colors.gray, fontWeight:'bold', textTransform:'uppercase'}}>{res.lang}</Text>
                <Text style={{color: THEME.colors.success, fontSize: 12}}>{res.time}ms</Text>
              </View>
              <Text style={{color: text, fontSize: 16}}>{res.offline}</Text>
            </View>
          ))}
          <View style={{height: 50}} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ---------------------------------------------------------
// 🧩 MAIN COMPONENTS
// ---------------------------------------------------------

const RotatingLoader = ({ color }) => {
    const spinValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
        ).start();
    }, []);
    const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return <Animated.View style={{ transform: [{ rotate: spin }] }}><Loader2 size={24} color={color} /></Animated.View>;
};

const Shimmer = ({ isShimmering }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (isShimmering) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                    Animated.timing(shimmerAnim, { toValue: 0, duration: 500, useNativeDriver: true })
                ])
            ).start();
        } else {
            shimmerAnim.setValue(0);
        }
    }, [isShimmering]);
    if (!isShimmering) return null;
    return (
        <Animated.View
            style={[
                styles.shimmerOverlay,
                {
                    opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }),
                    transform: [{ scale: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }]
                }
            ]}
        />
    );
};

const SelectionModal = ({ visible, onClose, title, options, onSelect, isDarkMode }) => {
    const modalBg = isDarkMode ? THEME.colors.darkCard : '#fff';
    const headerBg = isDarkMode ? '#333' : THEME.colors.pastelPeach;
    const textColor = isDarkMode ? '#fff' : '#000';
    const subTextColor = isDarkMode ? '#aaa' : '#666';
    const borderColor = isDarkMode ? '#444' : '#eee';

    return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
          <View style={[styles.modalHeader, { backgroundColor: headerBg, borderBottomColor: THEME.colors.black }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}><X size={24} color={textColor} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {options.map((item, index) => (
              <TouchableOpacity key={item.code} style={[styles.modalItem, index === options.length - 1 && {borderBottomWidth: 0}, { borderBottomColor: borderColor }]} onPress={() => { onSelect(item); onClose(); }}>
                <View style={{flexDirection:'row', flex: 1}}>
                    {item.icon && <View style={{marginTop: 4}}><item.icon size={24} color={textColor} style={{marginRight:16}} /></View>}
                    <View style={{flex: 1}}>
                        <Text style={[styles.modalItemName, { color: textColor, marginBottom: 4 }]}>{item.name}</Text>
                        <Text style={[styles.modalItemDesc, { color: subTextColor, lineHeight: 20 }]}>
                            {item.detail || item.desc || ''}
                        </Text>
                    </View>
                </View>
                <View style={{width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: textColor, marginLeft: 10, alignSelf:'flex-start', marginTop: 6}} />
              </TouchableOpacity>
            ))}
            <View style={{height: 40}} />
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
    );
};

const ResultCard = ({ data, isDarkMode, playingId, handleSpeak, setExpandedImage, audioLoading, appBg, isLatest, scale, showOriginal, onDelete }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
    
  useEffect(() => {
      if (isLatest && !data.isLoading) { 
          Animated.loop(
              Animated.sequence([
                  Animated.timing(pulseAnim, { toValue: 1.01, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                  Animated.timing(pulseAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
              ])
          ).start();
      } else {
          pulseAnim.setValue(1); 
      }
  }, [isLatest, data.isLoading]);

  const lightColors = [THEME.colors.pastelPeach, THEME.colors.pastelGreen, THEME.colors.pastelBlue, THEME.colors.pastelPurple, THEME.colors.pastelPink, THEME.colors.pastelYellow, THEME.colors.pastelCyan];
  const darkColor = THEME.colors.darkCard;
    
  const colorIndex = data.colorIndex !== undefined ? data.colorIndex : (data.id % lightColors.length);
  const bg = isDarkMode ? darkColor : lightColors[colorIndex % lightColors.length];
    
  const contentColor = isDarkMode ? '#fff' : '#000';
  const labelColor = isDarkMode ? '#94a3b8' : '#475569';
  const isPlaying = playingId === data.id;

  const textLen = data.transliterated ? data.transliterated.length : 0;
  let dynamicFontSize = 32;
  if (textLen > 100) dynamicFontSize = 18;
  else if (textLen > 50) dynamicFontSize = 24;
    
  const fontSizeMain = dynamicFontSize * scale; 
  const fontSizeTrans = 16 * scale;
  const fontSizeLabel = 10 * scale;
  const iconSize = 22 * scale;

  const getBadgeInfo = () => {
    if (data.type === 'text') return { label: 'TEXT INPUT', icon: Type };
    if (data.contentType === 'sign_symbol') return { label: 'SYMBOL ONLY', icon: Ban };
    if (data.contentType === 'sign_text') return { label: 'SIGNBOARD', icon: Triangle };
    if (data.contentType === 'no_text') return { label: 'NO TEXT', icon: ScanEye };
    return { label: 'DOCUMENT', icon: FileText };
  };
  const badgeInfo = getBadgeInfo();

  // --- SHARE FUNCTION ---
  const handleShare = async () => {
      try {
          const message = `Original: ${data.original}\nPronunciation: ${data.transliterated}\nMeaning: ${data.translated}\n\nScanned with Scriptify`;
          await Share.share({ message });
      } catch (error) {
          Alert.alert(error.message);
      }
  };

  // --- GOOGLE MAPS FUNCTION ---
  const handleMaps = () => {
       const query = data.original || data.transliterated;
       if (!query) return;
       const url = Platform.select({
           ios: `maps:0,0?q=${encodeURIComponent(query)}`,
           android: `geo:0,0?q=${encodeURIComponent(query)}`
       });
       const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

       Linking.canOpenURL(webUrl).then(supported => {
           if (supported) {
               Linking.openURL(webUrl);
           } else {
               Linking.openURL(webUrl); 
           }
       });
  };

  if (data.isLoading) {
    return (
        <Animated.View style={[styles.resultCard, get3DStyle(bg), { transform: [{ scale: pulseAnim }] }]}>
            <View style={[styles.cardHeader, {borderBottomColor: contentColor}]}>
                <View style={[styles.langBadge, {backgroundColor: contentColor}]}>
                    <Text style={[styles.langBadgeText, {color: isDarkMode ? '#000' : '#fff', fontSize: 12 * scale}]}>{data.detected}</Text>
                </View>
                <View style={{flexDirection:'row', gap: 4, alignItems:'center'}}>
                      <Clock size={14} color={contentColor} />
                      <Text style={{fontSize: 12, fontWeight:'bold', color: contentColor}}>{data.timestamp || "Now"}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                {data.thumbnail && <View style={[styles.thumbContainer, {borderColor: contentColor}]}><Image source={{uri: data.thumbnail}} style={styles.resultThumb} /></View>}
                <View style={{alignItems: 'center', paddingVertical: 20}}>
                    <ActivityIndicator size="large" color={contentColor} />
                    <Text style={[styles.mainText, {color: contentColor, fontSize: fontSizeMain, marginTop: 16}]}>Thinking...</Text>
                </View>
            </View>
        </Animated.View>
    );
  }

  // --- SPECIAL CASE: NO TEXT DETECTED (e.g. Fan) ---
  if (data.contentType === 'no_text') {
      return (
        <Animated.View style={[styles.resultCard, get3DStyle(isDarkMode ? '#333' : '#fee2e2'), { borderColor: THEME.colors.error }]}>
            <View style={[styles.cardHeader, {borderBottomColor: THEME.colors.error}]}>
                <View style={[styles.langBadge, {backgroundColor: THEME.colors.error}]}>
                    <Text style={[styles.langBadgeText, {color: '#fff', fontSize: 12 * scale}]}>NOT FOUND</Text>
                </View>
                <View style={{flexDirection:'row', gap: 4, alignItems:'center'}}>
                      <Clock size={14} color={THEME.colors.error} />
                      <Text style={{fontSize: 12, fontWeight:'bold', color: THEME.colors.error}}>{data.timestamp || "Now"}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                {data.thumbnail && (
                    <TouchableOpacity onPress={() => setExpandedImage(data.thumbnail)} style={[styles.thumbContainer, {borderColor: THEME.colors.error, opacity: 0.8}]}>
                       <Image source={{uri: data.thumbnail}} style={styles.resultThumb} />
                    </TouchableOpacity>
                )}
                <View style={{alignItems: 'center', paddingVertical: 10}}>
                    <AlertOctagon size={48} color={THEME.colors.error} style={{marginBottom: 10}} />
                    <Text style={[styles.mainText, {color: contentColor, fontSize: 22, textAlign:'center'}]}>No sign or text detected</Text>
                    <Text style={{color: labelColor, fontSize: 14, textAlign:'center', marginTop: 8}}>Please scan a valid signboard or text.</Text>
                </View>
            </View>
        </Animated.View>
      );
  }

  const isSymbolMode = data.contentType === 'sign_symbol';
  const showTextFields = (data.type === 'text' || data.hasText === true) && !isSymbolMode;
  
  const textToInteract = showTextFields ? data.transliterated : data.translated;
  const canInteract = textToInteract && textToInteract.length > 0;

  return (
    <Animated.View style={[styles.resultCard, get3DStyle(bg), { transform: [{ scale: pulseAnim }] }]}>
        <View style={[styles.cardHeader, {borderBottomColor: contentColor}]}>
            <View style={[styles.langBadge, {backgroundColor: contentColor, marginRight: 8}]}>
                <Text style={[styles.langBadgeText, {color: isDarkMode ? '#000' : '#fff', fontSize: 12 * scale}]}>{data.detected}</Text>
            </View>

            {data.type === 'image' && (
               <View style={{flexDirection:'row', alignItems:'center', opacity: 0.6, marginRight: 'auto'}}>
                  <badgeInfo.icon size={12} color={contentColor} style={{marginRight: 4}} strokeWidth={3} />
                  <Text style={{fontSize: 10, fontWeight:'900', color: contentColor, letterSpacing:0.5}}>{badgeInfo.label}</Text>
               </View>
            )}

            <View style={{flexDirection:'row', gap: 10, alignItems:'center', marginLeft: 'auto'}}>
                {onDelete && (
                    <TouchableOpacity onPress={() => onDelete(data.id)} style={{marginRight: 4}}>
                        <Trash2 size={iconSize} color={THEME.colors.error} strokeWidth={2.5} />
                    </TouchableOpacity>
                )}
                 
                {canInteract && (
                  <TouchableOpacity onPress={() => handleSpeak(textToInteract, data.id)} style={{width: 32, alignItems:'center'}}>
                      {isPlaying ? (audioLoading ? <RotatingLoader color={contentColor} /> : <Square size={iconSize} color={contentColor} fill={contentColor} strokeWidth={2.5} />) : (<Volume2 size={iconSize} color={contentColor} strokeWidth={2.5} />)}
                  </TouchableOpacity>
                )}
                 
                {canInteract && (
                  <TouchableOpacity onPress={() => { Clipboard.setStringAsync(textToInteract); ToastAndroid.show("Copied!", 0); }}><Copy size={iconSize} color={contentColor} strokeWidth={2.5} /></TouchableOpacity>
                )}

                {/* --- MAPS BUTTON --- */}
                {canInteract && (
                   <TouchableOpacity onPress={handleMaps}>
                      <MapPin size={iconSize} color={contentColor} strokeWidth={2.5} />
                   </TouchableOpacity>
                )}

                {/* --- SHARE BUTTON --- */}
                {canInteract && (
                   <TouchableOpacity onPress={handleShare}>
                      <Share2 size={iconSize} color={contentColor} strokeWidth={2.5} />
                   </TouchableOpacity>
                )}

            </View>
        </View>
          
        <View style={styles.cardBody}>
            {data.thumbnail && (
              <TouchableOpacity onPress={() => setExpandedImage(data.thumbnail)} style={[styles.thumbContainer, {borderColor: contentColor}]}>
                 <Image source={{uri: data.thumbnail}} style={styles.resultThumb} />
              </TouchableOpacity>
            )}

            {showTextFields && (
                <>
                    <Text style={[styles.sectionLabel, {color: labelColor, fontSize: fontSizeLabel}]}>READ IT (PRONUNCIATION)</Text>
                    <Text style={[styles.mainText, {color: contentColor, fontSize: fontSizeMain, lineHeight: fontSizeMain * 1.3}]}>{data.transliterated}</Text>
                </>
            )}
              
            {data.translated && (
                <View style={{marginTop: 12}}>
                    <Text style={[styles.sectionLabel, {color: labelColor, fontSize: fontSizeLabel}]}>MEANING</Text>
                    <View style={[styles.translationBox, {borderColor: contentColor, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)'}]}>
                        <Text style={[styles.translationText, {color: contentColor, fontSize: fontSizeTrans, lineHeight: fontSizeTrans * 1.4}]}>{data.translated}</Text>
                    </View>
                </View>
            )}

            {!showTextFields && data.uiMessage && (
                <View style={{marginTop: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8}}>
                    <Text style={{color: contentColor, fontStyle: 'italic', textAlign: 'center'}}>{data.uiMessage}</Text>
                </View>
            )}

            {showOriginal && data.original && showTextFields && (
                <View style={{marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)'}}>
                    <View style={{flexDirection:'row', alignItems:'center', marginBottom:4}}>
                        {data.type === 'image' ? (<ScanEye size={12} color={labelColor} style={{marginRight:4}} />) : (<FileText size={12} color={labelColor} style={{marginRight:4}} />)}
                        <Text style={[styles.sectionLabel, {color: labelColor, fontSize: fontSizeLabel, marginBottom:0}]}>
                            {data.type === 'image' ? 'SCANNED TEXT' : 'ORIGINAL TEXT'}
                        </Text>
                    </View>
                    <Text style={[styles.originalText, {color: contentColor, fontSize: 14 * scale}]}>{data.original}</Text>
                </View>
            )}
        </View>
    </Animated.View>
  );
};

const GoogleLensViewfinder = ({ onGalleryPress, onCapture, cameraRef, isProcessing, flash, capturedPhoto, isShimmering }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const screenWidth = Dimensions.get('window').width;
  const boxSize = screenWidth * 0.75;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (permission && !permission.granted) requestPermission();
    Animated.loop(Animated.sequence([Animated.timing(scanAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }), Animated.timing(scanAnim, { toValue: 0, duration: 2000, easing: Easing.linear, useNativeDriver: true })])).start();
  }, [permission]);

  if (!permission) return <View style={{flex:1, backgroundColor:'black'}} />;
  if (!permission.granted) return <View style={styles.permContainer}><TouchableOpacity onPress={requestPermission} style={styles.permBtn}><Text style={styles.permBtnText}>Grant Camera Access</Text></TouchableOpacity></View>;

  return (
    <View style={styles.lensContainer}>
      {isProcessing && capturedPhoto ? (
          <View style={StyleSheet.absoluteFill}>
              <Image source={{uri: capturedPhoto}} style={[StyleSheet.absoluteFill, {resizeMode: 'cover'}]} />
              <View style={[StyleSheet.absoluteFill, {backgroundColor: 'rgba(0,0,0,0.3)'}]} />
          </View>
      ) : (
          <CameraView style={StyleSheet.absoluteFill} facing="back" ref={cameraRef} enableTorch={flash}>
            <SafeAreaView style={{flex: 1}} pointerEvents="box-none">
              <View style={styles.viewfinderContainer} pointerEvents="none">
                <View style={{ width: boxSize, height: boxSize }}>
                    <View style={[styles.corner, styles.cornerTL]} /><View style={[styles.corner, styles.cornerTR]} /><View style={[styles.corner, styles.cornerBL]} /><View style={[styles.corner, styles.cornerBR]} />
                </View>
              </View>
              <View style={styles.lensControlsRow}>
                  <TouchableOpacity onPress={onGalleryPress} style={[styles.controlBtnSmall, get3DStyle(THEME.colors.white)]}><LucideImage size={24} color="#000" /></TouchableOpacity>
                  <TouchableOpacity onPress={onCapture} activeOpacity={0.7} style={styles.shutterBtnContainer}><View style={styles.shutterBtnOuter}><Search size={32} color="#000" strokeWidth={3} /><Shimmer isShimmering={isShimmering} /></View></TouchableOpacity>
                  <View style={{width: 60}} />
              </View>
            </SafeAreaView>
          </CameraView>
      )}
    </View>
  );
};

export default function App() {
  const [mode, setMode] = useState('lens'); 
  const [sourceLang, setSourceLang] = useState(SOURCE_OPTIONS[0]);
  const [targetLang, setTargetLang] = useState(LANGUAGES[0]);
  const [inputText, setInputText] = useState('');
    
  const [lensResult, setLensResult] = useState(null);
  const [textResult, setTextResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isShimmering, setIsShimmering] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [flash, setFlash] = useState(false);
    
  const [playingId, setPlayingId] = useState(null); 
  const [audioLoading, setAudioLoading] = useState(false); 
  const soundRef = useRef(null); 

  const [autoSpeak, setAutoSpeak] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);
  const [appScale, setAppScale] = useState(1.0); 
  const [selectedProvider, setSelectedProvider] = useState(PROVIDER_OPTIONS[0]);
  const [selectedTTS, setSelectedTTS] = useState(TTS_OPTIONS[0]);
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[0]);
    
  const [liveId, setLiveId] = useState(null); 
  const [lastColorIndex, setLastColorIndex] = useState(0); 
    
  // --- NEW DIAGNOSTICS STATE ---
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const historyTimer = useRef(null); 

  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');
    
  const [isLoaded, setIsLoaded] = useState(false);

  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false); 
  const [showTTSModal, setShowTTSModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false); 

  const cameraRef = useRef(null); 
  const navTranslateY = useRef(new Animated.Value(0)).current;

  const appBg = isDarkMode ? THEME.colors.darkBg : THEME.colors.offWhite;
  const textColor = isDarkMode ? THEME.colors.white : THEME.colors.black;
  const cardBg = isDarkMode ? THEME.colors.darkCard : THEME.colors.white;
  const inputBg = isDarkMode ? THEME.colors.darkInput : THEME.colors.white;

  const isCameraMode = mode === 'lens' && !lensResult;

  // ---------------------------------------------------------
  // 💾 PERSISTENCE LOGIC
  // ---------------------------------------------------------

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [historyJson, settingsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.history),
          AsyncStorage.getItem(STORAGE_KEYS.settings),
        ]);

        if (historyJson) {
          setHistory(JSON.parse(historyJson));
        }

        if (settingsJson) {
          const s = JSON.parse(settingsJson);
          if (typeof s.autoSpeak === 'boolean') setAutoSpeak(s.autoSpeak);
          if (typeof s.saveHistory === 'boolean') setSaveHistory(s.saveHistory);
          if (typeof s.appScale === 'number') setAppScale(s.appScale);
          if (typeof s.isDarkMode === 'boolean') setIsDarkMode(s.isDarkMode);
          if (s.selectedProvider) setSelectedProvider(s.selectedProvider);
          if (s.selectedTTS) setSelectedTTS(s.selectedTTS);
          if (s.selectedTheme) setSelectedTheme(s.selectedTheme);
          if (s.sourceLang) setSourceLang(s.sourceLang);
          if (s.targetLang) setTargetLang(s.targetLang);
        }
      } catch (e) {
        console.log('Failed to load data', e);
      } finally {
        setIsLoaded(true); 
      }
    };
    loadPersistedData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return; 
    const saveHistoryToStorage = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
      } catch (e) { console.log('Failed to save history', e); }
    };
    saveHistoryToStorage();
  }, [history, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return; 
    const saveSettingsToStorage = async () => {
      try {
        const settings = {
          autoSpeak, saveHistory, appScale, selectedProvider, selectedTTS, selectedTheme, isDarkMode, sourceLang, targetLang,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      } catch (e) { console.log('Failed to save settings', e); }
    };
    saveSettingsToStorage();
  }, [autoSpeak, saveHistory, appScale, selectedProvider, selectedTTS, selectedTheme, isDarkMode, sourceLang, targetLang, isLoaded]);

  // --- AUTOMATICALLY SWITCH OUT OF LENS MODE IF OFFLINE ---
  useEffect(() => {
    if (selectedProvider.code === 'offline' && mode === 'lens') {
        setMode('text');
        ToastAndroid.show("Lens disabled in offline mode", ToastAndroid.SHORT);
    }
  }, [selectedProvider, mode]);


  const addToHistory = (result) => {
      if (!saveHistory || !result) return;
      setHistory(prev => {
          if (prev.length > 0 && prev[0].original === result.original && prev[0].transliterated === result.transliterated) {
              return prev;
          }
          return [result, ...prev];
      });
  };

  const deleteHistoryItem = (id) => {
    Alert.alert( "Delete Item", "Are you sure you want to remove this from history?",
        [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { setHistory(prev => prev.filter(item => item.id !== id)); }}]
    );
  };

  const clearAllHistory = () => {
    Alert.alert("Clear All History", "This will permanently delete all saved history. This cannot be undone.",
        [{ text: "Cancel", style: "cancel" }, { text: "Clear All", style: "destructive", onPress: () => { setHistory([]); }}]
    );
  };

  useEffect(() => {
    if (mode === 'text') {
        const currentText = inputText.trim();
        if (textResult && textResult.original === currentText && !textResult.isLoading) return; 

        if (currentText.length > 0) {
            const currentLiveId = liveId || Date.now();
            if (!liveId) {
                setLiveId(currentLiveId);
                setLastColorIndex(prev => (prev + 1) % 7);
            }
            const colorToUse = liveId ? lastColorIndex : (lastColorIndex + 1) % 7;

            setTextResult({
                id: currentLiveId, isLoading: true, detected: sourceLang.name, transliterated: "Thinking...", translated: "", original: currentText, thumbnail: null, type: 'text', colorIndex: colorToUse, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            });

            if (historyTimer.current) clearTimeout(historyTimer.current);
            historyTimer.current = setTimeout(() => {
                handleProcess(inputText, false, null, null, currentLiveId, colorToUse, false);
            }, 800);

            return () => { if (historyTimer.current) clearTimeout(historyTimer.current); };
        } else if (currentText.length === 0) {
            setLiveId(null);
            if (textResult) setTextResult(null);
        }
    }
  }, [inputText, mode, sourceLang, targetLang]); 

  useEffect(() => {
    const refresh = async () => {
        if (mode === 'lens' && lensResult && !lensResult.isLoading && capturedPhoto) {
            try {
                setLensResult(prev => ({ ...prev, isLoading: true, transliterated: "Updating...", translated: "" }));
                const manipulatedImage = await ImageManipulator.manipulateAsync(capturedPhoto, [{ resize: { width: 800 } }], { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true });
                await handleProcess('', true, manipulatedImage.base64, capturedPhoto, lensResult.id, lensResult.colorIndex, true);
            } catch (e) { setLensResult(null); }
        }
        if (mode === 'text' && textResult && !textResult.isLoading && textResult.original) {
             try {
                setTextResult(prev => ({ ...prev, isLoading: true, transliterated: "Updating...", translated: "" }));
                await handleProcess(textResult.original, false, null, null, textResult.id, textResult.colorIndex, false);
             } catch (e) { setTextResult(null); }
        }
    };
    refresh();
  }, [targetLang]);

  useEffect(() => {
      let saveTimer;
      if (mode === 'text' && textResult && !textResult.isLoading && textResult.type === 'text') {
          saveTimer = setTimeout(() => { addToHistory(textResult); }, 2000); 
      }
      return () => clearTimeout(saveTimer);
  }, [textResult, mode]);

  const handleReset = () => { setInputText(''); setTextResult(null); setLiveId(null); };

  const stopAudio = async () => {
      if (soundRef.current) {
          try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch(e){}
          soundRef.current = null;
      }
      await Speech.stop();
      setPlayingId(null);
      setAudioLoading(false);
  };

  const handleSpeak = async (text, id) => {
      if (playingId === id) { await stopAudio(); return; }
      if (playingId !== null) await stopAudio();
      setPlayingId(id);
        
      if (selectedTTS.code === 'native' || selectedProvider.code !== 'google') {
           Speech.speak(text, { onStart: () => setPlayingId(id), onDone: () => setPlayingId(null), onStopped: () => setPlayingId(null) });
           return;
      }
      setAudioLoading(true);
      let hasTimedOut = false;
      const timeoutTimer = setTimeout(() => {
          hasTimedOut = true;
          setAudioLoading(false);
          Speech.speak(text, { onStart: () => setPlayingId(id), onDone: () => setPlayingId(null), onStopped: () => setPlayingId(null) });
      }, 5000); 
      try {
          const wav = await callGeminiTTS(text);
          if (!hasTimedOut) {
              clearTimeout(timeoutTimer); 
              const { sound } = await Audio.Sound.createAsync({ uri: `data:audio/wav;base64,${wav}` }, { shouldPlay: true });
              soundRef.current = sound;
              setAudioLoading(false);
              sound.setOnPlaybackStatusUpdate(status => { if (status.didJustFinish) { setPlayingId(null); soundRef.current = null; } });
          }
      } catch (e) {
          if (!hasTimedOut) {
              clearTimeout(timeoutTimer);
              setAudioLoading(false);
              Speech.speak(text, { onStart: () => setPlayingId(id), onDone: () => setPlayingId(null), onStopped: () => setPlayingId(null) });
          }
      }
  };

  const changeMode = (newMode) => {
    Keyboard.dismiss();
    stopAudio(); 
    if (mode === 'text' && textResult && !textResult.isLoading) { addToHistory(textResult); }
    setMode(newMode);
  };

  // --------------------------------------------------------------------------------
  // 🚀 MAIN PROCESSING ENGINE (UPDATED FOR FALLBACK & FALLBACK)
  // --------------------------------------------------------------------------------
  const handleProcess = async (textInput, isImage = false, imgBase64 = null, imgUri = null, existingId = null, colorIdx = 0, saveToHistory = true) => {
      if (isImage) setIsProcessing(true);
      stopAudio();
       
      const processingId = existingId || Date.now();
      let result;
      let useOfflineEngine = selectedProvider.code === 'offline';

      try {

          // --- 1. TRY ONLINE ENGINE (IF SELECTED) ---
          if (!useOfflineEngine) {
            try {
                const prompt = isImage
                    ? `You are an AI Lens engine inside the React Native app "Scriptify".
                       Target Language for translation/transliteration: ${targetLang.name}.

                       Analyze the image and categorize strictly into one of these 4 types:

                       1. NO TEXT / NORMAL OBJECTS (e.g., fan, bottle, tree, scenery, random objects):
                          - If no readable text or traffic sign is present.
                          - content_type: "no_text"
                          - has_text: false
                          - original_text: ""
                          - ui_message: "No sign or text detected."

                       2. SYMBOL-ONLY SIGN (e.g., No Entry symbol, U-turn allowed, with NO letters):
                          - content_type: "sign_symbol"
                          - has_text: false
                          - translated_text: "Meaning of the symbol"
                          - ui_message: "Symbol-only road sign detected (no text)."

                       3. SIGNBOARD WITH TEXT (Traffic, Safety, Direction signs):
                          - content_type: "sign_text"
                          - has_text: true
                          - is_signboard: true
                          - transliterated_text: "MUST PROVIDE Phonetic reading of the sign in ${targetLang.name} script."
                          - translated_text: "MUST PROVIDE Meaning of the sign in ${targetLang.name}."
                          - ui_message: "Road sign detected."

                       4. GENERAL TEXT (Documents, Shop boards, T-shirts, Packaging, Posters):
                          - content_type: "non_sign_text"
                          - has_text: true
                          - is_signboard: false
                          - ui_message: "Text detected (non-signboard)."

                       OUTPUT FORMAT (Valid JSON Only):
                       {
                          "has_text": boolean,
                          "content_type": "sign_text" | "sign_symbol" | "non_sign_text" | "no_text",
                          "original_text": "Exact text found (or empty string)",
                          "transliterated_text": "Phonetic reading in ${targetLang.name} script (NOT Latin). E.g. 'Hello' -> 'हेलो'",
                          "translated_text": "Meaning in ${targetLang.name}",
                          "detected_language": "Language Name",
                          "is_signboard": boolean,
                          "ui_message": "Helper string for UI"
                       }
                       
                       Do NOT hallucinate text if none exists.`
                    : `Transliterate "${textInput}" to ${targetLang.name} script (phonetic) and translate meaning. JSON: { "transliterated_text": string, "translated_text": string, "detected_language": string }`;
                  
                  const data = await callGeminiAPI(prompt, imgBase64);
                  
                  // Handle "no_text" case
                  if (data.content_type === 'no_text') {
                      result = {
                          original: "",
                          transliterated: "No Text Detected",
                          translated: "Please scan again",
                          detected: "None",
                          contentType: 'no_text',
                          hasText: false,
                          uiMessage: data.ui_message || "No sign or text detected."
                      };
                  } else {
                      result = { 
                          original: data.original_text || textInput, 
                          transliterated: data.transliterated_text, 
                          translated: data.translated_text, 
                          detected: data.detected_language || "Auto",
                          contentType: data.content_type || 'text', 
                          hasText: data.has_text !== undefined ? data.has_text : true,
                          uiMessage: data.ui_message
                      };
                  }

            } catch (apiError) {
                console.log("API Failed, switching to fallback:", apiError);
                useOfflineEngine = true; // Trigger fallback
                ToastAndroid.show("Online failed. Using Offline Mode.", ToastAndroid.SHORT);
            }
          }

          // --- 2. OFFLINE FALLBACK (OR IF SELECTED) ---
          if (useOfflineEngine) {
              let textToAnalyze = textInput;
              
              if (isImage) {
                  textToAnalyze = await performOfflineOCR(imgUri);
              }

              const offlineData = await offlineAnalyze(textToAnalyze, targetLang, isImage);
              result = {
                  original: offlineData.original,
                  transliterated: offlineData.transliterated,
                  translated: offlineData.translated,
                  detected: offlineData.detected,
                  contentType: offlineData.contentType,
                  hasText: offlineData.hasText,
                  uiMessage: offlineData.hasText ? "Text processed offline." : "No text found."
              };
          }

          const finalResult = { 
              id: processingId, 
              type: isImage ? 'image' : 'text', 
              thumbnail: imgUri, 
              timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
              isLoading: false, 
              colorIndex: colorIdx, 
              ...result 
          };

          if (isImage) {
             setLensResult(finalResult);
             if (saveHistory && result.hasText) addToHistory(finalResult); 
          } else {
             setTextResult(finalResult);
          }
            
          if (autoSpeak && result.transliterated && result.hasText && isImage && result.contentType !== 'no_text') {
              handleSpeak(result.transliterated, finalResult.id); 
          }

      } catch (err) {
          if (isImage) setLensResult(null); 
          if (isImage) Alert.alert("Error", err.message);
      } finally {
          setIsProcessing(false);
          setIsShimmering(false);
      }
  };

  const handleDirectCapture = async () => {
    if (cameraRef.current) {
        setIsShimmering(true); 
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true, skipProcessing: true });
            setCapturedPhoto(photo.uri);
            const placeholderId = Date.now();
            const nextColor = (lastColorIndex + 1) % 7; setLastColorIndex(nextColor);
            setLensResult({ id: placeholderId, isLoading: true, detected: sourceLang.name, transliterated: "Analyzing...", translated: "", original: "", thumbnail: photo.uri, type: 'image', colorIndex: nextColor, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
            const manipulatedImage = await ImageManipulator.manipulateAsync(photo.uri, [{ resize: { width: 800 } }], { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true });
            await handleProcess('', true, manipulatedImage.base64, photo.uri, placeholderId, nextColor, true);
        } catch (error) {
            setIsShimmering(false);
            setCapturedPhoto(null);
            setLensResult(null);
            Alert.alert("Error", "Failed to capture image");
        }
    }
  };

  const renderHeader = () => {
    if (mode === 'settings') {
      return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => changeMode('lens')} style={styles.headerIconBtn}><ChevronLeft size={28} color={textColor} strokeWidth={3} /></TouchableOpacity>
            <Text style={[styles.headerTitle, {color: textColor}]}>SETTINGS</Text>
            <View style={styles.headerIconBtn} /> 
        </View>
      );
    }
    const useTransparent = isCameraMode;
    const headerTextColor = useTransparent ? '#fff' : textColor;
    const headerIconColor = useTransparent ? '#fff' : textColor;

    return (
      <View style={[styles.header, useTransparent && styles.headerTransparent]}>
          {isCameraMode ? (
              <TouchableOpacity onPress={() => setFlash(!flash)} style={styles.headerIconBtn}>
                 {flash ? <Zap size={28} color="#FACC15" fill="#FACC15" strokeWidth={2.5} /> : <ZapOff size={28} color={headerIconColor} strokeWidth={2.5} />}
              </TouchableOpacity>
          ) : (
              <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)} style={styles.headerIconBtn}>
                 {isDarkMode ? <Sun size={28} color={textColor} fill="none" stroke={textColor} strokeWidth={2.5} /> : <Moon size={28} color={textColor} strokeWidth={2.5} />}
              </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, useTransparent ? {color: '#fff', textShadowColor: '#000', textShadowRadius: 3} : {color: headerTextColor}]}>SCRIPTIFY</Text>
          <TouchableOpacity onPress={() => changeMode('settings')} style={styles.headerIconBtn}><Settings size={28} color={headerIconColor} strokeWidth={2.5} /></TouchableOpacity>
      </View>
    );
  };

  const renderLangRow = (isOverlay = false) => (
      <View style={[styles.langRow, isOverlay && styles.langRowOverlay]}>
          <TouchableOpacity onPress={() => setShowSourceModal(true)} style={[styles.langPill, get3DStyle(cardBg)]}><Text style={styles.langLabel}>FROM</Text><Text style={[styles.langValue, {color: textColor}]}>{sourceLang.name}</Text><ChevronDown size={16} color={textColor} /></TouchableOpacity>
          <ArrowRight size={20} color={isOverlay ? '#fff' : textColor} strokeWidth={3} />
          <TouchableOpacity onPress={() => setShowTargetModal(true)} style={[styles.langPill, get3DStyle(cardBg)]}><Text style={styles.langLabel}>TO</Text><Text style={[styles.langValue, {color: textColor}]}>{targetLang.name}</Text><ChevronDown size={16} color={textColor} /></TouchableOpacity>
      </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: appBg}]}>
      <StatusBar barStyle={isDarkMode || isCameraMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
        
      <Modal visible={!!expandedImage} transparent={true} onRequestClose={() => setExpandedImage(null)}>
        <View style={styles.fullImageContainer}><TouchableOpacity style={styles.fullImageClose} onPress={() => setExpandedImage(null)}><X size={28} color="#fff" /></TouchableOpacity>{expandedImage && <Image source={{ uri: expandedImage }} style={styles.fullImage} resizeMode="contain" />}</View>
      </Modal>

      {showDiagnostics && <DiagnosticsScreen onClose={() => setShowDiagnostics(false)} isDarkMode={isDarkMode} />}

      {!isCameraMode ? (<SafeAreaView style={{backgroundColor: appBg, zIndex: 50}}>{renderHeader()}</SafeAreaView>) : (<View style={styles.lensHeaderOverlay}>{renderHeader()}</View>)}

      <View style={{flex: 1}}>
        {isCameraMode ? (
            <>
                <GoogleLensViewfinder 
                    cameraRef={cameraRef} isProcessing={isProcessing} flash={flash} onToggleFlash={() => setFlash(!flash)} onCapture={handleDirectCapture} capturedPhoto={capturedPhoto} isShimmering={isShimmering}
                    onGalleryPress={async () => {
                        let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.5 });
                        if (!res.canceled) {
                            setCapturedPhoto(res.assets[0].uri); 
                            const placeholderId = Date.now();
                            const nextColor = (lastColorIndex + 1) % 7; setLastColorIndex(nextColor);
                            setLensResult({ id: placeholderId, isLoading: true, detected: sourceLang.name, transliterated: "Analyzing...", translated: "", original: "", thumbnail: res.assets[0].uri, type: 'image', colorIndex: nextColor, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
                            handleProcess('', true, res.assets[0].base64, res.assets[0].uri, placeholderId, nextColor, true); 
                        }
                    }}
                />
                {!capturedPhoto && renderLangRow(true)}
            </>
        ) : (
            <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
                <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 200, paddingTop: 0}} showsVerticalScrollIndicator={false}>
                    <View style={{ width: '100%', alignSelf:'center' }}> 
                        
                    {mode === 'lens' && lensResult && (
                        <View style={{marginTop: 10}}> 
                            {renderLangRow()}
                            <ResultCard data={lensResult} isLatest={true} scale={appScale} showOriginal={true} isDarkMode={isDarkMode} playingId={playingId} handleSpeak={handleSpeak} setExpandedImage={setExpandedImage} audioLoading={audioLoading} appBg={appBg} />
                            {!lensResult.isLoading && <TouchableOpacity onPress={() => {setLensResult(null); setCapturedPhoto(null);}} style={[styles.actionBtn, get3DStyle(textColor)]}><Text style={[styles.actionBtnText, {color: appBg}]}>Scan Again</Text></TouchableOpacity>}
                        </View>
                    )}

                    {mode === 'text' && (
                        <View>
                            {renderLangRow()}
                            <View style={[styles.inputContainer, get3DStyle(inputBg), {height: 220 * appScale, marginBottom: 10}]}>
                                <TextInput style={[styles.input, {color: textColor, fontSize: 20 * appScale}]} placeholder="Type here..." placeholderTextColor={THEME.colors.gray} multiline value={inputText} onChangeText={setInputText} />
                                <TouchableOpacity onPress={handleReset} style={styles.goBtn}>
                                    <View style={[styles.goBtnInner, get3DStyle(isDarkMode ? THEME.colors.white : THEME.colors.black)]}>
                                        <RotateCcw size={20} color={isDarkMode ? THEME.colors.black : THEME.colors.white} strokeWidth={3} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                             
                            {textResult && (
                                <View style={{marginTop: 10}}>
                                    <ResultCard data={textResult} isLatest={true} scale={appScale} showOriginal={false} isDarkMode={isDarkMode} playingId={playingId} handleSpeak={handleSpeak} setExpandedImage={setExpandedImage} audioLoading={audioLoading} appBg={appBg} />
                                    {!textResult.isLoading && <TouchableOpacity onPress={() => {setTextResult(null); setInputText(''); setLiveId(null);}} style={[styles.clearBtn]}><Text style={styles.clearBtnText}>Clear Results</Text></TouchableOpacity>}
                                </View>
                            )}
                        </View>
                    )}

                    {mode === 'history' && (
                        <View>
                           {history.length === 0 ? <View style={{alignItems:'center', marginTop: 50}}><Text style={{fontSize: 20, fontWeight:'bold', color: '#ccc'}}>No history yet!</Text></View> : 
                                history.map((item, index) => (
                                    <ResultCard 
                                        key={item.id} 
                                        data={item} 
                                        isLatest={false} 
                                        scale={appScale} 
                                        showOriginal={true} 
                                        isDarkMode={isDarkMode} 
                                        playingId={playingId} 
                                        handleSpeak={handleSpeak} 
                                        setExpandedImage={setExpandedImage} 
                                        audioLoading={audioLoading} 
                                        appBg={appBg}
                                        onDelete={deleteHistoryItem} // Passing Delete Handler
                                    />
                                ))
                           }
                        </View>
                    )}

                    {mode === 'settings' && (
                        <View style={{gap: 20}}>
                            <View style={[styles.settingCard, get3DStyle(cardBg)]}>
                                <Text style={[styles.settingTitle, {backgroundColor: isDarkMode ? '#333' : THEME.colors.offWhite, color: textColor, borderColor: THEME.colors.black}]}>App Size</Text>
                                <View style={[styles.settingRow, {borderBottomWidth:0, justifyContent:'space-between'}]}>
                                    <View style={{flexDirection:'row', alignItems:'center'}}><View style={styles.settingIcon}><Maximize size={20} color={textColor}/></View><Text style={[styles.settingLabel, {color: textColor}]}>{appScale === 1.0 ? "Normal" : appScale < 1.0 ? "Compact" : "Large"}</Text></View>
                                    <View style={{flexDirection:'row', gap: 10}}>
                                        <TouchableOpacity onPress={() => setAppScale(0.8)} style={{padding: 8, backgroundColor: appScale === 0.8 ? '#000' : (isDarkMode ? '#333' : '#eee'), borderRadius: 8}}><Minimize size={20} color={appScale === 0.8 ? '#fff' : textColor} /></TouchableOpacity>
                                        <TouchableOpacity onPress={() => setAppScale(1.0)} style={{padding: 8, backgroundColor: appScale === 1.0 ? '#000' : (isDarkMode ? '#333' : '#eee'), borderRadius: 8}}><Text style={{fontWeight:'bold', color: appScale === 1.0 ? '#fff' : textColor}}>1x</Text></TouchableOpacity>
                                        <TouchableOpacity onPress={() => setAppScale(1.2)} style={{padding: 8, backgroundColor: appScale === 1.2 ? '#000' : (isDarkMode ? '#333' : '#eee'), borderRadius: 8}}><Maximize size={20} color={appScale === 1.2 ? '#fff' : textColor} /></TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* --- THEME SECTION --- */}
                            <View style={[styles.settingCard, get3DStyle(cardBg)]}>
                                <Text style={[styles.settingTitle, {backgroundColor: isDarkMode ? '#333' : THEME.colors.offWhite, color: textColor, borderColor: THEME.colors.black}]}>Visual Theme</Text>
                                <TouchableOpacity onPress={() => setShowThemeModal(true)} style={[styles.settingRow, {borderBottomWidth:0}]}>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                        <View style={styles.settingIcon}><Palette size={20} color={textColor}/></View>
                                        <View>
                                            <Text style={[styles.settingLabel, {color: textColor}]}>{selectedTheme.name}</Text>
                                            <Text style={styles.settingDesc}>{selectedTheme.desc}</Text>
                                        </View>
                                    </View>
                                    <ChevronRight size={20} color={textColor}/>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.settingCard, get3DStyle(cardBg)]}><Text style={[styles.settingTitle, {backgroundColor: isDarkMode ? '#333' : THEME.colors.offWhite, color: textColor, borderColor: THEME.colors.black}]}>AI Model</Text><TouchableOpacity onPress={() => setShowProviderModal(true)} style={[styles.settingRow, {borderBottomWidth:0}]}><View style={{flexDirection:'row', alignItems:'center'}}><View style={styles.settingIcon}><Cpu size={20} color={textColor}/></View><View><Text style={[styles.settingLabel, {color: textColor}]}>{selectedProvider.name}</Text><Text style={styles.settingDesc}>{selectedProvider.desc}</Text></View></View><ChevronRight size={20} color={textColor}/></TouchableOpacity></View>
                            <View style={[styles.settingCard, get3DStyle(cardBg)]}><Text style={[styles.settingTitle, {backgroundColor: isDarkMode ? '#333' : THEME.colors.offWhite, color: textColor, borderColor: THEME.colors.black}]}>Voice Engine</Text><TouchableOpacity onPress={() => setShowTTSModal(true)} style={[styles.settingRow, {borderBottomWidth:0}]}><View style={{flexDirection:'row', alignItems:'center'}}><View style={styles.settingIcon}><Speaker size={20} color={textColor}/></View><View><Text style={[styles.settingLabel, {color: textColor}]}>{selectedTTS.name}</Text><Text style={styles.settingDesc}>{selectedTTS.desc}</Text></View></View><ChevronRight size={20} color={textColor}/></TouchableOpacity></View>
                            
                            {/* --- PREFERENCES --- */}
                            <View style={[styles.settingCard, get3DStyle(cardBg)]}>
                                <Text style={[styles.settingTitle, {backgroundColor: isDarkMode ? '#333' : THEME.colors.offWhite, color: textColor, borderColor: THEME.colors.black}]}>Preferences</Text>
                                <View style={[styles.settingRow, {borderColor: isDarkMode ? '#333' : '#f0f0f0'}]}><View style={{flexDirection:'row', alignItems:'center'}}><View style={styles.settingIcon}><Mic size={20} color={textColor}/></View><Text style={[styles.settingLabel, {color: textColor}]}>Auto-Speak</Text></View><Switch value={autoSpeak} onValueChange={setAutoSpeak} trackColor={{true: THEME.colors.success, false: '#e2e8f0'}} thumbColor="#fff"/></View>
                                <View style={[styles.settingRow, {borderColor: isDarkMode ? '#333' : '#f0f0f0'}]}><View style={{flexDirection:'row', alignItems:'center'}}><View style={styles.settingIcon}><History size={20} color={textColor}/></View><Text style={[styles.settingLabel, {color: textColor}]}>Save History</Text></View><Switch value={saveHistory} onValueChange={setSaveHistory} trackColor={{true: THEME.colors.success, false: '#e2e8f0'}} thumbColor="#fff"/></View>
                                {/* CLEAR HISTORY BUTTON */}
                                <TouchableOpacity onPress={clearAllHistory} style={[styles.settingRow, {borderBottomWidth:0}]}>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                        <View style={styles.settingIcon}><Trash2 size={20} color={THEME.colors.error}/></View>
                                        <Text style={[styles.settingLabel, {color: THEME.colors.error}]}>Clear All History</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* --- DIAGNOSTICS ENTRY --- */}
                            <TouchableOpacity onPress={() => setShowDiagnostics(true)} style={{padding: 20, alignItems:'center', opacity: 0.5}}>
                                <Text style={{color: textColor, fontSize: 12}}>Run Diagnostics (Dev Only)</Text>
                            </TouchableOpacity>

                        </View>
                    )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        )}
      </View>

      {mode !== 'settings' && (
          <View style={styles.navContainer}>
              <View style={[styles.navPill, get3DStyle(isDarkMode ? THEME.colors.darkCard : THEME.colors.white)]}>
                  <View style={styles.navItemContainer}><TouchableOpacity onPress={() => changeMode('text')} style={[styles.navItem, mode === 'text' && styles.navItemActive]}><Type size={20} color={mode === 'text' ? '#fff' : textColor} strokeWidth={2.5} />{mode === 'text' && <Text style={styles.navTextActive}>Type</Text>}</TouchableOpacity></View>
                  
                  {/* --- CONDITIONAL LENS RENDERING (Removed in Offline Mode) --- */}
                  {selectedProvider.code !== 'offline' && (
                      <View style={styles.navItemContainer}><TouchableOpacity onPress={() => changeMode('lens')} style={[styles.navItem, mode === 'lens' && styles.navItemActive]}>{mode === 'lens' ? (<View style={{flexDirection:'row', alignItems:'center'}}><Aperture size={20} color="#fff" strokeWidth={2.5} /><Text style={styles.navTextActive}>Lens</Text></View>) : (<Aperture size={24} color={textColor} strokeWidth={2.5} />)}</TouchableOpacity></View>
                  )}

                  <View style={styles.navItemContainer}><TouchableOpacity onPress={() => changeMode('history')} style={[styles.navItem, mode === 'history' && styles.navItemActive]}><History size={20} color={mode === 'history' ? '#fff' : textColor} strokeWidth={2.5} />{mode === 'history' && <Text style={styles.navTextActive}>History</Text>}</TouchableOpacity></View>
              </View>
          </View>
      )}

      <SelectionModal visible={showSourceModal} onClose={()=>setShowSourceModal(false)} title="Translate From" options={SOURCE_OPTIONS} onSelect={setSourceLang} isDarkMode={isDarkMode} />
      <SelectionModal visible={showTargetModal} onClose={()=>setShowTargetModal(false)} title="Translate To" options={LANGUAGES} onSelect={setTargetLang} isDarkMode={isDarkMode} />
      <SelectionModal visible={showProviderModal} onClose={()=>setShowProviderModal(false)} title="AI Model" options={PROVIDER_OPTIONS} onSelect={setSelectedProvider} isDarkMode={isDarkMode} />
      <SelectionModal visible={showTTSModal} onClose={()=>setShowTTSModal(false)} title="Voice Engine" options={TTS_OPTIONS} onSelect={setSelectedTTS} isDarkMode={isDarkMode} />
      <SelectionModal visible={showThemeModal} onClose={()=>setShowThemeModal(false)} title="Visual Theme" options={THEME_OPTIONS} onSelect={setSelectedTheme} isDarkMode={isDarkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, paddingTop: Platform.OS==='android'?45:16 },
  headerTransparent: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  headerIconBtn: { width: 44, height: 44, justifyContent:'center', alignItems:'center' },
  lensHeaderOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, paddingTop: Platform.OS==='android'?10:0 },
  lensContainer: { flex: 1, backgroundColor: '#000' },
  viewfinderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 },
  floatingFlashBtn: { position: 'absolute', top: 100, right: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  corner: { position: 'absolute', width: 60, height: 60, borderColor: 'rgba(255, 255, 255, 0.6)', borderWidth: 1.5, zIndex: 10 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 32 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 32 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 32 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 32 },
  lensControlsRow: { position: 'absolute', bottom: 120, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 20 },
  controlBtnSmall: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  shutterBtnContainer: { },
  shutterBtnOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', borderWidth: 4, borderColor: '#000', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 8 },
  shimmerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 40, backgroundColor: '#FACC15', zIndex: 1 },
  processingBox: { padding: 24, alignItems: 'center', width: 220 },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  langRowOverlay: { position: 'absolute', top: 110, left: 20, right: 20, zIndex: 100 },
  langPill: { flex: 1, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  langLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8' },
  langValue: { fontSize: 16, fontWeight: 'bold' },
  inputContainer: { padding: 16, marginBottom: 20 },
  input: { flex: 1, fontWeight: '600', textAlignVertical: 'top' },
  goBtn: { position: 'absolute', bottom: 16, right: 16 },
  goBtnInner: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  clearBtn: { alignSelf: 'center', padding: 10 },
  clearBtnText: { color: '#94a3b8', fontWeight: 'bold' },
  resultCard: { marginBottom: 20, width: '100%', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 3 },
  langBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  langBadgeText: { fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  cardBody: { padding: 20 },
  thumbContainer: { width: '100%', height: 150, marginBottom: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 3 },
  resultThumb: { width: '100%', height: '100%' },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', marginBottom: 4, letterSpacing: 1 },
  originalText: { marginBottom: 16 },
  mainText: { fontWeight: '800' },
  translationBox: { marginTop: 4, padding: 12, borderRadius: 12, borderWidth: 2 },
  translationText: { fontStyle: 'italic' },
  actionBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  actionBtnText: { fontWeight: 'bold', fontSize: 16 },
  settingCard: { padding: 0, overflow: 'hidden' },
  settingTitle: { fontSize: 18, fontWeight: '900', padding: 16, borderBottomWidth: 3 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2 },
  settingIcon: { width: 32, alignItems: 'center' },
  settingLabel: { fontSize: 16, fontWeight: 'bold' },
  settingDesc: { fontSize: 12, color: '#666' },
  navContainer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center', zIndex: 100 },
  navPill: { flexDirection: 'row', padding: 6, width: '85%', justifyContent: 'space-between', borderRadius: 100 },
  navItemContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navItem: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, flexDirection: 'row', alignItems: 'center' },
  navItemActive: { backgroundColor: '#000' },
  navTextActive: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 3, borderColor: '#000', borderBottomWidth: 8, borderRightWidth: 6, overflow: 'hidden', maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 3, borderBottomColor: '#000', backgroundColor: THEME.colors.pastelPeach },
  modalTitle: { fontSize: 20, fontWeight: '900' },
  modalList: { padding: 20 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: '#eee' },
  modalItemName: { fontSize: 18, fontWeight: 'bold' },
  modalItemDesc: { fontSize: 12, color: '#666' },
  fullImageContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
  fullImage: { width: '100%', height: '100%' },
  fullImageClose: { position: 'absolute', top: 50, right: 20, width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 22, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  permContainer: { flex:1, backgroundColor:'#000', alignItems:'center', justifyContent:'center'},
  permBtn: { backgroundColor: '#fff', padding: 20, borderRadius: 20 },
  permBtnText: { fontWeight: 'bold' },
});