import mongoose, { Schema } from 'mongoose';
import { softDelete } from '../lib/helper';
import { IFTask } from '../interfaces/task.interface';
import { Tasker } from '../models/tasker.model';

const TaskSchema = new Schema({
    address: {
        lat: {
            type: String
        },
        long: {
            type: String
        },
        sub_name: {
            type: String
        },
        name: { type: String },
        location: { type: String }
    },
    // location_gps: {
    //     lat: {
    //         type: String
    //     },
    //     long: {
    //         type: String
    //     }
    // },
    // address: {
    //     type: String
    // },
    start_time: {
        type: Number
    },
    end_time: {
        type: Number
    },
    estimate_time: {
        type: String
    },
    date: {
        type: Number
    },
    note: {
        type: String
    },
    status: {
        type: Number,
        default: 0,
        enum: [0, 1, 2, 3] // 0: waiting,1:accepted,2:success,3:rejected
    },
    language: {
        type: Number,
        default: 1,
        enum: [1, 2, 3, 4]
    },
    failure_reason: {
        reason: {
            type: String
        },
        user: {
            _id: Schema.Types.ObjectId,
            name: String
        },
        tasker: {
            _id: Schema.Types.ObjectId,
            name: String
        }
    },
    total_price: {
        type: Number
    },
    posted_user: {
        _id: {
            type: Schema.Types.ObjectId
        },
        name: {
            type: String
        },
        phoneNumber: {
            type: String
        },
        address: {
            type: String
        },
        email: {
            type: String
        },
        avatar: {
            type: String
        },
        fcm_token: [
            {
                type: String
            }
        ]
    },
    tasker: {
        _id: {
            type: Schema.Types.ObjectId
        },
        name: {
            type: String
        },
        phoneNumber: {
            type: String
        },
        address: {
            type: String
        },
        email: {
            type: String
        },
        avatar: {
            type: String
        },
        created_time: {
            type: Number
        },
        updated_time: {
            type: Number
        },
        fcm_token: [
            {
                type: String
            }
        ]
    },
    selected_option: [
        {
            _id: {
                type: String
            },
            name: {
                type: String
            },
            price: {
                type: Number
            },
            quantity: {
                type: Number
            },
            note: {
                type: String
            }
        }
    ],
    service: {
        _id: {
            type: Schema.Types.ObjectId
        },
        translation: [
            {
                language: { type: String },
                name: { type: String }
            }
        ],
        name: {
            type: String
        },
        options: [
            {
                _id: {
                    type: Schema.Types.ObjectId
                },
                name: {
                    type: String
                },
                price: {
                    type: Number
                },
                quantity: {
                    type: Number
                },
                note: {
                    type: String
                },
                is_selected: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        payments: [
            {
                name: {
                    type: String
                },
                is_active: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        option_type: {
            type: Number
        },
        img: {
            type: String
        }
    },
    is_rating: {
        type: Boolean,
        default: false
    },
    type_home: {
        type: Number,
        enum: [0, 1, 2]
    },
    check_list: [
        {
            name: {
                type: String
            },
            status: {
                type: Boolean,
                default: false
            }
        }
    ],
    list_pictures_before: [
        {
            type: String
        }
    ],
    list_pictures_after: [
        {
            type: String
        }
    ],
    user_deleted: {
        type: Boolean
    },
    tasker_deleted: {
        type: Boolean
    },
    admin_deleted: {
        type: Boolean
    },
    created_time: {
        type: Number
    },
    updated_time: {
        type: Number
    }
});

/**
 * Function delete software is database
 * @return
 */
TaskSchema.methods.softDelete = async function () {
    softDelete(this);
    await this.save();
};

/**
 * Function updated time when api update task
 */
TaskSchema.pre('findOneAndUpdate', function () {
    const data: any = this.getUpdate();
    data.updated_time = Date.now();
});

// ///Funtion sync data when update data to Tasker
// async function syncDataWhenUpdate(doc: any) {
//     await Tasker.updateMany({ 'task.tasker': doc._id }, { $set: { task: doc } });
// }

// //Function update data tasker in Task when update data to Tasker
// TaskSchema.post('findOneAndUpdate', function (doc) {
//     syncDataWhenUpdate(doc);
// });

export const Task = mongoose.model<IFTask>('Task', TaskSchema);
