import React, { useContext, useState, useRef } from "react";
import './App.css';
import MassaContext from "./context";
import { IContext } from "./massaPlugin";
import { DISABLED, NOT_INSTALLED } from "./massaPlugin/constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Web3 } from "./massaPlugin/MassaPlugin";
import { FileDrop } from 'react-file-drop';
import './uploader.css';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import type {} from '@mui/lab/themeAugmentation';
import { TNodeStatus, web3Client } from "./w3/client";
import { IContractData } from "@massalabs/massa-web3";
import TextField from '@mui/material/TextField';
import useAsyncEffect from "./utils/asyncEffect";
import isEqual from "lodash/isEqual";
import sortBy from "lodash/sortBy";

interface IProps {
  web3: Web3|null,
  accounts: Array<any>,
  error: Error|null,
  awaiting: boolean,
  openMassa: any
}

interface IState {
  txHash: string|undefined,
  deploymentError: Error|undefined
}

const MassaDappCore: React.FunctionComponent<IProps> = ({web3, accounts, error, awaiting, openMassa}: IProps): JSX.Element => {

  const fileInputRef = useRef(null);
  const [wasmFile, setWasmFile] = useState<File|null>(null);
  const [dappReady, setDappReady] = useState<boolean>(false);
  const [deploymentState, setDeploymentState] = useState<IState>({
    deploymentError: undefined,
    txHash: undefined,
  });
  const [nodeStatus, setNodeStatus] = useState<TNodeStatus>(null);

  useAsyncEffect(async () => {
    // NOTE: eventhough here we could use the injected web3, for this example, we are using the web3 client from the sdk directly
    try {
      const nodeStatus = await web3Client.publicApi().getNodeStatus();
      setNodeStatus(nodeStatus);
    } catch (error) {
      console.error(error);
      setDeploymentState({...deploymentState, deploymentError: error as Error});
    }
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

  const onDeployWasm = async () => {
      if (wasmFile && dappReady) {
        toast(`Deploying wasm...`);
        const binaryArrayBuffer = await wasmFile.arrayBuffer();
        const binaryFileContents = new Uint8Array(binaryArrayBuffer);
        const contractDataBase64: string = Buffer.from(binaryFileContents).toString("base64");
        try {
          const deployTxId = await web3?.massaProvider.contractWrapper.deploySmartContract({
            fee: 0,
            maxGas: 200000,
            gasPrice: 0,
            coins: 0,
            contractDataBase64
          } as IContractData);
          const deploymentOperationId = deployTxId ? deployTxId : null;
          if (!deploymentOperationId) {
            throw Error(`SC Deployment did not produce an operation ID. Please check your Node!`);
          }
          toast(`Wasm contract successfully deployed`);
          console.log(deploymentOperationId);
          setDeploymentState({...deploymentState, txHash: deploymentOperationId});
        } catch (err) {
          console.error(err);
          setDeploymentState({...deploymentState, deploymentError: error as Error});
        }
      }
  };
  
  if (error && error.message === NOT_INSTALLED) {
    return (
      <a href="https://massa.net/" target="_blank" rel="noopener noreferrer">
        Install Massa Browser Plugin
      </a>
    );
  } else if (error && error.message === DISABLED) {
    return <Button className="massa-button" variant="contained" onClick={openMassa}>Enable Massa Plugin</Button>
  } else if (error) {
    return <Button className="massa-button" type="button" onClick={openMassa}>{error.message}</Button>
  } else if (!web3 && awaiting) {
    return <Button className="massa-button" variant="contained" onClick={openMassa}>Massa Plugin loading...</Button>
  } else if (!web3) {
    return <Button className="massa-button" variant="contained" onClick={openMassa}>Please open and allow Massa Plugin</Button>
  } else if (accounts.length === 0) {
    return <Button className="massa-button" variant="contained" onClick={openMassa}>No Wallet</Button>
  } else {
    if (!dappReady) {
      toast(`Massa Web3 is enabled 🚀. Version ${web3.massaProvider.version}`);
      setDappReady(true);
    }
    return (
      <React.Fragment>
        <ToastContainer />
        {getNodeOverview(nodeStatus)}
        <FileDrop
              onDrop={(files: FileList|null, event: React.DragEvent<HTMLDivElement>) => {
                const loadedFile: File|null = files && files.length > 0 ? files[0] : null;
                setWasmFile(loadedFile);
              }}
              onTargetClick={(event) => {
                (fileInputRef.current as any).click();
              }}
          >
            { wasmFile ? `Uploaded wasm file: ${wasmFile.name}` : "Drop or select your wasm dapp file here!" }
        </FileDrop>
        <input
          onChange={(event) => {
            const { files } = event.target;
            const loadedFile: File|null = files && files.length > 0 ? files[0] : null;
            setWasmFile(loadedFile);
          }}
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
        />
        <LoadingButton className="massa-button"
                      variant="contained" 
                      color="primary" 
                      onClick={onDeployWasm}
                      disabled={!(wasmFile && dappReady)}>
                        Deploy wasm
        </LoadingButton>
        <TextField
          id="op-id"
          type="text"
          label="Operation Id"
          value={deploymentState.txHash || deploymentState.deploymentError?.message || ""}
          margin="normal"
          fullWidth
          disabled
          className="text-field"
        />
      </React.Fragment>
    );
  }
}

export default function MassaDappExample() {
  const { web3, accounts, error, awaiting, openMassa }: IContext = useContext(
    MassaContext,
  ) as IContext;

  const onOpenMassa = React.useCallback(
    (e: any) => openMassa(e),
    [openMassa]
  );

  return <MemoizedMassaDappCore web3={web3} accounts={accounts} error={error} awaiting={awaiting} openMassa={onOpenMassa}/>
}

const MemoizedMassaDappCore = React.memo(MassaDappCore, (prevProps: Readonly<IProps>, nextProps: Readonly<IProps>): boolean => {
  return isEqual(prevProps.web3, nextProps.web3) && isEqual(sortBy(prevProps.accounts), sortBy(nextProps.accounts));
});
