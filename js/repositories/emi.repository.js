"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped EMI repository implementing the common repository contract. */
const EMIRepository = createRepository("emi");

export { EMIRepository };
export default EMIRepository;
