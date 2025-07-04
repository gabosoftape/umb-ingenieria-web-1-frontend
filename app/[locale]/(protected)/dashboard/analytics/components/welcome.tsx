"use client"
import React, { useState } from "react";
import {useAuth} from "@/contexts/auth.context";


const WelcomeComponent = () => {
  const { user } = useAuth();
  return (
      <div>
        <h1>✌️ Bienvenido {user?.name}</h1>
      </div>
  );
};

export default WelcomeComponent;
