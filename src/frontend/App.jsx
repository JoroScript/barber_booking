
import CalendarComponent from './CalendarComponent'
import {BrowserRouter, Routes,Route} from 'react-router-dom';
import HomePage from './HomePage'
import Layout from './Layout';
function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout/>}>
      <Route index element={<HomePage/>}/>
      <Route path="/booking" element={<CalendarComponent/>}/>
      </Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App
