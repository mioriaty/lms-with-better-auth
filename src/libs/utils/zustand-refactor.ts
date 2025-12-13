import type { StateCreator } from 'zustand';
import { create as zcreate } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const create = <T extends Record<string, any>>(
  createState: StateCreator<T, [['zustand/immer', never]]> | undefined
) => {
  return zcreate<T, [['zustand/immer', never]]>(immer(createState as any));
};
