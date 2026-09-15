export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms?: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
  synonyms?: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  meanings: DictionaryMeaning[];
  sourceUrl?: string;
}

// In-memory cache for ultra-fast instant repeated lookups
const memoryCache = new Map<string, DictionaryEntry>();

// Rich fallback scholastic lexicon for offline resilience and academic terminology
const SCHOLASTIC_LEXICON: Record<string, Omit<DictionaryEntry, 'word'>> = {
  scholastic: {
    phonetic: '/skəˈlæstɪk/',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Of or concerning education, schools, and academic study.',
            example: 'The university recognized her exceptional scholastic achievements.'
          }
        ],
        synonyms: ['academic', 'educational', 'intellectual', 'learned']
      }
    ]
  },
  pedagogy: {
    phonetic: '/ˈpɛdəɡɒdʒi/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The method, practice, and theory of teaching and education.',
            example: 'Innovative student-centered pedagogy fosters deeper classroom engagement.'
          }
        ],
        synonyms: ['teaching', 'instruction', 'education', 'tutelage']
      }
    ]
  },
  epistemology: {
    phonetic: '/ɪˌpɪstɪˈmɒlədʒi/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The branch of philosophy concerned with the theory, nature, and grounds of knowledge.',
            example: 'His paper explores the epistemology of modern computational science.'
          }
        ],
        synonyms: ['theory of knowledge', 'philosophy']
      }
    ]
  },
  empirical: {
    phonetic: '/ɪmˈpɪrɪkəl/',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Based on, concerned with, or verifiable by observation or experience rather than purely theory or pure logic.',
            example: 'The researchers gathered empirical evidence across three independent trials.'
          }
        ],
        synonyms: ['observational', 'factual', 'experimental', 'verified']
      }
    ]
  },
  paradigm: {
    phonetic: '/ˈpærədaɪm/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A typical pattern, archetype, or distinct set of concepts and thought patterns within an academic discipline.',
            example: 'The study represents a paradigm shift in environmental economics.'
          }
        ],
        synonyms: ['model', 'framework', 'archetype', 'standard']
      }
    ]
  },
  hypothesis: {
    phonetic: '/haɪˈpɒθɪsɪs/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A proposed explanation made as a starting point for further investigation based on limited initial evidence.',
            example: 'The scholar formulated a testable hypothesis regarding algorithmic bias.'
          }
        ],
        synonyms: ['theory', 'proposition', 'thesis', 'conjecture']
      }
    ]
  },
  methodology: {
    phonetic: '/ˌmɛθəˈdɒlədʒi/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A system of methods used in a particular area of study or activity.',
            example: 'A robust quantitative methodology was established to evaluate survey data.'
          }
        ],
        synonyms: ['procedure', 'technique', 'framework', 'system']
      }
    ]
  },
  synthesis: {
    phonetic: '/ˈsɪnθɪsɪs/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The combination of ideas or components to form a coherent, integrated whole.',
            example: 'Her literature review provides a thoughtful synthesis of recent findings.'
          }
        ],
        synonyms: ['integration', 'amalgamation', 'combination', 'fusion']
      }
    ]
  },
  rhetoric: {
    phonetic: '/ˈrɛtərɪk/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The art of effective or persuasive speaking and writing, often utilizing figures of speech and compositional techniques.',
            example: 'The manuscript analyzes the classical rhetoric of political debates.'
          }
        ],
        synonyms: ['oratory', 'eloquence', 'discourse', 'persuasion']
      }
    ]
  },
  dialectic: {
    phonetic: '/ˌdaɪəˈlɛktɪk/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'The art of investigating or discussing the truth of opinions through logical argumentation and resolving contradictions.',
            example: 'The essay frames the dilemma as a dialectic between individual liberty and collective security.'
          }
        ],
        synonyms: ['logic', 'reasoning', 'argumentation', 'debate']
      }
    ]
  },
  manuscript: {
    phonetic: '/ˈmænjʊskrɪpt/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'An author’s text that has not yet been published, or a submitted academic draft for scholarly peer review.',
            example: 'The student submitted the revised manuscript for peer consideration.'
          }
        ],
        synonyms: ['paper', 'document', 'draft', 'text']
      }
    ]
  },
  heuristic: {
    phonetic: '/hjʊəˈrɪstɪk/',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Enabling a person to discover or learn something for themselves; a practical method not guaranteed to be optimal but sufficient for immediate goals.',
            example: 'Heuristic methods allow complex decision models to find swift solutions.'
          }
        ],
        synonyms: ['exploratory', 'rule-of-thumb', 'practical', 'problem-solving']
      }
    ]
  },
  qualitative: {
    phonetic: '/ˈkwɒlɪtətɪv/',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Relating to, measuring, or measured by the quality or descriptive nature of something rather than its numerical quantity.',
            example: 'The qualitative interviews highlighted key cultural nuances.'
          }
        ],
        synonyms: ['descriptive', 'interpretive', 'subjective']
      }
    ]
  },
  quantitative: {
    phonetic: '/ˈkwɒntɪtətɪv/',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Relating to, measuring, or measured by the quantity of something rather than its descriptive quality.',
            example: 'Quantitative analysis of the survey answers revealed statistically significant trends.'
          }
        ],
        synonyms: ['numerical', 'statistical', 'measurable']
      }
    ]
  },
  nuance: {
    phonetic: '/ˈnjuːɑːns/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A subtle distinction or variation in shade of meaning, tone, expression, or feeling.',
            example: 'Effective academic prose captures the nuance of competing arguments.'
          }
        ],
        synonyms: ['subtlety', 'shade', 'refinement', 'distinction']
      }
    ]
  },
  juxtapose: {
    phonetic: '/ˌdʒʌkstəˈpəʊz/',
    meanings: [
      {
        partOfSpeech: 'verb',
        definitions: [
          {
            definition: 'To place or deal with close together for contrasting effect.',
            example: 'The author juxtaposes traditional educational paradigms with contemporary digital learning.'
          }
        ],
        synonyms: ['contrast', 'compare', 'collocate']
      }
    ]
  },
  cognitive: {
    phonetic: '/ˈkɒɡnɪtɪv/',
    meanings: [
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Relating to cognition, including processes of conscious intellectual activity such as thinking, reasoning, remembering, and imagining.',
            example: 'Active reading strengthens long-term cognitive retention.'
          }
        ],
        synonyms: ['intellectual', 'mental', 'cerebral', 'rational']
      }
    ]
  },
  peer: {
    phonetic: '/pɪə/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A person of the same age, status, or ability as another; an equal in scholarly community.',
            example: 'The paper underwent rigorous evaluation by student peers.'
          }
        ],
        synonyms: ['colleague', 'contemporary', 'equal', 'fellow']
      }
    ]
  },
  abstract: {
    phonetic: '/ˈæbstrækt/',
    meanings: [
      {
        partOfSpeech: 'noun',
        definitions: [
          {
            definition: 'A brief summary of a scholarly article, thesis, review, or in-depth analysis of a particular subject.',
            example: 'Scholars read the abstract to assess relevance prior to reading the complete text.'
          }
        ],
        synonyms: ['summary', 'synopsis', 'overview', 'precis']
      },
      {
        partOfSpeech: 'adjective',
        definitions: [
          {
            definition: 'Existing in thought or as an idea but not having a physical or concrete existence.',
            example: 'Mathematical concepts can often appear abstract to young learners.'
          }
        ],
        synonyms: ['theoretical', 'conceptual', 'philosophical']
      }
    ]
  }
};

