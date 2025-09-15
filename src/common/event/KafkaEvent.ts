export class KafkaEvent<T> {
  constructor(
    public readonly key: string,
    public readonly value: T,
  ) {}
}
