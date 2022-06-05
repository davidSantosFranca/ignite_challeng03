import { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { loadProducts } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();
  
  const cartItemsAmount=cart.reduce((sum,product) => {
      const newSum = {...sum};
      newSum[product.id] = product.amount;
      return newSum;
    }, {} as CartItemsAmount)
    
  function handleAddProduct(id: number) {
     addProduct(id);
     
  }
  useEffect(() => {
    loadProducts().then(products =>{
      setProducts(products.map(product =>{ return {...product, priceFormatted:formatPrice(product.price)}}));
    })
  }, []);
  return (
    <ProductList>
      {products.map((p) => (
        <li key={p.id}>
          <img src={p.image} alt={p.title} />
          <strong>{p.title}</strong>
          <span>{p.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(p.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[p.id]??0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
