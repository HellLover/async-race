import { getRandomName, getRandomColor } from "@/util";

const BASE_API_URL = import.meta.env["VITE_BASE_API_URL"];

export async function generateCars(count = 100) {
  const cars = Array.from({ length: count }).map(() => ({
    name: getRandomName(),
    color: getRandomColor(),
  }));

  await Promise.all(
    cars.map((car) =>
      fetch(`${BASE_API_URL}/garage`, {
        method: "POST",
        body: JSON.stringify(car),
        headers: { "Content-Type": "application/json" },
      })
    )
  );
}

export async function fetchCars(page = 1, limit = 7) {
  const res = await fetch(`${BASE_API_URL}/garage?_page=${page}&_limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch cars");
  const data = await res.json();
  return {
    cars: data,
    totalCars: parseInt(res.headers.get("X-Total-Count") || "0", 10),
  }
}

export async function carEngine(id: number, status: "started" | "stopped") {
  const res = await fetch(`${BASE_API_URL}/engine?id=${id}&status=${status}`, { 
    method: "PATCH"
  });
  if (!res.ok) throw new Error("Failed to start engine");
  return res.json();
}

export async function driveCar(id: number) {
  const res = await fetch(`${BASE_API_URL}/engine?id=${id}&status=drive`, { 
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to drive car");
  return res.json();
}

export async function fetchWinners(page?: number, limit?: number) {
  const res = await fetch(`${BASE_API_URL}/winners?${page ? `&_page=${page}` : ""}${limit ? `&_limit=${limit}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch the winners");
  return res.json();
}

export async function addOrCreateWinner(
  payload: { id: number; wins: number, time: number }, 
  status: "add" | "create"
) {
  if(status === "add") {
    const res = await fetch(`${BASE_API_URL}/winners/${payload.id}`, {
      method: "PUT",
      body: JSON.stringify({
        wins: payload.wins,
        time: payload.time,
      }),
      headers: { "Content-Type": "application/json" }
    })

    if (!res.ok) throw new Error("Failed to update a winner");
    return res.json();
  } else {
    const res = await fetch(`${BASE_API_URL}/winners`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Failed to create a winner");
    return res.json();
  }
}