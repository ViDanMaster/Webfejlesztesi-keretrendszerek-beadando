export class Product {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public price: number,
    public categoryId: number,
    public imageUrl: string,
  ) {}
}