import Cars from "@/components/Cars";
import { Play, RotateCcw } from "lucide-react";
import Button from "@/components/Button";
import { generateCars } from "@/services/api";
import { useRaceStore } from "@/store/useRaceStore";

function Garage() {
  const resetAll = useRaceStore((s) => s.resetAll);
  const raceAll = useRaceStore((s) => s.raceAll);
  const fetchCars = useRaceStore((s) => s.fetchCars);

  const handleGenerate = async () => {
    await generateCars(100);
    fetchCars();
  };

  return (
    <div className="container w-full px-10 py-5 flex flex-col justify-center items-center">
        {/* Controllers */}
        <div className="w-full flex flex-col md:flex-row justify-between gap-4 my-20">
          <div className="flex items-center gap-3 flex-row">
            <Button 
              size="sm"
              onClick={raceAll}
            >
                <span>Race</span>
                <Play className="w-5 h-5 ml-2" />
            </Button>

            <Button 
              size="sm" 
              className="bg-red-300 hover:bg-red-300/70"
              onClick={() => resetAll()}
            >
                <span>Reset</span>
                <RotateCcw className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-row">
            <input 
              type="text"
              placeholder="Car Brand"
              className="w-32 px-2 py-1 bg-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
            />
            <input
              type="color"
              className="w-7 h-7 bg-gray-400 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"              
            />
            <Button size="sm">
              <span>Create</span>
            </Button>
          </div>

          <div className="flex items-center gap-3 flex-row">
            <input 
              type="text"
              placeholder="Car Brand"
              className="w-32 px-2 py-1 bg-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
            />
            <input
              type="color"
              className="w-7 h-7 bg-gray-400 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"              
            />
            <Button size="sm">
              <span>Update</span>
            </Button>
          </div>

          <Button 
            size="sm"
            onClick={handleGenerate}
          >
              <span>Generate Cars</span>
          </Button>
        </div>

        <div className="w-full">
          <Cars />
        </div>
    </div>
  );
}

export default Garage;