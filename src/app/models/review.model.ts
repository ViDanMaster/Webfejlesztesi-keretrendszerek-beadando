export class Review {
  constructor(
    public id: string,
    public productId: string,
    public userId: string,
    public rating: number,
    public comment: string,
    public date: Date 
  ) {}
}