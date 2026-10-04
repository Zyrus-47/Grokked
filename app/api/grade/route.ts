import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, MODELS, withExponentialBackoff } from "@/lib/gemini";
import { GRADER_SYSTEM_PROMPT } from "@/lib/agent-prompts";
import { ConceptUpdateItemSchema } from "@/lib/zod-schemas";

export async function POST(req: NextRequest) {
  let currentScoreVal = 50;
  try {
    const { questions, userAnswers, conceptMastery, currentScore, isDemoMode } = await req.json();
    currentScoreVal = currentScore ?? 50;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Questions are required" }, { status: 400 });
    }

    // Offline / Demo mode evaluation
    if (isDemoMode || !process.env.GEMINI_API_KEY) {
      let correctCount = 0;
      const updates = questions.map((q: any) => {
        const isCorrect = userAnswers[q.id] === q.correctIndex;
        if (isCorrect) correctCount += 1;
        return {
          concept: q.concept,
          status: isCorrect ? "green" : "red",
          reason: isCorrect
            ? "Student demonstrated verified code comprehension."
            : "Student missed the core concept in the quiz gate.",
        };
      });

      const newScore = Math.min(100, Math.round(currentScore + (correctCount / questions.length) * 20));
      return NextResponse.json({
        updates,
        comprehensionMeterScore: newScore,
      });
    }

    const ai = getGeminiClient();

    // Define function calling declaration for concept updates
    const updateConceptToolDeclaration = {
      functionDeclarations: [
        {
          name: "updateConceptMastery",
          description:
            "Updates the student's mastery record for specific programming concepts based on quiz performance",
          parameters: {
            type: "OBJECT",
            properties: {
              updates: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    concept: { type: "STRING" },
                    status: { type: "STRING", enum: ["red", "yellow", "green"] },
                    reason: { type: "STRING" },
                  },
                  required: ["concept", "status", "reason"],
                },
              },
              comprehensionMeterScore: {
                type: "NUMBER",
                description: "Updated overall comprehension score (0 to 100%)",
              },
            },
            required: ["updates", "comprehensionMeterScore"],
          },
        },
      ],
    };

    const evaluatedDetails = questions.map((q: any) => ({
      concept: q.concept,
      question: q.question,
      userAnswerIndex: userAnswers[q.id],
      correctIndex: q.correctIndex,
      isCorrect: userAnswers[q.id] === q.correctIndex,
    }));

    const promptText = `Student Quiz Evaluation:
${JSON.stringify(evaluatedDetails, null, 2)}

Current Student Comprehension Score: ${currentScore}%

Existing Concept Knowledge Map:
${JSON.stringify(conceptMastery || {}, null, 2)}

Call the 'updateConceptMastery' tool with categorized statuses ('green' for correct, 'red' for missed) and recalculate the comprehension score between 0 and 100%.`;

    const response = await withExponentialBackoff(() =>
      ai.models.generateContent({
        model: MODELS.GRADER,
        contents: promptText,
        config: {
          systemInstruction: GRADER_SYSTEM_PROMPT,
          tools: [updateConceptToolDeclaration as any],
        },
      })
    );

    // Extract function call
    let updates: any[] = [];
    let comprehensionMeterScore = currentScore;

    const candidates = response.candidates || [];
    const calls = candidates[0]?.content?.parts?.filter((p: any) => p.functionCall) || [];

    const firstCall = calls[0];
    if (firstCall && (firstCall as any).functionCall) {
      const callArgs: any = (firstCall as any).functionCall.args;
      updates = callArgs?.updates || [];
      comprehensionMeterScore = callArgs?.comprehensionMeterScore ?? currentScore;
    } else {
      // Fallback deterministic grading
      let correctCount = 0;
      updates = questions.map((q: any) => {
        const isCorrect = userAnswers[q.id] === q.correctIndex;
        if (isCorrect) correctCount += 1;
        return {
          concept: q.concept,
          status: isCorrect ? "green" : "red",
          reason: isCorrect ? "Demonstrated verified comprehension" : "Missed question in step gate",
        };
      });
      comprehensionMeterScore = Math.min(100, Math.round(currentScore + (correctCount / questions.length) * 20));
    }

    return NextResponse.json({
      updates,
      comprehensionMeterScore,
    });
  } catch (error: any) {
    console.error("[API/grade error]:", error);
    // Graceful fallback
    return NextResponse.json({
      updates: [],
      comprehensionMeterScore: currentScoreVal,
    });
  }
}
