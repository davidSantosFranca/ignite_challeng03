import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { loadProducts, loadStock } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => void;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });
  const [products, setProducts] = useState<Product[]>([]);

   const addProduct = async (productId: number) => {
     try {
       const stockItem = await loadStock(productId).then((stock) => stock);
       const cartItem = cart.find((x) => x.id === productId);
       let localCart: Product[] = [];
       if (stockItem) {
         if (cartItem) {
           if (stockItem.amount < cartItem.amount + 1) {
             toast.error("Sem estoque para adicionar este item ao carrinho!");
             return;
           }
           localCart = cart.map((item) =>
             item.id === productId ? { ...item, amount: item.amount + 1 } : item
           );
           setCartLocal(localCart);
         } else {
           if (stockItem.amount > 0) {
             localCart = [
               ...cart,
               { ...products.find((x) => x.id === productId)!, amount: 1 },
             ];
             setCartLocal(localCart);
           } else {
             toast.error("Sem estoque para adicionar este item ao carrinho!");
             return;
           }
         }
       }
       if (localCart.length > 0) {
         localStorage.setItem("@RocketShoes:cart", JSON.stringify(localCart));
       }
     } catch (err) {
       toast.error("Erro na adição do produto");
       console.log(err);
     }
   };
  function setCartLocal(newCart:Product[]){
    setCart(newCart);
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
  }
  const removeProduct = (productId: number) => {
    try {
      setCartLocal(cart.filter(x=>x.id !== productId));
    } catch(err) {
      toast.error(`Erro ao tentar remover o produto ${products.find(x=>x.id === productId)?.title}!`)
      console.log(err);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const stock = await loadStock(productId).then((res) => res);
      console.log(stock, amount, amount<=stock.amount);
      if(amount<=stock.amount){
        setCartLocal(cart.map(item=>
          (item.id === productId?{...item, amount: amount}:item)))
      }else{
        toast.error("Sem estoque para atualizar este item no carrinho!");
        return;
      }
    } catch {
      toast.error(`Erro ao atualizar o produto ${products.find(x=>x.id === productId)?.title}`)
    }
  };
  useEffect(() => {
    loadProducts().then((products) => {
      setProducts(products);
    });
  },[])
  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
