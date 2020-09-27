import { App, Construct } from '@aws-cdk/core';
import * as cdk from '@aws-cdk/core';
import { Construct as CoreConstruct } from '@aws-cdk/core';

const app = new App();

class ConstructClass {
  constructor(param: Construct) {
  }
}

class AccessibleConstructClass {
  constructor(public readonly param: Construct) {
  }
}

class ListConstructClass {
  constructor(param: Construct[]) {
  }
}

class EllipsesConstructClass {
  constructor(...param: Construct[]) {
  }
}

class AssignmentConstructClass {
  constructor(param: Construct = new Construct(app, 'a')) {
  }
}

class AccessibleAssignmentClass {
  constructor(private readonly param: Construct = new Construct(app, 'a')) {
  }
}