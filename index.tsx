/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
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

var prevState: VoiceState;
var prevStatus: string;

export default definePlugin({
    name: "autoStatus",
    description: "Change status on different events",
    authors: [{ name: "cynex_", id: 224173920968900608n }],
    flux: {
        VOICE_STATE_UPDATES({ voiceStates }: { voiceStates: VoiceState[]; }) {
            const myGuildId = SelectedGuildStore.getGuildId();
            const myChanId = SelectedChannelStore.getVoiceChannelId();
            const myId = UserStore.getCurrentUser().id;

            for (const state of voiceStates) {
                const { userId, channelId, oldChannelId } = state;
                console.log("[autoStatus] Joining: " + channelId);
                console.log("[autoStatus] Old: " + oldChannelId);
                console.log("[autoStatus] Prev: " + prevState?.channelId);

                if (userId === myId && channelId !== prevState?.channelId) {
                    const status = PresenceStore.getStatus(UserStore.getCurrentUser().id);
                    if (channelId && !prevState?.channelId) {
                        // joining a channel
                        updateAsync("dnd");
                    } else {
                        // leaving a channel
                        updateAsync("online");
                    }
                }

                prevState = state;
            }
        }
    }
});
