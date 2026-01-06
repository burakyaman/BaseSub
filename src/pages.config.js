import Analytics from './pages/Analytics';
import CalendarPage from './pages/CalendarPage';
import Home from './pages/Home';
import Insights from './pages/Insights';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "CalendarPage": CalendarPage,
    "Home": Home,
    "Insights": Insights,
    "Onboarding": Onboarding,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};