"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped budget repository implementing the common repository contract. */
const BudgetRepository = createRepository("budget");

export { BudgetRepository };
export default BudgetRepository;

