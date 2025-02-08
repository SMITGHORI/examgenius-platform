
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
    
    // Validate required parameters
    if (!pdfId || !examId || !totalMarks || !numberOfQuestions || !subject || !difficulty) {
      console.error("[generate-exam-questions] Missing required parameters:", { pdfId, examId, totalMarks, numberOfQuestions, subject, difficulty })
      throw new Error('Missing required parameters')
    }

    console.log("[generate-exam-questions] Starting question generation for PDF:", pdfId)
    console.log("[generate-exam-questions] Parameters:", { totalMarks, numberOfQuestions, subject, difficulty })
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

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
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const configuration = new Configuration({
      apiKey: openaiApiKey
    })
    const openai = new OpenAIApi(configuration)

    // Calculate marks per question
    const marksPerQuestion = Math.ceil(totalMarks / numberOfQuestions)

    console.log("[generate-exam-questions] Generating", numberOfQuestions, "questions with", marksPerQuestion, "marks each")

    try {
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
${pdf.content.substring(0, 2000)} // Further reduced content length for token limits

Generate questions that thoroughly test understanding of the main concepts from this text.`

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an expert at creating educational assessments for ${subject} at the ${difficulty} difficulty level. Format your response as a valid JSON array.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      })

      if (!response.data.choices[0]?.message?.content) {
        console.error("[generate-exam-questions] No content in OpenAI response")
        throw new Error('Failed to generate questions - no content in response')
      }

      console.log("[generate-exam-questions] Raw OpenAI response received")

      let generatedQuestions
      try {
        generatedQuestions = JSON.parse(response.data.choices[0].message.content)
        if (!Array.isArray(generatedQuestions)) {
          throw new Error('Response is not an array')
        }
      } catch (parseError) {
        console.error("[generate-exam-questions] Failed to parse OpenAI response:", parseError)
        console.error("[generate-exam-questions] Raw response:", response.data.choices[0].message.content)
        throw new Error('Failed to parse generated questions')
      }

      console.log("[generate-exam-questions] Successfully parsed questions, count:", generatedQuestions.length)

      // Validate and format questions
      const questions = generatedQuestions.map((q: any, index: number) => {
        if (!q.question_text || !Array.isArray(q.options) || q.options.length !== 4 || !q.correct_answer) {
          console.error("[generate-exam-questions] Invalid question format:", q)
          throw new Error(`Invalid format for question ${index + 1}`)
        }

        return {
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer.toString(),
          marks: marksPerQuestion,
          explanation: q.explanation || 'No explanation provided',
          exam_id: examId
        }
      })

      console.log("[generate-exam-questions] Questions formatted successfully")

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
        JSON.stringify({ success: true, questions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (openAiError: any) {
      console.error("[generate-exam-questions] OpenAI API error:", openAiError)
      throw new Error(`OpenAI API error: ${openAiError.message || 'Unknown error'}`)
    }

  } catch (error: any) {
    console.error("[generate-exam-questions] Error:", error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
