import CalendarPage from './pages/CalendarPage';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Home from './pages/Home';
import Insights from './pages/Insights';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CalendarPage": CalendarPage,
    "Analytics": Analytics,
    "Settings": Settings,
    "Home": Home,
    "Insights": Insights,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};