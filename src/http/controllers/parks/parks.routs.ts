import { FastifyInstance } from "fastify";
import { add } from "./add-park.controller.js";

export async function parkRouts(app: FastifyInstance) {
    app.post('/add', add)
}