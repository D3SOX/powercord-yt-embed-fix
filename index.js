const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { get } = require('powercord/http');
const { getModule } = require('powercord/webpack');

const Settings = require('./components/Settings.jsx');

module.exports = class YTEmbedFix extends Plugin {
    startPlugin() {
        const { MessageAccessories } = getModule(['MessageAccessories'], false);
        inject('yt-embed-fix', MessageAccessories.prototype, 'render', (_args, res) => {
            // find message embeds
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

            // get settings
            const replaceAllEmbeds = this.settings.get('replaceAllEmbeds', false);
            const invidiousInstance = this.settings.get('invidiousInstance', 'invidious.weblibre.org');

            for (const embed of embeds) {
                const { video } = embed;
                if (video) {
                    const { url } = video;
                    // we only want to modify YouTube embeds
                    // TODO: maybe add support for other privacy oriented sites like Nitter, ProxiTok, Bibliogram, ...
                    if (url && url.includes('youtube.com/embed/')) {
                        // inline helper function that replaces the YouTube embed with an invidious one
                        const replaceEmbed = () => {
                            const urlObject = new URL(url);
                            // invidious embed urls follow the same pattern as YouTube embed urls, so we can just replace the hostname
                            urlObject.hostname = invidiousInstance;
                            video.url = urlObject.toString();
                        };

                        if (replaceAllEmbeds) {
                            // forward all videos
                            replaceEmbed();
                        } else {
                            // only forward blocked embeds
                            get(url).then(response => {
                                const contents = response.body.toString();

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
