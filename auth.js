import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import mongoClientPromise from "./database/mongoClientPromise";
import { userModel } from "./models/user-model";


export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(mongoClientPromise, { databaseName: process.env.ENVIRONMENT }),
    session:{
        strategy: "jwt",
    },

    providers: [
        CredentialProvider({
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                if (credentials === null) return null;

                try {
                    const user = await userModel.findOne({ email: credentials.email })
                    if (user) {
                        const isMatch = user.email === credentials.email;
                        if (isMatch) {
                            return user;
                        } else {
                            throw new Error("Email or Password is mismatch!");
                        }
                    } else {
                        throw new Error("User Not Found!");

                    }
                } catch (error) {
                    throw new Error(error);
                }

            },
        }),
        
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
})