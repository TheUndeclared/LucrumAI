import { HttpError } from '@exceptions/http/HttpError';
import BaseService from './baseService.service';
import { User } from '../database/mongodb/models/user.model';

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  /**
   * Retrieves a user by ID.
   *
   * @param {string} id - The ID of the user.
   * @returns {Promise<any>} - The user.
   * @throws {HttpError} - If the user could not be retrieved.
   */
  public getById = async (
    id: string,
  ): Promise<any> => {
    try {
      return await User.findOne({ id });
    } catch (error) {
      throw new HttpError({ message: 'ERROR_MESSAGE.USER.ERROR.COULD_NOT_GET_USER_BY_ID', errors: error });
    }
  };
}

export default UserService;
