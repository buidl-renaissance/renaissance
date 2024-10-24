import React from "react";

import { DAArtwork, DAContent } from "../interfaces";
import { EventRegister } from "react-native-event-listeners";

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

export const updateContent = () => {
  EventRegister.emitEvent("update-content", {});
};

export const useContent = (type: string = 'post') => {
  const [content, setContent] = React.useState<DAContent[]>();

  React.useEffect(() => {
    if (!content) updateContent();
  }, [content]);

  React.useEffect(() => {
    const listener = EventRegister.addEventListener("update-content", async (data) => {
      await updateContent();
    });
    return () => {
      if (typeof listener === "string")
        EventRegister.removeEventListener(listener);
    };
  });


  const updateContent = React.useCallback(() => {
    (async () => {
      console.log("UPDATE CONTENT", `https://api.detroiter.network/api/content?type=${type}`);
      const req = await fetch(`https://api.detroiter.network/api/content?type=${type}`);
      const result = await req.json();
      setContent(result.data);
    })();
  }, []);

  return [ content ];
};
