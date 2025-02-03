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
    
    if (!pdfId) {
      throw new Error('PDF ID is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get PDF content from database
    const { data: pdf, error: pdfError } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', pdfId)
      .single()

    if (pdfError || !pdf) {
      throw new Error('PDF not found')
    }

    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Create exam first in 'draft' status
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({
        title: `${pdf.title} - Generated Exam`,
        subject: pdf.subject,
        total_marks: 50, // Default value
        duration: 30,
        difficulty: 'medium',
        created_by: pdf.uploaded_by,
        status: 'draft'
      })
      .select()
      .single()

    if (examError) {
      throw examError
    }

    // Generate questions using GPT-4
    const prompt = `Based on the following PDF content, generate 5 multiple choice questions with explanations. Format the response as a JSON array with the following structure for each question:
    {
      "question_text": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "A",
      "explanation": "...",
      "marks": 2
    }
    
    PDF Content:
    ${pdf.content || 'Sample content for testing'}`

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    })

    const questions = JSON.parse(completion.data.choices[0].message?.content || '[]')

    // Insert generated questions
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(
        questions.map((q: any) => ({
          exam_id: exam.id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          marks: q.marks,
          explanation: q.explanation
        }))
      )

    if (questionsError) {
      throw questionsError
    }

    // Update exam status to active and set start time
    const { error: updateError } = await supabase
      .from('exams')
      .update({ 
        status: 'active',
        start_time: new Date().toISOString(),
        total_marks: questions.length * 2
      })
      .eq('id', exam.id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Exam created successfully',
        examId: exam.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})