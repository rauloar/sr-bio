import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    // For dashboard root, we want exact match
    if (path === '/dashboard' && location.pathname === '/dashboard') {
        return 'bg-primary text-white';
    }
    // For sub-routes, check if the pathname starts with the link path (but not for root dashboard link)
    if (path !== '/dashboard' && location.pathname.startsWith(path)) {
        return 'bg-primary text-white';
    }
    return 'text-slate-400 hover:bg-[#233648] hover:text-white';
  };

  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Inicio' },
    { path: '/dashboard/devices', icon: 'devices', label: 'Dispositivos' },
    { path: '/dashboard/users', icon: 'group', label: 'Usuarios' },
    { path: '/dashboard/events', icon: 'description', label: 'Registros' },
    { path: '/dashboard/settings', icon: 'settings', label: 'Configuración' },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200/10 bg-[#111a22] p-4 md:flex h-screen sticky top-0">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="size-10 rounded-lg bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCP1hakbgtpH--murgvO7nBHduIoMgAmCIHl7PjOBnZZPMYCUsf1acivFyeDghj8W7Ap6le3r8FfRUCxShRNb18Kg8hsusxdZlbhYsXXha0iprC2VxFOf9Jt_C3vFN4iH65x8_UxlgSf_iuT-9PdKWTJdQvCcSQ8fz3JcyLJxoIREUC9GJRf4o65gsQUzLbbiexw07x5ag-2eZr3NBR-WKeaDH0jlZNXH_wm_8_DgV1XVhwlGSs4nrJJe5zUfJKjGsPYSnDCKc5dJU")' }}></div>
          <div className="flex flex-col">
            <h1 className="text-base font-medium leading-normal text-white">SR-BIO</h1>
            <p className="text-sm font-normal leading-normal text-[#92adc9]">Web App</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${isActive(item.path)}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname === item.path ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <p className="text-sm font-medium leading-normal">{item.label}</p>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto flex flex-col gap-1">
        <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-[#233648] hover:text-white transition-colors">
          <span className="material-symbols-outlined">help</span>
          <p className="text-sm font-medium leading-normal">Ayuda</p>
        </a>
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-[#233648] hover:text-white transition-colors">
          <span className="material-symbols-outlined">logout</span>
          <p className="text-sm font-medium leading-normal">Cerrar Sesión</p>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;