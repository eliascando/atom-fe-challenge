export interface UserProfile {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface UserSession {
    token: string;
    user: UserProfile;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterUserInput extends LoginInput {
    name: string;
}
