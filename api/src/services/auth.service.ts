import config from '@config';
import jwt from 'jsonwebtoken';
import BaseService from '@services/baseService.service';
import { User } from '../database/mongodb/models/user.model';
import { ethers } from 'ethers';
import { HttpUnauthorized } from '@exceptions/http/HttpUnauthorized';

const { secret, validMins } = config.auth;

class AuthService extends BaseService {
  private readonly MESSAGE = 'Welcome to SolTradeAI! Sign this message to login.';

  /**
   * Generates a JWT token for the given user.
   * @param user - The user object to be included in the token.
   * @returns A JWT token as a string.
   */
  public createToken(user: any): string {
    return jwt.sign(user, secret, {
      expiresIn: `${validMins}m`,
      issuer: config.auth.issuer,
    });
  }

  public async verifySignature(walletAddress: string, signature: string): Promise<any> {
    try {
      const signerAddr = await ethers.utils.verifyMessage(this.MESSAGE, signature);

      const normalizedSignerAddr = signerAddr.toLowerCase();
      const normalizedWalletAddr = walletAddress.toLowerCase();

      if (normalizedSignerAddr !== normalizedWalletAddr) {
        throw new HttpUnauthorized('Invalid signature - addresses do not match');
      }

      try {
        // Use MongoDB findOneAndUpdate with upsert option
        const user = await User.findOneAndUpdate(
          { wallet_address: normalizedWalletAddr },
          { wallet_address: normalizedWalletAddr },
          { upsert: true, new: true }
        );

        const token = this.createToken({
          id: user.id,
          wallet_address: user.wallet_address,
        });

        return { token, user };
      } catch (dbError) {
        throw new Error('Failed to create user or token');
      }
    } catch (error) {
      if (error instanceof HttpUnauthorized) {
        throw error;
      }
      throw new HttpUnauthorized('Invalid signature');
    }
  }
}

export default AuthService;
