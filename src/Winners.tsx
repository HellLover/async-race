import { useRaceStore } from "@/store/useRaceStore";
import { useEffect } from "react";
import { Car } from "lucide-react";
import Pagination from "./components/Pagination";

function Winners() {
  const { fetchWinners, winners, currentWinnersPage } = useRaceStore();

  const totalPages = Math.ceil(winners.length / 10);

  useEffect(() => {
    fetchWinners(currentWinnersPage);
  }, [currentWinnersPage]);

  useEffect(() => {
    fetchWinners();
  }, []);

  return (
    <>
      <div className="container rounded-lg shadow-lg overflow-hidden w-full h-full gap-5">
        {winners.length > 0 ? (
          <div className="overflow-x-auto">
            <span className="font-bold text-2xl text-gray-300">Winners ({winners.length})</span>
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">CAR</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">NAME</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">WINS</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">BEST TIME</th>
                </tr>
              </thead>
              <tbody className="bg-blue-950 divide-y divide-gray-200">
                {winners.map((winner) => (
                  <tr
                    key={winner.id}
                    className={`hover:bg-indigo-800/20 bg-blue-950 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">#{winner.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Car className="w-10 h-10" style={{ color: winner.color }} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{winner.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {winner.wins} wins
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono">{winner.bestTime}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <span className="w-full mx-auto text-2xl font-bold text-gray-200">No Winners Yet. Start a race to determine the winner.</span>
        )}

        <Pagination
          onNext={() => currentWinnersPage + 1}
          onPrevious={() => currentWinnersPage - 1}
          totalPages={totalPages}
          currentPage={currentWinnersPage}
        />
      </div>
    </>
  );
}

export default Winners;