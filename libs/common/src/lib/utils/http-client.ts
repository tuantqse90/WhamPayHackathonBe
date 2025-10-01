import axios from 'axios';

export const httpClient = axios.create({
  baseURL: process.env.API_URL,
});

export const httpClientWithApiKeyAuth = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'x-api-key': process.env.API_KEY,
  },
});

export const httpClientWithBearerTokenAuth = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
  },
});

/**
 * Execute a request to the API
 * @param url - The URL to execute the request to
 * @param method - The method to execute the request with
 * @param data - The data to execute the request with
 * @returns The response from the API
 */
export const execute = async <
  T,
  D extends Record<string, unknown> = Record<string, unknown>
>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data: D
) => {
  switch (method) {
    case 'GET':
      return await httpClientWithApiKeyAuth.get<T>(url, { params: data });
    case 'POST':
      return await httpClientWithApiKeyAuth.post<T>(url, data);
    case 'PUT':
      return await httpClientWithApiKeyAuth.put<T>(url, data);
    case 'DELETE':
      return await httpClientWithApiKeyAuth.delete<T>(url, { data });
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};

/**
 * Get a resource from the API
 * @param url - The URL to get the resource from
 * @param params - The parameters to get the resource with
 * @returns The response from the API
 */
export const get = async <
  T,
  P extends Record<string, unknown> = Record<string, unknown>
>(
  url: string,
  params?: P
) => {
  const response = await httpClientWithApiKeyAuth.get<T>(url, { params });
  return response.data;
};

/**
 * Post a resource to the API
 * @param url - The URL to post the resource to
 * @param data - The data to post to the resource
 * @returns The response from the API
 */
export const post = async <
  T,
  D extends Record<string, unknown> = Record<string, unknown>
>(
  url: string,
  data: D
) => {
  const response = await httpClientWithApiKeyAuth.post<T>(url, data);
  return response.data;
};

/**
 * Put a resource to the API
 * @param url - The URL to put the resource to
 * @param data - The data to put to the resource
 * @returns The response from the API
 */
export const put = async <
  T,
  D extends Record<string, unknown> = Record<string, unknown>
>(
  url: string,
  data: D
) => {
  const response = await httpClientWithApiKeyAuth.put<T>(url, data);
  return response.data;
};

/**
 * Delete a resource from the API
 * @param url - The URL to delete the resource from
 * @param params - The parameters to delete the resource with
 * @returns The response from the API
 */
export const delelete = async <
  T,
  P extends Record<string, unknown> = Record<string, unknown>
>(
  url: string,
  params?: P
) => {
  const response = await httpClientWithApiKeyAuth.delete<T>(url, { params });
  return response.data;
};
