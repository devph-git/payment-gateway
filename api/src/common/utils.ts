import { plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { Logger } from '@nestjs/common';

const PTC = <T>(clazz: ClassType<T>, obj: object) => plainToClass(clazz, obj, { excludeExtraneousValues: true });

class loggerInterface<T> {
  clazz?: ClassType<T>;
  message: any;
}

const log = <T>({ clazz, message }: loggerInterface<T>) => {
  const log = new Logger(clazz ? clazz.name : null);
  log.debug(message);
};

export { PTC, log };
