import React, { createContext, ReactNode, useState } from 'react';

export type ImageItem = {
  id: string;
  url: string;
  height: number;
};

interface PinBoardContextType {
  pins: ImageItem[];
  addPin: (image: ImageItem) => void;
  collages: ImageItem[];
  addToCollage: (image: ImageItem) => void;
}

export const PinBoardContext = createContext<PinBoardContextType>({
  pins: [],
  addPin: () => {},
  collages: [],
  addToCollage: () => {},
});

export const PinBoardProvider = ({ children }: { children: ReactNode }) => {
  const [pins, setPins] = useState<ImageItem[]>([]);
  const [collages, setCollages] = useState<ImageItem[]>([]);

  const addPin = (image: ImageItem) => {
    setPins((prev) => {
      if (prev.find((item) => item.id === image.id)) return prev;
      return [...prev, image];
    });
  };

  const addToCollage = (image: ImageItem) => {
    setCollages((prev) => {
      if (prev.find((item) => item.id === image.id)) return prev;
      return [...prev, image];
    });
  };

  return (
    <PinBoardContext.Provider value={{ pins, addPin, collages, addToCollage }}>
      {children}
    </PinBoardContext.Provider>
  );
}; 