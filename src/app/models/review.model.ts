export class Review {
  constructor(
    public id: string,
    public productId: number,
    public userId: number,
    public rating: number,
    public comment: string,
    public date: Date 
  ) {}
}