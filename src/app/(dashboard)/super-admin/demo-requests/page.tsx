'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import {
  Building2,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Phone,
  Rocket,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DemoRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  whatsapp: string;
  employees: string;
  hasISO: boolean;
  message: string;
  status: 'pending' | 'contacted' | 'closed' | 'activated';
  created_at: any;
}

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'demo_requests'),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as DemoRequest[];
      setRequests(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: 'contacted' | 'closed') => {
    const docRef = doc(db, 'demo_requests', id);
    await updateDoc(docRef, { status });
  };

  // Función para activar usuario y abrir WhatsApp
  const activateAndContact = async (request: DemoRequest) => {
    setActivatingId(request.id);

    try {
      const response = await fetch('/api/demo-requests/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demoRequestId: request.id,
          name: request.name,
          email: request.email,
          company: request.company,
          whatsapp: request.whatsapp,
          trialDays: 30,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      // Crear mensaje de WhatsApp con credenciales
      const message = `¡Hola ${request.name}! 🎉

Tu cuenta en *Don Cándido IA* ha sido activada.

📧 *Usuario:* ${data.email}
🔑 *Contraseña:* ${data.password}

🔗 *Accede aquí:* https://doncandidoia.com/login

Tu período de prueba es de ${data.trialDays} días.

¿Necesitas ayuda para comenzar? ¡Escríbeme!`;

      // Abrir WhatsApp con el mensaje
      const whatsappNumber = request.whatsapp.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error activando usuario:', error);
      alert('Error al activar el usuario');
    } finally {
      setActivatingId(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const contactedRequests = requests.filter(r => r.status === 'contacted');
  const activatedRequests = requests.filter(r => r.status === 'activated');
  const closedRequests = requests.filter(r => r.status === 'closed');

  const RequestCard = ({ request }: { request: DemoRequest }) => (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{request.name}</h3>
            <p className="text-sm text-slate-400">{request.email}</p>
          </div>
          <div className="flex gap-2">
            {request.hasISO && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                ISO 9001
              </Badge>
            )}
            {request.status === 'activated' && (
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                Activado
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="text-slate-300">{request.company}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-slate-300">
              {request.employees} empleados
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <Phone className="w-4 h-4 text-emerald-500" />
            <a
              href={`https://wa.me/${request.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {request.whatsapp}
            </a>
          </div>
        </div>

        {request.message && (
          <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5" />
              <p className="text-sm text-slate-300">{request.message}</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {request.created_at &&
              formatDistanceToNow(request.created_at.toDate(), {
                addSuffix: true,
                locale: es,
              })}
          </span>
          <div className="flex gap-2">
            {request.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => activateAndContact(request)}
                  disabled={activatingId === request.id}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {activatingId === request.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4 mr-1" />
                  )}
                  Activar y Contactar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(request.id, 'contacted')}
                  className="border-slate-700 text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Solo Contactado
                </Button>
              </>
            )}
            {request.status === 'contacted' && (
              <>
                <Button
                  size="sm"
                  onClick={() => activateAndContact(request)}
                  disabled={activatingId === request.id}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {activatingId === request.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4 mr-1" />
                  )}
                  Activar Ahora
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(request.id, 'closed')}
                  className="border-slate-700"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cerrar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Solicitudes de Demo
        </h2>
        <p className="text-slate-400">
          Gestiona las solicitudes recibidas desde la landing page.
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500"
          >
            Pendientes{' '}
            <Badge variant="secondary" className="ml-2 bg-slate-800">
              {pendingRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="contacted"
            className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500"
          >
            Contactados{' '}
            <Badge variant="secondary" className="ml-2 bg-slate-800">
              {contactedRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="activated"
            className="data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500"
          >
            Activados{' '}
            <Badge variant="secondary" className="ml-2 bg-slate-800">
              {activatedRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="closed"
            className="data-[state=active]:bg-slate-500/10 data-[state=active]:text-slate-400"
          >
            Cerrados{' '}
            <Badge variant="secondary" className="ml-2 bg-slate-800">
              {closedRequests.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {pendingRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay solicitudes pendientes.
            </div>
          )}
        </TabsContent>

        <TabsContent value="contacted" className="space-y-4 mt-6">
          {contactedRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {contactedRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay solicitudes contactadas.
            </div>
          )}
        </TabsContent>

        <TabsContent value="activated" className="space-y-4 mt-6">
          {activatedRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {activatedRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay usuarios activados.
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4 mt-6">
          {closedRequests.map(request => (
            <RequestCard key={request.id} request={request} />
          ))}
          {closedRequests.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No hay solicitudes cerradas.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
