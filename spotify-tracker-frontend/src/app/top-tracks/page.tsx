"use client";

import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";

type TopTrack = {
  trackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  playedAt: string;
  durationMs: number;
};

function TopTracks() {
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("long_term");

  useEffect(() => {
    async function fetchTopTracks() {
      try {
        const response = await apiClient.get(
          `/top-tracks?timeRange=${timeRange}`
        );
        const data = response.data;
        setTopTracks(data);
      } catch (error) {
        // handle errors here
      }
    }
    fetchTopTracks();
  }, [timeRange]);

  useEffect(() => {
    console.log("Top tracks:", topTracks);
  }, [topTracks]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Top Tracks
      </h1>

      <div className="mb-6 text-center">
        <label
          htmlFor="selectedTimeRange"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Choose a time range:
        </label>
        <select
          id="selectedTimeRange"
          name="selectedTimeRange"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
        >
          <option value="short_term">Short-term</option>
          <option value="medium_term">Medium-term</option>
          <option value="long_term">Long-term</option>
        </select>
      </div>

      <ul className="space-y-4">
        {topTracks.map((track, index = 0) => (
          <li
            key={`${track.trackId}-${track.playedAt}`}
            className="p-4 bg-gray-100 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <p className="text-lg font-semibold text-gray-900">
              {track.trackName}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Artist:</span> {track.artistName}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Album:</span> {track.albumName}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium">Rank: {index + 1}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default TopTracks;
