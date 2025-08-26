import { useRaceStore, type Winner } from "@/store/useRaceStore";
import Button from "./Button";
import { Car as CarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Pagination from "./Pagination";
import { z } from 'zod';
import { usePersistentForm } from "@/hooks/usePersistentForm";

const formSchema = z.object({
  text: z.string()
    .min(1, "Brand is required")
    .max(30, "Brand must be less than 30 characters")
    .trim(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  selectedId: z.number()
    .nullable()
});

type FormData = z.infer<typeof formSchema>;

const Cars = () => {
  const {
    cars,
    currentGaragePage,
    totalCars,
    loading,
    fetchCars,
    setGaragePage,
    winner,
    raceOnProgress
  } = useRaceStore();
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);

  const totalPages = Math.ceil(totalCars / 7);;

  useEffect(() => {
    fetchCars(currentGaragePage);
  }, [currentGaragePage]);

  useEffect(() => {
    if (!raceOnProgress && winner) {
      const timeout = setTimeout(() => {
        setCurrentWinner(winner);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [raceOnProgress, winner]);

  const clearWinner = () => {
    setCurrentWinner(null);
  }

  if(cars.length === 0) {
    return (
        <span className="w-full mx-auto text-2xl text-gray-300 font-bold">No cars to display.</span>
    )
  }

  return (
    <>
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

        <div className="flex flex-row justify-between">
          <span className="font-bold text-2xl text-gray-300">Garage ({totalCars})</span>

          <Pagination
            onPrevious={() => setGaragePage(currentGaragePage - 1)}
            onNext={() => setGaragePage(currentGaragePage + 1)}
            currentPage={currentGaragePage}
            totalPages={totalPages}
          />
        </div>
      </div>

      {!raceOnProgress && currentWinner && (
        <div className="absolute bg-black/50 inset-0 flex items-center justify-center z-5">
          <div className="bg-white rounded-lg p-8 text-center shadow-2xl max-w-md mx-4">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Winner!</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div
                className={`w-6 h-6 rounded-full`}
                style={{ backgroundColor: currentWinner?.color }}
              ></div>
              <span className="text-2xl font-semibold text-gray-700">{currentWinner.name}</span>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              Finished in <span className="font-bold text-blue-600">{currentWinner?.time}s</span>
            </p>
            <Button
              onClick={clearWinner}
              className="justify-self-center"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const CarController = ({ id }: { id: number }) => {
    const car = useRaceStore((s) => s.cars.find((c) => c.id === id))!;
    const stopEngine = useRaceStore((s) => s.stopEngine);
    const driveCar = useRaceStore((s) => s.driveCar);
    const removeCar = useRaceStore((s) => s.removeCar);
    const raceOnProgress = useRaceStore((s) => s.raceOnProgress);

    const [trackWidth, setTrackWidth] = useState(0);

    useEffect(() => {
      function updateWidth() {
        if (trackRef.current) {
          setTrackWidth(trackRef.current.offsetWidth);
        }
      }

      updateWidth();

      window.addEventListener("resize", updateWidth);

      return () => {
        window.removeEventListener("resize", updateWidth);
      };
    }, []);

    const trackRef = useRef<HTMLDivElement>(null);
    const leftPosition = (car.progress / 100) * (trackWidth - 95);

    const { 
      setData 
    } = usePersistentForm<FormData>(formSchema, { text: '', color: '#000000', selectedId: null }, 'updateInputStorage');

    const handleSelect = () => {
      setData({
        text: car.name,
        color: car.color,
        selectedId: car.id
      })
    }

    return (
      <>
        {/* Car control */}
        <div className="w-full flex items-center justify-self-start py-6 gap-3">
          <div className="flex justify-center flex-row items-center gap-2">
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="bg-transparent border border-white/20 hover:bg-white/10"
                onClick={handleSelect}
              >
                Select
              </Button>

              <Button 
                size="sm" 
                className="bg-red-300 hover:bg-red-300/70"
                onClick={() => removeCar(car.id)}
                disabled={car.progress > 0 || raceOnProgress}
              >
                Remove
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="bg-transparent border border-white/20 hover:bg-white/10"
                onClick={() => driveCar(car.id)}
                disabled={car?.engineOn || raceOnProgress}
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

          <div className="relative w-full h-full border-b-2 border-gray-800" ref={trackRef}>
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear"
              style={{ left: `${leftPosition}px`, }}
            >
              <CarIcon
                size={95}
                style={{
                  color: car.color,
                }}
              />
            </div>

            <span className="font-bold flex justify-self-end">{car.name}</span>
          </div>
        </div>
      </>
    )
}

export default Cars