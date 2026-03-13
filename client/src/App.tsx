import { Route, Routes, useLocation } from 'react-router';
import LoginForm from './components/auth/LoginForm';
import Protect from './components/protect-component/Protect';
import RegistrationForm from './components/auth/RegistrationForm';
import Header from './components/Header';
import Profile from './components/profile/Profile';
import Users from './components/users/Users';
import MainPage from './components/chats/MainPage';
import Redirect from './components/Redirect';

function App() {
    const location = useLocation();
    const isAuthPage =
        location.pathname === '/login' || location.pathname === '/register';
    return (
        <>
            {!isAuthPage && <Header />}
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route
                    path="/chats"
                    element={
                        <Protect children={<MainPage withChat={false} />} />
                    }
                />
                <Route
                    path="/chats/:id"
                    element={
                        <Protect children={<MainPage withChat={true} />} />
                    }
                />

                <Route
                    path="/users"
                    element={<Protect children={<Users />} />}
                />
                <Route
                    path="/profile"
                    element={<Protect children={<Profile />} />}
                />
                <Route path="/" element={<Redirect />} />
            </Routes>
        </>
    );
}

export default App;
