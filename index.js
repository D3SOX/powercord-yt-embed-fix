const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModule } = require('powercord/webpack');

module.exports = class YTEmbedFix extends Plugin {

    async startPlugin() {
        const { MessageAccessories } = await getModule(['MessageAccessories'], false);
        inject('yt-embed-fix', MessageAccessories.prototype, 'render', (args, res) => {
            //this.log('[YT EMBED FIX] MessageAccessories', res);
            const children = res?.props?.children;
            //this.log('[YT EMBED FIX] children', children);
            if (children && children.length >= 9) {
                const context = children[8];
                //this.log('[YT EMBED FIX] context', context);
                const embeds = context?.props?.message?.embeds;
                //this.log('[YT EMBED FIX] embeds', embeds);
                if (embeds && embeds.length) {
                    //this.log('[YT EMBED FIX] found message with embeds', embeds);
                    for (const embed of embeds) {
                        const video = embed.video;
                        if (video) {
                            if (video.url.includes('youtube.com/embed/')) {
                                //this.log('[YT EMBED FIX] found YouTube embed', context, video, video.url);

                                // region only forward blocked embeds
                                // this is cursed, but I don't want to host my own proxy for this
                                fetch(`https://api.allorigins.win/get?url=${video.url}`).then(res => res.json()).then(data => {
                                    const { contents } = data;
                                    //this.log('[YT EMBED FIX] res', contents);

                                    // blocked embeds contain this meta tag
                                    if (contents.includes('name="robots" content="noindex"')) {
                                        //this.log('[YT EMBED FIX] replace unavailable youtube embed', context, video, video.url);
                                        const { url } = video;
                                        const urlObject = new URL(url);
                                        //urlObject.hostname = 'invidious.snopyta.org';
                                        //urlObject.hostname = 'invidio.us';
                                        urlObject.hostname = 'invidious.weblibre.org';
                                        video.url = urlObject.toString();
                                    }
                                });
                                // endregion

                                // region forward all videos
                                /*const { url } = video;
                                const urlObject = new URL(url);
                                //urlObject.hostname = 'invidious.snopyta.org';
                                //urlObject.hostname = 'invidio.us';
                                urlObject.hostname = 'invidious.weblibre.org';
                                video.url = urlObject.toString();*/
                                // endregion
                            }
                        }
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
