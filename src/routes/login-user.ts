import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'




export async function loginUser(app:FastifyInstance) {

    app
    .withTypeProvider<ZodTypeProvider>()
    .post('/login',{

        schema: {
            body: z.object({
                username: z.string(),
                password: z.string(),
            }),
            response:{
                200: z.object({
                    userId: z.string().uuid(),
                    message: z.string(),
                    token: z.string()
                })
            }
        }
    },async (request, reply)=>{

        const {username, password} = request.body

        const user = await prisma.user.findUnique({
            where:{
                username
            }
        })


        if(!user)
            throw new Error('User not found')



        const validPassword = await bcrypt.compare(password, user.password)

        if(!validPassword)
            throw new Error('Invalid password')

        const token = jwt.sign({ username: user.username, isAdmin: user.isAdmin }, 'secret', { expiresIn: '1h' });


        return reply.status(200).send({userId: user.id, message: 'User loggedin', token})
        
    })

    
}