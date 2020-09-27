import { Construct } from 'constructs';

class ConstructClass {
  constructor(param: Construct) {
  }
}

class PrimitiveClass {
  constructor(param: string) {
  }
}

class PrimitiveArrayClass {
  constructor(param: string[]) {
  }
}

class PrimitiveEllipsesClass {
  constructor(...param: string[]) {
  }
}

class AccessibleParameterClass {
  constructor(private readonly options: string = '') {
  }
}