# ESLint Code Checks

UI5 uses ESLint to check JavaScript sources.  

## Rule Set

The current set of enabled rules can be found in the top-level [.eslintrc.json](/.eslintrc.json) file.  
Those rules apply to all JavaScript code that is part of the OpenUI5 project repository.

## Library-Specific Rule Set

Library projects may decide on a stricter rule set for the whole library or parts of it.  
Rules from the central rule set **MUST NOT** be overridden with a lower severity.

Example: [src/sap.ui.fl/.eslintrc.json](../src/sap.ui.fl/.eslintrc.json)

## Execute Checks

See [Developing OpenUI5 > Running the Static Code Checks (ESLint)](./developing.md#running-the-static-code-checks-eslint)
