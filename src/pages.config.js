import Analytics from './pages/Analytics';
import CalendarPage from './pages/CalendarPage';
import Home from './pages/Home';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "CalendarPage": CalendarPage,
    "Home": Home,
    "Insights": Insights,
    "Settings": Settings,
    "Onboarding": Onboarding,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};