import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { EmptyState } from '../../feedback/EmptyState';

export interface SharedGridColumn<Row> {
  field: keyof Row;
  header: string;
  renderCell?: (row: Row) => ReactNode;
  sortable?: boolean;
}

export interface SharedGridSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SharedGridFilter {
  field: string;
  operator: 'contains' | 'equals' | 'is' | 'after' | 'before';
  value: string | number | boolean;
}

export interface ServerPaginationState {
  page: number;
  pageSize: number;
  rowCount: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface SharedDataGridProps<Row> {
  rows: readonly Row[];
  columns: readonly SharedGridColumn<Row>[];
  getRowId: (row: Row) => string | number;
  pagination: ServerPaginationState;
  sort?: SharedGridSort | null;
  onSortChange?: (sort: SharedGridSort | null) => void;
  filters?: readonly SharedGridFilter[];
  onFiltersChange?: (filters: readonly SharedGridFilter[]) => void;
  renderRowActions?: (row: Row) => ReactNode;
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  noResults?: boolean;
  density?: 'compact' | 'comfortable';
  label?: string;
}

function cellContent<Row>(column: SharedGridColumn<Row>, row: Row) {
  if (column.renderCell) return column.renderCell(row);
  const value = row[column.field];
  return value === null || value === undefined || value === '' ? '—' : String(value);
}

export function SharedDataGrid<Row>({
  rows,
  columns,
  getRowId,
  pagination,
  sort = null,
  onSortChange,
  filters = [],
  onFiltersChange,
  renderRowActions,
  loading = false,
  errorMessage,
  onRetry,
  emptyTitle = 'No records yet',
  emptyDescription = 'There is no data to display.',
  noResults = false,
  density = 'compact',
  label = 'Data table',
}: SharedDataGridProps<Row>) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const pageCount = Math.max(1, Math.ceil(pagination.rowCount / pagination.pageSize));
  const rowPadding = density === 'compact' ? 0.5 : 1.25;
  const pageSizeOptions = pagination.pageSizeOptions ?? [10, 25, 50];

  const changePageSize = (event: SelectChangeEvent<number>) => {
    pagination.onPageSizeChange(Number(event.target.value));
  };

  const toggleSort = (field: keyof Row) => {
    if (!onSortChange) return;
    const key = String(field);
    if (!sort || sort.field !== key) {
      onSortChange({ field: key, direction: 'asc' });
      return;
    }
    onSortChange(sort.direction === 'asc' ? { field: key, direction: 'desc' } : null);
  };

  if (errorMessage) {
    return (
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      >
        {errorMessage}
      </Alert>
    );
  }

  const paginationControls = (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      gap={1}
      sx={{ p: 1.5 }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="body2" color="text.secondary">
          Rows per page
        </Typography>
        <Select<number>
          size="small"
          value={pagination.pageSize}
          onChange={changePageSize}
          inputProps={{ 'aria-label': 'Rows per page' }}
          sx={{ minWidth: 76 }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" color="text.secondary">
          {pagination.rowCount} total
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Typography variant="body2" color="text.secondary">
          Page {pagination.page + 1} of {pageCount}
        </Typography>
        <Button
          size="small"
          disabled={pagination.page <= 0 || loading}
          onClick={() => pagination.onPageChange(pagination.page - 1)}
          aria-label="Previous page"
        >
          Previous
        </Button>
        <Button
          size="small"
          disabled={pagination.page + 1 >= pageCount || loading}
          onClick={() => pagination.onPageChange(pagination.page + 1)}
          aria-label="Next page"
        >
          Next
        </Button>
      </Stack>
    </Stack>
  );

  if (loading && rows.length === 0) {
    return (
      <Paper variant="outlined" aria-label={`${label} loading`} aria-busy="true">
        <Stack spacing={1} sx={{ p: 2 }}>
          <CircularProgress size={22} aria-label="Loading records" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={density === 'compact' ? 40 : 52} />
          ))}
        </Stack>
      </Paper>
    );
  }

  if (rows.length === 0) {
    const hasNoResults = noResults || filters.length > 0;
    return (
      <Paper variant="outlined">
        <EmptyState
          variant={hasNoResults ? 'no-results' : 'empty'}
          title={hasNoResults ? 'No results found' : emptyTitle}
          description={
            hasNoResults
              ? 'Try changing or clearing your search and filters.'
              : emptyDescription
          }
          actionLabel={filters.length > 0 && onFiltersChange ? 'Clear filters' : undefined}
          onAction={
            filters.length > 0 && onFiltersChange
              ? () => {
                  onFiltersChange([]);
                  pagination.onPageChange(0);
                }
              : undefined
          }
        />
        {paginationControls}
      </Paper>
    );
  }

  if (mobile) {
    return (
      <Stack spacing={1.5} aria-label={label} aria-busy={loading}>
        {loading && <CircularProgress size={22} aria-label="Refreshing records" />}
        {rows.map((row) => (
          <Paper
            key={getRowId(row)}
            variant="outlined"
            component="article"
            aria-label={String(cellContent(columns[0], row))}
            sx={{ p: 1.5 }}
          >
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {cellContent(columns[0], row)}
            </Typography>
            <Stack spacing={1}>
              {columns.slice(1).map((column) => (
                <Stack
                  key={String(column.field)}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  gap={2}
                >
                  <Typography variant="caption" color="text.secondary">
                    {column.header}
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>{cellContent(column, row)}</Box>
                </Stack>
              ))}
              {renderRowActions && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
                  {renderRowActions(row)}
                </Box>
              )}
            </Stack>
          </Paper>
        ))}
        <Paper variant="outlined">{paginationControls}</Paper>
      </Stack>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }} aria-busy={loading}>
      {loading && <LinearProgress aria-label="Refreshing records" />}
      <TableContainer>
        <Table size={density === 'compact' ? 'small' : 'medium'} aria-label={label}>
          <TableHead>
            <TableRow>
              {columns.map((column) => {
                const isSorted = sort?.field === String(column.field);
                return (
                  <TableCell
                    key={String(column.field)}
                    sortDirection={isSorted ? sort.direction : false}
                    sx={{ py: rowPadding, fontWeight: 700 }}
                  >
                    {column.sortable && onSortChange ? (
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => toggleSort(column.field)}
                        aria-label={`Sort by ${column.header}${
                          isSorted ? `, currently ${sort.direction}` : ''
                        }`}
                      >
                        {column.header}
                        {isSorted ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                      </Button>
                    ) : (
                      column.header
                    )}
                  </TableCell>
                );
              })}
              {renderRowActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)} hover>
                {columns.map((column) => (
                  <TableCell key={String(column.field)} sx={{ py: rowPadding }}>
                    {cellContent(column, row)}
                  </TableCell>
                ))}
                {renderRowActions && (
                  <TableCell align="right">{renderRowActions(row)}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {paginationControls}
    </Paper>
  );
}
