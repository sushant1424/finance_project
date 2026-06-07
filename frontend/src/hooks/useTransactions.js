import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import transactionApi from '@/api/transactionApi';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  setFilters,
  toggleSelect,
  clearSelection,
  selectAll,
} from '@/store/transactionSlice';

export function useTransactions(autoFetch = true) {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.transactions.items);
  const total = useSelector((s) => s.transactions.total);
  const filters = useSelector((s) => s.transactions.filters);
  const loading = useSelector((s) => s.transactions.loading);
  const error = useSelector((s) => s.transactions.error);
  const selectedIds = useSelector((s) => s.transactions.selectedIds);

  useEffect(() => {
    if (autoFetch) dispatch(fetchTransactions(filters));
  }, [autoFetch, dispatch, filters]);

  return {
    items,
    total,
    filters,
    loading,
    error,
    selectedIds,
    fetch: useCallback((p) => dispatch(fetchTransactions(p ?? filters)), [dispatch, filters]),
    create: useCallback((d) => dispatch(createTransaction(d)), [dispatch]),
    update: useCallback((id, d) => dispatch(updateTransaction({ id, data: d })), [dispatch]),
    remove: useCallback((id) => dispatch(deleteTransaction(id)), [dispatch]),
    bulkDelete: useCallback((ids) => dispatch(bulkDeleteTransactions(ids)), [dispatch]),
    setFilters: useCallback((p) => dispatch(setFilters(p)), [dispatch]),
    toggleSelect: useCallback((id) => dispatch(toggleSelect(id)), [dispatch]),
    clearSelection: useCallback(() => dispatch(clearSelection()), [dispatch]),
    selectAll: useCallback(() => dispatch(selectAll()), [dispatch]),
    exportCsv: useCallback((p) => transactionApi.exportCsv(p ?? filters), [filters]),
  };
}

export default useTransactions;
