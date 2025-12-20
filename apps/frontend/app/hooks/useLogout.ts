import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';

import { performLogout } from '@/helper/logoutHelper';
import { useMyScrollViewModal } from '@/components/GlobalModal/useMyScrollViewModal';

const useLogout = () => {
        const dispatch = useDispatch();
        const router = useRouter();
        const { close } = useMyScrollViewModal();

        return useCallback(
                async (asGuest: boolean = false) => {
                        close();
                        await performLogout(dispatch, router, asGuest);
                },
                [close, dispatch, router]
        );
};

export default useLogout;
