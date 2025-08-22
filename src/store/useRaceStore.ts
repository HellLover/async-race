import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  fetchCars,
  carEngine,
  driveCar,
  addOrCreateWinner,
  fetchWinners,
} from "@/services/api";

type Car = {
  id: number;
  name: string;
  color: string;
  wins: number;
  velocity: number;
  distance: number;
  time: number | null;
  bestTime: number | null;
  progress: number;
  engineOn: boolean;
  failed?: boolean;
};

type RaceState = {
  cars: Car[];
  winners: Pick<Car, 'id' | 'color' | 'name' | 'wins' | 'time'>[];
  loading: boolean;
  currentGaragePage: number;
  currentWinnersPage: number;
  totalCars: number;

  setGaragePage: (page: number) => void;
  setWinnersPage: (page: number) => void;
  fetchCars: (page?: number, limit?: number) => Promise<void>;
  fetchWinners: (page?: number, limit?: number) => Promise<void>;
  startEngine: (id: number) => Promise<void>;
  stopEngine: (id: number) => Promise<void>;
  driveCar: (id: number) => Promise<void>;
  raceAll: () => Promise<void>;
  resetAll: () => Promise<void>;
};

export const useRaceStore = create<RaceState>()(
  persist(
    (set, get) => ({
      cars: [],
      winners: [],
      loading: false,
      totalCars: 0,
      currentGaragePage: 1,
      currentWinnersPage: 1,

      setGaragePage: (page) => set({ currentGaragePage: page }),
      setWinnersPage: (page) => set({ currentWinnersPage: page }),

      fetchCars: async (page = get().currentGaragePage, limit = 7) => {
        set({ loading: true });

        const data = await fetchCars(page, limit);
        const winners = await fetchWinners();

        set({
          cars: data.cars.map((car: Car) => ({
            ...car,
            velocity: null,
            time: null,
            bestTime: null,
            progress: 0,
            engineOn: false,
            wins: winners.find((w: { id: number }) => w.id === car.id)?.wins || 0,
          })),
          totalCars: data.totalCars,
          loading: false,
        });
      },

      fetchWinners: async (page = get().currentWinnersPage, limit = 10) => {
        set({ loading: true });

        const winners = await fetchWinners(page, limit) as ({ id: number, wins: number, time: number })[];
        const cars = get().cars;

        const carMap = new Map(cars.map(car => [car.id, car]));

        const winnersWithDetails = winners.map((winner) => {
          const car = carMap.get(winner.id);

          return {
            ...winner,
            name: car?.name ?? 'Unknown',
            color: car?.color ?? 'Unknown',
          };
        });

        set({
          winners: winnersWithDetails,
          loading: false,
        });
      },

      startEngine: async (id) => {
        const { velocity, distance } = await carEngine(id, "started");
        set((state) => ({
          cars: state.cars.map((c) =>
            c.id === id ? { ...c, velocity, distance, engineOn: true } : c
          ),
        }));
      },

      stopEngine: async (id) => {
        await carEngine(id, "stopped");
        set((state) => ({
          cars: state.cars.map((c) =>
            c.id === id ? { ...c, engineOn: false, velocity: 0 } : c
          ),
        }));
      },

      driveCar: async (id) => {
        const { cars, startEngine } = get();
        const car = cars.find((c) => c.id === id);

        if(car) {
          try {
              await startEngine(car.id);

              const time = Number(((car.distance / car.velocity) / 1000).toFixed(2));
              console.log(`Car ${id} will take ${time} seconds to finish the race.`)

              set((state) => ({
                cars: state.cars.map((c) =>
                  c.id === id ? { ...c, time, progress: 0 } : c
                ),
              }));

              await driveCar(id);

              const start = Date.now();
              const duration = time * 1000;
              const animate = () => {
                const elapsed = Date.now() - start;
                const progress = Math.min((elapsed / duration) * 100, 100);

                set((state) => ({
                  cars: state.cars.map((c) =>
                    c.id === id ? { ...c, progress } : c
                  ),
                }));

                if (progress < 100) requestAnimationFrame(animate);
              };
              requestAnimationFrame(animate);
          } catch (error) {
              set((state) => ({
                cars: state.cars.map((c) =>
                  c.id === id ? { ...c, failed: true, progress: 0 } : c
                ),
              }));
              console.error("Error driving car:", error);
          }
        }
      },

      raceAll: async () => {
        const { cars, startEngine, driveCar } = get();

        const finished = await Promise.all(
          cars.map(async (car) => {
            try {
              await startEngine(car.id);
              if(!car.failed) await driveCar(car.id);
              return get().cars.find((c) => c.id === car.id)!;
            } catch (error) {
              set((state) => ({
                cars: state.cars.map((c) =>
                  c.id === car.id ? { ...c, failed: true, progress: 0 } : c
                ),
              }));
              return null;
            }
          })
        );

        const successfulCars = finished.filter((c): c is typeof finished[0] => !!c && !c.failed);

        if (successfulCars.length === 0) {
          console.warn("All cars failed to race.");
          return;
        }

        const winner = successfulCars.reduce((prev, curr) =>
          prev?.time! < curr?.time! ? prev : curr
        );

        if(winner) {
          if(winner?.wins === 0) {
            await addOrCreateWinner({
              id: winner.id,
              wins: 1,
              time: winner.time || 0,
            }, "create");
          } else {
            await addOrCreateWinner({
              id: winner.id,
              wins: winner.wins + 1,
              time: winner.time || 0,
            }, "add");
          }

          const winnerCar = get().cars.find((car) => car.id === winner.id);
          if (winnerCar) {
            set({ winners: [...get().winners, {
              ...winnerCar,
              name: winner.name,
              time: (winner.time ?? 0) > (winnerCar.time ?? 0) ? winnerCar.time : winner.time
            }] });
          }
        }
      },

      resetAll: async () => {
        await Promise.all(get().cars.map((car) => get().stopEngine(car.id)));

        set((state) => ({
          cars: state.cars.map((car) => ({
            ...car,
            progress: 0,
            engineOn: false,
            failed: false,
          })),
          winner: null,
        }))
      }
    }),
    {
      name: 'car-race-storage'
    }
  )
);