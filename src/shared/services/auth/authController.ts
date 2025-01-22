import { LOCAL_STORAGE_TOKEN_KEY } from '../../const/localStorage';
import { routes } from '../../const/router';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from '../../lib/utils/localStorage';
import { TokenSchema, TokenType } from '../../types/auth';
import { UserService } from '../user/userService';
import { AuthService } from './authService';

export class AuthController {
  authService: AuthService;
  userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    this.authService = authService;
    this.userService = userService;
  }

  private isTokenValid(data: unknown): data is TokenType {
    return TokenSchema.safeParse(data).success;
  }

  parseJwt = (token: string): TokenType => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  };

  authenticate = async (): Promise<void> => {
    await this.authService.login(this.processAuth);
  };

  logout = async (): Promise<void> => {
    await this.authService.logout();
    this.userService.clearUserData();
    removeLocalStorageItem(LOCAL_STORAGE_TOKEN_KEY);
  };

  private processAuth = async (): Promise<void> => {
    const token = this.authService.authRequest.result.data?.token;

    if (token) {
      const parsedToken = this.parseJwt(token);

      if (this.isTokenValid(parsedToken)) {
        setLocalStorageItem(LOCAL_STORAGE_TOKEN_KEY, token);
        await this.userService.fetchUser(parsedToken.sub);
        if (this.userService.getUserRequestStore.result.data) {
          window.history.pushState({}, '', routes.main());
        }
      }
    }
  };

  restoreSession = async (): Promise<void> => {
    const token = getLocalStorageItem(LOCAL_STORAGE_TOKEN_KEY);
    if (typeof token === 'string') {
      const parsedToken = this.parseJwt(token);

      if (this.isTokenValid(parsedToken)) {
        await this.userService.fetchUser(parsedToken.sub);
      }
    }
  };
}
