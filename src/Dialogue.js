import React, { PureComponent } from 'react';

export class Dialogue extends PureComponent {
    render() {
        return (
            <div className="dialogue">
                {this.props.children}
            </div>
        )
    }
}

