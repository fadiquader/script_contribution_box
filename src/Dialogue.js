import React, { Component } from 'react';


export class Dialogue extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="dialogue">
                {this.props.children}
            </div>
        )
    }
}

