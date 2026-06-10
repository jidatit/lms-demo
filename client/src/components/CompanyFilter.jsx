import { useState } from 'react';
import {
    Box,
    Button,
    Popover,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress,
    Typography
} from '@mui/material';
import { useCompanies } from 'api/queries/companies';
import { useAuth } from 'contexts/AuthContext';
import { CloseCircle } from 'iconsax-react';

const CompanyFilter = ({
    selectedCompanyId,
    setSelectedCompanyId,
    companyName = '',
    setCompanyName,
    onCompanyChange = () => { },
    onClear = () => { }
}) => {
    const { currentUser } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [search, setSearch] = useState('');

    const { data, isLoading } = useCompanies(
        currentUser?.role === 'admin'
            ? {}
            : { createdBy: currentUser?.id }
    );

    const companies = data?.data || [];

    const filtered = companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (company) => {

        const id = company.id || null;
        const name = company.name || '';
        setSelectedCompanyId(id);
        setCompanyName(name);
        onCompanyChange(id, name);
        setAnchorEl(null);
        setSearch('');
    };

    const handleClear = () => {
        setSelectedCompanyId(null);
        setCompanyName('');
        setSearch('');
        onClear();
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const displayText = companyName || 'Select Organization';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
                variant="outlined"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                    textTransform: 'none',
                    justifyContent: 'space-between',
                    py: 1,
                    fontSize: '0.875rem'
                }}
            >
                <Typography noWrap sx={{ fontSize: '0.875rem' }}>
                    {displayText}
                </Typography>
            </Button>

            {selectedCompanyId && (
                <IconButton
                    size="small"
                    onClick={handleClear}
                    sx={{ p: 0.5 }}
                >
                    <CloseCircle size={18} />
                </IconButton>
            )}

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { width: 320 } }}
            >
                <Box sx={{ p: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search Organization..."
                        fullWidth
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ mb: 1.5 }}
                        autoFocus
                    />

                    {isLoading ? (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : filtered.length === 0 ? (
                        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                            No Organization found
                        </Typography>
                    ) : (
                        <List sx={{ py: 0, maxHeight: 300, overflow: 'auto' }}>
                            <ListItem
                                button
                                selected={!selectedCompanyId}
                                onClick={() => handleSelect({ id: null, name: '' })}
                            >
                                <ListItemText primary="All Organization" primaryTypographyProps={{ fontWeight: 500 }} />
                            </ListItem>

                            {filtered.map((company) => (
                                <ListItem
                                    key={company.id}
                                    button
                                    selected={selectedCompanyId === company.id}
                                    onClick={() => handleSelect(company)}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'primary.dark' }
                                        }
                                    }}
                                >
                                    <ListItemText primary={company.name} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>
        </Box>
    );
};

export default CompanyFilter;