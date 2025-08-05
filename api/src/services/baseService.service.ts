import { Model } from 'mongoose';
import { HttpError } from '@exceptions/http/HttpError';

class BaseService {
  protected model: Model<any>;

  constructor(model?: Model<any>) {
    this.model = model;
  }

  public setDependencies(dependencies: Record<string, any>): void {
    Object.assign(this, dependencies);
  }

  public async findAll(options: any = {}): Promise<any[]> {
    try {
      const { limit = 50, offset = 0, sort = { createdAt: -1 }, ...query } = options;
      return await this.model.find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit);
    } catch (error) {
      throw new HttpError({ message: 'Error finding records', errors: error });
    }
  }

  public async findById(id: string): Promise<any | null> {
    try {
      return await this.model.findOne({ id });
    } catch (error) {
      throw new HttpError({ message: 'Error finding record by ID', errors: error });
    }
  }

  public async find(options: any = {}): Promise<any | null> {
    try {
      return await this.model.findOne(options);
    } catch (error) {
      throw new HttpError({ message: 'Error finding record', errors: error });
    }
  }

  public async create(data: any): Promise<any | null> {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw new HttpError({ message: 'Error creating record', errors: error });
    }
  }

  public async edit(query: any, data: any): Promise<any | null> {
    try {
      return await this.model.findOneAndUpdate(
        query,
        { $set: data },
        { new: true }
      );
    } catch (error) {
      throw new HttpError({ message: 'Error updating record', errors: error });
    }
  }

  public async findAndEdit(query: any, data: any): Promise<any | null> {
    try {
      const doc = await this.model.findOne(query);
      if (!doc) {
        throw new Error('Record not found');
      }
      Object.assign(doc, data);
      return await doc.save();
    } catch (error) {
      throw new HttpError({ message: 'Error finding and updating record', errors: error });
    }
  }

  public async delete(query: any): Promise<boolean> {
    try {
      const result = await this.model.deleteOne(query);
      return result.deletedCount > 0;
    } catch (error) {
      throw new HttpError({ message: 'Error deleting record', errors: error });
    }
  }

  public async findAndDelete(query: any): Promise<any | null> {
    try {
      return await this.model.findOneAndDelete(query);
    } catch (error) {
      throw new HttpError({ message: 'Error finding and deleting record', errors: error });
    }
  }

  public async count(query: any = {}): Promise<number> {
    try {
      return await this.model.countDocuments(query);
    } catch (error) {
      throw new HttpError({ message: 'Error counting records', errors: error });
    }
  }

  public async findAndCountAll(options: any = {}): Promise<{ count: number; rows: any[] }> {
    try {
      const { limit = 50, offset = 0, sort = { createdAt: -1 }, ...query } = options;
      const [count, rows] = await Promise.all([
        this.model.countDocuments(query),
        this.model.find(query)
          .sort(sort)
          .skip(offset)
          .limit(limit)
      ]);
      return { count, rows };
    } catch (error) {
      throw new HttpError({ message: 'Error finding and counting records', errors: error });
    }
  }
}

export default BaseService;
