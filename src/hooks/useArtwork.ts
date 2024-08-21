import React from "react";

import { DAArtwork } from "../interfaces";

export const useArtworks = () => {
  const [artworks, setArtworks] = React.useState<DAArtwork[] | null>(null);

  React.useEffect(() => {
    if (!artworks) updateArtworks();
  }, [artworks]);

  const updateArtworks = React.useCallback(() => {
    (async () => {
      console.log(`UPDATE ARTWORKS!!`);
      const req = await fetch(`https://api.detroiter.network/api/artwork`);
      const result = await req.json();
      setArtworks(result.data);
    })();
  }, []);

  return [ artworks ];
};

export const useArtwork = (artworkId: number) => {
  const [artwork, setArtwork] = React.useState<DAArtwork | null>(null);

  React.useEffect(() => {
    if (!artwork) updateArtwork();
  }, [artwork]);

  const updateArtwork = React.useCallback(() => {
    (async () => {
      console.log(`UPDATE ARTWORK!! ${artworkId}`);
      const req = await fetch(`https://api.detroiter.network/api/artwork/${artworkId}`);
      const result = await req.json();
      setArtwork(result);
    })();
  }, []);

  return [ artwork ];
};
