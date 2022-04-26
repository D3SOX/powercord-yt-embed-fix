const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { get } = require('powercord/http');
const { getModule } = require('powercord/webpack');

const Settings = require('./components/Settings.jsx');

module.exports = class YTEmbedFix extends Plugin {
    startPlugin() {
        const { MessageAccessories } = getModule(['MessageAccessories'], false);
        inject('yt-embed-fix', MessageAccessories.prototype, 'render', (args, res) => {
            const children = res?.props?.children;
            if (!children || children.length < 9) {
                return res;
            }

            const context = children[8];
            if (!context) {
                return res;
            }

            const embeds = context?.props?.message?.embeds;
            if (!embeds || !embeds.length) {
                return res;
            }

            const replaceAllEmbeds = this.settings.get('replaceAllEmbeds');
            const invidiousInstance = this.settings.get('invidiousInstance');

            for (const embed of embeds) {
                const { video } = embed;
                if (video) {
                    const { url } = video;
                    if (url && url.includes('youtube.com/embed/')) {
                        const replaceEmbed = () => {
                            const urlObject = new URL(url);
                            urlObject.hostname = invidiousInstance;
                            video.url = urlObject.toString();
                        };

                        if (replaceAllEmbeds) {
                            // forward all videos
                            replaceEmbed();
                        } else {
                            // only forward blocked embeds
                            get(url).then(res => {
                                const contents = res.body.toString();

                                // blocked embeds contain this meta tag
                                if (contents.includes('name="robots" content="noindex"')) {
                                    replaceEmbed();
                                }
                            });
                        }
                    }
                }
            }

            return res;
        });

        powercord.api.settings.registerSettings(this.entityID, {
            category: this.entityID,
            label: 'YouTube Embed Fix',
            render: Settings,
        });
    }

    pluginWillUnload() {
        uninject('yt-embed-fix');
        powercord.api.settings.unregisterSettings(this.entityID);
    }
};
