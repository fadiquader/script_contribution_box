import React, { Component } from 'react';


export class Character extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="character">
                {this.props.children}
            </div>
        )
    }
}

