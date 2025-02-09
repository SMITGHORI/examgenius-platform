
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("[generate-exam-questions] Starting function")
    
    // Parse request body
    const requestBody = await req.json()
    console.log("[generate-exam-questions] Request body:", requestBody)
    
    const { pdfId, examId, totalMarks, numberOfQuestions, subject, difficulty } = requestBody
    
    // Validate required parameters
    if (!pdfId || !examId || !totalMarks || !numberOfQuestions || !subject || !difficulty) {
      console.error("[generate-exam-questions] Missing required parameters:", { pdfId, examId, totalMarks, numberOfQuestions, subject, difficulty })
      throw new Error('Missing required parameters')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error("[generate-exam-questions] Missing Supabase configuration")
      throw new Error('Missing Supabase configuration')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Get PDF content
    console.log("[generate-exam-questions] Fetching PDF content for ID:", pdfId)
    const { data: pdf, error: pdfError } = await supabaseClient
      .from('pdf_uploads')
      .select('content, title')
      .eq('id', pdfId)
      .maybeSingle()

    if (pdfError) {
      console.error("[generate-exam-questions] Error fetching PDF:", pdfError)
      throw new Error(`Error fetching PDF: ${pdfError.message}`)
    }

    if (!pdf || !pdf.content) {
      console.error("[generate-exam-questions] PDF content not found")
      throw new Error('PDF content not found')
    }

    console.log("[generate-exam-questions] PDF content retrieved, length:", pdf.content.length)

    // Initialize OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error("[generate-exam-questions] OpenAI API key not configured")
      throw new Error('OpenAI API key not configured')
    }

    const configuration = new Configuration({
      apiKey: openaiApiKey
    })
    const openai = new OpenAIApi(configuration)

    // Calculate marks per question
    const marksPerQuestion = Math.ceil(totalMarks / numberOfQuestions)

    console.log("[generate-exam-questions] Generating", numberOfQuestions, "questions with", marksPerQuestion, "marks each")

    // Prepare content for OpenAI prompt
    const truncatedContent = pdf.content.substring(0, 1500) // Further reduced for token limits
    
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
${truncatedContent}

Generate questions that thoroughly test understanding of the main concepts from this text.`

    console.log("[generate-exam-questions] Sending request to OpenAI")
    
    try {
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
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      })

      console.log("[generate-exam-questions] OpenAI response received:", response.data)

      if (!response.data.choices[0]?.message?.content) {
        console.error("[generate-exam-questions] No content in OpenAI response")
        throw new Error('Failed to generate questions - no content in response')
      }

      let generatedQuestions
      try {
        generatedQuestions = JSON.parse(response.data.choices[0].message.content)
        if (!Array.isArray(generatedQuestions)) {
          console.error("[generate-exam-questions] Response is not an array:", response.data.choices[0].message.content)
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
        if (!q.question_text || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correct_answer !== 'number') {
          console.error("[generate-exam-questions] Invalid question format:", q)
          throw new Error(`Invalid format for question ${index + 1}`)
        }

        return {
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
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
      if (openAiError.response) {
        console.error("[generate-exam-questions] OpenAI error response:", openAiError.response.data)
      }
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
