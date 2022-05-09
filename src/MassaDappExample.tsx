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
const _ = require('lodash');

const MASSA_PLUGIN_VERSION = "v1.0"; // TODO: must come from the library

export interface IProps {
  web3: Web3|null,
  error: any,
  awaiting: boolean,
  openMassa: any
}

const MassaDappCore: React.FunctionComponent<IProps> = ({web3, error, awaiting, openMassa}: IProps): JSX.Element => {

  const [wasmFile, setWasmFile] = useState<any>(null);
  const [dappReady, setDappReady] = useState<boolean>(false);
  
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
              onDrop={(files, event) => {
                console.log('onDrop!', files, event);
                const loadedFile = files && files.length > 0 ? files[0].name : null;
                console.log("Loaded File ", loadedFile);
                setWasmFile(loadedFile);
              }}
          >
            { wasmFile ? `Uploaded wasm file: ${wasmFile}` : "Click or Drop your wasm dapp file here!" }
        </FileDrop>
        <Button variant="contained">Deploy app</Button>
      </React.Fragment>
    );
  }
}

export default function MassaDappExample() {
  const { web3, error, awaiting, openMassa }: IContext = useContext(
    MassaContext,
  ) as IContext;

  const _web3 = React.useMemo(() => {
    return web3
  }, [web3]);

  const onOpenMassa = React.useCallback(
    (e: any) => openMassa(e),
    [openMassa]
  );

  return <MemoizedMassaDappCore web3={_web3} error={error} awaiting={awaiting} openMassa={onOpenMassa}/>
}

const MemoizedMassaDappCore = React.memo(MassaDappCore, (prevProps: Readonly<IProps>, nextProps: Readonly<IProps>): boolean => {
  return _.isEqual(prevProps.web3, nextProps.web3)
});
