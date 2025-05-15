export class Product {
  constructor(
    public id: string, // Módosítsd string vagy number típusra
    public name: string,
    public description: string,
    public price: number,
    public categoryId: number,
    public imageUrl: string
  ) {}
}