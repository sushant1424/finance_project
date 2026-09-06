import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import goalApi from '@/api/goalApi';
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
  completeGoal,
  withdrawGoal,
  convertGoal,
} from '@/store/goalSlice';

export function useGoals(autoFetch = true) {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.goals.items);
  const loading = useSelector((s) => s.goals.loading);
  const error = useSelector((s) => s.goals.error);

  useEffect(() => {
    if (autoFetch) dispatch(fetchGoals());
  }, [autoFetch, dispatch]);

  return {
    items,
    loading,
    error,
    fetch: useCallback(() => dispatch(fetchGoals()), [dispatch]),
    create: useCallback((d) => dispatch(createGoal(d)), [dispatch]),
    update: useCallback((id, d) => dispatch(updateGoal({ id, data: d })), [dispatch]),
    remove: useCallback((id) => dispatch(deleteGoal(id)), [dispatch]),
    contribute: useCallback((id, d) => dispatch(contributeToGoal({ id, data: d })), [dispatch]),
    complete: useCallback((id) => dispatch(completeGoal(id)), [dispatch]),
    withdraw: useCallback((id, d) => dispatch(withdrawGoal({ id, data: d })), [dispatch]),
    convert: useCallback((id, d) => dispatch(convertGoal({ id, data: d })), [dispatch]),
    getContributions: useCallback((id) => goalApi.getContributions(id), []),
  };
}

export default useGoals;
