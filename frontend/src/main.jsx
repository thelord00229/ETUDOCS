import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import './index.css'
import Router from './routes/Router.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,      // une fois chargées, les données ne sont jamais "périmées" → aucun refetch automatique au remontage/navigation
            gcTime: Infinity,         // le cache reste en mémoire toute la session (jamais purgé)
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
        },
    },
})

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
                <BrowserRouter>
                    <Router />
                </BrowserRouter>
            </ErrorBoundary>
        </QueryClientProvider>
    </StrictMode>,
)
