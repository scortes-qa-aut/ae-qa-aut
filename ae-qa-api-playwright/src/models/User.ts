export interface UserPayload {
  name: string;
  email: string;
  password: string;
  title: string;
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

export interface ApiResponse {
  responseCode: number;
  message?: string;
}

export interface UserDetailResponse extends ApiResponse {
  user: {
    id: number;
    name: string;
    email: string;
    title: string;
    first_name: string;
    last_name: string;
    // ... resto de campos
  };
}