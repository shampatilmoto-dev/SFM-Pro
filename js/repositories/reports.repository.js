"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped reports repository implementing the common repository contract. */
const ReportsRepository = createRepository("reports");

export { ReportsRepository };
export default ReportsRepository;
