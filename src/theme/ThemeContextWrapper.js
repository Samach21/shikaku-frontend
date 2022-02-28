import React, { useState, useEffect } from 'react';
import { ThemeContext, themes } from '../contexts/ThemeContext';

export function ThemeContextWrapper(props) {
    const [theme, setTheme] = useState(themes.dark);

    function changeTheme(theme) {
        setTheme(theme);
    }

    useEffect(() => {
        switch (theme) {
        case themes.light:
            document.body.classList.remove('dark');
            document.body.classList.add('light');
            break;
        case themes.dark:
        default:
            document.body.classList.remove('light');
            document.body.classList.add('dark');
            break;
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme: theme, changeTheme: changeTheme }}>
            {props.children}
        </ThemeContext.Provider>
    );
}