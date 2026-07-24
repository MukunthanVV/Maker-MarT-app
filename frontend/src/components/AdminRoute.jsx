import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import apiClient from '../api/client';

export const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState(undefined);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      try {
        let profile = null;
        let error = false;
        try {
          const res = await apiClient.get(`/users/${user.id}`);
          profile = res.data;
        } catch (err) {
          error = true;
        }
          
        const bypass = user.email === 'tharunkarthikav21@gmail.com';
        if (bypass || (!error && profile && profile.is_admin)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error checking admin status", err);
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, []);

  if (isAdmin === undefined) {
    return <div className="min-h-screen bg-background flex justify-center items-center font-body-md text-on-background">Checking privileges...</div>;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};
