import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'landlord' | 'user';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [checkingRole, setCheckingRole] = useState(!!requiredRole);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    if (!requiredRole || isLoading || !user) {
      setCheckingRole(false);
      return;
    }

    const checkRole = async () => {
      if (requiredRole === 'admin') {
        const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });
        if (!error && data === true) setHasRole(true);
      } else if (requiredRole === 'landlord') {
        // Admins can also access landlord pages
        const [{ data: isLandlord }, { data: isAdmin }] = await Promise.all([
          supabase.rpc('has_role', { _user_id: user.id, _role: 'landlord' }),
          supabase.rpc('is_admin', { _user_id: user.id }),
        ]);
        if (isLandlord === true || isAdmin === true) setHasRole(true);
      } else {
        setHasRole(true);
      }
      setCheckingRole(false);
    };

    checkRole();
  }, [user, isLoading, requiredRole]);

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading session...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading while role is being checked
  if (requiredRole && checkingRole) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show access denied if role check failed
  if (requiredRole && !hasRole) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}
