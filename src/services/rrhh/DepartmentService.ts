import { db } from '@/firebase/config';
import {
  Department,
  DepartmentFilters,
  PaginatedResponse,
  PaginationParams,
} from '@/types/rrhh';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

const COLLECTION_NAME = 'departments';

export class DepartmentService {
  static async getAll(organizationId: string): Promise<Department[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('organization_id', '==', organizationId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Department[];
    } catch (error) {
      console.error('Error getting departments:', error);
      throw new Error('Error al obtener departamentos');
    }
  }

  static async getById(id: string): Promise<Department | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          created_at: docSnap.data().created_at?.toDate() || new Date(),
          updated_at: docSnap.data().updated_at?.toDate() || new Date(),
        } as Department;
      }
      return null;
    } catch (error) {
      console.error('Error getting department:', error);
      throw new Error('Error al obtener departamento');
    }
  }

  static async getPaginated(
    organizationId: string,
    filters: DepartmentFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<Department>> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('organization_id', '==', organizationId)
      );

      // Apply filters
      if (filters.search) {
        q = query(
          q,
          where('nombre', '>=', filters.search),
          where('nombre', '<=', filters.search + '\uf8ff')
        );
      }

      if (filters.is_active !== undefined) {
        q = query(q, where('is_active', '==', filters.is_active));
      }

      if (filters.responsible_user_id) {
        q = query(
          q,
          where('responsable_id', '==', filters.responsible_user_id)
        );
      }

      // Apply sorting
      const sortField = pagination.sort || 'created_at';
      const sortOrder = pagination.order === 'asc' ? 'asc' : 'desc';
      q = query(q, orderBy(sortField, sortOrder));

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      if (offset > 0) {
        // For simplicity, we'll get all and slice - in production you'd use cursors
        const allDocs = await getDocs(q);
        const docs = allDocs.docs.slice(offset, offset + pagination.limit);
        const total = allDocs.size;

        const data = docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date(),
          updated_at: doc.data().updated_at?.toDate() || new Date(),
        })) as Department[];

        return {
          data,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            totalPages: Math.ceil(total / pagination.limit),
            hasNext: offset + pagination.limit < total,
            hasPrev: pagination.page > 1,
          },
        };
      }

      q = query(q, limit(pagination.limit));
      const querySnapshot = await getDocs(q);
      const total = querySnapshot.size; // This is approximate

      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date(),
      })) as Department[];

      return {
        data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
          hasNext: data.length === pagination.limit,
          hasPrev: pagination.page > 1,
        },
      };
    } catch (error) {
      console.error('Error getting paginated departments:', error);
      throw new Error('Error al obtener departamentos paginados');
    }
  }

  static async create(
    data: Omit<
      Department,
      'id' | 'created_at' | 'updated_at' | 'organization_id'
    >,
    organizationId: string
  ): Promise<Department> {
    try {
      const now = Timestamp.now();
      const docData = {
        ...data,
        organization_id: organizationId,
        created_at: now,
        updated_at: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);

      return {
        id: docRef.id,
        ...data,
        organization_id: organizationId,
        created_at: now.toDate(),
        updated_at: now.toDate(),
      };
    } catch (error) {
      console.error('Error creating department:', error);
      throw new Error('Error al crear departamento');
    }
  }

  static async update(
    id: string,
    data: Partial<Omit<Department, 'id' | 'created_at'>>
  ): Promise<Department> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        updated_at: Timestamp.now(),
      };

      await updateDoc(docRef, updateData);

      const updated = await this.getById(id);
      if (!updated) {
        throw new Error('Departamento no encontrado después de actualizar');
      }

      return updated;
    } catch (error) {
      console.error('Error updating department:', error);
      throw new Error('Error al actualizar departamento');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting department:', error);
      throw new Error('Error al eliminar departamento');
    }
  }

  static async toggleActive(id: string): Promise<Department> {
    try {
      const department = await this.getById(id);
      if (!department) {
        throw new Error('Departamento no encontrado');
      }

      return await this.update(id, { is_active: !department.is_active });
    } catch (error) {
      console.error('Error toggling department active status:', error);
      throw new Error('Error al cambiar estado del departamento');
    }
  }
}
