import { DataProvider, GetListParams, GetListResponse, BaseRecord } from "@refinedev/core";
import { API_URL } from "./constants";
import { mockSubjects } from "@/constants/mock-data";


export const  dataProvider: DataProvider  = {
  getList: async <TData extends BaseRecord = BaseRecord>({ resource}:
    GetListParams) : Promise<GetListResponse<TData>> => {
      if (resource !== 'subjects') return { data: [] as TData[], total: 0 };

      return{
        data: mockSubjects as unknown as TData[],
        total: mockSubjects.length,
      }
    },
  
    getOne: async () => {throw new Error("This function is not present in mock")},
    create: async () => {throw new Error("This function is not present in mock")},
    update: async () => {throw new Error("This function is not present in mock")},
    deleteOne: async () => {throw new Error("This function is not present in mock")},

    getApiUrl: () => ''
}
