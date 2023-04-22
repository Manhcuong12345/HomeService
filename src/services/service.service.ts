import { Service } from '../models/service.model';
import { HttpException } from '../common';
import { upload } from '../middlewares/cloud_upload.middleware';
import { UNAUTHORIZED, SERVICE_NOT_FOUND } from '../common/constants/err.constants';

export class ServicesService {
    private static instance: ServicesService;

    static getInstance(): ServicesService {
        if (!ServicesService.instance) {
            ServicesService.instance = new ServicesService();
        }
        return ServicesService.instance;
    }

    /**
     *Function check data before create data
     * @param {*} serviceData
     */

    static async chekingDataBeforeCreate(serviceData: any) {
        const existsService = await Service.findOne({ name: serviceData.name });
        if (existsService) throw new HttpException(400, { error_code: '400', error_message: 'Name is already exist' });

        return true;
    }

    /**
     * Function create service data
     * @param {*} serviceData
     * @param {*} user
     * @return
     */

    async createService(serviceData: any, user: any) {
        // await ServicesService.chekingDataBeforeCreate(serviceData);
        if (user.type !== 'Admin') throw new HttpException(401, UNAUTHORIZED);

        const service = new Service(serviceData);
        await service.save();

        return service;
    }

    /**
     * Function get by id service
     * @param {*} id
     * @param {*} user
     * @return
     */
    async getServiceById(id: string, user: any) {
        const service = await Service.findById(id);
        if (!service) throw new HttpException(404, SERVICE_NOT_FOUND);

        // service.selected_option = service

        return service;
    }

    // /**
    //  * Function get by id service
    //  * @param {*} id
    //  * @param {*} user
    //  * @return
    //  */
    async getGroupOptionById(serviceId: string, id: string) {
        // const service: any = await Service.find({ 'options._id': { _id: id } }).select({ name: 1 });
        // const service = await Service.find({ options: { _id: id } });
        const service = await Service.findOne({ _id: serviceId }, { options: { $elemMatch: { _id: id } } });
        console.log(service);
        if (!service) throw new HttpException(404, SERVICE_NOT_FOUND);
        const option = Object.assign(service.options);
        console.log(option);

        return service;
    }

    /**
     * Function update service datas
     * @param {*} id
     * @param {*} serviceData
     * @param {*} user
     * @return
     */

    async updateService(id: string, serviceData: any, user: any) {
        if (user.type !== 'Admin') throw new HttpException(401, UNAUTHORIZED);

        const service = await Service.findByIdAndUpdate(id, serviceData, { new: true });
        if (!service) throw new HttpException(404, SERVICE_NOT_FOUND);

        return service;
    }

    /**
     * Function used to create filters
     * help filter data based on user data and user submitted data (search_string)
     *
     * @param {*} search_string
     * @param {*} user
     *  @param {*} active
     * @returns
     */
    getFilter(search_string: string, user: any, active: boolean) {
        let filter: any = {};

        if (search_string) {
            filter = { name: { $regex: new RegExp(['', search_string, ''].join(''), 'i') } };
        }
        if (active) {
            filter = { is_active: active };
        }

        return filter;
    }

    /**
     * Function used to get data of all users and pagination
     * @param {*} limit
     * @param {*} active
     * @param {*} search_string
     * @param {*} user
     * @param {*} page
     * @return
     */
    async getAllServiceAndPaging({
        page,
        limit,
        user,
        search_string,
        active
    }: {
        page?: number;
        limit?: number;
        user?: any;
        search_string?: string;
        active?: boolean;
    }) {
        if (!page || page <= 0) page = 1;
        if (!limit) limit = 10;

        let skip = 0;
        skip = (page - 1) * limit;

        const filter = this.getFilter(search_string, user, active);

        const services = await Service.find(filter).skip(skip).limit(limit).sort({ created_time: 'desc' });
        const documentCount = await Service.countDocuments();

        const response = {
            data: services,
            meta_data: {
                total_records: documentCount,
                limit: limit,
                page: page,
                total_page: Math.ceil(documentCount / Number(limit))
            }
        };

        return response;
    }

    /**
     * Function delete service data
     * @param {*} id
     * @param {*} user
     * @return
     */

    async deleteService(id: string, user: any) {
        if (user.type !== 'Admin') throw new HttpException(401, UNAUTHORIZED);

        const service = await Service.findByIdAndDelete(id);
        if (!service) throw new HttpException(404, SERVICE_NOT_FOUND);

        return service;
    }

    /**
     * Function upload image in service
     * @param {*} serviceData
     * @param {*} id
     */
    async uploadFile(id: string, serviceData: any) {
        let service = await Service.findById(id);
        if (!service) throw new HttpException(400, SERVICE_NOT_FOUND);

        //config url link file then send url to cloud google storage data img and save url avatar in database
        let fileAvatar = await upload(serviceData);
        service.img = fileAvatar;
        service.updated_time = Date.now();
        if (!fileAvatar) throw new HttpException(400, { error_code: '400', error_message: '' });

        Object.assign(service, fileAvatar);

        await service.save();
        return service;
    }
}
