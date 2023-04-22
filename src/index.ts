import { App } from './app';
import { config } from './config/config';
import express from 'express';

async function Main() {
    const app = new App();
    const port: number = config.get('port') || 3000;

    await app.start();
    await app.listen(port, () => {
        console.log('listening on port', port);
    });
}

Main();
