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
    isEnabledInCall: {
        description: "Change status when joining a call",
        type: OptionType.BOOLEAN,
        default: true
    },
    statusInCall: {
        description: "Status to set while in a call",
        type: OptionType.SELECT,
        options: [
            { label: "Do not disturb", value: "dnd", default: true },
            { label: "Idle", value: "idle" },
            { label: "Invisible", value: "invisible" },
        ],
        disabled: () => !settings.store.isEnabledInCall
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
            if (!settings.store.isEnabledInCall) return;

            const myGuildId = SelectedGuildStore.getGuildId();
            const myChanId = SelectedChannelStore.getVoiceChannelId();
            const myId = UserStore.getCurrentUser().id;

            for (const state of voiceStates) {
                const { userId, channelId, oldChannelId } = state;
                console.log("[autoStatus] Joining: " + channelId);
                console.log("[autoStatus] Old: " + oldChannelId);
                console.log("[autoStatus] Prev: " + prevState?.channelId);

                if (userId === myId) {
                    const status = PresenceStore.getStatus(UserStore.getCurrentUser().id);
                    if (channelId && typeof oldChannelId === "undefined") {
                        // joining a channel
                        updateAsync(settings.store.statusInCall);
                    } else if (!channelId) {
                        // leaving a channel
                        updateAsync("online");
                    }
                }

                prevState = state;
            }
        }
    }
});
