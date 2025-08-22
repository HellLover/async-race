import { useRaceStore } from "@/store/useRaceStore";
import Button from "./Button";
import { Car as CarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Pagination from "./Pagination";

const Cars = () => {
  const {
    cars,
    currentGaragePage,
    totalCars,
    loading,
    fetchCars,
    setGaragePage,
  } = useRaceStore();
  const totalPages = Math.ceil(totalCars / 7);

  useEffect(() => {
    fetchCars(currentGaragePage);
  }, [currentGaragePage]);

  return (
    <div className="relative grid grid-cols-1 gap-4 w-full">

      <div className="flex flex-col gap-6 text-white rounded-lg w-full">
        {loading ? (
          <div className="flex justify-center items-center h-max w-full">
            <span className="text-white font-bold text-3xl">Loading...</span>
          </div>
        ) : (
          cars.map((car) => (
              <CarController key={car.id} id={car.id} />
          ))
        )}
      </div>

      <Pagination
        onPrevious={() => setGaragePage(currentGaragePage - 1)}
        onNext={() => setGaragePage(currentGaragePage + 1)}
        currentPage={currentGaragePage}
        totalPages={totalPages}
      />
    </div>
  );
};

const CarController = ({ id }: { id: number }) => {
    const car = useRaceStore((s) => s.cars.find((c) => c.id === id))!;
    const stopEngine = useRaceStore((s) => s.stopEngine);
    const driveCar = useRaceStore((s) => s.driveCar);

    const [trackWidth, setTrackWidth] = useState(0);

    useEffect(() => {
      function updateWidth() {
        if (trackRef.current) {
          setTrackWidth(trackRef.current.offsetWidth);
        }
      }

      // Call once on mount
      updateWidth();

      // Update on resize
      window.addEventListener("resize", updateWidth);

      return () => {
        window.removeEventListener("resize", updateWidth);
      };
    }, []);

    const trackRef = useRef<HTMLDivElement>(null);
    const leftPosition = (car.progress / 100) * (trackWidth - 70)

    return (
      <>
        {/* Car control */}
        <div className="w-full flex items-center justify-self-start py-6 gap-3">
          <div className="flex justify-center flex-row items-center gap-2">
            <div className="flex flex-col gap-2">
              <Button size="sm" className="bg-transparent border border-white/20 hover:bg-white/10">
                Select
              </Button>

              <Button size="sm" className="bg-red-300 hover:bg-red-300/70">
                Remove
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="bg-transparent border border-white/20 hover:bg-white/10"
                onClick={() => driveCar(car.id)}
                disabled={car?.engineOn}
              >
                Start
              </Button>

              <Button 
                size="sm" 
                className="bg-red-300 hover:bg-red-300/70"
                onClick={() => stopEngine(id)}
                disabled={!car?.engineOn}
              >
                Stop
              </Button>
            </div>
          </div>

          <div className="relative w-full h-full" ref={trackRef}>
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear"
              style={{ left: `${leftPosition}px`, }}
            >
              <CarIcon
                size={70}
                style={{
                  color: car.color,
                }}
              />
            </div>
          </div>
        </div>
      </>
    )
}

export default Cars