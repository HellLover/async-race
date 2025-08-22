import { Route, Routes, Link } from "react-router-dom";
import Garage from "./Garage";
import Winners from "./Winners";
import Button from "@/components/Button";

function App() {

  return (
    <>
      <div className="relative w-full min-h-screen px-4 py-10 overflow-x-hidden grid place-items-center">
        {/* HEADING */}
        <div className="absolute min-h-screen inset-0 -z-1 bg-[url('./src/assets/background.jpg')] bg-cover bg-center bg-no-repeat filter blur-xs grayscale-50" />
      
        <header className="w-full md:max-w-8xl flex justify-center items-center gap-7 flex-col pb-10">
          <p className="font-bold text-3xl md:text-4xl lg:text-5xl text-gray-100">ASYNC RACE</p>

          <div className="flex items-center gap-3 flex-col md:flex-row max-w-md">
            <Button className="flex justify-stretch">
                <Link to="/" className="text-md md:text-lg font-bold">GARAGE</Link>
            </Button>

            <Button className="flex justify-stretch">
                <Link to="/winners" className="text-md md:text-lg font-bold">WINNERS</Link>
            </Button>
          </div>
        </header>

        <hr className="container h-2 w-full text-amber-200" />

        {/* Race track and Winners section */}
        <Routes>
          <Route path="/" element={<Garage />} />
          <Route path="/winners" element={<Winners />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
