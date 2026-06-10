import { useState, useEffect } from 'react';
import { Box, Button, Popover, TextField, MenuItem, IconButton } from '@mui/material';
import { Add } from 'iconsax-react';

const ContributorFilter = ({
  searchedContributor,
  setSearchedContributor,
  filteredContributors,
  handleContributorChange,
  onClear,
}) => {
  const [contSearchQuery, setContSearchQuery] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const [open2, setOpen2] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen2(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen2(false);
  };

  const handleClear = () => {
    setSearchedContributor('');
    onClear?.();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'contributor-popover' : undefined;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button variant="outlined" onClick={handleClick} sx={{ flexGrow: 1, textTransform: 'none' }}>
        {searchedContributor ? searchedContributor : 'Select Partner'}
      </Button>

      <Popover
        id={id}
        open={open2}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search Partner"
            value={contSearchQuery}
            onChange={(e) => setContSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                setOpen2(false);
              }
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': { padding: '0px', height: '43px' },
              '& .MuiInputBase-input': { padding: '8px 8px' }
            }}
          />
          {filteredContributors.length > 0 ? (
            filteredContributors.map((option) => (
              <MenuItem
                key={option.email}
                value={option.email}
                onClick={() => {
                  handleContributorChange(option); // Only call this
                  setContSearchQuery('');
                  handleClose();
                }}
              >
                {option.email}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No results found</MenuItem>
          )}
        </Box>
      </Popover>

      {searchedContributor && (
        <IconButton color="error" onClick={handleClear} sx={{ fontSize: '24px' }}>
          <Add style={{ transform: 'rotate(45deg)' }} />
        </IconButton>
      )}
    </Box>
  );
};

export default ContributorFilter;
