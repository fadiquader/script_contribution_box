import React, { PureComponent } from 'react';


export class Action extends PureComponent {
    render() {
        return (
            <div className="action">
                {this.props.children}
            </div>
        )
    }
}

