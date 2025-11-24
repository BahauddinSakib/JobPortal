// lib/cv-matcher.js

class CVMatcher {
  /**
   * Match CV content with job description
   * @param {string} jobDescription - The job description text
   * @param {string} cvText - The CV/resume text
   * @returns {Promise<Object>} Match result with score and details
   */
  static async matchCV(jobDescription, cvText) {
    try {
      // If no CV text provided, return default score
      if (!cvText || !jobDescription) {
        return {
          score: 0,
          matchedKeywords: [],
          totalKeywords: 0,
          matchedCount: 0,
          explanation: 'No CV text or job description provided'
        };
      }

      // Simple keyword matching algorithm
      const jobKeywords = this.extractKeywords(jobDescription);
      const cvKeywords = this.extractKeywords(cvText);
      
      // Calculate match score
      const matchedKeywords = jobKeywords.filter(keyword => 
        cvKeywords.some(cvWord => this.fuzzyMatch(cvWord, keyword))
      );
      
      const score = jobKeywords.length > 0 
        ? (matchedKeywords.length / jobKeywords.length) * 100 
        : 0;
      
      return {
        score: Math.round(Math.min(score, 100)),
        matchedKeywords: matchedKeywords.slice(0, 10), // Top 10 matches
        totalKeywords: jobKeywords.length,
        matchedCount: matchedKeywords.length,
        explanation: this.generateExplanation(score, matchedKeywords.length, jobKeywords.length)
      };
    } catch (error) {
      console.error('CV matching error:', error);
      return {
        score: 0,
        matchedKeywords: [],
        totalKeywords: 0,
        matchedCount: 0,
        explanation: 'Error processing CV match',
        error: error.message
      };
    }
  }

  /**
   * Extract important keywords from text
   */
  static extractKeywords(text) {
    if (!text) return [];
    
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !stopWords.has(word) &&
        !/\d/.test(word) // Exclude pure numbers
      )
      .slice(0, 50); // Limit to top 50 keywords
  }

  /**
   * Simple fuzzy matching
   */
  static fuzzyMatch(word1, word2) {
    return word1.includes(word2) || word2.includes(word1);
  }

  /**
   * Generate human-readable explanation
   */
  static generateExplanation(score, matched, total) {
    if (score >= 80) return 'Excellent match! Strong alignment with job requirements.';
    if (score >= 60) return 'Good match. Meets most key requirements.';
    if (score >= 40) return 'Moderate match. Some relevant skills found.';
    if (score >= 20) return 'Limited match. Few relevant keywords found.';
    return 'Poor match. Limited alignment with job requirements.';
  }

  /**
   * Process multiple applications with CV matching
   */
  static async processApplications(applications, jobDescription) {
    const processedApplications = [];
    
    for (const application of applications) {
      try {
        let matchResult = {
          score: 0,
          matchedKeywords: [],
          explanation: 'No CV available for matching'
        };
        
        // If there's a CV file path, you could read and process it here
        // For now, we'll use any available text from the application
        if (application.cover_letter || application.skills) {
          const cvText = `${application.cover_letter || ''} ${application.skills || ''}`;
          matchResult = await this.matchCV(jobDescription, cvText);
        }
        
        processedApplications.push({
          ...application,
          matchScore: matchResult.score,
          matchDetails: matchResult
        });
      } catch (error) {
        console.error(`Error processing application ${application.id}:`, error);
        processedApplications.push({
          ...application,
          matchScore: 0,
          matchDetails: {
            score: 0,
            matchedKeywords: [],
            explanation: 'Error processing CV match'
          }
        });
      }
    }
    
    return processedApplications;
  }
}

export default CVMatcher;