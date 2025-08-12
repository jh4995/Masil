import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (activity) => {
    if (cartItems.find(item => item.id === activity.id)) {
      Alert.alert('알림', '이미 장바구니에 추가된 활동입니다.');
      return;
    }
    setCartItems(prevItems => [...prevItems, activity]);
    Alert.alert('성공', `${activity.name} 활동을 장바구니에 담았습니다.`);
  };

  const value = {
    cartItems,
    addToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};