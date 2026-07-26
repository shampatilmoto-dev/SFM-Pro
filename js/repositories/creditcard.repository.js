"use strict";

import { createRepository } from "./repository.factory.js";

/** User-scoped credit-card repository implementing the common repository contract. */
const CreditCardRepository = createRepository("creditcards");

export { CreditCardRepository };
export default CreditCardRepository;
