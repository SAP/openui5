/*eslint strict: [2, "global"] */
"use strict";
window.fixture["async-sync-conflict_legacyAPIs"].executions++;
window.fixture["async-sync-conflict_legacyAPIs"].SomeGlobalScript = window.fixture["async-sync-conflict_legacyAPIs"].EXPECTED_EXPORT;
window.fixture["async-sync-conflict_legacyAPIs"].externalModuleLoaded = true;
