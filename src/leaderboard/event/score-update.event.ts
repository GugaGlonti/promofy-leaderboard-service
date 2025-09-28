export class ScoreUpdateEvent {
  constructor(
    public readonly userId: number,
    public readonly scoreDelta: number,
    public readonly timestamp: Date,
  ) {}
}
