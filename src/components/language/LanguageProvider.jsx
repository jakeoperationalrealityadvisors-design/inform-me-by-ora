import React from 'react';
import { LanguageProvider as Provider } from './LanguageContext';

export default function LanguageProviderWrapper({ children }) {
    return <Provider>{children}</Provider>;
}