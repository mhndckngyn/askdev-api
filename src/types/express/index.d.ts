import { UserRole } from "@/types/user.type";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: UserRole;
      avatar?: string;
      token?: string;
    }

    interface Request {
      user?: User;
    }
  }
}
