import Router from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controller/UserController';
import SessionController from './app/controller/SessionController';
import FilesController from './app/controller/FilesController';
import ProvidersController from './app/controller/ProvidersController';
import AppointmentController from './app/controller/AppointmentController';
import ScheduleController from './app/controller/ScheduleController';
import NotificationController from './app/controller/NotificationController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FilesController.store);

routes.get('/providers', ProvidersController.index);

routes.post('/appointments', AppointmentController.store);
routes.get('/appointments', AppointmentController.index);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

module.exports = routes;
