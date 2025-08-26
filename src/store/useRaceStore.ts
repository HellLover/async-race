import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  fetchCars,
  carEngine,
  driveCar,
  addOrCreateWinner,
  fetchWinners,
  createCar,
  removeCar,
  updateCar,
} from "@/services/api";

export type Car = {
  id: number;
  name: string;
  color: string;
  wins: number;
  velocity: number | null;
  distance: number;
  time: number | null;
  progress: number;
  engineOn: boolean;
  failed?: boolean;
};

export interface Winner extends Pick<Car, 'id' | 'color' | 'name' | 'wins' | 'time'> { 
  bestTime: number | null 
}

type RaceState = {
  cars: Car[];
  winners: Winner[];
  winner: Winner | null;
  loading: boolean;
  currentGaragePage: number;
  currentWinnersPage: number;
  totalCars: number;
  raceOnProgress: boolean;

  setGaragePage: (page: number) => void;
  setWinnersPage: (page: number) => void;
  fetchCars: (page?: number, limit?: number) => Promise<void>;
  fetchWinners: (page?: number, limit?: number) => Promise<void>;
  startEngine: (id: number) => Promise<{ distance: number | null, velocity: number | null }>;
  stopEngine: (id: number) => Promise<void>;
  driveCar: (id: number) => Promise<void>;
  raceAll: () => Promise<void>;
  resetAll: () => Promise<void>;
  createCar: (name: string, color: string) => Promise<void>;
  updateCar: (id: number, name:  string, color: string) => Promise<void>;
  removeCar: (id: number) => Promise<void>
};

