const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { get } = require('powercord/http');
const { getModule } = require('powercord/webpack');

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

            for (const embed of embeds) {
                const { video } = embed;
                if (video) {
                    const { url } = video;
                    if (url && url.includes('youtube.com/embed/')) {
                        // region only forward blocked embeds
                        get(url).then(res => {
                            const contents = res.body.toString();

                            // blocked embeds contain this meta tag
                            if (contents.includes('name="robots" content="noindex"')) {
                                const urlObject = new URL(url);
                                //urlObject.hostname = 'invidious.snopyta.org';
                                //urlObject.hostname = 'invidio.us';
                                urlObject.hostname = 'invidious.weblibre.org';
                                video.url = urlObject.toString();
                            }
                        });
                        // endregion

                        // region forward all videos
                        /*const urlObject = new URL(url);
                        //urlObject.hostname = 'invidious.snopyta.org';
                        //urlObject.hostname = 'invidio.us';
                        urlObject.hostname = 'invidious.weblibre.org';
                        video.url = urlObject.toString();*/
                        // endregion
                    }
                }
            }

            return res;
        });
    }

    pluginWillUnload() {
        uninject('yt-embed-fix');
    }
};
