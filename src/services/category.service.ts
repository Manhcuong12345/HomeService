import { Category } from '../models/category.model';

export class CategoryService {
    private static instance: CategoryService;

    static getInstance(): CategoryService {
        if (!CategoryService.instance) {
            CategoryService.instance = new CategoryService();
        }
        return CategoryService.instance;
    }

    /**
     * Function create data Category
     * @param categoryData
     * @returns
     */
    async create(categoryData: any) {
        const category = new Category(categoryData);
        await category.save();

        return category;
    }

    /**
     * Function get all data Category
     * @returns
     */
    async getAll() {
        const categories = Category.find();
        return categories;
    }
}
