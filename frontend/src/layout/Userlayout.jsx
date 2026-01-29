import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"


function Userlayout() {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>


        </>
    )
}

export default Userlayout