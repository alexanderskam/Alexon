import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const Redirect = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/users');
    });
    return <div></div>;
};

export default Redirect;
