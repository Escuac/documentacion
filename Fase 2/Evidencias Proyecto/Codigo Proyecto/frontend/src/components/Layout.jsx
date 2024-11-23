import { Header } from './Header';
import { Sidebar } from './Sidebar';
export const Layout = ({children}) => {
  return (
    <div className='parent'>
      <Sidebar/>
      <Header/>
      <div id="main">
        {children}
      </div>
    </div>
  )
}
