/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import { findByCodeLazy } from "@webpack";
import { PresenceStore, SelectedChannelStore, SelectedGuildStore, UserStore } from "@webpack/common";

interface VoiceState {
    userId: string;
    channelId?: string;
    oldChannelId?: string;
    deaf: boolean;
    mute: boolean;
    selfDeaf: boolean;
    selfMute: boolean;
}

const updateAsync = findByCodeLazy("updateAsync", "status"); // function that updates status
// statuses : online, idle, dnd, invisible

var settings = definePluginSettings({
    statusToset: {
        description: "Status to set when one of the following happens:",
        type: OptionType.SELECT,
        options: [
            { label: "Do not disturb", value: "dnd", default: true },
            { label: "Idle", value: "idle" },
            { label: "Invisible", value: "invisible" },
        ],
        disabled: () => !settings.store.privateCall
    },
    privateCall: {
        description: "Change status when joining a call",
        type: OptionType.BOOLEAN,
        default: true
    },
    voiceChannel: {
        description: "Change status when joining a voice channel in a server",
        type: OptionType.BOOLEAN,
        default: true
    }
});

var prevState: VoiceState;
var prevStatus: string;

export default definePlugin({
    name: "autoStatus",
    description: "Change status on different events",
    authors: [{ name: "cynex_", id: 224173920968900608n }],
    settings,
    flux: {
        VOICE_STATE_UPDATES({ voiceStates }: { voiceStates: VoiceState[]; }) {
            const myGuildId = SelectedGuildStore.getGuildId();
            const myChanId = SelectedChannelStore.getVoiceChannelId();
            const myId = UserStore.getCurrentUser().id;

            for (const state of voiceStates) {
                const { userId, channelId, oldChannelId } = state;
                console.log("[autoStatus] Joining: " + channelId + " " + myGuildId);
                console.log("[autoStatus] Old: " + oldChannelId);
                console.log("[autoStatus] Prev: " + prevState?.channelId);

                if (userId === myId) {
                    const status = PresenceStore.getStatus(UserStore.getCurrentUser().id); // TODO: save previous status
                    if (channelId && typeof oldChannelId === "undefined") {
                        if (myGuildId === null && settings.store.privateCall) {
                            // joining a private call
                            updateAsync(settings.store.statusToset);
                        }
                        else if (settings.store.voiceChannel) {
                            // joining a voice channel
                            updateAsync(settings.store.statusToset);
                        }
                    } else if (!channelId) {
                        // leaving a channel/call
                        updateAsync("online"); // TODO: use previous status
                    }

                    prevState = state;
                }
            }
        }
    }
});
