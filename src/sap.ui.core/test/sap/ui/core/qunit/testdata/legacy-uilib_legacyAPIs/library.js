/**
 * Initialization Code and shared classes of library sap.ui.testlib (0.0.1-SNAPSHOT)
 */
jQuery.sap.declare("sap.ui.legacy.testlib.library");
jQuery.sap.require("sap.ui.core.Core");
// library dependencies
jQuery.sap.require("sap.ui.core.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
  name : "sap.ui.legacy.testlib",
  dependencies : ["sap.ui.core"],
  types: [
  ],
  interfaces: [
  ],
  controls: [
  ],
  elements: [
  ],
  version: "0.0.1-SNAPSHOT"});

// only to test compatibility with "variant" parameter
// (which is not in use in productive libraries)
sap.ui.getCore().includeLibraryTheme("sap.ui.legacy.testlib", "[legacy]");
