export class NewPlayerEvent {
  constructor(
    public readonly userId: string,
    public readonly newScore: number,
    public readonly timestamp: Date,
  ) {}
}
