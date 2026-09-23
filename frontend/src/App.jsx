import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Resumes from "./pages/Resumes";
import Analysis from "./pages/Analysis";
import Jobs from "./pages/Jobs";
import CreateJob from "./pages/CreateJob";
import JobDescriptionAnalyzer from "./pages/JobDescriptionAnalyzer";
import Matches from "./pages/Matches";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/jobs"
            element={<Jobs />}
          />

          <Route
            path="/applications"
            element={<Applications />}
          />

          <Route
            path="/matches"
            element={<Matches />}
          />

          <Route element={<RoleRoute allowedRole="candidate" />}>
            <Route
              path="/resumes"
              element={<Resumes />}
            />

            <Route
              path="/analysis"
              element={<Analysis />}
            />

            <Route
              path="/jd-analyzer"
              element={<JobDescriptionAnalyzer />}
            />
          </Route>

          <Route element={<RoleRoute allowedRole="recruiter" />}>
            <Route
              path="/jobs/create"
              element={<CreateJob />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
