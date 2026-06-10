import IconButton from '@mui/material/IconButton';
import { Sun1, Moon } from 'iconsax-react';

import { ThemeMode } from 'config';
import useConfig from 'hooks/useConfig';

export default function SimpleThemeToggle() {
    const { mode, onChangeMode } = useConfig();

    const toggleMode = () => {
        onChangeMode(mode === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT);
    };

    return (
        <IconButton onClick={toggleMode} sx={{ p: 1 }}>
            {mode === ThemeMode.LIGHT ? (
                <Sun1 variant="Bold" />
            ) : (
                <Moon variant="Bold" />
            )}
        </IconButton>
    );
}
