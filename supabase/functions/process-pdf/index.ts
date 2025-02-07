
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { pdfId } = await req.json()
    console.log("[process-pdf] Processing PDF with ID:", pdfId)
    
    if (!pdfId) {
      throw new Error('PDF ID is required')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update PDF status to processing
    await supabase
      .from('pdf_uploads')
      .update({ processing_status: 'processing' })
      .eq('id', pdfId)

    console.log("[process-pdf] Fetching PDF data...")
    
    // Get PDF content from storage
    const { data: pdfData, error: pdfError } = await supabase
      .from('pdf_uploads')
      .select('*')
      .eq('id', pdfId)
      .single()

    if (pdfError || !pdfData) {
      console.error("[process-pdf] Error fetching PDF:", pdfError)
      throw new Error('PDF not found')
    }

    const { data: fileData } = await supabase.storage
      .from('pdfs')
      .download(pdfData.storage_path)

    if (!fileData) {
      console.error("[process-pdf] PDF file not found in storage")
      throw new Error('PDF file not found in storage')
    }

    const text = await fileData.text()
    console.log('[process-pdf] Successfully extracted text, length:', text.length)

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    console.log('[process-pdf] Generating questions using OpenAI...')

    // Generate questions using GPT-4
    const prompt = `Analyze this PDF content and generate 5 multiple choice questions. The questions should be challenging but fair, and directly related to the content of the PDF. Each question should test understanding of key concepts from the text.

    Format each question as a JSON object with this structure:
    {
      "question_text": "The question text here",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correct_answer": "A",
      "explanation": "Detailed explanation of why this is the correct answer",
      "marks": 2
    }

    PDF Content: ${text.substring(0, 8000)} // Limiting content length for API
    
    Generate questions that:
    1. Are directly based on the PDF content
    2. Test different levels of understanding
    3. Have clear, unambiguous correct answers
    4. Include detailed explanations
    `

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are an expert exam question generator. Create clear, specific questions that test understanding of the provided content. Questions should be challenging but fair, with unambiguous correct answers." 
        },
        { role: "user", content: prompt }
      ],
    })

    console.log('[process-pdf] Received response from OpenAI')
    
    const generatedQuestions = JSON.parse(completion.data.choices[0].message?.content || '[]')
    console.log('[process-pdf] Parsed questions:', generatedQuestions)

    // Create exam with generated questions
    console.log('[process-pdf] Creating exam...')
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({
        title: `${pdfData.title} - Generated Exam`,
        description: 'Generated from PDF analysis',
        duration: 30, // Default duration
        total_marks: generatedQuestions.reduce((acc: number, q: any) => acc + q.marks, 0),
        pdf_id: pdfId,
        created_by: pdfData.uploaded_by,
        status: 'draft'
      })
      .select()
      .single()

    if (examError) {
      console.error('[process-pdf] Error creating exam:', examError)
      throw examError
    }

    // Insert generated questions
    console.log('[process-pdf] Inserting questions...')
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(
        generatedQuestions.map((q: any) => ({
          exam_id: exam.id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          marks: q.marks,
          explanation: q.explanation
        }))
      )

    if (questionsError) {
      console.error('[process-pdf] Error inserting questions:', questionsError)
      throw questionsError
    }

    // Update PDF status to completed
    await supabase
      .from('pdf_uploads')
      .update({
        processing_status: 'completed',
        content: text
      })
      .eq('id', pdfId)

    console.log('[process-pdf] Processing completed successfully')

    return new Response(
      JSON.stringify({ 
        message: 'PDF processed successfully',
        examId: exam.id,
        questionCount: generatedQuestions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('[process-pdf] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
