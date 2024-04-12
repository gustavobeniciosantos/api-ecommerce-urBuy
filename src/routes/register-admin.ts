import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {z} from "zod";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcrypt';



export async function registerAdmin(app:FastifyInstance) {
    
    app
    .withTypeProvider<ZodTypeProvider>()
    .post('/register/admin', {

        schema: {
            body: z.object({
                name: z.string(),
                username: z.string().min(5),
                email: z.string().email(),
                password: z.string().min(8),
            }),
            response: {
                201: z.object({
                    userId: z.string().uuid(),
                    isAdmin: z.boolean() // retorna na Response o ID do usuário
                })
            }
        }
        


    }, async (request, reply) =>{
            const  {name, username, email, password} = request.body

            const usernameExists = await prisma.user.findUnique({
                where: { username }
              });
              
              const emailExists = await prisma.user.findUnique({
                where: { email }
              })

              
              if(usernameExists ){
                throw new Error('E-mail already registered')
              } else if(emailExists){
                throw new Error('Username already registered')
              }

              const hashedPassword = await bcrypt.hash(password, 10)

              const user = await prisma.user.create({
                data:{
                    name,
                    username,
                    email,
                    password: hashedPassword,
                    isAdmin: true
                }
              })
                return reply.status(201).send({userId: user.id, isAdmin: user.isAdmin})
    })

}