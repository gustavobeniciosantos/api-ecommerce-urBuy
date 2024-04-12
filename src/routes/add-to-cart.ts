import { FastifyInstance } from "fastify";
import z from "zod";

export async function addToCart(app:FastifyInstance) {

    app.post('/add-to-cart',{
       schema:{
        body: z.object({
            productName: z.string(),
            quantity: z.number().int()
        })
       }
    }, 
    async (request, reply) => {

    })
}