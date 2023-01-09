import React from "react";
import { Route, Routes } from "react-router-dom";
import { Lists } from "./List/Lists";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Lists />} />
      <Route path="/posts" element={<Lists />} />
      <Route path="/posts/:id" element={<Lists />} />
    </Routes>
  );
};
