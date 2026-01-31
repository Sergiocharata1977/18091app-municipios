// API endpoint to get voice configuration

import { VoiceConfigurationService } from '@/lib/elevenlabs/voice-config';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const config = VoiceConfigurationService.getCustomVoiceConfig();

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('[API /elevenlabs/voice-config] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error getting voice configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
