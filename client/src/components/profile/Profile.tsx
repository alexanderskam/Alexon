import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import Button from '../../UI/Button';
import useConfirm from '../../hooks/auth/useConfirm';
import { useContext, type MouseEventHandler } from 'react';
import { ToastContainer } from 'react-toastify';
import { SocketContext } from '../../context/SocketContext';
import useDeleteUser from '../../hooks/users/useDeleteUser';

const Profile = () => {
    const user = useSelector((state: RootState) => state.userReducer);
    const confirmMutation = useConfirm(user.email);
    const socketRef = useContext(SocketContext);
    const deleteUser = useDeleteUser(socketRef);
    const handleDeleteUser: MouseEventHandler<HTMLButtonElement> = () => {
        deleteUser(user._id);
    };
    const handleConfirm: MouseEventHandler<HTMLButtonElement> = () => {
        confirmMutation.mutate({ userId: user._id });
    };
    return (
        <div className="bg-blue-300 h-19/20 flex items-center justify-center flex-col p-2">
            <div className="bg-[#31343a] text-white w-full md:w-4/10 border border-transparent rounded-2xl p-3 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#2f4e83] flex items-center justify-center text-white font-medium">
                    {user.username.charAt(0)}
                </div>
                <div className="flex justify-between w-full mt-4">
                    <p
                        className="text-2xl mb-5 max-w-30 sm:max-w-none truncate"
                        title={user.username}
                    >
                        {user.username}
                    </p>
                    <strong
                        className="text-2xl max-w-50 sm:max-w-none truncate"
                        title={user.email}
                    >
                        {user.email}
                    </strong>
                </div>
                <div className="w-full flex items-center">
                    <p className=" text-2xl">{`Ваш профиль ${user.isActivated ? '' : 'не'} активирован`}</p>
                    {!user.isActivated ? (
                        <Button
                            disabled={confirmMutation.isPending}
                            onClick={handleConfirm}
                            className="ml-auto"
                        >
                            Активировать
                        </Button>
                    ) : (
                        <></>
                    )}
                </div>
                <div className="flex w-full mt-2">
                    <Button onClick={handleDeleteUser} className="ml-auto">
                        Удалить аккаунт
                    </Button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Profile;
