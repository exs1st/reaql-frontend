import React, { FC, useContext } from 'react';
import { useQuery } from '@apollo/client';

import { ISideBarWithDataProps } from 'lib/types/components/data';
import { Query, Subscription } from 'lib/graphql/types';
import { GET_DIALOGS } from 'lib/graphql/queries/dialog';

import { UserContext } from 'helpers/contexts/userContext';

import { SideBar } from 'components/common';
import { DIALOG_CREATED } from 'lib/graphql/subscriptions/dialog';

const SideBarWithData: FC<ISideBarWithDataProps> = (props) => {
    const { state: UserState } = useContext(UserContext);

    const { data, subscribeToMore } = useQuery<Query>(GET_DIALOGS, {
        variables: { userId: UserState?.user?.id },
    });

    const dialogs = data?.dialogs;

    const subscribeToNewDialogs = () => {
        return subscribeToMore({
            document: DIALOG_CREATED,
            variables: { userId: UserState?.user?.id },
            updateQuery: (
                prev,
                {
                    subscriptionData,
                }: { subscriptionData: { data: Subscription } }
            ) => {
                if (!subscriptionData.data) return prev;

                const newDialogItem = subscriptionData.data.dialogCreated;

                const newCache = {
                    ...prev,
                    dialogs: [...prev.dialogs, newDialogItem],
                };

                return newCache;
            },
        });
    };

    return (
        <SideBar
            {...props}
            dialogs={dialogs}
            subscribeToNewDialogs={subscribeToNewDialogs}
        />
    );
};

export default SideBarWithData;