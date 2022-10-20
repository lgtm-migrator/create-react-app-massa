import React, { useState, useRef } from "react";
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FileDrop } from 'react-file-drop';
import LoadingButton from '@mui/lab/LoadingButton';
import type {} from '@mui/lab/themeAugmentation';
import { Client, ClientFactory, DefaultProviderUrls, IAccount, IContractData, INodeStatus, WalletClient } from "@massalabs/massa-web3";
import TextField from '@mui/material/TextField';
import useAsyncEffect from "./utils/asyncEffect";

const baseAccountSecretKey: string = "S13iFJarF4v6CxYPeguUQHqkxDdGZgFhrsiEMznbnS3is9aXFps";

interface IState {
  txHash: string|undefined,
  deploymentError: Error|undefined
}
interface IProps {}

export const MassaDappCore: React.FunctionComponent<IProps> = (): JSX.Element => {

  const fileInputRef = useRef(null);
  const [wasmFile, setWasmFile] = useState<File|null>(null);
  const [web3Client, setWeb3Client] = useState<Client|null>(null);
  const [deploymentState, setDeploymentState] = useState<IState>({
    deploymentError: undefined,
    txHash: undefined,
  });
  const [nodeStatus, setNodeStatus] = useState<INodeStatus|null>(null);

  useAsyncEffect(async () => {
    try {
      const baseAccount: IAccount = await WalletClient.getAccountFromSecretKey(baseAccountSecretKey);
      const web3Client = await ClientFactory.createDefaultClient(DefaultProviderUrls.TESTNET, true, baseAccount);
      const nodeStatus = await web3Client.publicApi().getNodeStatus();
      setWeb3Client(web3Client);
      setNodeStatus(nodeStatus);
    } catch (error) {
      console.error(error);
      setDeploymentState({...deploymentState, deploymentError: error as Error});
    }
  }, []);

  const getNodeOverview = (nodeStatus: INodeStatus|null): JSX.Element => {
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
    if (!web3Client) {
      return;
    }
      if (wasmFile) {
        toast(`Deploying wasm...`);
        const binaryArrayBuffer = await wasmFile.arrayBuffer();
        const binaryFileContents = new Uint8Array(binaryArrayBuffer);
        const contractDataBase64: string = Buffer.from(binaryFileContents).toString("base64");
        try {
          const deployTxId = await web3Client.smartContracts().deploySmartContract({
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
          setDeploymentState({...deploymentState, txHash: deploymentOperationId[0]});
        } catch (err) {
          console.error(err);
          setDeploymentState({...deploymentState, deploymentError: err as Error});
        }
      }
  };

  return (
    <React.Fragment>
      <ToastContainer />
      {getNodeOverview(nodeStatus)}
      <hr />
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
                    disabled={!wasmFile}>
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
        color="primary"
      />
    </React.Fragment>
  );
}