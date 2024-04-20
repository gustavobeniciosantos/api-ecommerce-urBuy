import fastify from "fastify"
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { registerUser } from "./routes/register-user";
import { loginUser } from "./routes/login-user";
import { registerAdmin } from "./routes/register-admin";
import { addProduct } from "./routes/add-product";
import { getProductList } from "./routes/get-product-list";
import { addToCart } from "./routes/add-to-cart";

export const app = fastify().withTypeProvider<ZodTypeProvider>()


app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler)

app.register(registerUser)
app.register(loginUser)
app.register(registerAdmin)
app.register(addProduct)
app.register(getProductList)
app.register(addToCart)

app.listen({port: 5050}).then(() =>{
    console.log('Server is running')
})