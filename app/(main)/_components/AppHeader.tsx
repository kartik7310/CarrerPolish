import React from "react";
import Image from "next/image";
import { UserButton } from "@stackframe/stack";

const AppHeader: React.FC = () => {
  return (
    <header className="w-full p-3 shadow-sm flex justify-between items-center">
      <Image src="/logo.svg" alt="Company Logo" width={40} height={40} />
      <UserButton />
    </header>
  );
};

export default AppHeader;
