export async function softDelete(obj: any) {
    obj.tasker.is_deleted = true;
    obj.posted_user.is_deleted = true;
}
//Function filter data if is_active = true then filter data
export async function filterRegisters(obj: any) {
    obj.is_active = { $ne: true };
}

//function filter data if ivaild = true then filter data
export async function filterAllNoti(obj: any) {
    obj.isValidUser = { $ne: true };
    obj.type_notification.name.toString() === 'Notification vouncher all User';
}

//Function make generate code otp send email to user
export function makeToken(length: number) {
    let result = '';
    const characters = '01256987456693251786';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// //Function seup time auto delete document.
// export async function addMinutes(date: any, minutes: number) {
//     return await new Date(date.getTime() + minutes * 60000);
// }
