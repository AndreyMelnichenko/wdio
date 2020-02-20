import { Cookie, parse } from "set-cookie-parser";
import { IUser } from "src/models/User";
import { Client } from "../client/client";

class LoginAPI extends Client {
  private static pageUrl: string = "login?";

  public static async getLoginCoockies(user: IUser): Promise<Cookie[]> {
    const instance = super.create(super.getConfig());
    const data = JSON.stringify({
      password: user.password,
      email: user.email
    });
    const cookie = await instance
      .post(this.pageUrl, data)
      .then(res => parse(res.headers["set-cookie"]));
    return cookie;
  }
}

export { LoginAPI };
