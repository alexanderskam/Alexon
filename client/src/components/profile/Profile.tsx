import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import Button from '../../UI/Button';

const Profile = () => {
    const user = useSelector((state: RootState) => state.userReducer);
    return (
        <div className="bg-blue-300 h-19/20 flex items-center justify-center flex-col">
            <div className="bg-[#31343a] text-white h-4/10 w-5/10 border border-transparent rounded-2xl p-3 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#2f4e83] flex items-center justify-center text-white font-medium">
                    {user.username.charAt(0)}
                </div>
                <p className="w-full text-2xl">{user.username}</p>
                <strong className="w-full text-2xl">{user.email}</strong>
                <div className="w-full flex items-center">
                    <p className=" text-2xl">{`Ваш профиль ${user.isActivated ? '' : 'не'} активирован`}</p>
                    {!user.isActivated ? (
                        <Button className="ml-auto">Активировать</Button>
                    ) : (
                        <></>
                    )}
                </div>
                <div className="flex w-full mt-2">
                    <Button className="ml-auto">Удалить аккаунт</Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
