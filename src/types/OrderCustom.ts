export interface Topping {
    id: string;
    name: string;
    price: number;
    isFree?: boolean;
}

export interface CustomOrder {
    size: Size;
    cream: Cream;
    fruits: Fruit[];
    toppings: Topping[];
    total: number;
}

export interface Size {
    id: string;
    name: string;
    volume: number;
    price: number;
}

export interface Cream {
    id: string;
    name: string;
    price: number;
}

export interface Fruit {
    id: string;
    name: string;
    price: number;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    customOrder?: CustomOrder;
    ingredients?: string;
    type: string;
}
