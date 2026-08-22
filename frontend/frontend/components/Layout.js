import Header from './Header'
import Footer from './Footer'
export default function Layout({children}){return <div className="min-h-screen flex flex-col"><Header/><main className="flex-1 rsre-page-enter">{children}</main><Footer/></div>}
