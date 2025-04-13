export class Product {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public price: number,
    public categoryId: number,
    public imageUrl: string,
    public isFavorite: boolean = false,
  ) {}
}