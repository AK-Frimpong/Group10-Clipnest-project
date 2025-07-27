import React from 'react';
import CollageCreationScreen from '../CollageCreationScreen';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CollageModal({ visible, onClose }: Props) {
  return (
    <CollageCreationScreen
      visible={visible}
      onClose={onClose}
    />
  );
}