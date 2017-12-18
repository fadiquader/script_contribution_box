import React, { Component } from 'react';


export default class Character extends Component {
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

