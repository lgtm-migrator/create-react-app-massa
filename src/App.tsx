import React, { useEffect, useState } from 'react';
import './App.css';
import massa from './massa_logo.png'
import {ClientFactory, INodeStatus, IAccount, DefaultProviderUrls} from "@massalabs/massa-web3";
import MassaContext from './context';
import MassaButton from './MassaButton';

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

  const getNodeOverview = (nodeStatus?: TNodeStatus): JSX.Element => {
    if (!nodeStatus) {
      return <React.Fragment>"Getting Massa's Node Status..."</React.Fragment>;
    }
    return (<React.Fragment>
      Massa Net Version: {nodeStatus?.version}
      <br />
      Massa Net Node Id: {nodeStatus?.node_id}
      <br />
      Massa Net Node Ip: {nodeStatus?.node_ip}
      <br />
      Massa Net Time:    {nodeStatus?.current_time}
      <br />
      Massa Net Cycle: {nodeStatus?.current_cycle}
      <br />
      </React.Fragment>)
  }

  return (
    <div className="App">
      <MassaContext.Provider value={null}>
        <header className="App-header">
          <img src={massa} className="App-logo" alt="logo"/>
          {getNodeOverview(nodeStatus)}
          <MassaButton />
        </header>
      </MassaContext.Provider>
    </div>
  );
}

export default App;
