import { createContext } from "react";

interface UserContextType {
  userData: any; // or a proper type instead of `any`
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
