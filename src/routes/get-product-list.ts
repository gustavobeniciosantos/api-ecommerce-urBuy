import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { NotAuthorized } from "./_errors/not-authorized";
import { JwtPayload } from "jsonwebtoken";
import jwt from 'jsonwebtoken';
import { prisma } from "../lib/prisma";


interface MyJwtPayload extends JwtPayload {
    username: string;
    isAdmin: boolean;
}

export async function getProductList(app: FastifyInstance) {

    app.withTypeProvider<ZodTypeProvider>()
        .get('/products/get-products', {
            schema: {
                response: {
                    200: z.object({
                        products: z.array(z.object({
                            productName: z.string(),
                            price: z.number(),
                            description: z.string(),
                            unit: z.number().int()
                        }))
                    })
            }
            }
            
        }, async (request, reply) => {

            const { authorization } = request.headers

            if (!authorization) {
                throw new Error('Token not provided');
            }

            const token = authorization.split(' ')[1]


            const { username, isAdmin } = jwt.verify(token, 'secret') as MyJwtPayload

            if (!isAdmin.valueOf() == true) {
                throw new NotAuthorized('User is not authorized to get the products')
            }



            
            const products = await prisma.product.findMany({
                select: {
                    productName: true,
                    description: true,
                    price: true,
                    unit: true,  
                }
            })
            reply.status(200).send({ 
                products: products.map(product => {
                    return {
                        productName: product.productName,
                        description: product.description,
                        price: Number(product.price),
                        unit: product.unit,
                    }
                }) 
            })
            

        })

}