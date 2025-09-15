export class ScoreUpdateEvent {
  constructor(
    public readonly userId: string,
    public readonly scoreDelta: number,
    public readonly timestamp: Date,
  ) {}
}
