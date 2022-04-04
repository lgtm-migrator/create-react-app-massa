import React, { useEffect, useState } from 'react';
import './App.css';
import {ClientFactory, INodeStatus, IAccount, DefaultProviderUrls} from "massa-web3";

const baseAccount = {
  publicKey: "5Jwx18K2JXacFoZcPmTWKFgdG1mSdkpBAUnwiyEqsVP9LKyNxR",
  privateKey: "2SPTTLK6Vgk5zmZEkokqC3wgpKgKpyV5Pu3uncEGawoGyd4yzC",
  address: "9mvJfA4761u1qT8QwSWcJ4gTDaFP5iSgjQzKMaqTbrWCFo1QM"
} as IAccount;

type TNodeStatus = INodeStatus | null;

const web3Client = ClientFactory.createDefaultClient(DefaultProviderUrls.TESTNET, false, baseAccount);

function App() {

  const [nodeStatus, setNodeStatus] = useState<TNodeStatus>(null);

  const getNodeStatusAsync = async () => {
    try {
      const nodeStatus: INodeStatus = await web3Client.publicApi().getNodeStatus();
      setNodeStatus(nodeStatus);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getNodeStatusAsync();
  }, []);

  return (
    <div className="App">
      Massa Node status:
      {nodeStatus ? JSON.stringify(nodeStatus, null, 2) : "Network status unavailable"}
    </div>
  );
}

export default App;
