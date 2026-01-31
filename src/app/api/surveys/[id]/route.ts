import { SurveyService } from '@/services/surveys/SurveyService';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get survey by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const survey = await SurveyService.getById(params.id);

    if (!survey) {
      return NextResponse.json(
        { success: false, error: 'Encuesta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: survey,
    });
  } catch (error) {
    console.error('Error in GET /api/surveys/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete survey
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await SurveyService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Encuesta eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error in DELETE /api/surveys/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// PATCH - Complete survey
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await SurveyService.complete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Encuesta completada exitosamente',
    });
  } catch (error) {
    console.error('Error in PATCH /api/surveys/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
