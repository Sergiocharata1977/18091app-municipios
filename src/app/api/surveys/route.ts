import { SurveyService } from '@/services/surveys/SurveyService';
import { NextRequest, NextResponse } from 'next/server';

// GET - List all surveys
export async function GET() {
  try {
    const surveys = await SurveyService.list();

    return NextResponse.json({
      success: true,
      data: surveys,
    });
  } catch (error) {
    console.error('Error in GET /api/surveys:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// POST - Create new survey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = 'temp-user-id'; // TODO: Get from auth
    const userName = 'Usuario Temporal';

    const surveyId = await SurveyService.create(body, userId, userName);

    return NextResponse.json({
      success: true,
      data: { id: surveyId },
      message: 'Encuesta creada exitosamente',
    });
  } catch (error) {
    console.error('Error in POST /api/surveys:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
