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

export async function addToCart(app:FastifyInstance) {

    app.withTypeProvider<ZodTypeProvider>()
    .post('/add-to-cart',{
       schema:{
        body: z.object({
            productName: z.string(),
        }),
        response:{
            201: z.object({
                userID: z.string().uuid(),
                productID: z.string().uuid(),
                createdAt: z.date(),
                message: z.string()
                
            }),
            400: z.object({
                message: z.string()
            })
        }
       }
    }, 
    async (request, reply) => {

        const { authorization } = request.headers

        if (!authorization) {
            throw new Error('Token not provided');
        }

        const token = authorization.split(' ')[1]
        const { username, isAdmin } = jwt.verify(token, 'secret') as MyJwtPayload

        if (isAdmin) {
            throw new NotAuthorized('User is not authorized to add a product')
        }

        const {productName} = request.body

        const user = await prisma.user.findUnique({ where: { username: username } });
        const product = await prisma.product.findUnique({ where: { productName: productName } });


        if(user && product){
            const existingCartItems = await prisma.cartItem.findMany({
                where: {
                    AND: [
                        { userId: user.id },
                        { productId: product.id }
                    ]
                }
            });
        
            if(existingCartItems.length > 0) {
                // Se o item já existe no carrinho, atualize a quantidade
                await prisma.cartItem.update({
                    where: {
                        id: existingCartItems[0].id
                    },
                    data: {
                        quantity: {
                            increment: 1
                        }
                    }
                });
            } else {
                // Se o item não existe no carrinho, crie um novo
                await prisma.cartItem.create({
                    data:{
                        quantity: 1, // Defina a quantidade conforme necessário
                        userId: user.id,
                        productId: product.id
                    }
                });
            }
        
            return reply.status(201).send({ 
                message: 'Product added to cart',
                userID: user.id,
                productID: product.id,
                createdAt: new Date()
            })
        } else {
            return reply.status(400).send({ message: 'User or product not found' })
        }
        
    })
}
