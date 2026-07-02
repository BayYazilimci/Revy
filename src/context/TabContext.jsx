import { createContext } from 'react'

export const TabContext = createContext({
  activeTab: 'anasayfa',
  setActiveTab: () => {},
  tabParams: {},
  setTabParams: () => {},
})
