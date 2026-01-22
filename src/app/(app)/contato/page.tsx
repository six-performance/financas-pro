'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { createClient } from '@/lib/supabase/client';
import { Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'react-toastify';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Send, Loader2, LightbulbIcon, Sparkles } from 'lucide-react';

// Criar instância única do cliente Supabase
const supabaseClient = createClient();

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const AVAILABLE_TIMES = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

export default function ContactPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const hasLoadedRef = useRef(false);

  // Verificar se o usuário é PRO
  const isPaidUser = user?.subscriptionStatus === 'paid';

  useEffect(() => {
    if (user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabaseClient
        .from('appointments')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false });

        console.log(data);

      if (error) {
        console.error('Erro ao carregar agendamentos:', error);
        return;
      }

      const appointmentsList: Appointment[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        userEmail: item.user_email,
        userName: item.user_name,
        userPhone: item.user_phone,
        date: item.date,
        time: item.time,
        message: item.message,
        status: item.status,
        createdAt: new Date(item.created_at),
      }));

      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !selectedDate || !selectedTime || !message.trim()) {
      toast.warning('Por favor, preencha todos os campos antes de enviar.');
      return;
    }

    try {
      setSubmitting(true);

      const dateObj = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate;
      if (!dateObj) return;

      const { error } = await supabaseClient
        .from('appointments')
        .insert({
          user_id: user.uid,
          user_email: user.email,
          user_name: user.displayName,
          user_phone: phone,
          date: dateObj.toISOString().split('T')[0],
          time: selectedTime,
          message,
          status: 'pending',
        });

      if (error) {
        console.error('Erro ao criar agendamento:', error);
        toast.error('Não foi possível enviar sua solicitação. Tente novamente.');
        return;
      }

      toast.success('Agendamento enviado! A gestora entrará em contato em breve.');
      
      setMessage('');
      setPhone('');
      setSelectedTime('');
      
      await loadAppointments();
     
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Se não for usuário PRO, mostrar mensagem
  if (!isPaidUser) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Contato com Gestora"
          description="Agende uma reunião com nossa equipe de especialistas"
          icon="📞"
        />

          <Card className="max-w-2xl mx-auto border-2 border-orange-200">
            <CardContent className="p-12 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-orange-500" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                  Recurso Exclusivo PRO 🌟
                </h2>
                <p className="text-slate-700 mb-4">
                  O contato direto com nossa gestora financeira e agendamento de reuniões 
                  é um recurso exclusivo para assinantes do <strong>Plano PRO</strong>.
                </p>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Faça upgrade agora e tenha acesso a consultoria especializada, 
                  agendamento de reuniões e suporte prioritário!
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => router.push('/planos')}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Ver Planos PRO
              </Button>
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Contato com Gestora"
        description="Agende uma reunião e receba orientação especializada para seus investimentos"
        icon="📞"
      />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulário de Agendamento */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Agendar Reunião</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Calendar */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Selecione a Data
                    </Label>
                    <div className="border rounded-lg p-4">
                      <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        minDate={new Date()}
                        locale="pt-BR"
                        className="w-full border-0"
                      />
                    </div>
                  </div>

                  {/* Horários */}
                  <div>
                    <Label htmlFor="time-select" className="text-base font-semibold mb-3 block">
                      Selecione o Horário
                    </Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger id="time-select" className="w-full h-12 text-base">
                        <SelectValue placeholder="Escolha um horário disponível" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_TIMES.map((time) => (
                          <SelectItem key={time} value={time} className="text-base">
                            🕐 {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Telefone */}
                  <div>
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="mt-2"
                    />
                  </div>

                  {/* Mensagem */}
                  <div>
                    <Label htmlFor="message">Mensagem *</Label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                      placeholder="Descreva brevemente o assunto que gostaria de discutir..."
                      className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Botão Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    disabled={submitting || !selectedTime || !message.trim()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Solicitar Reunião
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Suas Solicitações</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <Loading size="md" />
                ) : appointments.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
                    Você ainda não tem agendamentos
                  </p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <Card key={appointment.id} className="bg-[var(--secondary)]">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-[var(--foreground)]">
                              {appointment.date}
                            </span>
                            <Badge
                              variant={
                                appointment.status === 'pending' ? 'warning' :
                                appointment.status === 'confirmed' ? 'success' :
                                'destructive'
                              }
                            >
                              {appointment.status === 'pending' ? 'Pendente' :
                               appointment.status === 'confirmed' ? 'Confirmado' :
                               'Cancelado'}
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--muted-foreground)] mb-2">
                            Horário: {appointment.time}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                            {appointment.message}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dica */}
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <LightbulbIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-900 mb-2">💡 Dica</p>
                    <p className="text-sm text-orange-800 leading-relaxed">
                      Prepare suas dúvidas com antecedência para aproveitar melhor a reunião com a gestora.
                      Tenha em mãos informações sobre seus investimentos atuais e objetivos financeiros.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
