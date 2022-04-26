import React from 'react';
import { Component } from 'react';
import PropTypes from "prop-types";
import MassaPlugin, { Web3 } from './MassaPlugin';
import { NOT_INSTALLED, TIMEOUT } from './constants';

function getDisplayName(WrappedComponent: any) {
    return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export async function withTimeoutRejection(promise: Promise<MassaPlugin>, timeout: number):  Promise<any> {
    const sleep = new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error(TIMEOUT)), timeout),
    );
    return Promise.race([promise, sleep]);
}


// props
export interface IProps {
    value: any;
    delay: number;
    timeout: number;
    options: Object;
}

// state
export interface IState {
    awaiting: boolean;
    error: Error | null;
    web3: Web3 | null;
    openMassa: (e: any) => any;
}

// context (same as IState)
export interface IContext {
    awaiting: boolean;
    error: Error | null;
    web3: Web3 | null;
    openMassa: (e: any) => any;
}

export function createMassaContext(initial: IContext | null) {

    // create massa context
    const Context = React.createContext<IContext | null>(initial);
    Context.displayName = "ReactMassaContext";

    const ContextProvider: React.Provider<IContext | null> = Context.Provider;

    class MassaContextProvider extends Component<IProps, IState> {

        public static propTypes = {
            value: PropTypes.any,      // Initial value is an object shaped like { web3, error, awaiting }
            delay: PropTypes.number,   // Refresh interval for Massa Plugin changes.
            timeout: PropTypes.number, // Prevent memory leaks by making the PopUp timeout after some time. This doesn't close the popup.
            options: PropTypes.object, // Massa Plugin class initialize options
        }

        public static defaultProps = {
            value: null,
            delay: 3000,    // retry/update every 3 seconds by default
            timeout: 20000, // wait for user to activate Massa.
            options: undefined,
        };

        // private class vars
        private watcher: any = null; // timer created with `setTimeout`
        private massa: MassaPlugin | null = null;

        constructor(props: IProps) {
            super(props);

            this.state = {
                web3: null,
                awaiting: false,
                error: null,
                ...props.value,
            }
        }

        componentDidMount(): void {
            this.setState({
                error: MassaPlugin.hasWeb3() ? null : new Error(NOT_INSTALLED)
            });
            this.handleWatch();
        }

        shouldComponentUpdate(nextProps: IProps, nextState: IState): boolean {
            if (this.state.awaiting !== nextState.awaiting) {
                console.log("shouldComponentUpdate::awaiting", this.state, nextState)
                return true;
            } else if (this.state.web3 !== nextState.web3) {
                console.log("shouldComponentUpdate::web3", this.state, nextState)
                return true;
            } else if (this.state.error !== nextState.error) {
                console.log("shouldComponentUpdate::error", this.state, nextState)
                return true;
            } else {
                return false;
            }
        }

        componentWillUnmount(): void {
            if (this.watcher) {
              clearTimeout(this.watcher);
            }
        }

        handleWatch = async () => {
            console.log("handleWatch 1", this.state);
            // if there is an already existing watcher, clear it
            if (this.watcher) {
              clearTimeout(this.watcher);
            }
      
            // if no web3, set it to awaiting
            if (!this.state.web3) {
              this.setState({ awaiting: true });
            }
            console.log("handleWatch 2", this.state);
      
            let error = this.state.error;
            let web3 = null;
            try {
            // in case of no MassaPlugin, try to load it again
              if (!this.massa) {
                this.massa = (await withTimeoutRejection(
                    MassaPlugin.initialize(this.props.options),
                  this.props.timeout,
                )) as MassaPlugin;
              }
              // get the underlying web3 instance
              web3 = await this.massa.getWeb3();
              // set the error to null
              error = null;
            } catch (err: any) {
              error = err;
            }
      
            // if no error occurred, set the next timeout to check the plugin status
            if (!error) {
              this.watcher = setTimeout(this.handleWatch, this.props.delay);
            }
      
            // set current state
            const nextState = { web3: web3, error: error, awaiting: false };
            this.setState(nextState);
            return nextState;
        };

        render(): JSX.Element {

            const { value, ...props } = this.props;

            const internalValue = {
              web3: this.state.web3,
              error: this.state.error,
              awaiting: this.state.awaiting,
              openMassa: this.handleWatch,
            };

            return <ContextProvider {...props} value={internalValue} />
        }
    }

    (Context as any).Provider = MassaContextProvider;
    return Context;
}

export const withMassaPlugin = (MassaContext: React.Context<IContext>) => {
    return function withMassaContext(Comp: any) {
      const ComponentWithMassa = React.forwardRef((props, ref) => (
        <MassaContext.Consumer>
          {massa => <Comp ref={ref} massa={massa} {...props} />}
        </MassaContext.Consumer>
      ));
  
      ComponentWithMassa.displayName = `withMassaPlugin(${getDisplayName(Comp)})`;
  
      return ComponentWithMassa;
    };
}

export const PropTypesMassa= {
    web3: PropTypes.object,
    error: PropTypes.object, // `Error` type
    awaiting: PropTypes.bool.isRequired,
    openMassa: PropTypes.func.isRequired,
};
  
export const PropTypesMassaObject = PropTypes.shape(PropTypesMassa);