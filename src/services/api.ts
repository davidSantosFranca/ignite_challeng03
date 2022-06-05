import axios from 'axios';
import { Product, Stock } from '../types';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});


export async function loadProducts(): Promise<Product[]> {
  return new Promise(async(resolve, reject)=>await api.get("/products")
    .then((res) => {
      resolve(res.data);
    })
    .catch((err)=>{
      console.log(err);
      reject([]);
    }));
}

export async function loadStock(id?:number): Promise<Stock> {
  return new Promise(async(resolve, reject) => await api.get("/stock",{params:{id:id}}).then((res) => {
      resolve(id?res.data[0]:res.data);
    })
    .catch((err) => {
      console.log(err);
      reject();
    }))
    ;
}