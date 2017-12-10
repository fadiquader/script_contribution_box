import React, { Component } from 'react';


export class Action extends Component {
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

