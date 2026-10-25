'use client';

import React from 'react';

// ─── Type Definitions ─────────────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface LeftSidebarProps {
  navGroups: NavGroup[];
  activeId: string;
  onActiveChange: (id: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

// ─── Icon Primitive Helper ───────────────────────────────────────────────────
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ─── SidebarItem Component (Internal Helper) ─────────────────────────────────
interface SidebarItemProps extends NavItem {
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function SidebarItem({
  label,
  icon,
  badge,
  isActive,
  collapsed,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: collapsed ? '8px 0' : '8px 16px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        cursor: 'pointer',
        border: 'none',
        borderRadius: 0,
        background: isActive ? 'rgba(194,147,103,0.12)' : 'transparent',
        borderLeft: isActive ? '3px solid var(--caramel)' : '3px solid transparent',
        color: isActive ? 'var(--caramel)' : '#7A6258',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: isActive ? 700 : 500,
        letterSpacing: '0.02em',
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(194,147,103,0.06)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = '#7A6258';
        }
      }}
      className="group"
    >
      <span 
        style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}
        className="transition-transform group-hover:scale-105 duration-200"
      >
        <Icon d={icon} size={15} />
      </span>

      {!collapsed && (
        <>
          <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </span>
          {badge && (
            <span
              style={{
                background: 'var(--caramel)',
                color: 'white',
                borderRadius: '999px',
                fontSize: '9px',
                fontWeight: 800,
                padding: '1px 6px',
                lineHeight: '16px',
                minWidth: '18px',
                textAlign: 'center',
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}

      {/* Collapsed badge dot */}
      {collapsed && badge && (
        <span
          style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            background: 'var(--caramel)',
            borderRadius: '999px',
            width: '7px',
            height: '7px',
          }}
        />
      )}
    </button>
  );
}

// ─── SidebarGroup Component (Internal Helper) ────────────────────────────────
interface SidebarGroupProps {
  title: string;
  items: NavItem[];
  activeId: string;
  collapsed: boolean;
  onItemClick: (id: string) => void;
}

function SidebarGroup({
  title,
  items,
  activeId,
  collapsed,
  onItemClick,
}: SidebarGroupProps) {
  return (
    <div>
      {/* Group title */}
      {!collapsed && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#A89286',
            padding: '14px 16px 4px',
            fontWeight: 700,
          }}
        >
          {title}
        </p>
      )}
      {collapsed && <div style={{ height: 8 }} />}

      {/* Items */}
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            isActive={activeId === item.id}
            collapsed={collapsed}
            onClick={() => onItemClick(item.id)}
          />
        ))}
      </div>

      {/* Group separator */}
      <div style={{ height: '1px', background: 'transparent', margin: '4px 0' }} />
    </div>
  );
}

// ─── Main LeftSidebar Component (Exported) ───────────────────────────────────
export default function LeftSidebar({
  navGroups,
  activeId,
  onActiveChange,
  collapsed,
  onCollapsedChange,
}: LeftSidebarProps) {
  return (
    <aside
      style={{
        background: 'rgba(252, 249, 242, 0.7)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderRight: '1px solid rgba(194,147,103,0.1)',
        borderBottomRightRadius: '24px',
        boxShadow: '4px 0 24px rgba(61,45,39,0.05)',
        width: collapsed ? '56px' : '232px',
        transition: 'width 0.28s cubic-bezier(.4,0,.2,1)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
      className="hidden md:flex flex-col flex-shrink-0 h-full select-none"
    >
      {/* Sticky Header wrapper for Collapse toggle */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(252, 249, 242, 0.92)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(194,147,103,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          width: '100%',
        }}
      >
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--caramel)',
            cursor: 'pointer',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: collapsed ? '100%' : 'auto',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {collapsed
              ? <><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></>
              : <><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></>
            }
          </svg>
        </button>
      </div>

      {/* Navigation groups */}
      <nav className="flex flex-col gap-0 pb-6">
        {navGroups.map((group) => (
          <SidebarGroup
            key={group.title}
            title={group.title}
            items={group.items}
            activeId={activeId}
            collapsed={collapsed}
            onItemClick={onActiveChange}
          />
        ))}
      </nav>
    </aside>
  );
}
