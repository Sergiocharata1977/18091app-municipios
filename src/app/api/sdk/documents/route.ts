/**
 * Document API Routes - SDK Unified
 *
 * GET /api/sdk/documents - List documents
 * POST /api/sdk/documents - Create document
 */

import { DocumentService } from '@/lib/sdk/modules/documents';
import type { DocumentFilters } from '@/lib/sdk/modules/documents/types';
import { CreateDocumentSchema } from '@/lib/sdk/modules/documents/validations';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/sdk/documents - List documents with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Initialize service
    const service = new DocumentService();

    // Get all documents without complex filters to avoid index requirements
    const allDocuments = await service.getRecentDocuments(1000);

    // Apply client-side filtering
    let documents = allDocuments;

    // Filter by status if provided
    const status = searchParams.get('status');
    if (status) {
      documents = documents.filter(doc => doc.status === status);
    }

    // Filter by category if provided
    const category = searchParams.get('category');
    if (category) {
      documents = documents.filter(doc => doc.category === category);
    }

    // Filter by createdBy if provided
    const createdBy = searchParams.get('createdBy');
    if (createdBy) {
      documents = documents.filter(doc => doc.createdBy === createdBy);
    }

    // Filter by tags if provided
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      const tags = tagsParam.split(',');
      documents = documents.filter(doc =>
        tags.some(tag => doc.tags?.includes(tag))
      );
    }

    // Filter by search term if provided
    const search = searchParams.get('search');
    if (search) {
      const searchLower = search.toLowerCase();
      documents = documents.filter(
        doc =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.content?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 100;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : 0;
    const paginatedDocuments = documents.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedDocuments,
      count: paginatedDocuments.length,
      total: documents.length,
    });
  } catch (error) {
    console.error('Error in GET /api/sdk/documents:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener documentos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/sdk/documents - Create document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate data using SDK schema
    const validatedData = CreateDocumentSchema.parse(body);

    // Get user ID from request (should come from auth middleware)
    const userId = body.userId || 'system';

    // Initialize service and create document
    const service = new DocumentService();
    const documentId = await service.createAndReturnId(validatedData, userId);

    return NextResponse.json(
      {
        id: documentId,
        message: 'Documento creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/documents:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al crear documento',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
