import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Size {
  id: string;
  name: string;
  volume: number;
  price: number;
}

interface Cream {
  id: string;
  name: string;
  price: number;
}

interface Fruit {
  id: string;
  name: string;
  price: number;
}

interface Topping {
  id: string;
  name: string;
  price: number;
  isFree?: boolean;
}

interface CustomOrder {
  size: Size;
  cream: Cream;
  fruits: Fruit[];
  toppings: Topping[];
  total: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: Size;
  cream?: Cream;
  fruits?: Fruit[];
  toppings?: Topping[];
  total?: number;
  customOrder?: CustomOrder;
  type: string;
/*   type: 'fruit' | 'topping' | 'size' | 'cream' | 'custom'; */
  isFree?: boolean;
}

interface CartContextType {
  cart: {
    items: CartItem[];
    totalAmount: number;
  };
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<{
    items: CartItem[];
    totalAmount: number;
  }>({ items: [], totalAmount: 0 });

  const calculateTotalAmount = (items: CartItem[]): number => {
    return items.reduce((total, item) => {
      const itemTotal = item.total ?? (item.price * item.quantity);
      return total + (item.isFree ? 0 : itemTotal);
    }, 0);
  };

  const addToCart = (item: CartItem) => {
    console.log('Adding item to cart:', item); // Log item being added

    setCart((prevCart) => {
      const itemIndex = prevCart.items.findIndex(
        (i) => i.id === item.id && JSON.stringify(i.customOrder) === JSON.stringify(item.customOrder)
      );

      let updatedItems = [...prevCart.items];
      if (itemIndex > -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity + item.quantity,
        };
      } else {
        updatedItems = [...prevCart.items, item];
      }

      const updatedTotalAmount = calculateTotalAmount(updatedItems);

      console.log('Updated cart items:', updatedItems); // Log updated items
      console.log('Updated total amount:', updatedTotalAmount); // Log updated total amount

      return {
        items: updatedItems,
        totalAmount: updatedTotalAmount,
      };
    });
  };

  const removeFromCart = (id: string) => {
    console.log('Removing item from cart with id:', id); // Log item being removed

    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.id !== id);
      const updatedTotalAmount = calculateTotalAmount(updatedItems);

      console.log('Updated cart items:', updatedItems); // Log updated items
      console.log('Updated total amount:', updatedTotalAmount); // Log updated total amount

      return {
        items: updatedItems,
        totalAmount: updatedTotalAmount,
      };
    });
  };

  const incrementQuantity = (id: string) => {
    console.log('Incrementing quantity for item with id:', id); // Log quantity increment

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );

      const updatedTotalAmount = calculateTotalAmount(updatedItems);

      console.log('Updated cart items:', updatedItems); // Log updated items
      console.log('Updated total amount:', updatedTotalAmount); // Log updated total amount

      return {
        items: updatedItems,
        totalAmount: updatedTotalAmount,
      };
    });
  };

  const decrementQuantity = (id: string) => {
    console.log('Decrementing quantity for item with id:', id); // Log quantity decrement

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      ).filter(item => item.quantity > 0);

      const updatedTotalAmount = calculateTotalAmount(updatedItems);

      console.log('Updated cart items:', updatedItems); // Log updated items
      console.log('Updated total amount:', updatedTotalAmount); // Log updated total amount

      return {
        items: updatedItems,
        totalAmount: updatedTotalAmount,
      };
    });
  };

  const clearCart = () => {
    console.log('Clearing cart'); // Log cart clearing

    setCart({ items: [], totalAmount: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
