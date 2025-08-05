import { IQuerySearchParams } from '@interfaces/paginate.interface';
import _ from 'lodash';
import { validate } from 'uuid';
import uuidParser from 'uuid-parse';
import bcrypt from 'bcryptjs';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';

export const toUnderscored = obj => {
  _.forEach(obj, (k, v) => {
    obj[k] = v.replace(/(?:^|\.?)([A-Z])/g, (x, y) => `_${y.toLowerCase()}`).replace(/^_/, '');
  });
  return obj;
};

export const diffToString = val => {
  if (typeof val === 'undefined' || val === null) {
    return '';
  }
  if (val === true) {
    return '1';
  }
  if (val === false) {
    return '0';
  }
  if (typeof val === 'string') {
    return val;
  }
  if (!Number.isNaN(Number(val))) {
    return `${String(val)}`;
  }
  if ((typeof val === 'undefined' ? 'undefined' : typeof val) === 'object') {
    return `${JSON.stringify(val)}`;
  }
  if (Array.isArray(val)) {
    return `${JSON.stringify(val)}`;
  }
  return '';
};

export const isEmpty = (value: any): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (value === 'undefined' || value === undefined) {
    return true;
  } else return value !== null && typeof value === 'object' && !Object.keys(value).length;
};

export function formatPaginate(query: IQuerySearchParams): IQuerySearchParams {
  const defaultLimit = 1000;
  const order: string = query.order || 'DESC';
  const orderBy: string = query.orderBy || 'createdAt';
  const search: string = query.search || '';
  const limit = Number(query.limit) || defaultLimit;
  const offset = Number(query.offset) || 0;

  return { limit, offset, order, orderBy, search };
}

export function formatUsername(name: string): string {
  return name
    ? name
        .toLowerCase()
        .replace(/ /g, '_')
        .replace(/[^a-zA-Z0-9_ ]/g, '')
    : null;
}

export function isEmail(email: string): boolean {
  const emailRegexp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return email ? emailRegexp.test(email) : false;
}

export function getObjectDifference(a, b) {
  return _.reduce(
    a,
    function (result, value, key) {
      if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      }
      if (b[key] && typeof b[key] === 'object') {
        b[key] = JSON.stringify(b[key]);
      }
      return value == b[key] ? result : result.concat(key);
    },
    [],
  );
}

export function getArrayKeysDifference(a, b) {
  return _.reduce(
    b,
    function (result, value) {
      return a.includes(value) ? result : result.concat(value);
    },
    [],
  );
}

export function removeRequestUnwantedProperties(a: any, b: any) {
  const results = {};

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== undefined && b[a[i]] !== undefined) {
      results[a[i]] = b[a[i]];
    }
  }
  return results;
}





export const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1);

export const camelCaseToUpperCase = (text: string): string | null => {
  return _.upperFirst(_.startCase(text).toLowerCase());
};

export const formatErrorText = (errors: string[]): string[] => {
  return errors.map(err => camelCaseToUpperCase(err));
};





export const delay = ms => new Promise(res => setTimeout(res, ms));

export const convertJSONKeys = (object, keys, invert = true) => {
  const newObject = {};
  if (invert) {
    keys = _.invert(keys);
  }
  Object.entries(object).forEach((o: any[]) => {
    newObject[keys[o[0]] ?? o[0]] = o[1];
  });
  return newObject;
};

export const hexToUUID = (hexString, invalidStringMsg = '') => {
  if (validate(hexString)) {
    return hexString;
  }
  const parsedHexString = hexString.replace(new RegExp('^0x'), '');

  if (!/[0-9A-Fa-f]{6}/g.test(parsedHexString)) {
    throw new Error(invalidStringMsg || 'Value is not valid hexadecimal number');
  }
  //Allocate 16 bytes for the uuid bytes representation
  const hexBuffer = Buffer.from(parsedHexString, 'hex');

  //Parse uuid string representation and send bytes into buffer
  const uuidResultBuffer = uuidParser.unparse(hexBuffer);

  //Create uuid utf8 string representation
  return uuidResultBuffer.toString('utf8');
};





export const splitCamelCase = (string: string) => string.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ');

export async function hashToken(token, saltRounds = 10) {
  const hashedToken = await bcrypt.hash(token, saltRounds);
  // Encode the hashed token using base64 without '/'
  return hashedToken.replace(/\//g, '_');
}

export function hashSyncPassword(password, saltRounds = 10) {
  return bcrypt.hashSync(password, saltRounds);
}

export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function getDTOvalues(dto: any) {
  return Object.values(dto).filter(value => typeof value === 'string');
}



export class EnumHelpers {
  static getNamesAndValues<T extends number>(e: any) {
    return EnumHelpers.getNames(e).map(n => ({ id: n, name: n, value: e[n] as T }));
  }

  static getNames(e: any) {
    return EnumHelpers.getObjValues(e).filter(v => typeof v === 'string') as string[];
  }

  static getValues<T extends number>(e: any) {
    return EnumHelpers.getObjValues(e).filter(v => typeof v === 'number') as T[];
  }

  static getSelectList<T extends number, U>(e: any, stringConverter: (arg: U) => string) {
    const selectList = new Map<T, string>();
    this.getValues(e).forEach(val => selectList.set(val as T, stringConverter(val as unknown as U)));
    return selectList;
  }

  static getSelectListAsArray<T extends number, U>(e: any, stringConverter: (arg: U) => string) {
    return Array.from(this.getSelectList(e, stringConverter), value => ({
      value: value[0] as T,
      presentation: value[1],
    }));
  }

  private static getObjValues(e: any): (number | string)[] {
    return Object.keys(e).map(k => e[k]);
  }
}



export function generateSwaggerSchemaFromDTO(dtoClass: any): any {
  const className = dtoClass.name;
  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
  });

  return schemas[className] || null;
}
