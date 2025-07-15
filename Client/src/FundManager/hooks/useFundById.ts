import { useEffect } from "react";
import { useAppDispatch } from "../../Redux/hooks";
import { useGetFundByIdQuery } from "../../API/Endpoints/Funds/funds";
import {
  clearCurrentFund,
  setCurrentFund,
  setError,
  setLoading,
} from "../../Redux/features/Funds/fundsSlice";

export const useFundById = (id: string) => {
  const dispatch = useAppDispatch();

  const { data: fund, isLoading, error, isFetching } = useGetFundByIdQuery(id);

  // Clear current fund when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearCurrentFund());
    };
  }, [dispatch]);

  // Sync loading state
  useEffect(() => {
    dispatch(setLoading(isLoading || isFetching));
  }, [isLoading, isFetching, dispatch]);

  // Sync error state
  useEffect(() => {
    if (error) {
      dispatch(
        setError(error instanceof Error ? error.message : "An error occurred")
      );
    }
  }, [error, dispatch]);

  // Update Redux store when data loads
  useEffect(() => {
    if (fund) {
      dispatch(setCurrentFund(fund));
    }
  }, [fund, dispatch]);

  return {
    isLoading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
  };
};
