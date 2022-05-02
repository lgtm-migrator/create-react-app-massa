import { waitWithTimeout } from ".";
import * as constants from "./constants";
import { MassaProvider } from "./types";

declare global {
  interface Window {
      massa: MassaProvider;
  }
}

export class Web3 {
  constructor(massaProvider: MassaProvider, options: Object) {
    // some more settings could be done here
    this.massaProvider = massaProvider;
  }
  public massaProvider: MassaProvider;
}

export default class MassaPlugin {

  constructor(provider: MassaProvider, options: Object) {
    if (!provider) {
      throw new Error(constants.MISSING_PROVIDER);
    }
    this.web3 = new Web3(provider, options);
  }

  private web3: Web3;

  public async getWeb3(): Promise<Web3>  {
    return this.web3;
  }

  static async initialize(options: Object): Promise<MassaPlugin> {
    const massaWeb3WindowObject = await MassaPlugin.getWeb3();
    return new MassaPlugin(massaWeb3WindowObject, options);
  }

  static hasWeb3(): boolean {
    const hasWeb3 = typeof window !== "undefined" && typeof window.massa !== "undefined";
    return (
      hasWeb3
    );
  }

  static async getWeb3(): Promise<MassaProvider> {
    // await the window.massa script to be injected!
    await waitWithTimeout(3000);
    if (window.massa) {
      return window.massa as MassaProvider;
    } else {
      throw new Error(constants.NOT_INSTALLED);
    }
  }
}
