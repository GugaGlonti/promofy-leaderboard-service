import { Kafka } from 'kafkajs';

const concurrentWorkers = Number(process.env.CONCURRENT_WORKERS) || 1;
const sendEventInterval = Number(process.env.SEND_EVENT_INTERVAL) || 1000;
const scoreUpdateProbability =
  Number(process.env.SCORE_UPDATE_PROBABILITY) || 0.7;
const newPlayerProbability = Number(process.env.NEW_PLAYER_PROBABILITY) || 0.2;
const variance = Number(process.env.SCORE_VARIANCE) || 10;
const kafkaBrokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

const kafka = new Kafka({ brokers: kafkaBrokers });
const producer = kafka.producer();
const admin = kafka.admin();

const workers: NodeJS.Timeout[] = [];
let playerCounter = 1;
const initialUser = { ID: 0, score: 0 };
const playerSet: Set<number> = new Set([initialUser.ID]);
const playerArray = [initialUser];

async function start() {
  console.log('Connecting to Kafka brokers:', kafkaBrokers);
  await producer.connect();

  console.log('Ensuring topics exist...');
  await createTopicIfNotExists('score_update');
  await createTopicIfNotExists('new_player');

  console.log('Starting to produce fake data...');
  for (let i = 0; i < concurrentWorkers; i++) startWorker(i);
}
void start();

function startWorker(id: number) {
  console.log(`Worker ${id} started`);
  const worker = setInterval(() => {
    if (Math.random() < scoreUpdateProbability) sendFakeScore();
    if (Math.random() < newPlayerProbability) sendFakeNewPlayer();
  }, sendEventInterval);
  workers.push(worker);
}

async function createTopicIfNotExists(topic: string) {
  await admin.connect();
  try {
    const topics = await admin.listTopics();
    if (!topics.includes(topic)) {
      await admin.createTopics({ topics: [{ topic }] });
      console.log(`Topic "${topic}" created`);
    } else {
      console.log(`Topic "${topic}" already exists`);
    }
  } catch (error) {
    console.error(`Error creating topic "${topic}":`, error);
  }
  await admin.disconnect();
}

function sendFakeScore() {
  try {
    const user = playerArray[Math.floor(Math.random() * playerArray.length)];

    void producer.send({
      topic: 'score_update',
      messages: [
        {
          key: String(user.ID),
          value: JSON.stringify({
            userId: user.ID,
            scoreDelta: Math.floor((Math.random() * 2 - 0.5) * variance) || 1,
            timestamp: new Date(),
          }),
        },
      ],
    });
  } catch (err) {
    console.error('Error sending score update:', err);
  }
}

function sendFakeNewPlayer() {
  try {
    playerCounter++;
    const user = {
      ID: playerCounter,
      username: `player_${playerCounter}`,
      score: 0,
    };
    if (playerSet.has(user.ID)) return;

    playerSet.add(user.ID);
    playerArray.push(user);

    void producer.send({
      topic: 'new_player',
      messages: [
        {
          key: String(user.ID),
          value: JSON.stringify({
            userId: user.ID,
            newScore: Math.floor(Math.random() * variance) + 1,
            timestamp: new Date(),
          }),
        },
      ],
    });
  } catch (err) {
    console.error('Error sending new player:', err);
  }
}
