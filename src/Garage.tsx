import Cars from "@/components/Cars";
import { Play, RotateCcw } from "lucide-react";
import Button from "@/components/Button";
import { generateCars } from "@/services/api";
import { useRaceStore } from "@/store/useRaceStore";
import DataInput from "./components/DataInput";

function Garage() {
  const { resetAll, raceAll, fetchCars, raceOnProgress } = useRaceStore();

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
              disabled={raceOnProgress}
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

          <DataInput action="create" />

          <DataInput action="update" />

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