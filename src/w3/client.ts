import { ClientFactory, DefaultProviderUrls, IAccount, INodeStatus } from "@massalabs/massa-web3";

const baseAccount = {
    publicKey: "5Jwx18K2JXacFoZcPmTWKFgdG1mSdkpBAUnwiyEqsVP9LKyNxR",
    privateKey: "2SPTTLK6Vgk5zmZEkokqC3wgpKgKpyV5Pu3uncEGawoGyd4yzC",
    address: "9mvJfA4761u1qT8QwSWcJ4gTDaFP5iSgjQzKMaqTbrWCFo1QM"
} as IAccount;
  
export type TNodeStatus = INodeStatus | null;

export const web3Client = ClientFactory.createDefaultClient(DefaultProviderUrls.LABNET, false, baseAccount);