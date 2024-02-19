import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <DynamicContextProvider
            settings={{
                environmentId: 'c67e2d65-f909-4896-83cd-fddcc60d2b1d',
                walletConnectors: [EthereumWalletConnectors],
                eventsCallbacks: {
                    onAuthSuccess: async (event) => {
                        const { authToken } = event;
                        console.log('Auth Success:', authToken);
                    },
                },
            }}>
            <App />
        </DynamicContextProvider>

    </React.StrictMode>,
)
