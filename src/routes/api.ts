import express from 'express';
import { Controller } from '../common';
import {
    AdminController,
    AuthController,
    CategoryController,
    ContactController,
    FcmTokenController,
    ForgotPasswordController,
    NotificationController,
    PushNotificationController,
    RatetingController,
    RegisterController,
    ServiceController,
    TaskerController,
    TaskController,
    UserController
    // AppController,
} from '../controllers';

export function initRouter(app: express.Application) {
    const controllers: Controller[] = [
        new AdminController(),
        new AuthController(),
        new CategoryController(),
        new ContactController(),
        new FcmTokenController(),
        new ForgotPasswordController(),
        new NotificationController(),
        new PushNotificationController(),
        new RatetingController(),
        new RegisterController(),
        new ServiceController(),
        new TaskerController(),
        new TaskController(),
        new UserController()
        // new AppController(),
    ];
    app.use(
        '/api',
        controllers.map((controller) => controller.router)
    );
}
