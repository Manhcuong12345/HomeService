import { NextFunction, Request, Response, Router } from 'express';
import { ContactService } from '../../services/contact.service';
import { Controller } from '../../common';
import { auth } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/authorize.middleware';

export class ContactController implements Controller {
    private readonly baseUrl: string = '/contacts';
    private _router: Router;
    private readonly contactService = ContactService.getInstance();

    get router(): Router {
        return this._router;
    }

    constructor() {
        this._router = Router();
        this.initRouter();
    }

    private initRouter(): void {
        this._router.get(this.baseUrl, auth, this.getAll);
        this._router.post(this.baseUrl, auth, this.createContact);
        this._router.put(this.baseUrl + '/:id', auth, authorize(['Admin']), this.updateContact);
        // this._router.put(this.baseUrl, auth, authorize(['Admin']), this.updateAll);
    }

    private updateContact = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const contactData = req.body;
            const { id } = req.params;

            res.send(await this.contactService.updateContact(id, contactData));
        } catch (err) {
            next(err);
        }
    };

    private createContact = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const contactData = req.body;
            res.send(await this.contactService.createContact(contactData));
        } catch (err) {
            next(err);
        }
    };

    private getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const { query } = req;
            res.send(await this.contactService.findAllAndPagning());
        } catch (err) {
            next(err);
        }
    };

    // private deleteContactUser = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         // const contactData = req.body;
    //         const { id } = req.params;
    //         const { contactId } = req.params;

    //         res.send(await this.contactService.deleteContactUser(id, contactId));
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    // private deleteContact = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         // const contactData = req.body;
    //         const { id } = req.params;
    //         const { contactId } = req.params;

    //         res.send(await this.contactService.deleteContact(id, contactId));
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    // private updateContactTasker = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const contactData = req.body;
    //         const { id } = req.params;
    //         const { contactIdTasker } = req.params;

    //         res.send(await this.contactService.updateContactTasker(id, contactIdTasker, contactData));
    //     } catch (err) {
    //         next(err);
    //     }
    // };

    // private createContact = async (req: Request, res: Response, next: NextFunction) => {
    //     try {
    //         const contactData = req.body;
    //         const { id } = req.params;

    //         res.send(await this.contactService.createContact(id, contactData));
    //     } catch (err) {
    //         next(err);
    //     }
    // };
}
