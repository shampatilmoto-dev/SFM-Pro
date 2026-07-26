"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped investment repository implementing the common repository contract. */
const InvestmentRepository = createRepository("investments");

export { InvestmentRepository };
export default InvestmentRepository;