/**
 * Strips punctuation, quotes, trailing plural markers, and whitespace to isolate the base word.
 */
export function cleanWordForLookup(rawText: string): string {
  if (!rawText) return '';
  // Take first word if multiple are present
  const firstWord = rawText.trim().split(/\s+/)[0];
  // Strip non-letter characters from start and end (preserving internal hyphens or apostrophes)
  const cleaned = firstWord.replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
  return cleaned;
}

/**
 * Determines whether a highlighted string is eligible for dictionary lookup (1-2 words, valid letters).
 */
export function isWordLookupCandidate(rawText: string): boolean {
  if (!rawText) return false;
  const words = rawText.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 2) return false;
  const candidate = cleanWordForLookup(words[0]);
  return candidate.length >= 2 && candidate.length <= 45 && /^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF'-]+$/.test(candidate);
}

/**
 * Looks up a word definition using Free Dictionary API, with localStorage/memory caching
 * and built-in scholastic offline fallback.
 */
export async function lookupDictionaryWord(rawWord: string): Promise<DictionaryEntry | null> {
  const cleanWord = cleanWordForLookup(rawWord);
  if (!cleanWord || cleanWord.length < 2) return null;

  const cacheKey = cleanWord.toLowerCase();

  // 1. Check memory cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 2. Check localStorage cache
  try {
    const saved = localStorage.getItem(`impacted_dict_${cacheKey}`);
    if (saved) {
      const parsed: DictionaryEntry = JSON.parse(saved);
      memoryCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch {
    // ignore storage read error
  }

  // 3. Check built-in scholastic lexicon
  if (SCHOLASTIC_LEXICON[cacheKey]) {
    const localEntry: DictionaryEntry = {
      word: cleanWord,
      ...SCHOLASTIC_LEXICON[cacheKey]
    };
    memoryCache.set(cacheKey, localEntry);
    return localEntry;
  }

  // 4. Fetch from Free Dictionary API (CORS-friendly, public)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cacheKey)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        
        // Find audio if available
        let audioUrl: string | undefined;
        if (Array.isArray(item.phonetics)) {
          const audioObj = item.phonetics.find((p: any) => p.audio && p.audio.length > 0);
          if (audioObj) {
            audioUrl = audioObj.audio;
          }
        }

        const meanings: DictionaryMeaning[] = (item.meanings || []).map((m: any) => ({
          partOfSpeech: m.partOfSpeech || 'definition',
          definitions: (m.definitions || []).slice(0, 3).map((d: any) => ({
            definition: d.definition || '',
            example: d.example,
            synonyms: Array.isArray(d.synonyms) ? d.synonyms.slice(0, 5) : []
          })),
          synonyms: Array.isArray(m.synonyms) ? m.synonyms.slice(0, 5) : []
        })).filter((m: DictionaryMeaning) => m.definitions.length > 0);

        const entry: DictionaryEntry = {
          word: item.word || cleanWord,
          phonetic: item.phonetic || (item.phonetics && item.phonetics[0]?.text) || undefined,
          audioUrl,
          meanings,
          sourceUrl: item.sourceUrls?.[0]
        };

        // Cache result
        memoryCache.set(cacheKey, entry);
        try {
          localStorage.setItem(`impacted_dict_${cacheKey}`, JSON.stringify(entry));
        } catch {
          // ignore storage quota error
        }

        return entry;
      }
    }
  } catch (err) {
    // Network or abort error, continue to fallback attempts
    console.debug(`Dictionary API fetch failed for "${cleanWord}", falling back...`, err);
  }

  // 5. Secondary fallback: Datamuse API (free definitions & parts of speech)
  try {
    const dmRes = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(cacheKey)}&md=dp&max=1`);
    if (dmRes.ok) {
      const dmData = await dmRes.json();
      if (Array.isArray(dmData) && dmData.length > 0 && dmData[0].defs && dmData[0].defs.length > 0) {
        const item = dmData[0];
        const rawDefs: string[] = item.defs;
        const meaningsMap: Record<string, DictionaryDefinition[]> = {};

        rawDefs.forEach((dStr: string) => {
          const parts = dStr.split('\t');
          const posCode = parts[0] || 'n';
          const defText = parts[1] || dStr;
          const posMap: Record<string, string> = {
            n: 'noun',
            v: 'verb',
            adj: 'adjective',
            adv: 'adverb',
            u: 'term'
          };
          const pos = posMap[posCode] || posCode;
          if (!meaningsMap[pos]) meaningsMap[pos] = [];
          meaningsMap[pos].push({ definition: defText });
        });

        const meanings: DictionaryMeaning[] = Object.entries(meaningsMap).map(([partOfSpeech, definitions]) => ({
          partOfSpeech,
          definitions: definitions.slice(0, 2)
        }));

        const fallbackEntry: DictionaryEntry = {
          word: item.word || cleanWord,
          meanings
        };

        memoryCache.set(cacheKey, fallbackEntry);
        return fallbackEntry;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Pronounces a given word aloud using either the audio file URL or the browser's Web Speech API.
 */
export function speakWord(word: string, audioUrl?: string): void {
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        speakViaWebSpeech(word);
      });
      return;
    } catch {
      // fallback to Web Speech
    }
  }
  speakViaWebSpeech(word);
}

function speakViaWebSpeech(word: string): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  }
}
