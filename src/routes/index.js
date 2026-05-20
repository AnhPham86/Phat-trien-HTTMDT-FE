import LayoutAdmin from "../layout/LayoutAdmin";
import LayoutDefault from "../layout/LayoutDefault";
import Carts from "../pages/Carts";
import Contact from "../pages/Contact";
import History from "../pages/History";
import Home from "../pages/Home";
import Introduce from "../pages/Introduce";
import Login from "../pages/Login";
import ManageContacts from "../pages/ManageContacts";
import ManageProducts from "../pages/ManageProducts";
import ManageShop from "../pages/ManageShop";
import ManageUsers from "../pages/ManageUsers";
import Register from "../pages/Register";
import ManageOrders from "../pages/ManageOrders";
import ManageReturns from "../pages/ManageReturns";
import ManageVouchers from "../pages/ManageVouchers";
import PrivateCustomer from "../pages/PrivateCustomer";
import LoginAdmin from "../pages/LoginAdmin";
import PrivateAdmin from "../pages/PrivateAdmin";
import ForgotPassword from "../pages/Login/ForgotPassword";
import ResetPassword from "../pages/Login/ResetPassword";
import PaymentReturn from "../pages/PaymentReturn";

const routes = [
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/introduce",
        element: <Introduce />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/payment/vnpay/return",
        element: <PaymentReturn />,
      },
      {
        element: <PrivateCustomer />,
        children: [
          {
            path: "/carts",
            element: <Carts />,
          },
          {
            path: "/history",
            element: <History />,
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <LayoutAdmin />,
    children: [
      {
        path: "",
        element: <LoginAdmin />,
      },
      {
        element: <PrivateAdmin />,
        children: [
          {
            path: "manage-shop",
            element: <ManageShop />,
          },
          {
            path: "manage-products",
            element: <ManageProducts />,
          },
          {
            path: "manage-users",
            element: <ManageUsers />,
          },
          {
            path: "manage-contacts",
            element: <ManageContacts />,
          },
          {
            path: "manage-orders",
            element: <ManageOrders />,
          },
          {
            path: "manage-returns",
            element: <ManageReturns />,
          },
          {
            path: "manage-vouchers",
            element: <ManageVouchers />,
          },
        ],
      },
    ],
  },
];

export default routes;