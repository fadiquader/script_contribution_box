import React, { Component } from 'react';


export class Character extends Component {
    render() {
        return (
            <div className="character">
                {this.props.children}
            </div>
        )
    }
}

