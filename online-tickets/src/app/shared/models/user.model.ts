export interface User {
    _id: string;
    userType: 'Admin' | 'Customer' | 'EventOrganizer' | string;
    name: string;
    username: string;
    birthdate: string;
    password: string;
}
