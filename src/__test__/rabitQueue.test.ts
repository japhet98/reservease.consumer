import { RabitQueue } from '../RabitQueue';

const rabitQueue = new RabitQueue(
  'amqps://ycxzxpph:GHQdJ2fwjpH7k3siLWqvRgEY2JLBa2iD@albatross.rmq.cloudamqp.com/ycxzxpph',
);

const apiRes: any = {
  ok: true,
  message: 'Successfully created channel',
  data: [],
};

// test('Create queue channel', async() => {
//     const res = await rabitQueue.CreateQueueChannel("testing");
//     expect(res).toEqual( apiRes);
//   });

//   test('Create exchange channel', async() => {
//     const res = await rabitQueue.CreateExchangeChannel("testing");
//     expect(res).toEqual( apiRes);
//   });

const apiRes2: any = {
  ok: true,
  message: `[x] Sent Hello world`,
  data: 'Hello world',
};

test('Send message to queue', async () => {
  const resp = await rabitQueue.CreateQueueChannel('testing');
  const res = await rabitQueue.SentToQueue(resp.data, 'testing', 'Hello world');
  expect(res).toEqual(apiRes2);
});

const SubscribeEvents = (message: string) => {
  //  console.log(message);
  return message;
};

test('Consume message from queue', async () => {
  const resp = await rabitQueue.CreateQueueChannel('japhet');
  await rabitQueue.SentToQueue(resp.data, 'japhet', 'Hello Japhet');
  await rabitQueue.ConsumeFromQueue(resp.data, 'japhet', { SubscribeEvents });
  expect(SubscribeEvents('Hello Japhet')).toEqual('Hello Japhet');
});

const apiRes3: any = {
  ok: true,
  message: `Published message to exchange name: reservease successfully`,
  data: 'I am testing for exchange',
};

test('Publish message to exchange', async () => {
  const resp = await rabitQueue.CreateExchangeChannel('reservease');
  const res = await rabitQueue.PublishMessage(resp.data, 'reservease', 'testing_service', 'I am testing for exchange');
  expect(res).toEqual(apiRes3);
});

test('Consume message from exchange', async () => {
  const resp = await rabitQueue.CreateExchangeChannel('reservease');
  await rabitQueue.PublishMessage(resp.data, 'reservease', 'testing_service', 'I am testing for exchange');
  await rabitQueue.SubscribeMessage(resp.data, 'reservease', 'testing_service', { SubscribeEvents });
  expect(SubscribeEvents('I am testing for exchange')).toEqual('I am testing for exchange');
});
