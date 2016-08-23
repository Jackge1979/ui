import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import api from './api';

/**
 * This component purpose is to decorate any component and map an user event
 * to an action to be dispatched
 * @example
 * <Dispatcher onClick='actionCreator:identifier' onDrag='actionCreator:anotherid'>
 *    <ChildrenElement />
 * </Dispatcher>
 */
export class Dispatcher extends React.Component {

  constructor(props) {
    super(props);
    this.onEvent = this.onEvent.bind(this);
  }

  onEvent(event, eventName) {
    if (this.props[eventName]) {
      this.props[eventName](event, this.props, this.context);
    }
  }

  render() {
    const childrenWithProps = React.Children.map(this.props.children,
     (child) => {
       let props = {};
       for (const name in this.props) {
         if (this.props.hasOwnProperty(name) && /^on.+/.test(name)) {
           props[name] = (event) => this.onEvent(event, name);
         }
       }
       return React.cloneElement(child, props);
     }
    );
    const child = React.Children.only(childrenWithProps[0]);
    return (child);
  }
}

Dispatcher.propTypes = {
  children: PropTypes.node.isRequired,
};

Dispatcher.contextTypes = {
  store: PropTypes.object.isRequired,
  registry: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
};

export default connect(
  undefined,
  api.action.mapDispatchToProps
)(Dispatcher);
