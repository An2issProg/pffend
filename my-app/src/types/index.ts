export interface Product {
  _id: string;
  nomProduit: string;
  description?: string;
  prix: number;
  categorie: string;
  sousCategorie?: string;
  imageUrl?: string;
  quantiteStock: number;
}

export interface CartItem extends Product {
  quantity: number;
}
