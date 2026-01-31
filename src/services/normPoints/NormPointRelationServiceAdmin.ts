/**
 * NormPointRelationServiceAdmin
 * Servicio para gestión de relaciones de puntos de norma (Versión Admin SDK)
 * Usado en API Routes para evitar problemas de permisos
 */

import { getAdminFirestore } from '@/lib/firebase/admin';
import {
  ComplianceStats,
  ComplianceStatus,
  NormCategory,
  NormPointRelation,
} from '@/types/normPoints';
import { NormPointServiceAdmin } from './NormPointServiceAdmin';

const COLLECTION_NAME = 'normPointRelations';

export class NormPointRelationServiceAdmin {
  /**
   * Obtiene todas las relaciones de puntos de norma
   */
  static async getAll(): Promise<NormPointRelation[]> {
    try {
      const db = getAdminFirestore();
      const snapshot = await db.collection(COLLECTION_NAME).get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        verification_date: doc.data().verification_date?.toDate(),
        next_review_date: doc.data().next_review_date?.toDate(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as NormPointRelation[];
    } catch (error) {
      console.error('Error getting norm point relations (Admin):', error);
      throw new Error('Error al obtener relaciones de puntos de norma');
    }
  }

  /**
   * Obtiene revisiones próximas en N días
   */
  static async getUpcomingReviews(
    days: number = 30
  ): Promise<NormPointRelation[]> {
    try {
      const allRelations = await this.getAll();
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return allRelations.filter(
        rel =>
          rel.next_review_date &&
          rel.next_review_date > now &&
          rel.next_review_date <= futureDate
      );
    } catch (error) {
      console.error('Error getting upcoming reviews (Admin):', error);
      throw new Error('Error al obtener revisiones próximas');
    }
  }

  /**
   * Obtiene estadísticas de cumplimiento
   */
  static async getComplianceStats(): Promise<ComplianceStats> {
    try {
      const allRelations = await this.getAll();
      const allNormPoints = await NormPointServiceAdmin.getAll();

      // Calculate global percentage
      const totalPercentage = allRelations.reduce(
        (sum, rel) => sum + (rel.compliance_percentage || 0),
        0
      );
      const global_percentage =
        allRelations.length > 0 ? totalPercentage / allRelations.length : 0;

      // By chapter
      const by_chapter: Record<number, number> = {};
      for (let chapter = 4; chapter <= 10; chapter++) {
        const chapterPoints = allNormPoints.filter(p => p.chapter === chapter);
        const chapterRelations = allRelations.filter(rel =>
          chapterPoints.some(p => p.id === rel.norm_point_id)
        );
        const chapterTotal = chapterRelations.reduce(
          (sum, rel) => sum + (rel.compliance_percentage || 0),
          0
        );
        by_chapter[chapter] =
          chapterRelations.length > 0
            ? chapterTotal / chapterRelations.length
            : 0;
      }

      // By category
      const by_category: Record<NormCategory, number> = {
        contexto: 0,
        liderazgo: 0,
        planificacion: 0,
        soporte: 0,
        operacion: 0,
        evaluacion: 0,
        mejora: 0,
      };

      const categories: NormCategory[] = [
        'contexto',
        'liderazgo',
        'planificacion',
        'soporte',
        'operacion',
        'evaluacion',
        'mejora',
      ];

      categories.forEach(category => {
        const categoryPoints = allNormPoints.filter(
          p => p.category === category
        );
        const categoryRelations = allRelations.filter(rel =>
          categoryPoints.some(p => p.id === rel.norm_point_id)
        );
        const categoryTotal = categoryRelations.reduce(
          (sum, rel) => sum + (rel.compliance_percentage || 0),
          0
        );
        by_category[category] =
          categoryRelations.length > 0
            ? categoryTotal / categoryRelations.length
            : 0;
      });

      // By status
      const by_status: Record<ComplianceStatus, number> = {
        completo: 0,
        parcial: 0,
        pendiente: 0,
        no_aplica: 0,
      };

      allRelations.forEach(rel => {
        if (rel.compliance_status) {
          by_status[rel.compliance_status]++;
        }
      });

      // Mandatory pending
      const mandatoryPoints = allNormPoints.filter(p => p.is_mandatory);
      const mandatory_pending = allRelations.filter(
        rel =>
          mandatoryPoints.some(p => p.id === rel.norm_point_id) &&
          rel.compliance_status === 'pendiente'
      ).length;

      // High priority pending
      const highPriorityPoints = allNormPoints.filter(
        p => p.priority === 'alta'
      );
      const high_priority_pending = allRelations.filter(
        rel =>
          highPriorityPoints.some(p => p.id === rel.norm_point_id) &&
          rel.compliance_status === 'pendiente'
      ).length;

      // Upcoming reviews
      const upcoming_reviews = await this.getUpcomingReviews(30);

      return {
        global_percentage,
        by_chapter,
        by_category,
        by_status,
        mandatory_pending,
        high_priority_pending,
        upcoming_reviews,
      };
    } catch (error) {
      console.error('Error getting compliance stats (Admin):', error);
      throw new Error('Error al obtener estadísticas de cumplimiento');
    }
  }
}
