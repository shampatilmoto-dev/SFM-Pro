"use strict";

import { AuthenticationManager } from "../../managers/authentication.manager.js";

/** Protect additive enterprise pages without changing the established route manager. */
async function protectPage() {
    const authenticated = await AuthenticationManager.checkAuthentication({ redirect: true });
    if (!authenticated) document.documentElement.hidden = true;
    return authenticated;
}

await protectPage();

export { protectPage };
