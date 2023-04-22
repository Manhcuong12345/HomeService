import { config } from '../config/config';
import * as redis from 'redis';

//function config database redis cloud when deploy on server
const redisClient = redis.createClient({
    url: `redis://${config.get('connectionUrlRedis')}:${config.get('portRedis')}`,
    password: config.get('passwordRedis')
});

redisClient.on('ready', () => {
    console.log('redis is connected');
});

redisClient.on('error', (err) => {
    console.log('redis is disconnected: ', err);
});

//function check log when start servier in local
(async () => {
    await redisClient.connect(); // if using node-redis client.

    const pingCommandResult = await redisClient.ping();
    console.log('Ping command result: ', pingCommandResult);

    const getCountResult = await redisClient.get('count');
    console.log('Get count result: ', getCountResult);

    const incrCountResult = await redisClient.incr('count');
    console.log('Increase count result: ', incrCountResult);

    const newGetCountResult = await redisClient.get('count');
    console.log('New get count result: ', newGetCountResult);

    await redisClient.set(
        'object',
        JSON.stringify({
            name: 'Redis',
            lastname: 'Client'
        })
    );

    const getStringResult = await redisClient.get('object');
    console.log('Get string result: ', JSON.parse(getStringResult));
})();

export { redisClient };
