"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped expense repository implementing the common repository contract. */
const ExpenseRepository = createRepository("expense");

export { ExpenseRepository };
export default ExpenseRepository;

