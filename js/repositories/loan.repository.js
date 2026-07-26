"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped loan repository implementing the common repository contract. */
const LoanRepository = createRepository("loans");

export { LoanRepository };
export default LoanRepository;

