// Pure NLP-based job matching with dynamic text analysis
class DynamicNLPMatcher {
  constructor() {
    this.stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
      'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could', 'may', 'might', 'must',
      'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine'
    ]);
  }

  // Advanced text preprocessing
  preprocessText(text) {
    if (!text) return [];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation but keep spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .split(' ')
      .filter(word => 
        word.length > 2 && 
        !this.stopWords.has(word) &&
        !/\d+/.test(word) // Remove pure numbers
      )
      .map(word => this.stemWord(word)); // Basic stemming
  }

  // Simple Porter stemmer implementation
  stemWord(word) {
    if (word.length < 3) return word;
    
    // Common suffixes
    const suffixes = [
      'ing', 'ed', 'es', 's', 'ly', 'ment', 'ness', 'ful', 'less', 'able', 'ible'
    ];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    
    return word;
  }

  // Calculate TF-IDF like weights (simplified)
  calculateTermWeights(documents) {
    const termFreq = {};
    const docFreq = {};
    
    // Calculate term frequency and document frequency
    documents.forEach((doc, docIndex) => {
      const terms = new Set(doc);
      terms.forEach(term => {
        if (!termFreq[term]) termFreq[term] = {};
        termFreq[term][docIndex] = (termFreq[term][docIndex] || 0) + 1;
        
        docFreq[term] = (docFreq[term] || 0) + 1;
      });
    });

    // Calculate TF-IDF weights
    const weights = {};
    Object.keys(termFreq).forEach(term => {
      weights[term] = {};
      Object.keys(termFreq[term]).forEach(docIndex => {
        const tf = termFreq[term][docIndex];
        const idf = Math.log(documents.length / (docFreq[term] || 1));
        weights[term][docIndex] = tf * idf;
      });
    });

    return weights;
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    const terms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    terms.forEach(term => {
      const a = vecA[term] || 0;
      const b = vecB[term] || 0;
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    });

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Extract key phrases using word co-occurrence
  extractKeyPhrases(text, minWords = 2, maxWords = 3) {
    if (!text) return [];
    
    const words = this.preprocessText(text);
    const phrases = [];
    
    // Generate n-grams
    for (let n = minWords; n <= maxWords; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        const phrase = words.slice(i, i + n).join(' ');
        if (phrase.split(' ').every(word => word.length > 2)) {
          phrases.push(phrase);
        }
      }
    }
    
    // Calculate phrase frequency
    const phraseFreq = {};
    phrases.forEach(phrase => {
      phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
    });
    
    // Return top phrases by frequency
    return Object.entries(phraseFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([phrase]) => phrase);
  }

  // Advanced semantic similarity using word embeddings concept
  calculateSemanticSimilarity(text1, text2) {
    const tokens1 = this.preprocessText(text1);
    const tokens2 = this.preprocessText(text2);
    
    if (tokens1.length === 0 || tokens2.length === 0) return 0;
    
    // Create document vectors using term frequency
    const vec1 = this.createFrequencyVector(tokens1);
    const vec2 = this.createFrequencyVector(tokens2);
    
    // Calculate multiple similarity measures
    const cosineSim = this.cosineSimilarity(vec1, vec2);
    const jaccardSim = this.jaccardSimilarity(tokens1, tokens2);
    const overlapSim = this.overlapCoefficient(tokens1, tokens2);
    
    // Weighted combination of different similarity measures
    return (cosineSim * 0.5 + jaccardSim * 0.3 + overlapSim * 0.2);
  }

  createFrequencyVector(tokens) {
    const vector = {};
    tokens.forEach(token => {
      vector[token] = (vector[token] || 0) + 1;
    });
    return vector;
  }

  jaccardSimilarity(set1, set2) {
    const intersection = new Set([...set1].filter(x => set2.includes(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  overlapCoefficient(set1, set2) {
    const intersection = new Set([...set1].filter(x => set2.includes(x)));
    const minSize = Math.min(set1.length, set2.length);
    return minSize === 0 ? 0 : intersection.size / minSize;
  }

  // Extract experience level using NLP patterns
  extractExperience(text) {
    if (!text) return { years: 0, level: 'entry' };
    
    const patterns = [
      { regex: /(\d+)\s*\+\s*years?/gi, weight: 1 },
      { regex: /(\d+)[\s\-](\d+)\s*years?/gi, weight: 1 },
      { regex: /senior|lead|principal|head|director/gi, weight: 5 },
      { regex: /mid[\s-]level|intermediate/gi, weight: 3 },
      { regex: /junior|entry[\s-]level|fresher/gi, weight: 1 },
      { regex: /intern|trainee/gi, weight: 0 }
    ];

    let totalYears = 0;
    let levelScore = 0;
    let foundYears = false;

    patterns.forEach(({ regex, weight }) => {
      const matches = [...text.matchAll(regex)];
      matches.forEach(match => {
        if (weight === 1 && match[1]) {
          // Extract years
          totalYears += parseInt(match[1]);
          foundYears = true;
        } else {
          levelScore += weight;
        }
      });
    });

    // Determine experience level
    let level = 'entry';
    if (levelScore >= 5 || totalYears >= 8) level = 'senior';
    else if (levelScore >= 3 || totalYears >= 5) level = 'mid';
    else if (levelScore >= 1 || totalYears >= 2) level = 'junior';

    return { years: foundYears ? totalYears : 0, level };
  }

  // Extract education information
  extractEducation(text) {
    if (!text) return { level: 'unknown', field: 'unknown' };
    
    const educationPatterns = {
      levels: {
        'phd|doctorate|d.phil': 'phd',
        'master|m\.sc|m\.a|m\.tech|mba': 'master',
        'bachelor|b\.sc|b\.a|b\.tech|bachelor\'s': 'bachelor',
        'associate|diploma|certificate': 'associate',
        'high school|secondary|hs': 'high_school'
      },
      fields: {
        'computer science|cs|software engineering': 'computer_science',
        'electrical engineering|ee': 'electrical_engineering',
        'mechanical engineering|me': 'mechanical_engineering',
        'business administration|bba|mba': 'business',
        'mathematics|maths': 'mathematics',
        'physics': 'physics',
        'chemistry': 'chemistry',
        'biology': 'biology'
      }
    };

    let highestLevel = 'unknown';
    let field = 'unknown';

    Object.entries(educationPatterns.levels).forEach(([pattern, level]) => {
      if (new RegExp(pattern, 'gi').test(text)) {
        highestLevel = level;
      }
    });

    Object.entries(educationPatterns.fields).forEach(([pattern, foundField]) => {
      if (new RegExp(pattern, 'gi').test(text)) {
        field = foundField;
      }
    });

    return { level: highestLevel, field };
  }

  // Main matching function
  calculateJobMatch(job, applicantData) {
    const jobText = `${job.j_title || ''} ${job.j_description || ''} ${job.j_skills || ''}`;
    const applicantText = `${applicantData.summary || ''} ${applicantData.experience || ''} ${applicantData.education || ''} ${applicantData.skills || ''}`;

    // Calculate semantic similarity
    const semanticScore = this.calculateSemanticSimilarity(jobText, applicantText);
    
    // Extract and compare key phrases
    const jobPhrases = this.extractKeyPhrases(jobText);
    const applicantPhrases = this.extractKeyPhrases(applicantText);
    const phraseOverlap = this.jaccardSimilarity(jobPhrases, applicantPhrases);
    
    // Experience matching
    const jobExp = this.extractExperience(jobText);
    const applicantExp = this.extractExperience(applicantText);
    const expMatch = this.calculateExperienceMatch(jobExp, applicantExp);
    
    // Education matching
    const jobEdu = this.extractEducation(jobText);
    const applicantEdu = this.extractEducation(applicantText);
    const eduMatch = this.calculateEducationMatch(jobEdu, applicantEdu);

    // Weighted final score
    const finalScore = (
      semanticScore * 0.4 +
      phraseOverlap * 0.3 +
      expMatch * 0.2 +
      eduMatch * 0.1
    ) * 100;

    return {
      score: Math.round(finalScore),
      category: this.getMatchCategory(finalScore),
      details: {
        semanticSimilarity: Math.round(semanticScore * 100),
        keywordOverlap: Math.round(phraseOverlap * 100),
        experienceMatch: Math.round(expMatch * 100),
        educationMatch: Math.round(eduMatch * 100),
        jobKeyPhrases: jobPhrases.slice(0, 5),
        applicantKeyPhrases: applicantPhrases.slice(0, 5)
      }
    };
  }

  calculateExperienceMatch(jobExp, applicantExp) {
    const levelWeights = { entry: 1, junior: 2, mid: 3, senior: 4 };
    const jobLevel = levelWeights[jobExp.level] || 1;
    const applicantLevel = levelWeights[applicantExp.level] || 1;
    
    if (applicantLevel >= jobLevel) return 1.0;
    return applicantLevel / jobLevel;
  }

  calculateEducationMatch(jobEdu, applicantEdu) {
    const levelWeights = { 
      high_school: 1, associate: 2, bachelor: 3, master: 4, phd: 5, unknown: 1 
    };
    const jobLevel = levelWeights[jobEdu.level] || 1;
    const applicantLevel = levelWeights[applicantEdu.level] || 1;
    
    if (applicantLevel >= jobLevel) return 1.0;
    return applicantLevel / jobLevel;
  }

  getMatchCategory(score) {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 50) return 'Potential Match';
    if (score >= 30) return 'Weak Match';
    return 'Poor Match';
  }
}

module.exports = { DynamicNLPMatcher };