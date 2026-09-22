import type { Studio } from "../lib/api/studios";

export type StudiosStackParamList = {
  StudiosList: undefined;
  StudioForm: { studio?: Studio };
};
