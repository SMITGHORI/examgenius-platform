
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { pdfId, examId, totalMarks, numberOfQuestions, subject, difficulty } = await req.json()
    console.log("[generate-exam-questions] Starting question generation for PDF:", pdfId)
    console.log("[generate-exam-questions] Parameters:", { totalMarks, numberOfQuestions, subject, difficulty })
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get PDF content
    const { data: pdf, error: pdfError } = await supabaseClient
      .from('pdf_uploads')
      .select('content, title')
      .eq('id', pdfId)
      .single()

    if (pdfError || !pdf?.content) {
      console.error("[generate-exam-questions] Error fetching PDF:", pdfError)
      throw new Error('PDF content not found')
    }

    console.log("[generate-exam-questions] PDF content retrieved, length:", pdf.content.length)

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Calculate marks per question
    const marksPerQuestion = Math.ceil(totalMarks / numberOfQuestions)

    console.log("[generate-exam-questions] Generating", numberOfQuestions, "questions with", marksPerQuestion, "marks each")

    const prompt = `Based on the following text from ${pdf.title}, generate ${numberOfQuestions} multiple choice questions for a ${difficulty} level ${subject} exam.

Each question should:
- Test understanding of key concepts from the PDF content
- Be appropriate for ${difficulty} difficulty level
- Have 4 options with one correct answer
- Include a brief explanation for the correct answer
- Be assigned ${marksPerQuestion} marks

Format each question as a JSON object with these fields:
- question_text: the question
- options: array of 4 strings for answer choices
- correct_answer: index of correct option (0-3)
- explanation: brief explanation of correct answer
- marks: ${marksPerQuestion}

Text content:
${pdf.content.substring(0, 8000)} // Limit content length to avoid token limits

Generate questions that thoroughly test understanding of the main concepts from this text.`

    const response = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating educational assessments for ${subject} at the ${difficulty} difficulty level.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    })

    if (!response.data.choices[0]?.message?.content) {
      throw new Error('Failed to generate questions')
    }

    console.log("[generate-exam-questions] Successfully generated questions from AI")

    // Parse the AI response into questions array
    const generatedQuestions = JSON.parse(response.data.choices[0].message.content)

    // Validate question format
    const questions = generatedQuestions.map((q: any) => ({
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer.toString(),
      marks: marksPerQuestion,
      explanation: q.explanation,
      exam_id: examId
    }))

    console.log("[generate-exam-questions] Formatted questions:", questions.length)

    // Save questions to database
    const { error: saveError } = await supabaseClient
      .from('questions')
      .insert(questions)

    if (saveError) {
      console.error("[generate-exam-questions] Error saving questions:", saveError)
      throw new Error('Failed to save generated questions')
    }

    console.log("[generate-exam-questions] Successfully saved questions to database")

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("[generate-exam-questions] Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
