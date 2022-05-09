import React, { useContext, useState } from "react";
import './App.css';
import MassaContext from "./context";
import { IContext } from "./massaPlugin";
import { NOT_INSTALLED } from "./massaPlugin/constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Web3 } from "./massaPlugin/MassaPlugin";
import { FileDrop } from 'react-file-drop';
import './uploader.css';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import type {} from '@mui/lab/themeAugmentation';
import { baseAccount, web3Client } from "./w3/client";
import { IContractData } from "@massalabs/massa-web3";
const _ = require('lodash');

const MASSA_PLUGIN_VERSION = "v1.0"; // TODO: must come from the library

interface IProps {
  web3: Web3|null,
  error: Error|null,
  awaiting: boolean,
  openMassa: any
}

const MassaDappCore: React.FunctionComponent<IProps> = ({web3, error, awaiting, openMassa}: IProps): JSX.Element => {

  const [wasmFile, setWasmFile] = useState<File|null>(null);
  const [dappReady, setDappReady] = useState<boolean>(false);

  const onDeployWasm = async () => {
      if (wasmFile && dappReady) {
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
          } as IContractData, baseAccount);
          const deploymentOperationId = deployTxId[0];
          toast(`Wasm contract successfully deployed`);
          console.log(deploymentOperationId);
        } catch (err) {
          console.error(err);
        }
      }
  };
  
  if (error && error.message === NOT_INSTALLED) {
    return (
      <a href="https://massa.net/" target="_blank" rel="noopener noreferrer">
        Install Massa Browser Plugin
      </a>
    );
  } else if (error) {
    return <Button className="massa-button" type="button" onClick={openMassa}>{error.message}</Button>
  } else if (!web3 && awaiting) {
    return <Button className="massa-button" variant="contained" onClick={openMassa}>Massa Plugin loading...</Button>
  } else if (!web3) {
    return <Button className="massa-button" variant="contained" onClick={openMassa}>Please open and allow Massa Plugin</Button>
  } else {
    if (!dappReady) {
      toast(`Massa Web3 is enabled 🚀. Version ${MASSA_PLUGIN_VERSION}`);
      setDappReady(true);
    }
    return (
      <React.Fragment>
        <ToastContainer />
        <FileDrop
              onDrop={(files: FileList|null, event: React.DragEvent<HTMLDivElement>) => {
                const loadedFile: File|null = files && files.length > 0 ? files[0] : null;
                console.log("Loaded File ", loadedFile);
                setWasmFile(loadedFile);
              }}
          >
            { wasmFile ? `Uploaded wasm file: ${wasmFile.name}` : "Drop your wasm dapp file here!" }
        </FileDrop>
        <LoadingButton className="massa-button" variant="contained" color="primary" onClick={onDeployWasm}>Deploy wasm</LoadingButton>
      </React.Fragment>
    );
  }
}

export default function MassaDappExample() {
  const { web3, error, awaiting, openMassa }: IContext = useContext(
    MassaContext,
  ) as IContext;

  const onOpenMassa = React.useCallback(
    (e: any) => openMassa(e),
    [openMassa]
  );

  return <MemoizedMassaDappCore web3={web3} error={error} awaiting={awaiting} openMassa={onOpenMassa}/>
}

const MemoizedMassaDappCore = React.memo(MassaDappCore, (prevProps: Readonly<IProps>, nextProps: Readonly<IProps>): boolean => {
  return _.isEqual(prevProps.web3, nextProps.web3)
});
