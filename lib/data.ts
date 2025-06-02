import { brandConfig } from "./brand";

// user data 
const users = [
  {
    name: brandConfig.shortName,
    email: brandConfig.email,
    password: "password",
    image: '/images/users/user-1.jpg',
  },
  
]

export type User = (typeof users)[number]

export const getUserByEmail = (email: string) => {
  return users.find((user) => user.email === email)
}