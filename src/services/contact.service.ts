import { Contact } from '../models/contact.model';
import { HttpException } from '../common';
import { CONTACT_NOT_FOUND } from '../common/constants/err.constants';

export class ContactService {
    private static instance: ContactService;

    static getInstance(): ContactService {
        if (!ContactService.instance) {
            ContactService.instance = new ContactService();
        }
        return ContactService.instance;
    }

    /**Function create contacts
     *@param {*} contactData
     *
     */
    async createContact(conttactData: any) {
        const contact = new Contact(conttactData);
        await contact.save();
        return contact;
    }

    /**
     * Function get all data contact
     */
    /**
     * Function get all noti and pagning
     * @param {*}
     */
    async findAllAndPagning() {
        const contacts = await Contact.find({});
        return contacts;
    }

    /**
     * Function update data contact
     * @param {*} contactData
     * @param {*} id
     */
    async updateContact(id: string, contactData: any) {
        const contact = await Contact.findOneAndUpdate(
            { _id: id },
            {
                $set: { contacts: contactData }
            },
            { new: true }
        );
        if (!contact) throw new HttpException(404, { error_code: '404', error_message: 'Contact info is not found' });

        return contact;
    }

    // /**
    //  * Function delete filed data in array object
    //  * @param {*} id
    //  * @param {*} contactId
    //  */
    // async deleteContactUser(id: string, contactId: string) {
    //     const contact = await Contact.findByIdAndUpdate(
    //         id,
    //         {
    //             $pull: { 'contact_info.contact_user': { _id: contactId } }
    //         },
    //         { new: true }
    //     );

    //     return contact;
    // }

    // /**
    //  * Function delete filed data in array object
    //  * @param {*} id
    //  * @param {*} contactId
    //  */
    // async deleteContactTasker(id: string, contactId: string) {
    //     const contact = await Contact.findByIdAndUpdate(
    //         id,
    //         {
    //             $pull: { 'contact_info.contact_tasker': { _id: contactId } }
    //         },
    //         { new: true }
    //     );

    //     return contact;
    // }
}
