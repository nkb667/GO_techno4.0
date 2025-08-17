import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { BookOpen, Key, Copy, CheckCircle } from 'lucide-react';

const Login = () => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

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

  const copyToClipboard = (code, type) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(''), 2000);
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
          <p className="text-gray-600 mt-2">🔑 НОВАЯ СИСТЕМА - ВХОД ПО КОДУ</p>
          <p className="text-xs text-green-600 font-mono mt-1">✅ Обновлено: Регистрация удалена</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Вход в систему</CardTitle>
            <CardDescription>
              Введите один из кодов доступа для входа в платформу GO Learning
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="accessCode">🔑 Код доступа</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="accessCode"
                    name="accessCode"
                    type="text"
                    placeholder="Вставьте код доступа сюда..."
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="pl-10 font-mono text-sm h-12"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Access Codes Display */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-4 text-center">📋 Доступные коды:</h4>
                
                <div className="space-y-4 text-sm">
                  {/* User Code */}
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-green-700 flex items-center">
                        👤 <span className="ml-2">ПОЛЬЗОВАТЕЛЬ</span>
                      </strong>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          copyToClipboard('GO2025_UserAccess_7X9K', 'user');
                          setAccessCode('GO2025_UserAccess_7X9K');
                        }}
                        className="h-8 text-xs"
                      >
                        {copiedCode === 'user' ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            ✅ Скопировано
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            📋 Использовать
                          </>
                        )}
                      </Button>
                    </div>
                    <code className="font-mono text-xs bg-gray-100 px-3 py-2 rounded block break-all">
                      GO2025_UserAccess_7X9K
                    </code>
                    <p className="text-xs text-gray-600 mt-2">🎓 Доступ к урокам и тестам</p>
                  </div>
                  
                  {/* Admin Code */}
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-red-700 flex items-center">
                        🔧 <span className="ml-2">АДМИНИСТРАТОР</span>
                      </strong>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          copyToClipboard('ADMIN_Control_P4N3L_2025', 'admin');
                          setAccessCode('ADMIN_Control_P4N3L_2025');
                        }}
                        className="h-8 text-xs"
                      >
                        {copiedCode === 'admin' ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            ✅ Скопировано
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            📋 Использовать
                          </>
                        )}
                      </Button>
                    </div>
                    <code className="font-mono text-xs bg-gray-100 px-3 py-2 rounded block break-all">
                      ADMIN_Control_P4N3L_2025
                    </code>
                    <p className="text-xs text-gray-600 mt-2">⚡ Полный доступ к системе</p>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                {loading ? '🔄 Вход...' : '🚀 Войти в систему'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-600 bg-white/50 rounded-lg p-3">
          <p className="font-medium">ℹ️ Инструкция:</p>
          <p className="mt-1">1. Нажмите "📋 Использовать" на нужном коде</p>
          <p>2. Нажмите "🚀 Войти в систему"</p>
          <p className="text-xs mt-2 text-blue-600">🆕 Регистрация больше не нужна!</p>
        </div>
      </div>
    </div>
  );
};

export default LoginNew;