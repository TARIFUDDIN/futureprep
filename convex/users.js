import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateUser = mutation({
    args: {
        name: v.string(),
        email: v.string()
    },
    handler: async (ctx, args) => {
        // Validate inputs
        if (!args.name || args.name.trim() === '') {
            throw new Error('Name is required');
        }
        
        if (!args.email || args.email.trim() === '') {
            throw new Error('Email is required');
        }

        console.log('CreateUser called with:', args);

        const userData = await ctx.db.query('users')
            .filter(q => q.eq(q.field('email'), args.email.trim())).collect();

        if (userData?.length == 0) {
            const data = {
                name: args.name.trim(),
                email: args.email.trim(),
                credit: 50000
            }
            
            console.log('Inserting new user:', data);
            const result = await ctx.db.insert('users', data);
            console.log('Insert result:', result);
            
            // Return the complete user object with the generated ID
            return {
                _id: result,
                ...data
            };
        }
        
        console.log('Returning existing user:', userData[0]);
        return userData[0];
    }
});

export const UpdateUserToken = mutation({
    args: {
        id: v.id('users'),
        credit: v.number(),
        orderId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const patchData = {
            credit: args.credit
        };

        if (args.orderId) {
            patchData.subscriptionId = args.orderId;
        }

        const result = await ctx.db.patch(args.id, patchData);
        
        return result;
    }
});