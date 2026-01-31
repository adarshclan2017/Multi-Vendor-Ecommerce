import { createBrowserRouter } from "react-router-dom";
import Register from "../Pages/auth/Register";
import Login from "../Pages/auth/Login";
import Userlayout from "../layout/Userlayout";
import Home from "../Pages/user/Home";
import Productcart from "../Pages/user/Productcart";
import Slideshow from "../components/SlideShow";
import CheckoutChecklist from "../Pages/user/CheckOut";
import OrderChecklist from '../Pages/user/PlaceOrder'
import MyOrders from "../Pages/user/MyOrder";
import OrderDetails from "../Pages/user/OrderDetails";





import Sellerlayout from "../layout/Sellerlayout";
import SellerDashboard from "../Pages/Seller/SellerDashboard";
import AddProduct from "../Pages/Seller/AddProduct";
import SellerProducts from "../Pages/Seller/SellerProducts";
import SellerOrders from "../Pages/Seller/SellerOrders";
import SellerOrderDetails from "../Pages/Seller/SellerOrderDetails";
import SellerProfile from "../Pages/Seller/SellerProfile";
import SellerEditProduct from "../Pages/Seller/SellerEditProduct";



import Adminlayout from "../layout/Adminlayout";
import AdminDashboard from "../Pages/admin/AdminDashboard";
import AdminProduct from "../Pages/admin/AdminProduct";
import AdminAddProduct from "../Pages/admin/AdminAddProduct";
import AdminOrders from "../Pages/admin/AdminOrders";
import AdminUsers from "../Pages/admin/AdminUsers";
import AdminCategorie from "../Pages/admin/AdminCategorie";
import AdminSettings from "../Pages/admin/AdminSettings";
import AdminAddCategorie from "../Pages/admin/AdminAddCategorie";
import AdminEditProduct from "../Pages/admin/AdminEditProduct";
import AdminViewUser from "../Pages/admin/AdminViewUser";
import AdminOrderDetails from "../Pages/admin/AdminOrderDetails";
import ProductDetails from "../Pages/user/ProductDetails";







const router = createBrowserRouter([
    {
        path: '/',
        element: <Userlayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'cart', element: <Productcart /> },
            { path: 'order', element: < MyOrders /> },
            { path: "product/:id", element: <ProductDetails /> },

            { path: 'order/:id', element: <OrderDetails /> },
            { path: 'slideshow', element: <Slideshow /> },
            { path: 'checkout', element: <CheckoutChecklist /> },
            { path: 'placeorder', element: <OrderChecklist /> },
            { path: 'placeorder/:id', element: <OrderChecklist /> }
        ]
    },

    {
        path: '/seller',
        element: <Sellerlayout />,
        children: [
            { index: true, element: <SellerDashboard /> },
            { path: 'addproduct', element: <AddProduct /> },
            { path: 'product', element: <SellerProducts /> },
            { path: 'order', element: <SellerOrders /> },
            { path: 'order/:id', element: <SellerOrderDetails /> },
            { path: 'profile', element: <SellerProfile /> },
            { path: 'edit/:id', element: <SellerEditProduct /> }
        ]
    },

    {
        path: '/admin', element: <Adminlayout />,
        children: [
            { index: true, element: <AdminDashboard /> },
            { path: 'product', element: <AdminProduct /> },
            { path: 'addproduct', element: <AdminAddProduct /> },
            { path: 'user', element: <AdminUsers /> },
            { path: "editproduct/:id", element: <AdminEditProduct /> },


            { path: "order", element: <AdminOrders /> },
            { path: "order/:id", element: <AdminOrderDetails /> },

            { path: 'categorie', element: <AdminCategorie /> },
            { path: 'settings', element: <AdminSettings /> },
            { path: 'addcategorie', element: <AdminAddCategorie /> },
            { path: 'editproduct/:id', element: <AdminEditProduct /> },
            { path: 'viewuser', element: <AdminViewUser /> }

        ]
    },











    { path: '/reg', element: <Register /> },

    { path: '/login', element: <Login /> }


]);

export default router;
