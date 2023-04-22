//System
export const UNAUTHORIZED = { error_code: '900', error_message: 'unauthorized' };

export const TOKEN_EXPIRED = { error_code: '901', error_message: 'token expired' };

export const INVALID_TOKEN = { error_code: '902', error_message: 'Invalid token' };

// User Management, Tasker,Service,Task,Admin,Contact,Rating comment
export const AUTH_FAIL = { error_code: '1000', error_message: 'Invalid email or password.' };

export const USER_NOT_FOUND = { error_code: '1001', error_message: 'User is not found!' };

export const EMAIL_AND_PHONENUMBER_EXIST = { error_code: '1002', error_message: 'Email and Number is already exists!' };

export const EMAIL_ALREADY_EXIST = { error_code: '1003', error_message: 'Email is already exists!' };

export const PHONENUMBER_ALREADY_EXIST = { error_code: '1004', error_message: 'Phonenumber is already exists!' };

export const INVALID_PASSWORD = { error_code: '1005', error_message: 'Invalid password!' };

export const TASKER_NOT_FOUND = { error_code: '1006', error_message: 'Tasker is not found!' };

export const SERVICE_NOT_FOUND = { error_code: '1007', error_message: 'Service is not found!' };

export const TASK_NOT_FOUND = { error_code: '1008', error_message: 'Task is not found!' };

export const RATING_ALREADY_EXISTS = { error_code: '1009', error_message: 'Rateting comment is not found!' };

export const DELETE_HAS_A_TASK_USER = {
    error_code: '1010',
    error_message: 'User is not rejected task because tasker has give a task!'
};

export const INVALID_VERIFICATION_CODE = { error_code: '1011', error_message: 'Invalid verification token!' };

export const TASKER_GIVE_TASK = { error_code: '1012', error_message: 'Task is receive from another Tasker!' };

export const TASK_HASBEEN_DELETE = { error_code: '1013', error_message: 'Task has been cancelled!' };

export const ADMIN_NOT_FOUND = { error_code: '1014', error_message: 'Admin is not found!' };

export const INVALID_VERIFICATION_OTP_EXPRIED = { error_code: '1015', error_message: 'Verification otp has expired!' };

export const CONTACT_NOT_FOUND = { error_code: '1016', error_message: 'Contact info is not found!' };

export const EMAIL_IS_NOT_EXIST = { error_code: '1017', error_message: 'Email is not exist!' };

export const NOTIFICATION_NOT_FOUND = { error_code: '1018', error_message: 'Notification is not found!' };

export const TASKER_COMPLETE_TASK = {
    error_code: '1019',
    error_message: 'Can not update complete task because task is not give by tasker!'
};

export const TASKER_COMPLETE_TASK_PICTURES = {
    error_code: '1020',
    error_message: 'Tasker is not complete task because is not upload files!'
};

export const TASK_ALREADY_REVIEW_TO_USER = {
    error_code: '1021',
    error_message: 'Task is already reviewed!'
};

export const TASK_TIME_HAS_NOT_YET_BEEN_REACHED = {
    error_code: '1022',
    error_message: 'Is not rejected task because the task time has not yet been reached.'
};

export const SAME_THE_CHANGE_PASSWORD = {
    error_code: '1023',
    error_message: 'Can not change password because password_old is the same password_new.'
};

export const RATE_LIMIT_REQUEST = {
    error_code: '1024',
    error_message: 'You have exceeded 5 requests in the limit and have to wait another 24h to come back!'
};

export const TASKER_GIVE_TASK_REJECTED = {
    error_code: '1025',
    error_message: 'Task is not give because user is has rejected task!'
};

// // Validate
// export const PAGE_AND_LIMIT_MUST_BE_NUMBER = { error_code: 1100, error_message: 'Page and limit should be a numberic' };

// export const MUST_BE_EMAIL = { error_code: 1101, error_message: 'must be an email' };

// export const NOT_EMPTY = { error_code: 1102, error_message: 'should not be empty' };

// export const MUST_BE_STRING = { error_code: 1103, error_message: 'must be a string' };

// export const MUST_BE_NUMBER = { error_code: 1104, error_message: 'must be a number' };

// export const LENGTH_MUST_BEETWEEN_6_TO_16 = {
//     error_code: 1105,
//     error_message: 'must be between 6 to 50 characters'
// };

// export const MUST_BE_ARRAY = { error_code: 1106, error_message: 'must be an array' };

// export const EACH_VALUE_MUST_BE_A_STRING = { error_code: 1107, error_message: 'each value must be a string' };
