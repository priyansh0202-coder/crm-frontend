export interface RegisterResponse {
  success: boolean;
  message: string;
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  token: string;
}

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
  };
  errors?: Array<{ msg: string; param: string; location: string }>;
}

export interface LoginUser {
  email: string;
  password: string;
}
