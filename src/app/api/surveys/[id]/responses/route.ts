import { SurveyService } from '@/services/surveys/SurveyService';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get responses for a survey
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const responses = await SurveyService.getResponses(params.id);

    return NextResponse.json({
      success: true,
      data: responses,
    });
  } catch (error) {
    console.error('Error in GET /api/surveys/[id]/responses:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// POST - Add response to survey
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const responseId = await SurveyService.addResponse(params.id, body);

    return NextResponse.json({
      success: true,
      data: { id: responseId },
      message: 'Respuesta guardada exitosamente',
    });
  } catch (error) {
    console.error('Error in POST /api/surveys/[id]/responses:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
