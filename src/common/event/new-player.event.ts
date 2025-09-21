export class NewPlayerEvent {
  constructor(
    public readonly userId: number,
    public readonly newScore: number,
    public readonly timestamp: Date,
  ) {}
}
