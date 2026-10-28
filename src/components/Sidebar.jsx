import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  HandCoins,
  WalletCards,
  ReceiptText,
  UsersRound,
  Landmark,
  UserCog,
  BellRing,
  Power,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
  Car,
  Settings
} from 'lucide-react'

import {
  getCurrentUser,
  hasPathPermission,
  SESSION_UPDATE_EVENT,
  PERMISSION_UPDATE_EVENT,
  logoutUser,
} from '../utils/userManagementStorage'

const Sidebar = ({ onCollapsedChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser())
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  // Listen to session and permission changes
  useEffect(() => {
    const handleSession = (e) => setCurrentUserState(e.detail || getCurrentUser())
    const handlePerm = () => setCurrentUserState(getCurrentUser())
    window.addEventListener(SESSION_UPDATE_EVENT, handleSession)
    window.addEventListener(PERMISSION_UPDATE_EVENT, handlePerm)
    window.addEventListener('storage', handlePerm)
    return () => {
      window.removeEventListener(SESSION_UPDATE_EVENT, handleSession)
      window.removeEventListener(PERMISSION_UPDATE_EVENT, handlePerm)
      window.removeEventListener('storage', handlePerm)
    }
  }, [])

  useEffect(() => {
    const getBreakpoint = (width) => {
      if (width >= 1024) return 'desktop'
      if (width >= 640) return 'tablet'
      return 'mobile'
    }

    let lastBreakpoint = getBreakpoint(window.innerWidth)

    const handleResize = () => {
      const currentBreakpoint = getBreakpoint(window.innerWidth)
      if (currentBreakpoint !== lastBreakpoint) {
        lastBreakpoint = currentBreakpoint

        setIsOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [onCollapsedChange])

  const toggleCollapsed = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    onCollapsedChange(next)
  }

  const navLinkClasses = ({ isActive }) =>
    `group flex items-center rounded-lg min-h-[38px] py-1.5 text-[13.5px] transition-all duration-200 ${isActive
      ? 'bg-[#006B52] text-[#FFFFFF] font-semibold shadow-sm'
      : 'text-[#A8D5C8] font-medium hover:bg-[#005344] hover:text-[#FFFFFF]'
    } ${isCollapsed ? 'justify-center px-2' : 'px-2.5 gap-2.5'}`

  const isLinkActive = (item, isActive) => {
    if (item.path === '/settings') {
      return location.pathname.startsWith('/settings')
    }
    return isActive
  }

  const getNavLinkClasses = (item) => ({ isActive }) => {
    const active = isLinkActive(item, isActive)
    return `group flex items-center rounded-lg min-h-[38px] py-1.5 text-[13.5px] transition-all duration-200 ${active
      ? 'bg-[#006B52] text-[#FFFFFF] font-semibold shadow-sm'
      : 'text-[#A8D5C8] font-medium hover:bg-[#005344] hover:text-[#FFFFFF]'
      } ${isCollapsed ? 'justify-center px-2' : 'px-2.5 gap-2.5'}`
  }

  const iconClasses = "h-[18px] w-[18px] shrink-0 transition-colors duration-200"

  const renderIcon = (IconComponent, isActive) => (
    <IconComponent
      className={`${iconClasses} ${isActive ? 'text-[#39D6A3]' : 'text-[#A8D5C8] group-hover:text-[#39D6A3]'}`}
      strokeWidth={isActive ? 2.5 : 2}
    />
  )

  const SectionLabel = ({ label }) => (
    <div className={`px-2 mb-1.5 mt-3.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#46D8AE] transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden m-0' : 'opacity-100'}`}>
      {label}
    </div>
  )

  const mainItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ]

  const moduleItems = [
    { name: 'Loan', path: '/loans', icon: HandCoins },
    { name: 'Collection', path: '/collection', icon: WalletCards },
    { name: 'Vehicle', path: '/vehicle', icon: Car },
    { name: 'Ledger', path: '/ledger', icon: ReceiptText },
    { name: 'Customer', path: '/customers', icon: UsersRound },
    { name: 'Investor', path: '/investors', icon: Landmark },
  ]

  const userItems = [
    { name: 'User Management', path: '/users', icon: UserCog },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  const notificationItems = [
    { name: 'Reminder', path: '/reminders', icon: BellRing },
  ]

  // Filter items by role-based permissions
  const filterByPerm = (items) => {
    if (!currentUser || currentUser.role === 'Admin') return items;
    return items.filter((item) => hasPathPermission(currentUser, item.path));
  };

  const visibleMainItems = filterByPerm(mainItems);
  const visibleModuleItems = filterByPerm(moduleItems);
  const visibleUserItems = filterByPerm(userItems);
  const visibleNotificationItems = filterByPerm(notificationItems);

  return (
    <>
      {/* Edge Sidebar Toggle for Mobile */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed ${isOpen ? 'left-[190px]' : 'left-0'} top-1/2 -translate-y-1/2 z-50 sm:hidden flex items-center justify-center rounded-r-lg bg-[#006B52] hover:bg-[#005344] text-[#FFFFFF] shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#39D6A3] h-11 w-7 active:scale-95`}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4 ml-0.5" />}
      </button>

      {isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm sm:hidden"
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-[100dvh] flex flex-col border-r border-[#145247] bg-[#003C32] p-2.5 xl:p-3 text-[#E8F5F1] shadow-xl transition-all duration-300 sm:translate-x-0 sm:shadow-none ${isCollapsed ? 'w-20' : 'w-[190px]'
          } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`mb-3 xl:mb-4 flex items-start px-1 ${isCollapsed ? 'justify-center' : 'justify-between'} shrink-0`}>
          <div className={`flex items-start gap-2 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
            <img
              src="/Motolend_logo.png"
              alt="MotoLend logo"
              className="h-7.5 w-7.5 rounded-lg object-contain bg-white/10 shrink-0 mt-0.5"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="text-[18px] font-bold tracking-tight leading-none whitespace-nowrap">
                  <span className="text-[#E8F5F1]">Moto</span>
                  <span className="text-[#39D6A3]">Lend</span>
                </div>
                <p className="mt-1 text-[7.5px] font-bold tracking-[0.06em] text-[#A8D5C8] leading-[1.2] uppercase max-w-[110px]">
                  POWERING SMARTER FINANCE
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-[#A8D5C8] hover:bg-[#005344] hover:text-[#FFFFFF] transition-colors sm:hidden shrink-0"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-hidden pb-2">
          {/* Top Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0 pr-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {visibleMainItems.length > 0 && (
              <>
                <SectionLabel label="MAIN" />
                <div className="space-y-2">
                  {visibleMainItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={getNavLinkClasses(item)}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {renderIcon(item.icon, isLinkActive(item, isActive))}
                          <span className={`whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </>
            )}

            {visibleModuleItems.length > 0 && (
              <>
                <SectionLabel label="MODULES" />
                <div className={`space-y-2 ${isCollapsed ? '' : 'pl-1.5'}`}>
                  {visibleModuleItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={getNavLinkClasses(item)}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {renderIcon(item.icon, isLinkActive(item, isActive))}
                          <span className={`whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </>
            )}

            {visibleNotificationItems.length > 0 && (
              <>
                <SectionLabel label="NOTIFICATIONS" />
                <div className="space-y-2">
                  {visibleNotificationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={getNavLinkClasses(item)}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {renderIcon(item.icon, isLinkActive(item, isActive))}
                          <span className={`whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bottom Area */}
          <div className="shrink-0 flex flex-col pt-1.5">
            <div className="pt-2.5 border-t border-[#145247] flex flex-col gap-2.5">
              {visibleUserItems.length > 0 && (
                <>
                  <SectionLabel label="USER" />
                  <div className="space-y-2">
                    {visibleUserItems.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={getNavLinkClasses(item)}
                        title={isCollapsed ? item.name : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            {renderIcon(item.icon, isLinkActive(item, isActive))}
                            <span className={`whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>{item.name}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </>
              )}

              {/* Active Profile Card */}
              <div className={`flex items-center gap-2 rounded-xl bg-[#005344] border border-[#145247] px-2.5 py-1.5 min-h-[38px] transition-all duration-300 mx-auto ${isCollapsed ? 'justify-center w-10 h-10 p-0' : 'w-[92%]'}`}>
                <div className="h-7 w-7 rounded-full bg-[#006B52] flex items-center justify-center shrink-0 shadow-inner text-[#39D6A3] font-bold text-[11px]">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : <UserRound className="h-3.5 w-3.5 text-[#39D6A3]" />}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11.5px] font-bold text-[#E8F5F1] leading-tight truncate">
                      {currentUser?.name || 'Admin'}
                    </span>
                    <span className="text-[9.5px] font-medium text-[#A8D5C8] truncate">
                      {currentUser?.role === 'Admin' ? 'Administrator' : 'Staff Member'}
                    </span>
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={() => {
                  logoutUser()
                  navigate('/login', { replace: true })
                }}
                className={`flex items-center rounded-lg bg-[#EF1111] hover:bg-red-700 text-[#FFFFFF] transition-colors duration-200 shadow-sm cursor-pointer mx-auto ${isCollapsed ? 'justify-center p-2 w-10 h-10' : 'justify-center gap-1.5 px-3 py-1.5 min-h-[36px] w-[92%]'
                  }`}
                title={isCollapsed ? 'Sign Out' : undefined}
              >
                <Power className="h-[14px] w-[14px] shrink-0 text-[#FFFFFF]" />
                {!isCollapsed && (
                  <span className="text-[12px] font-medium whitespace-nowrap text-[#FFFFFF]">Sign Out</span>
                )}
              </button>

              {/* Collapse Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="p-1.5 rounded-lg text-[#A8D5C8] hover:text-[#E8F5F1] hover:bg-[#005344] transition-all duration-200"
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4 shrink-0" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
