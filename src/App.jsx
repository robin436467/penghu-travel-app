import { createContext, useContext, useState } from 'react'
import { StoreProvider } from './store'
import BottomNav from './components/BottomNav'
import Overview from './pages/Overview'
import Itinerary from './pages/Itinerary'
import Explore from './pages/Explore'
import Expenses from './pages/Expenses'
import SpotDetail from './components/SpotDetail'
import InstallPrompt from './components/InstallPrompt'

const NavContext = createContext(null)
export const useNav = () => useContext(NavContext)

export default function App() {
  const [tab, setTab] = useState('overview')
  const [spotId, setSpotId] = useState(null)
  const [itinDay, setItinDay] = useState(1)

  const nav = {
    tab,
    itinDay,
    goTab: (t) => {
      setSpotId(null)
      setTab(t)
    },
    goItinerary: (day) => {
      setSpotId(null)
      if (day) setItinDay(day)
      setTab('itinerary')
    },
    openSpot: (id) => setSpotId(id),
    closeSpot: () => setSpotId(null),
  }

  return (
    <StoreProvider>
      <NavContext.Provider value={nav}>
        <div className="min-h-svh pb-[calc(76px+env(safe-area-inset-bottom))]">
          {tab === 'overview' && <Overview />}
          {tab === 'itinerary' && <Itinerary />}
          {tab === 'explore' && <Explore />}
          {tab === 'expenses' && <Expenses />}
        </div>

        <BottomNav tab={tab} onChange={nav.goTab} />
        <InstallPrompt />

        {spotId && <SpotDetail spotId={spotId} onClose={nav.closeSpot} />}
      </NavContext.Provider>
    </StoreProvider>
  )
}
