declare module 'express-ipfilter' {
  import express from 'express';

  function IpFilter(ips: string[], options: any): express.RequestHandler;

  export { IpFilter };
}

