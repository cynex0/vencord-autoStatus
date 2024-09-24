/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Max Orlov (cynex_)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { findByCodeLazy } from "@webpack";

const updateAsync = findByCodeLazy("updateAsync", "status"); // function that updates status
// statuses : online, idle, dnd, invisible

export default definePlugin({
    name: "autoStatus",
    description: "Change status on different events",
    authors: [{ name: "cynex_", id: 224173920968900608n }],
});
