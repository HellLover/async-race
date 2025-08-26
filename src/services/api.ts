import { getRandomName, getRandomColor } from "@/util";
import type { Car } from "@/store/useRaceStore";

const BASE_API_URL = import.meta.env["VITE_BASE_API_URL"];

export type CarResponse<T = undefined> = {
  success: true;
  data?: T
}

export type ApiError = {
  success: false;
  status: number;
  message: string
}

export type ApiResult<T = undefined> = CarResponse<T> | ApiError;

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

export async function fetchCars(page = 1, limit = 7): Promise<ApiResult<{ cars: Car[]; totalCars: number }>> {
  try {
      const res = await fetch(`${BASE_API_URL}/garage?_page=${page}&_limit=${limit}`);
      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: res.statusText
        }
      }

      const cars: Car[] = await res.json();
      return {
        success: true,
        data: {
          cars,
          totalCars: parseInt(res.headers.get("X-Total-Count") || "0", 10)
        }
      }
  } catch(err) {
      return {
        success: false,
        status: 500,
        message: (err as Error).message,
      }
  }
}

export async function carEngine(id: number, status: "started" | "stopped"): Promise<ApiResult<{ velocity: number, distance: number }>> {
    try {
      const res = await fetch(`${BASE_API_URL}/engine?id=${id}&status=${status}`, { 
        method: "PATCH"
      });
      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: res.statusText
        }
      }

      const data = await res.json();
      return {
        success: true,
        data
      }
    } catch(err) {
      return {
        success: false,
        status: 500,
        message: (err as Error).message
      }
    }
}

export async function driveCar(id: number): Promise<ApiResult> {
  try {
      const res = await fetch(`${BASE_API_URL}/engine?id=${id}&status=drive`, { 
        method: "PATCH",
      });

      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: res.statusText
        }
      }

      return { success: true }
  } catch(err) {
      return {
        success: false,
        status: 500,
        message: (err as Error).message,
      };
  }
}

export async function fetchWinners(page?: number, limit?: number): Promise<ApiResult<Car[]>> {
  try {
    const res = await fetch(`${BASE_API_URL}/winners?${page ? `&_page=${page}` : ""}${limit ? `&_limit=${limit}` : ""}`);
    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: res.statusText
      }
    }

    const data = await res.json();
    return {
      success: true,
      data
    }
  } catch(err) {
      return {
        success: false,
        status: 500,
        message: (err as Error).message,
      };
  }
}

export async function addOrCreateWinner(
  payload: { id: number; wins: number, time: number }, 
  status: "add" | "create"
): Promise<ApiResult<{ id: number, wins: number, time: number }>> {
  try {
    if(status === "add") {
      const res = await fetch(`${BASE_API_URL}/winners/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify({
          wins: payload.wins,
          time: payload.time,
        }),
        headers: { "Content-Type": "application/json" }
      })

      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: res.statusText
        }
      }

      const data = await res.json();
      return {
        success: true,
        data
      }
    } else {
      const res = await fetch(`${BASE_API_URL}/winners`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        return {
          success: false,
          status: res.status,
          message: res.statusText
        }
      }

      const data = await res.json();
      return {
        success: true,
        data
      }
    }
  } catch(err) {
      return {
        success: false,
        status: 500,
        message: (err as Error).message,
      };
  }
}

export async function createCar(name: string, color: string): Promise<ApiResult<Car>> {
  try {
    const res = await fetch(`${BASE_API_URL}/garage`, {
      method: 'POST',
      body: JSON.stringify({ name, color }),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: res.statusText
      }
    }

    const data = await res.json();
    return {
      success: true,
      data
    }
  } catch(err) {
    return {
      success: false,
      status: 500,
      message: (err as Error).message,
    };
  }
}

export async function updateCar(id: number, payload: {
  name: string, color: string
}): Promise<ApiResult<Car>> {
  try {
    const res = await fetch(`${BASE_API_URL}/garage/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: res.statusText
      }
    }

    const data = await res.json();
    return {
      success: true,
      data
    }
  } catch(err) {
    return {
      success: false,
      status: 500,
      message: (err as Error).message,
    };
  }
}

export async function removeCar(id: number): Promise<ApiResult> {
  try {
    const res = await fetch(`${BASE_API_URL}/garage/${id}`, {  method: 'DELETE' });

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: res.statusText
      }
    }

    return { success: true }
  } catch(err) {
    return {
      success: false,
      status: 500,
      message: (err as Error).message,
    };
  }
}