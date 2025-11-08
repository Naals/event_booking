export interface User {
    username: string;
    email: string;
}

export interface Event {
    name: string;
    total_seats: number;
}

export interface BookingRequest {
    event_id: number;
    user_id: number;
}
