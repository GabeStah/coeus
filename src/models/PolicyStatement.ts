export interface IPolicyStatement {
  action: Array<string> | string;
  allow?: boolean;
  resource: Array<string> | string;
}

export class PolicyStatement implements IPolicyStatement {
  action: Array<string> | string;
  allow?: boolean = true;
  resource: Array<string> | string;

  public matchesServiceMethod({
    method,
    service
  }: {
    method: string;
    service: string;
  }) {
    if (typeof this.action === 'string') {
      // const actionSplit = statement.action.split(':');
    } else {
    }
  }
}
