import React, { useState } from 'react';
import './App.css';
import massa from './massa_logo.png'
import MassaContext from './context';
import MassaDappExample from './MassaDappExample';
import { TNodeStatus, web3Client } from './w3/client';
import useAsyncEffect from './utils/asyncEffect';

const App: React.FC = () => {
  const [nodeStatus, setNodeStatus] = useState<TNodeStatus>(null);

  useAsyncEffect(async () => {
    const nodeStatus = await web3Client.publicApi().getNodeStatus();
    setNodeStatus(nodeStatus);
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
          <MassaDappExample />
        </header>
      </MassaContext.Provider>
    </div>
  );
}

export default App;
