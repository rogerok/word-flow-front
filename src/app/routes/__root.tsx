import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import React from 'react';
import { MainLayout } from '@shared/elements';
import { AuthController } from '@shared/services';
import { NavbarLinks } from '@shared/const';
import { Header } from '@widgets/Header';
import { Navbar } from '@widgets/Navbar';

interface RouterContext {
  isAuth: boolean;
  authController?: AuthController;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <MainLayout
        header={<Header />}
        content={<Outlet />}
        navbar={<Navbar links={NavbarLinks} />}
      />
    </>
  ),
  beforeLoad: async ({ context }) => {
    if (!context.isAuth) {
      await context.authController?.restoreSession();
    }
  },
});
