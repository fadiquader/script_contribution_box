import React, { PureComponent } from 'react';


class CharacterContainer extends PureComponent {
    state = {
        style: {}
    };
    componentDidMount() {
        const pos =  this.divElement.getBoundingClientRect();
        const width = this.divElement.clientWidth;
        const diff = pos.left - width - 12;
        const cssMarignProperty = diff > 0 ? 'marginLeft': 'marginRight';
        const cssDirectionProperty = diff > 0 ? 'left': 'right';
        this.setState({ style:{
            [cssMarignProperty]: `-${width + 8}px`,
            [cssDirectionProperty]: '0px',
        }});
    }
    render() {
        const { style } = this.state;
        return (
            <div style={style}
                 ref={ node => this.divElement = node}
                 className="character-details">
                { this.props.children }
            </div>
        )
    }
}

export default CharacterContainer;