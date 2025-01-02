export type GenericObject<T = any> = { [key: string]: T };

export type TApiError = { error: true; data: { message: string } };

export type TApiData<T = any> = { error: false; data: T };

export type TApiRes<T = any> = TApiData<T> | TApiError;
