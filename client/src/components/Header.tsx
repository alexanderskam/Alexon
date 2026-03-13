import { Link } from 'react-router';
import { FaUser } from 'react-icons/fa';
import { BiSolidMessageSquareDetail } from 'react-icons/bi';
import { BsFillPeopleFill } from 'react-icons/bs';
import { IoLogOut } from 'react-icons/io5';
import useLogout from '../hooks/auth/useLogout';

const Header = () => {
    const logout = useLogout();
    return (
        <div className="flex h-1/20 bg-[#2a2f3a] justify-between p-1">
            <div className="flex">
                <Link
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white gap-2"
                    to={'/users'}
                >
                    <BsFillPeopleFill /> <p>Users</p>
                </Link>
                <Link
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white gap-2"
                    to={'/chats'}
                >
                    <BiSolidMessageSquareDetail /> Chats
                </Link>
            </div>
            <div className="flex">
                <Link
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white gap-2"
                    to={'/profile'}
                >
                    <FaUser /> Profile
                </Link>
                <Link
                    to={'/'}
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white gap-2"
                    onClick={(e) => {
                        e.preventDefault();
                        logout.mutate();
                    }}
                >
                    <IoLogOut /> Logout
                </Link>
            </div>
        </div>
    );
};

export default Header;
