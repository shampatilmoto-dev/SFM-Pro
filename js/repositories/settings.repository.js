"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped settings repository implementing the common repository contract. */
const SettingsRepository = createRepository("settings");

export { SettingsRepository };
export default SettingsRepository;

