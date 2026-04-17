import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ScrollToHash from "./utills/scroll";
import { getUserFromToken } from "./utills/checkAuth";
import { pagepaths } from "./constant/pagepaths";
import Login from "./pages/loginPage";
import { SignUp } from "./pages/signup";
import ProtectedRoute from "./routes/protectedRoutWrapper";
import Home from "./pages/home";


function App() {
  const [isauthenticated, setAuthenticated] = useState(getUserFromToken() ? true : false);
  let user = getUserFromToken();
  useEffect(() => {
    user = getUserFromToken();
  }, [isauthenticated]);
  return (<>
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route
          path={pagepaths.LOGINPAGE}
          element={
            !isauthenticated ? (
              <Login setAuthenticated={setAuthenticated} />
            ) : (
              <Navigate to={pagepaths.HOMEPAGE} />
            )
          }
        />
        <Route
          path={pagepaths.REGISTERPAGE}
          element={
            !isauthenticated ? (
              <SignUp />
            ) : (
              <Navigate to={pagepaths.HOMEPAGE} />
            )
          }
        />
        <Route element={<ProtectedRoute isauthenticated={isauthenticated} />}>
          <Route path={pagepaths.HOMEPAGE} element={<Home user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </>);
}

export default App;