export abstract class AppError extends Error {
  abstract readonly statusCode: number
}
