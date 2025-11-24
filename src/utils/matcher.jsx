import { pipeline } from '@xenova/transformers';

class JobCVMatcher {
  constructor() {
    this.model = null;
  }

  async initialize() {
    this.model = await pipeline(
      'feature-extraction', 
      'Xenova/all-mpnet-base-v2'
    );
  }

  async getEmbedding(text) {
    if (!this.model) await this.initialize();
    const result = await this.model(text, {
      pooling: 'mean',
      normalize: true
    });
    return Array.from(result.data);
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async calculateMatch(job, cv) {
    const jobText = `
      Job Title: ${job.j_title}
      Job Description: ${job.j_description}
      Required Skills: ${job.j_skills}
      Required Education: ${job.j_degree_name}
      Experience Required: ${job.j_experience_id}
    `;

    const cvText = `
      Professional Summary: ${cv.summary}
      Skills: ${cv.skills}
      Work Experience: ${cv.experience}
      Education: ${cv.education}
    `;

    const [jobEmbedding, cvEmbedding] = await Promise.all([
      this.getEmbedding(jobText),
      this.getEmbedding(cvText)
    ]);

    const similarity = this.cosineSimilarity(jobEmbedding, cvEmbedding);
    const score = Math.round(similarity * 100);

    return {
      score: score,
      category: score >= 70 ? 'Good Match' : 'Needs Review'
    };
  }
}

export default new JobCVMatcher();