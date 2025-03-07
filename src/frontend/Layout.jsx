import {Outlet} from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  console.log('layout component rendered');
    return (
      <>
        <Navigation />
        <main className='flex flex-col h-screen w-full justify-center bg-gradient-to-b from-red-700 via-red-900 to-black'>
          <Outlet />
          </main>
      </>
    );
  };