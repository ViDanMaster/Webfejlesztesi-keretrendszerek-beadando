export class Review {
  constructor(
    public productId: number,
    public userId: number,
    public rating: number,
    public comment: string,
    public date: Date 
  ) {}
}