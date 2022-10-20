import React from 'react';
import './App.css';
import massa from './massa-logo.png'
import {MassaDappCore} from './MassaDappExample';

const App: React.FC = () => {
  return (
    <div className="App">
        <header className="App-header">
          <img src={massa} className="App-logo" alt="logo"/>
          <MassaDappCore />
        </header>
    </div>
  );
}

export default App;
