import React from 'react';
import './App.css';
import massa from './massa_logo.png'
import MassaContext from './context';
import MassaDappExample from './MassaDappExample';

const App: React.FC = () => {
  return (
    <div className="App">
      <MassaContext.Provider value={null}>
        <header className="App-header">
          <img src={massa} className="App-logo" alt="logo"/>
          <MassaDappExample />
        </header>
      </MassaContext.Provider>
    </div>
  );
}

export default App;
