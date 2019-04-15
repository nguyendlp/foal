import { Class } from '../../core';
import { getMetadata } from '../../core/routes/utils';
import { IApiTag } from '../interfaces';

export function getTags(controllerClass: Class, propertyKey?: string): IApiTag[] | undefined {
  return getMetadata('api:document:tags', controllerClass, propertyKey);
}
