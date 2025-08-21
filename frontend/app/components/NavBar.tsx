
export function NavBar() {

    return (
        <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-white shadow-md">

            <div className="w-full md:flex md:items-center md:gap-2">
                <div className="flex items-center justify-between">
                    <div className="navbar-start items-center justify-between max-md:w-full">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Stress & Anxiety Monitor</h1>
                            <p className="text-muted-foreground">Real-time biometric analysis dashboard</p>
                        </div>
                        <div className="md:hidden">

                        </div>
                    </div>
                </div>
                <div id="default-navbar-collapse" className="md:navbar-end collapse hidden grow basis-full overflow-hidden transition-[height] duration-300 max-md:w-full" >
                    <ul className="menu md:menu-horizontal gap-2 p-0 text-base max-md:mt-2">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Services</a></li>
                        <li><a href="#">Contact us</a></li>
                    </ul>
                </div>
            </div>

        </nav>
    )

}