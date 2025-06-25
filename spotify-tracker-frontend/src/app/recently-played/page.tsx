"use client";

import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";

type Track = {
  trackId: string;
  trackName: string;
  artistName: string;
  albumName: string;
  durationMs: number;
  playedAt: string;
};

function RecentlyPlayed() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // obtain the recently played tracks
  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await apiClient.get("/recently-played");
        const data = response.data;
        setTracks(data);
      } catch (error: any) {
        setError(error.message || "Failed to fetch tracks");
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, []);

  // log the updated tracks
  useEffect(() => {
    console.log("Fetched tracks:", tracks); // this runs whenever tracks changes
  }, [tracks]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Recently Played Tracks
      </h1>

      <ul className="space-y-4">
        {tracks.map((track) => (
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
              <span className="font-medium">Played at:</span>{" "}
              {new Date(track.playedAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default RecentlyPlayed;
