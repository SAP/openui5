/**
 * Initialization Code and shared classes of library sap.ui.testlib (0.0.1-SNAPSHOT)
 */
jQuery.sap.declare("sap.ui.testlib.library");
jQuery.sap.require("sap.ui.core.Core");
// library dependencies
jQuery.sap.require("sap.ui.core.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
  name : "sap.ui.testlib",
  dependencies : ["sap.ui.core"],
  types: [
  ],
  interfaces: [
  ],
  controls: [
    "sap.ui.testlib.TestButton"
  ],
  elements: [
  ],
  version: "0.0.1-SNAPSHOT"});

