import { GoogleGenAI, Type } from "@google/genai";
import { EstimateResult, ProjectComplexity, FieldValue, ScopeSelection } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateEstimate(
    complexity: ProjectComplexity,
    customFields: FieldValue[],
    scopeSelections: ScopeSelection[]
  ): Promise<EstimateResult> {
    
    const modelId = "gemini-3-flash-preview"; 

    // Construct context strings
    const fieldsContext = customFields.map(f => `- ${f.label}: ${f.value}`).join('\n');
    
    const inScopeItems = scopeSelections.filter(s => s.isInScope).map(s => `- [${s.category}] ${s.item}`).join('\n');
    const outOfScopeItems = scopeSelections.filter(s => !s.isInScope).map(s => `- [${s.category}] ${s.item}`).join('\n');

    const prompt = `
      Sen uzman bir kıdemli yazılım mimarı ve proje yöneticisisin.
      Aşağıdaki proje detaylarına, meta verilere ve KAPSAM bilgilerine dayanarak detaylı bir yazılım geliştirme tahmini oluştur.
      
      ÖNEMLİ KURAL: Yalnızca "Kapsam İçi" (In Scope) olarak belirtilen maddeler için efor ve maliyet hesapla. "Kapsam Dışı" maddeleri planlama ve maliyete dahil ETME, ancak risklerde belirt.
      
      Proje Karmaşıklığı: ${complexity}
      
      Proje Detayları (Meta Veriler):
      ${fieldsContext}

      KAPSAM BİLGİLERİ:
      
      DAHİL OLANLAR (Kapsam İçi - Efor Harcanacak):
      ${inScopeItems}
      
      HARİÇ TUTULANLAR (Kapsam Dışı - Efor Yok):
      ${outOfScopeItems}

      Lütfen şunları hesapla:
      1. Tahmini toplam geliştirme saati (Sadece kapsam içi maddeler için).
      2. Tahmini maliyet (USD cinsinden, ortalama $50/saat varsay).
      3. Hafta cinsinden süre.
      4. Önerilen teknoloji yığını.
      5. Olası riskler.
      6. Ana görevlerin kırılımı (Task Breakdown).
      7. Yönetici özeti.
    `;

    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalHours: { type: Type.NUMBER, description: "Toplam efor saati" },
              totalCost: { type: Type.NUMBER, description: "Toplam maliyet (USD)" },
              currency: { type: Type.STRING, description: "Para birimi kodu (örn: USD)" },
              timelineWeeks: { type: Type.NUMBER, description: "Hafta cinsinden proje süresi" },
              recommendedStack: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Önerilen teknolojiler listesi"
              },
              risks: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Olası proje riskleri"
              },
              summary: { type: Type.STRING, description: "Kısa yönetici özeti" },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    hours: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    role: { type: Type.STRING, description: "Örn: Backend Dev, UI Designer" }
                  }
                }
              }
            },
            required: ["totalHours", "totalCost", "timelineWeeks", "tasks", "recommendedStack", "summary"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("API boş yanıt döndürdü.");

      const result = JSON.parse(text) as EstimateResult;
      return result;

    } catch (error) {
      console.error("Gemini Estimation Error:", error);
      throw error;
    }
  }
};
