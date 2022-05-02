import React, { useContext } from "react";
import './App.css';
import MassaContext from "./context";
import { IContext } from "./massaPlugin";
import { NOT_INSTALLED } from "./massaPlugin/constants";

const MASSA_PLUGIN_VERISON = "v1.0"; // TODO: must come from the library

export default function MassaButton() {
  const { web3, error, awaiting, openMassa }: IContext = useContext(
    MassaContext,
  ) as IContext;

  function handleButtonClick() {
    alert(`Massa Web3 is enabled. Version ${MASSA_PLUGIN_VERISON}`); // eslint-disable-line no-alert
  }

  if (error && error.message === NOT_INSTALLED) {
    return (
      <a href="https://massa.net/" target="_blank" rel="noopener noreferrer">
        Install Massa Browser Plugin
      </a>
    );
  } else if (error) {
    return (
      <button className="massa-button" type="button" onClick={openMassa}>
        {error.message}
      </button>
    );
  } else if (!web3 && awaiting) {
    return (
      <button className="massa-button" type="button" onClick={openMassa}>
        Massa Plugin loading...
      </button>
    );
  } else if (!web3) {
    return (
      <button className="massa-button" type="button" onClick={openMassa}>
        Please open and allow Massa Plugin (TODO???)
      </button>
    );
  } else {
    return (
      <button className="massa-button" type="button" onClick={handleButtonClick}>
          Plugin Ready 🚀
      </button>
    );
  }
}