export const useRaceStore = create<RaceState>()(
  persist(
    (set, get) => ({
      cars: [],
      winners: [],
      winner: null,
      loading: false,
      totalCars: 0,
      currentGaragePage: 1,
      currentWinnersPage: 1,
      raceOnProgress: false,

      setGaragePage: (page) => set({ currentGaragePage: page }),
      setWinnersPage: (page) => set({ currentWinnersPage: page }),

      fetchCars: async (page = get().currentGaragePage, limit = 7) => {
        set({ loading: true });

        const data = await fetchCars(page, limit);
        if(!data.success) {
          console.log("Failed to fetch the cars.", data.message);
          return;
        }    

        const navType = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
        const wasReloaded = navType[0].type === "reload";

        const existingCars = get().cars;

        set({
          cars: data.data?.cars.map((car): Car => {
            const existing = existingCars.find((c) => c.id === car.id);

            return {
              ...car,
              velocity: null,
              distance: 500000,
              time: null,
              progress: !wasReloaded ? (existing?.progress ?? 0) : 0,
              engineOn: false,
              wins: existing?.wins ?? 0,
            };
          }),
          totalCars: data.data?.totalCars,
          loading: false,
        });
      },

      fetchWinners: async (page = get().currentWinnersPage, limit = 10) => {
        set({ loading: true });

        const data = await fetchWinners(page, limit);
        if(!data.success) {
          console.log("Failed to fetch the winners.", data.message);
          return;
        }    

        const cars = get().winners;

        const winnerMap = new Map(cars.map(car => [car.id, car]));

        const winnersWithDetails = data.data?.map((winner) => {
          const car = winnerMap.get(winner.id);

          return {
            ...winner,
            bestTime: car?.bestTime ?? car?.time ?? null,
            name: car?.name ?? 'Unknown',
            color: car?.color ?? "0x000",
          };
        });

        set({
          winners: winnersWithDetails,
          loading: false,
        });
      },

      startEngine: async (id) => {
        const engineData = await carEngine(id, "started");
        if(!engineData.success) {
          console.log(`Failed to start the engine for ${id}.`, engineData.message);
          return { velocity: null, distance: null };
        }

        const { distance, velocity } = engineData.data!;

        set((state) => ({
          cars: state.cars.map((c) =>
            c.id === id ? { ...c, velocity, distance, engineOn: true } : c
          ),
        }));

        return { velocity, distance }
      },

      stopEngine: async (id) => {
        const engineData = await carEngine(id, "stopped");
        if(!engineData.success) {
          console.log(`Failed to stop the engine for ${id}.`, engineData.message);
          return;
        }

        set((state) => ({
          cars: state.cars.map((c) =>
            c.id === id ? { ...c, engineOn: false, velocity: null, progress: 0 } : c
          ),
        }));
      },

      driveCar: async (id) => {
        const { cars, startEngine } = get();
        const car = cars.find((c) => c.id === id);

        if(car) {
          try {
              const { distance, velocity } = await startEngine(car.id);

              const time = Number(((distance! / velocity!) / 1000).toFixed(2));
              console.log(`Car ${id} will take ${time} seconds to finish the race.`)

              set((state) => ({
                cars: state.cars.map((c) =>
                  c.id === id ? { ...c, time } : c
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
                  )
                }));

                if (progress < 100) requestAnimationFrame(animate);
              };
              requestAnimationFrame(animate);
          } catch (error) {
              set((state) => ({
                cars: state.cars.map((c) =>
                  c.id === id ? { ...c, failed: true, progress: 0, engineOn: false } : c
                )
              }));
              console.error("Error driving car:", error);
          }
        }
      },

      raceAll: async () => {
        const { cars, driveCar } = get();

        set((state) => ({
          cars: state.cars.map((c) => ({
            ...c,
            engineOn: false
          })),
          winner: null,
          raceOnProgress: true
        }))

        const finished = await Promise.all(
          cars.map(async (car) => {
            try {
              if(!car.failed) await driveCar(car.id);
              return get().cars.find((c) => c.id === car.id)!;
            } catch (error) {
              set((state) => ({
                cars: state.cars.map((c) =>
                  c.id === car.id ? { ...c, failed: true, progress: 0, engineOn: false } : c
                ),
                raceOnProgress: false
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
            const data: Winner = {
              id: winner.id,
              color: winner.color,
              wins: winner.wins,
              time: winner.time,
              name: winner.name,
              bestTime: winnerCar.time !== null && (winner.time ?? 0) > winnerCar.time ? winner.time : winnerCar.time
            }

            set((state) => ({
              winners: [...state.winners, data],
              winner: data,
              raceOnProgress: false
            }));
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
          raceOnProgress: false
        }))
      },

      createCar: async (name: string, color: string) => {
        if(get().raceOnProgress) return;

        const data = await createCar(name, color);
        if(!data.success) {
          console.log(`Failed to create a car.`, data.message);
          return;
        }

        set((state) => ({
          cars: [
            ...state.cars,
            {
              ...data.data!,
              velocity: null,
              time: null,
              progress: 0,
              engineOn: false,
              wins: 0
            }
          ],
          totalCars: state.totalCars + 1,
        }));
      },

      updateCar: async (id: number, name: string, color: string) => {
        const car = get().cars.find((c) => c.id === id);

        if((car && car.progress === 0) || !get().raceOnProgress) {
          await updateCar(id, {
            name, color
          });

          set((state) => ({
            cars: state.cars.map((c) =>
              c.id === id ? { ...c, name, color } : c
            ),
          }))
        }
      },

      removeCar: async (id: number) => {
        const car = get().cars.find((c) => c.id === id);
        const { currentGaragePage, fetchCars, totalCars } = get();

        if((car && car.progress === 0) || !get().raceOnProgress) {
          await removeCar(id);

          const newTotal = totalCars - 1;

          const limit = 7;
          const totalPages = Math.ceil(newTotal / limit);

          const newPage = currentGaragePage > totalPages ? totalPages : currentGaragePage;

          set((state) => ({
            cars: state.cars.filter((car) => car.id !== id),
            totalCars: Math.max(0, state.totalCars - 1),
            currentGaragePage
          }));

          await fetchCars(newPage, limit);
        }
      }
    }),
    {
      name: 'car-race-storage',
      partialize: (state) => ({ 
        cars: state.cars.map((car) => ({
          ...car,
          progress: car.progress
        })), 
        winners: state.winners,
        raceOnProgress: state.raceOnProgress,
        totalCars: state.totalCars,
        currentGaragePage: state.currentGaragePage
      }),
    }
  )
);