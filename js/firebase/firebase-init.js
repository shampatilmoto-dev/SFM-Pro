"use strict";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { firebaseApp } from "./firebase-config.js";

/** Firebase Authentication instance for the configured application. */
const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

/** Cloud Firestore instance for the configured application. */
const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null;

export { firebaseAuth, firebaseDb };
