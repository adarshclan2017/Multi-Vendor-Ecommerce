import React from 'react'
import SellerNavbar from '../components/SellerNavbar'
import { Outlet } from 'react-router-dom'

function Sellerlayout() {
    return (
        <div className="seller-layout">
            <SellerNavbar />
            <main className="seller-content">
                <Outlet />
            </main>
        </div>
    )
}

export default Sellerlayout
