import React, { FC, useContext } from 'react';
import { useQuery } from '@apollo/client';

import { ISideBarWithDataProps } from 'lib/types/components/data';
import { Query, Subscription } from 'lib/graphql/types';
import { DIALOGS } from 'lib/graphql/queries/dialog';

import { UserContext } from 'helpers/contexts/userContext';

import { SideBar } from 'components/common';
import { DIALOG_CREATED } from 'lib/graphql/subscriptions/dialog';

const SideBarWithData: FC<ISideBarWithDataProps> = (props) => {
    const { state: UserState } = useContext(UserContext);

    const { subscribeToMore, ...result } = useQuery<Query>(DIALOGS, {
        variables: { userId: UserState?.user?.id },
        pollInterval: 60000,
    });

    const subscribeToNewDialogs = () => {
        if (UserState && UserState.user) {
            return subscribeToMore({
                document: DIALOG_CREATED,
                variables: { userId: UserState.user.id },
                updateQuery: (
                    prev,
                    {
                        subscriptionData,
                    }: { subscriptionData: { data: Subscription } }
                ) => {
                    if (!subscriptionData.data) return prev;

                    const newDialogItem = subscriptionData.data.dialogCreated;
                    const prevDialogs =
                        prev && prev.dialogs ? prev.dialogs : [];

                    const newCache = {
                        ...prev,
                        dialogs: [newDialogItem, ...prevDialogs],
                    };

                    return newCache;
                },
            });
        }
    };

    return (
        <SideBar
            {...props}
            {...result}
            subscribeToNewDialogs={subscribeToNewDialogs}
        />
    );
};

export default SideBarWithData;
