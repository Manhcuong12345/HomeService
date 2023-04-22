export {};

declare global {
    namespace Express {
        interface User {
            _id: string;
            name: string;
            email: string;
            type: string;
        }
        interface Request {
            tasker: {
                _id: string;
                name: string;
                email: string;
                type: string;
            };
            admin: {
                _id: string;
                name: string;
                email: string;
                type: string;
            };
        }
    }
}
