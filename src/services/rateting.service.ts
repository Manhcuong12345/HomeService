import { Rateting } from '../models/rateting.model';
import { HttpException } from '../common';
import { User } from '../models/user.model';
import { Tasker } from '../models/tasker.model';
import { Task } from '../models/task.model';
import {
    USER_NOT_FOUND,
    TASK_ALREADY_REVIEW_TO_USER,
    TASK_NOT_FOUND,
    TASKER_NOT_FOUND
} from '../common/constants/err.constants';

export class RatetingService {
    private static instance: RatetingService;

    static getInstance(): RatetingService {
        if (!RatetingService.instance) {
            RatetingService.instance = new RatetingService();
        }
        return RatetingService.instance;
    }

    /**
     * Function create ratting comments user to task of tasker
     * @param id
     * @param user
     * @param data
     * @returns
     */
    async createRattingComments(id: string, user: any, data: any) {
        //check token _id is user login app
        const userData = await User.findById(user._id).select({ _id: 1, name: 1 });
        if (!userData) throw new HttpException(404, USER_NOT_FOUND);

        //Find id task then tasker _id in task
        const task: any = await Task.findById(id);
        if (!task) throw new HttpException(404, TASK_NOT_FOUND);

        //check token _id user is match _id user in task.
        if (userData._id.toString() !== task.posted_user._id.toString())
            throw new HttpException(400, { error_code: '400', error_message: 'User can not comments and ratting!' });

        //Body data when create comment,ratting
        const comment: any = {
            description: data.description,
            rating: data.rating,
            user: userData,
            task: task._id
        };

        //Find id tasker and update push comment and ratting then save data in tasker.
        const commentUser: any = await Tasker.findById(task.tasker._id);
        if (!commentUser) throw new HttpException(404, TASKER_NOT_FOUND);

        //check task when user comment task to tasker one comment. If > one comment info error
        if (commentUser) {
            const alreadyReview = commentUser.comments.find(
                (review: any) => review.task.toString() === task._id.toString()
            );
            if (alreadyReview) {
                throw new HttpException(400, TASK_ALREADY_REVIEW_TO_USER);
            }
        }

        commentUser.comments.push(comment);
        //Function calulate total_rating, num_review of tasker when user rating tasker
        commentUser.num_review = commentUser.comments.length;
        //total rating
        commentUser.total_rating =
            Math.round(
                (commentUser.comments.reduce((acc: any, comment: any) => comment.rating + acc, 0) /
                    commentUser.comments.length) *
                    10
            ) / 10;

        task.is_rating = true;

        await commentUser.save();
        await task.save();

        return commentUser;
    }
}
