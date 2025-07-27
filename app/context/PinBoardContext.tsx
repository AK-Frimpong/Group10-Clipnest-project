import React, { createContext, ReactNode, useState } from 'react';

export type ImageItem = {
  id: string;
  url: string;
  height: number;
};

export type Board = {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  items: ImageItem[];
  coverImage?: string;
  createdAt: Date;
};

interface PinBoardContextType {
  pins: ImageItem[];
  addPin: (image: ImageItem) => void;
  collages: ImageItem[];
  addToCollage: (image: ImageItem) => void;
  boards: Board[];
  addBoard: (board: Board) => void;
  addToBoard: (boardId: string, item: ImageItem) => void;
  removeFromBoard: (boardId: string, itemId: string) => void;
}

export const PinBoardContext = createContext<PinBoardContextType>({
  pins: [],
  addPin: () => {},
  collages: [],
  addToCollage: () => {},
  boards: [],
  addBoard: () => {},
  addToBoard: () => {},
  removeFromBoard: () => {},
});

export const PinBoardProvider = ({ children }: { children: ReactNode }) => {
  const [pins, setPins] = useState<ImageItem[]>([]);
  const [collages, setCollages] = useState<ImageItem[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);

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

  const addBoard = (board: Board) => {
    setBoards((prev) => {
      if (prev.find((b) => b.id === board.id)) return prev;
      return [...prev, board];
    });
  };

  const addToBoard = (boardId: string, item: ImageItem) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? { ...board, items: [...board.items, item] }
          : board
      )
    );
  };

  const removeFromBoard = (boardId: string, itemId: string) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? { ...board, items: board.items.filter((item) => item.id !== itemId) }
          : board
      )
    );
  };

  return (
    <PinBoardContext.Provider value={{ 
      pins, 
      addPin, 
      collages, 
      addToCollage, 
      boards, 
      addBoard, 
      addToBoard, 
      removeFromBoard 
    }}>
      {children}
    </PinBoardContext.Provider>
  );
}; 