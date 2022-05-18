export interface MassaProvider {
    // root methods
    enable: (toggle: boolean) => void,
    version: string,
    enabled: boolean,

    // client methods
    contractWrapper: IContractWrapper,
    walletWrapper: IWalletWrapper,
}
export interface IContractWrapper {
    deploySmartContract: (contractData: any) => Promise<string>;
}
export interface IWalletWrapper {
    getBaseAccount: () => Promise<any>;
    walletInfo: () => Promise<Array<any>>;
}