import React from "react";
import { Route, Routes } from "react-router-dom";
import { List } from "./List/List";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<List />} />
      <Route path="/posts" element={<List />} />
    </Routes>
  );
};
