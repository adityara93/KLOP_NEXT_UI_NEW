import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Collapse,
  MenuItem,
  Stack,
  TextField,
  type TextFieldProps,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

export interface ToolbarFilterOption {
  label: string;
  value: string;
}

export interface ToolbarFilter {
  key: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'select' | 'text';
  inputType?: TextFieldProps['type'];
  options?: readonly ToolbarFilterOption[];
  placeholder?: string;
  disabled?: boolean;
}

export interface AdaptiveToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  primaryFilters?: readonly ToolbarFilter[];
  additionalFilters?: readonly ToolbarFilter[];
  onClearFilters: () => void;
  onPageReset: () => void;
  searchLabel?: string;
}

function FilterInput({ filter, onValueChange }: {
  filter: ToolbarFilter;
  onValueChange: (value: string) => void;
}) {
  return (
    <TextField
      select={filter.type === 'select'}
      type={filter.inputType}
      size="small"
      label={filter.label}
      value={filter.value}
      disabled={filter.disabled}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder={filter.placeholder}
      sx={{ minWidth: { xs: '100%', sm: 160 }, flex: { sm: '0 1 200px' } }}
      inputProps={{ 'aria-label': filter.label }}
    >
      {filter.type === 'select' && [
        <MenuItem key="all" value="">
          All
        </MenuItem>,
        ...(filter.options ?? []).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        )),
      ]}
    </TextField>
  );
}

export function AdaptiveToolbar({
  searchValue,
  onSearchChange,
  primaryFilters = [],
  additionalFilters = [],
  onClearFilters,
  onPageReset,
  searchLabel = 'Search',
}: AdaptiveToolbarProps) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(false);
  const filters = [...primaryFilters, ...additionalFilters];
  const visiblePrimaryFilters = mobile ? [] : primaryFilters.slice(0, 2);
  const overflowFilters = mobile
    ? filters
    : [...primaryFilters.slice(2), ...additionalFilters];
  const activeFilterCount = filters.filter((filter) => filter.value.trim() !== '').length;

  const updateSearch = (value: string) => {
    onSearchChange(value);
    onPageReset();
  };
  const updateFilter = (filter: ToolbarFilter, value: string) => {
    filter.onChange(value);
    onPageReset();
  };
  const clearAll = () => {
    onClearFilters();
    onSearchChange('');
    onPageReset();
  };

  return (
    <Stack spacing={1.5} component="section" aria-label="Search and filters">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ sm: 'center' }}
      >
        <TextField
          size="small"
          fullWidth
          label={searchLabel}
          value={searchValue}
          onChange={(event) => updateSearch(event.target.value)}
          InputProps={{
            startAdornment: <SearchOutlinedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          inputProps={{ 'aria-label': searchLabel }}
          sx={{ flex: '1 1 280px' }}
        />
        {!mobile &&
          visiblePrimaryFilters.map((filter) => (
            <FilterInput
              key={filter.key}
              filter={filter}
              onValueChange={(value) => updateFilter(filter, value)}
            />
          ))}
        {overflowFilters.length > 0 && (
          <Button
            variant={expanded ? 'contained' : 'outlined'}
            startIcon={
              <Badge color="primary" badgeContent={activeFilterCount} max={99}>
                <FilterListOutlinedIcon />
              </Badge>
            }
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls="adaptive-toolbar-additional-filters"
          >
            {mobile ? 'Filters' : 'More filters'}
          </Button>
        )}
        {(activeFilterCount > 0 || searchValue !== '') && (
          <Button onClick={clearAll} color="inherit">
            Clear
          </Button>
        )}
      </Stack>
      <Collapse in={expanded} unmountOnExit>
        <Box
          id="adaptive-toolbar-additional-filters"
          sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover' }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
            Filters
          </Typography>
          {overflowFilters.length > 0 ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} useFlexGap flexWrap="wrap" gap={1.5}>
              {overflowFilters.map((filter) => (
                <FilterInput
                  key={filter.key}
                  filter={filter}
                  onValueChange={(value) => updateFilter(filter, value)}
                />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No additional filters are available.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Stack>
  );
}
