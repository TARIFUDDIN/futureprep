import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateUser = mutation({
    args: {
        name: v.string(),
        email: v.string()
    },
    handler: async (ctx, args) => {
        const userData = await ctx.db.query('users')
            .filter(q => q.eq(q.field('email'), args.email)).collect();

        if(userData?.length == 0) {
            const data = {
                name: args.name,
                email: args.email,
                credit: 50000
            }
            const result = await ctx.db.insert('users', {...data});
            console.log(result);
            return data;
        }
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