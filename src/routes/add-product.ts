import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import jwt from 'jsonwebtoken';
import { prisma } from "../lib/prisma";

import { JwtPayload } from 'jsonwebtoken';
import { Prisma } from "@prisma/client";
import { NotAuthorized } from "./_errors/not-authorized";

interface MyJwtPayload extends JwtPayload {
    username: string;
    isAdmin: boolean;
}

export async function addProduct(app: FastifyInstance) {

    app.withTypeProvider<ZodTypeProvider>()
        .post('/product/add-product', {
            schema: {
                body: z.object({
                    productName: z.string(),
                    price: z.number(),
                    description: z.string(),
                    unit: z.number().int(),
                }),
                response: {
                    201: z.object({
                        productId: z.string().optional(),
                        message: z.string()
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
                throw new NotAuthorized('User is not authorized to add a product')
            }

            const { productName, price, description, unit } = request.body;

            const existingProduct = await prisma.product.findUnique({
                where:{
                    productName,
                }
            })

            if(existingProduct){
                await prisma.product.update({
                    where:{
                        productName
                    },
                    data:{ 
                        unit:{
                        increment: 1
                    }}
                })

                const newUnit = await prisma.product.findUnique({
                    where:{
                        productName,
                    }
                })
                
                return reply.status(200).send({message: `Novo produto adicionado: ${productName}, nova quantidade: ${newUnit?.unit}`              
                })
            }else{
                const products = await prisma.product.create({
                    data: {
                        productName,
                        price,
                        description,
                        unit
                    } as Prisma.ProductCreateInput
                });
    
                return reply.status(201).send({ productId: products.id, message: 'created' })
            }

            
        })
}
