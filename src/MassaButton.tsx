import React, { useContext } from "react";
import MassaContext from "./context";
import { IContext } from "./massaPlugin";
import { NOT_INSTALLED } from "./massaPlugin/constants";

export default function MassaButton() {
  const { web3, error, awaiting, openMassa }: IContext = useContext(
    MassaContext,
  ) as IContext;

  function handleButtonClick() {
    alert(`Web3 (${web3}) is enabled`); // eslint-disable-line no-alert
  }

  if (error && error.message === NOT_INSTALLED) {
    return (
      <a href="https://massa.net/" target="_blank" rel="noopener noreferrer">
        Install Massa Browser Plugin
      </a>
    );
  } else if (error) {
    return (
      <button type="button" onClick={openMassa}>
        {error.message}
      </button>
    );
  } else if (!web3 && awaiting) {
    return (
      <button type="button" onClick={openMassa}>
        Massa Plugin loading...
      </button>
    );
  } else if (!web3) {
    return (
      <button type="button" onClick={openMassa}>
        Please open and allow Massa Plugin
      </button>
    );
  } else {
    return (
      <button type="button" onClick={handleButtonClick}>
          PLUGIN READY
      </button>
    );
  }
}
