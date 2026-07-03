import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing  from "./pages/Landing"
import Callback from "./pages/Callback"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Landing />}  />
        <Route path="/callback"  element={<Callback />} />
      </Routes>
    </BrowserRouter>
  )
}