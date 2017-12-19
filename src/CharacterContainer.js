import React, { PureComponent } from 'react';


class CharacterContainer extends PureComponent {
    state = {
        clientWidth: 0
    };
    componentDidMount() {
        this.setState({ clientWidth: `-${this.divElement.clientWidth + 8}px`});
    }
    render() {
        // margin-left
        const { clientWidth } = this.state;
        const characterStyle = {
            marginLeft: clientWidth
        }
        return (
            <div style={characterStyle}
                 ref={ node => this.divElement = node}
                 className="character-details">
                { this.props.children }
            </div>
        )
    }
}

export default CharacterContainer;