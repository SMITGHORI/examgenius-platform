
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
      .update({ 
        processing_status: 'processing',
        processing_error: null 
      })
      .eq('id', pdfId)

    console.log("[process-pdf] Fetching PDF data...")
    
    // Get PDF content from storage
    const { data: pdfData, error: pdfError } = await supabase
      .from('pdf_uploads')
      .select('*')
      .eq('id', pdfId)
      .single()

    if (pdfError || !pdfData) {
      throw new Error(pdfError?.message || 'PDF not found')
    }

    const { data: fileData, error: storageError } = await supabase.storage
      .from('pdfs')
      .download(pdfData.storage_path)

    if (storageError) {
      throw new Error(`Failed to download PDF: ${storageError.message}`)
    }

    if (!fileData) {
      throw new Error('PDF file not found in storage')
    }

    const text = await fileData.text()
    console.log('[process-pdf] Successfully extracted text, length:', text.length)

    if (!text || text.length < 100) {
      throw new Error('Extracted text is too short or empty')
    }

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    console.log('[process-pdf] Creating exam...')
    
    // Create a basic exam first
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert({
        title: `${pdfData.title} - Generated Exam`,
        description: 'Generated from PDF analysis',
        duration: 30,
        total_marks: 100,
        pdf_id: pdfId,
        created_by: pdfData.uploaded_by,
        status: 'draft'
      })
      .select()
      .single()

    if (examError) {
      throw new Error(`Failed to create exam: ${examError.message}`)
    }

    console.log('[process-pdf] Exam created successfully:', exam.id)

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
        examId: exam.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('[process-pdf] Error:', error)
    
    // Initialize Supabase client for error handling
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update PDF status to error
    if (req.json) {
      try {
        const { pdfId } = await req.json()
        if (pdfId) {
          await supabase
            .from('pdf_uploads')
            .update({ 
              processing_status: 'error',
              processing_error: error.message 
            })
            .eq('id', pdfId)
        }
      } catch (e) {
        console.error('[process-pdf] Error updating PDF status:', e)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
