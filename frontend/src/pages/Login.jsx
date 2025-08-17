import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { BookOpen, Key } from 'lucide-react';

const Login = () => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!accessCode.trim()) {
      setError('Пожалуйста, введите код доступа');
      setLoading(false);
      return;
    }

    const result = await login(accessCode);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Неверный код доступа');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto bg-blue-600 text-white p-3 rounded-xl w-fit mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">GO Learn</h1>
          <p className="text-gray-600 mt-2">Введите код доступа для входа в систему</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>
              Введите код доступа для входа в платформу обучения GO
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="accessCode">Код доступа</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="accessCode"
                    name="accessCode"
                    type="text"
                    placeholder="Введите код доступа"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="pl-10 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Hint about codes */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Доступные коды:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div className="font-mono bg-white px-2 py-1 rounded border">
                    <strong>Пользователь:</strong> GO2025_UserAccess_7X9K
                  </div>
                  <div className="font-mono bg-white px-2 py-1 rounded border">
                    <strong>Администратор:</strong> ADMIN_Control_P4N3L_2025
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Вход...' : 'Войти в систему'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Используйте соответствующий код для получения доступа к системе</p>
        </div>
      </div>
    </div>
  );
};

export default Login;