import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Bike, ArrowLeft } from 'lucide-react';
import type { UserRole } from '@/types';

interface AuthScreenProps {
  onLogin: (user: any) => void;
  onRegister: (userData: any) => void;
  checkUser: (phone: string) => Promise<any | null>;
}

export function AuthScreen({ onLogin, onRegister, checkUser }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [role, setRole] = useState<UserRole>('passenger');
  const [vehicleDetails, setVehicleDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const user = await checkUser(phone);
      if (user) {
        onLogin(user);
      } else {
        setIsLogin(false);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!name || !surname || !phone) return;
    
    const userData = {
      name: `${name} ${surname}`,
      phone,
      role,
      lat: 0,
      lng: 0,
      details: role === 'driver' ? vehicleDetails : 'Pasajero',
      bio: '',
      avatar_url: '',
      status: 'online' as const
    };
    
    await onRegister(userData);
  };

  if (isLogin) {
    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md bg-zinc-900 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
              <Bike className="w-8 h-8 text-black" />
            </div>
            <CardTitle className="text-2xl text-emerald-400 font-bold">
              MOTO TAXI
            </CardTitle>
            <p className="text-zinc-400 text-sm mt-2">
              Tu transporte seguro y rápido
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0414..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-md bg-zinc-900 border-emerald-500/50">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-emerald-400 font-bold">
            Crear Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole('passenger')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === 'passenger'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-400'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-sm font-medium">Pasajero</span>
            </button>
            <button
              onClick={() => setRole('driver')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                role === 'driver'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-400'
              }`}
            >
              <Bike className="w-6 h-6" />
              <span className="text-sm font-medium">Conductor</span>
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Apellido</Label>
            <Input
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Tu apellido"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Teléfono</Label>
            <Input
              value={phone}
              readOnly
              className="bg-zinc-800 border-zinc-700 text-zinc-400"
            />
          </div>

          {role === 'driver' && (
            <div className="space-y-2">
              <Label className="text-zinc-300">Detalles del Vehículo</Label>
              <Input
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
                placeholder="Moto Marca - Modelo - Placa"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          )}

          <Button
            onClick={handleRegister}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
          >
            Crear Cuenta
          </Button>

          <Button
            onClick={() => setIsLogin(true)}
            variant="outline"
            className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
