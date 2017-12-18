import React, { PureComponent } from 'react';


export default class Action extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="action">
                {this.props.children}
            </div>
        )
    }
}

