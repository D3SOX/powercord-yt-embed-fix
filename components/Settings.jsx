const { React } = require('powercord/webpack');
const { TextInput, SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.PureComponent {
    defaultInstance = 'invidious.weblibre.org';

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <TextInput
                    onChange={val => this.props.updateSetting('invidiousInstance', val)}
                    defaultValue={this.props.getSetting('invidiousInstance', this.defaultInstance)}
                    required={true}
                    note={
                        <span>
                            Invidious instance used in embeds. You can find other instances at{' '}
                            <a href="https://api.invidious.io/" target="_blank">
                                https://api.invidious.io/
                            </a>
                            <br />
                            The default is{' '}
                            <code style={{ userSelect: 'all' }}>{this.defaultInstance}</code>
                        </span>
                    }
                >
                    Invidious instance
                </TextInput>
                <SwitchItem
                    onChange={() => this.props.toggleSetting('replaceAllEmbeds')}
                    note={'Forward all embeds to Invidious without checking if it is blocked on YouTube'}
                    value={this.props.getSetting('replaceAllEmbeds', false)}
                >
                    Replace all embeds
                </SwitchItem>
            </div>
        );
    }
};
