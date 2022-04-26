const { React } = require('powercord/webpack');
const { TextInput, SwitchItem } = require('powercord/components/settings');

module.exports = function Settings({ getSetting, updateSetting, toggleSetting }) {
    const defaultInstance = 'invidious.weblibre.org';

    return (
        <div>
            <TextInput
                onChange={val => updateSetting('invidiousInstance', val)}
                defaultValue={getSetting('invidiousInstance', defaultInstance)}
                required={true}
                note={
                    <span>
                        Invidious instance used in embeds. You can find other instances at{' '}
                        <a href="https://api.invidious.io/" target="_blank">
                            https://api.invidious.io/
                        </a>
                        <br />
                        The default is <code style={{ userSelect: 'all' }}>{defaultInstance}</code>
                    </span>
                }
            >
                Invidious instance
            </TextInput>
            <SwitchItem
                onChange={() => toggleSetting('replaceAllEmbeds')}
                note={'Forward all embeds to Invidious without checking if it is blocked on YouTube'}
                value={getSetting('replaceAllEmbeds', false)}
            >
                Replace all embeds
            </SwitchItem>
        </div>
    );
};
