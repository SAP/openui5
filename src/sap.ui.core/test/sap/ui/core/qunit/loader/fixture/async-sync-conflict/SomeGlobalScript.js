/*eslint strict: [2, "global"] */
"use strict";
window.fixture["async-sync-conflict"].executions++;
window.fixture["async-sync-conflict"].SomeGlobalScript = window.fixture["async-sync-conflict"].EXPECTED_EXPORT;
window.fixture["async-sync-conflict"].externalModuleLoaded = true;
