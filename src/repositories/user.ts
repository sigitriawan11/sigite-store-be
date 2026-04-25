import { ErrBadRequest } from "../config/errors";
import { User } from "../databases/main.db";

export class UserRepository {
    static async findUserByEmailNotDeleted(email: string) {
        const user = await User.findOne({
            where: {
                email: email.toLowerCase(),
                deleted_at: null
            }
        })

        return user?.get({plain: true})
    }

    static async findUserByEmailNotDeletedAndActive(email: string) {
        const data = await User.scope("withPassword").findOne({
            where: {
                email: email.toLowerCase(),
                deleted_at: null
            }
        })

        const user = data?.get({plain: true})

        if(!user){
            throw new ErrBadRequest("Login failed. Please check your email and password.") 
        }

        if(user && !user?.is_active){
            throw new ErrBadRequest("User is inactive")
        }

        return user!
    }

    static async checkUserIfExistsByEmail(email: string) : Promise<void> {
        const data = await User.findOne({
            where: {
                email: email.toLowerCase(),
                deleted_at: null
            }
        })

        const user = data?.get({plain: true})

        if(user){
            throw new ErrBadRequest("Email is registered")
        }
    }
}