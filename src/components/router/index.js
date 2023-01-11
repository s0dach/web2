import { Lists } from "../List/Lists";
import Login from "../Login/Login";

export const privateRoute = [
  { path: "/", element: <Lists /> },
  { path: "/posts", element: <Lists /> },
  { path: "/posts/:id", element: <Lists /> },
];

export const publicRoute = [{ path: "/login", element: <Login /> }];
