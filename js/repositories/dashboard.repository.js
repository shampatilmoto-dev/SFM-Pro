"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped dashboard repository implementing the common repository contract. */
const DashboardRepository = createRepository("dashboard");

export { DashboardRepository };
export default DashboardRepository;

