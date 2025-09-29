"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@stackframe/stack";
import { useMutation } from "convex/react";
import React, { useEffect, useState } from "react";
import { UserContext } from "./_context/UserContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState({});
  const user = useUser();
  const CreateUser = useMutation(api.users.CreateUser);

  const CreateNewUser = async () => {
    const result = await CreateUser({
      name: user?.displayName,
      email: user?.primaryEmail,
    });
    setUserData(result);
    console.log("result", result);
  };

  useEffect(() => {
    console.log("user", user);
    if (user) CreateNewUser();
  }, [user]);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export default AuthProvider;
