import { HttpStatus } from "../enums";

class ApiResponse {
    success: boolean;
    data?: {};
    message?: string;
    fetchedResultCount?: number;

    constructor(statusCode: number, data?: {}, message?: string, fetchedResultCount?: number) {
        this.success = statusCode < HttpStatus.BAD_REQUEST ? true : false;
        this.data = data;
        this.message = message;
        this.fetchedResultCount = fetchedResultCount;
    }
}

export { ApiResponse };
