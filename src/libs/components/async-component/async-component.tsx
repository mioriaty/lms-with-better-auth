import { FC, ReactNode } from 'react';

export interface AsyncComponentProps {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isEmpty?: boolean;

  Success: ReactNode;
  Error?: ReactNode;
  Empty?: ReactNode;
  Loading?: ReactNode;
}

export const AsyncComponent: FC<AsyncComponentProps> = ({
  isLoading,
  isSuccess,
  isError,
  isEmpty = false,
  Success,
  Error,
  Empty,
  Loading
}) => {
  const renderMap: Record<string, ReactNode> = {
    isLoading: Loading,
    isSuccess: Success,
    isError: Error,
    isEmpty: Empty
  };

  return (
    <>{renderMap[isLoading ? 'isLoading' : isSuccess ? 'isSuccess' : isError ? 'isError' : isEmpty ? 'isEmpty' : '']}</>
  );
};
