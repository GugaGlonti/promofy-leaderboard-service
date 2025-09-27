export class KafkaEvent<T> {
  constructor(
    public readonly key: number,
    public readonly value: T,
  ) {}
}
