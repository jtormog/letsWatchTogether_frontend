'use client';

import { useRouter, usePathname } from 'next/navigation';
import clsx from 'clsx';
import Image from 'next/image';
import HomeIcon from '@/icons/HomeIcon';
import SearchIcon from '@/icons/SearchIcon';
import SocialIcon from '@/icons/SocialIcon';
import CalendarIcon from '@/icons/CalendarIcon';

const navItems = [
  {
    path: '/',
    label: 'Inicio',
    icon: (
      <HomeIcon />
    )
  },
  {
    path: '/search',
    label: 'Búsqueda',
    icon: (
      <SearchIcon />
    )
  },
  {
    path: '/social',
    label: 'Social',
    icon: (
      <SocialIcon />
    )
  },
  {
    path: '/calendar',
    label: 'Calendario',
    icon: (
      <CalendarIcon/>
    )
  }
];

const NavItem = ({ path, label, icon, isActive, onClick }) => {

  const itemStyle = {
    paddingLeft: 12, 
    paddingRight: 12, 
    paddingTop: isActive ? 14 : 8, 
    paddingBottom: isActive ? 14 : 8, 
    background: isActive ? '#0DE383' : 'transparent', 
    borderRadius: 8, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    gap: 8, 
    display: 'flex',
    height: isActive ? '3.5em' : 'auto'
  };

  const textStyle = {
    color: isActive ? 'var(--color-grey-7, #121212)' : 'var(--color-grey-65, #A1A1AA)', 
    fontSize: 14,
    fontFamily: 'var(--font-inter)', 
    fontWeight: '500', 
    lineHeight: '20px',
    wordWrap: 'break-word',
    height: 'auto',
    display: 'inline-block'
  };

  return (
    <div 
      className={clsx("nav-item", { "cursor-pointer": !isActive })}
      style={{ 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'flex-start', 
        display: 'inline-flex',
        cursor: !isActive ? 'pointer' : 'default',
        paddingLeft: 16
      }}
      onClick={() => !isActive && onClick(path)}
    >
      <div 
        style={itemStyle}
        className={clsx("nav-item-content", { "cursor-pointer": !isActive })}
      >
        <div style={{ position: 'relative', color: isActive ? 'var(--color-grey-7, #121212)' : 'var(--color-grey-65, #A1A1AA)' }}>
          {icon}
        </div>
        <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={textStyle}>{label}</div>
        </div>
      </div>
    </div>
  );
};

export default function Navbar() {
  const router = useRouter();
  const currentPath = usePathname();
  
  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div className="navbar-container" style={{
      width: '100%', 
      position: 'relative',
      height: '5em',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="navbar-inner" style={{
        width: '95%', 
        maxWidth: 1845, 
        margin: '0 auto',
        position: 'relative', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        display: 'flex'
      }}>
        <div className="flex items-center">
          {/* Logo */}
          <div className="logo-container" style={{
            paddingRight: 16, 
            flexDirection: 'column', 
            justifyContent: 'flex-start', 
            alignItems: 'flex-start', 
            display: 'inline-flex'
          }}>
            <div style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex' }}>
              <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
                <div style={{
                  color: 'var(--color-spring-green-47, #0DE383)', 
                  fontSize: 20, 
                  fontFamily: 'Poppins', 
                  fontWeight: '800', 
                  lineHeight: '28px',
                  wordWrap: 'break-word',
                  height: 'auto',
                  display: 'inline-block'
                }}>
                  Let'sWatchTogether
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Items */}
          <div className="nav-items" style={{ justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
            {navItems.map((item, index) => (
              <NavItem 
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={currentPath === item.path}
                onClick={handleNavigation}
              />
            ))}
          </div>
        </div>
      
        {/* User Avatar - Changed to Image */}
        <div className="user-avatar" style={{
          width: 32, 
          height: 32, 
          overflow: 'hidden', 
          borderRadius: '100%', 
          display: 'inline-flex',
          position: 'relative'
        }}>
          <Image
            src='https://placehold.co/100x100/2E8B57/FFFFFF?text=JT'
            alt="User avatar"
            width={32}
            height={32}
            style={{
              borderRadius: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>
    </div>
  );
}

