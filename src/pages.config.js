import Home from './pages/Home';
import FillForm from './pages/FillForm';
import FillChecklist from './pages/FillChecklist';
import Submissions from './pages/Submissions';
import ViewFormSubmission from './pages/ViewFormSubmission';
import ViewChecklistSubmission from './pages/ViewChecklistSubmission';
import Admin from './pages/Admin';
import EditForm from './pages/EditForm';
import EditChecklist from './pages/EditChecklist';
import EditCategory from './pages/EditCategory';


export const PAGES = {
    "Home": Home,
    "FillForm": FillForm,
    "FillChecklist": FillChecklist,
    "Submissions": Submissions,
    "ViewFormSubmission": ViewFormSubmission,
    "ViewChecklistSubmission": ViewChecklistSubmission,
    "Admin": Admin,
    "EditForm": EditForm,
    "EditChecklist": EditChecklist,
    "EditCategory": EditCategory,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};