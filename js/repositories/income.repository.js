"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped income repository implementing the common repository contract. */
const IncomeRepository = createRepository("income");

export { IncomeRepository };
export default IncomeRepository;

