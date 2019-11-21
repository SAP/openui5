/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	AddLibrary,
	Change,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChange = new Change({
				changeType: "appdescr_ui5_addLibraries",
				content: {
					libraries: {
						"sap.me": {
							minVersion: "1.44",
							lazy: true
						}
					}
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with a change containing one library update", function (assert) {
			var oManifest = {
				"sap.ui5": {
					_version: "1.1.0",
					dependencies: {
						minUI5Version: "1.32.0",
						libs: {
							"sap.me": {
								minVersion: "1.40.0",
								lazy: true
							}
						}
					}
				}
			};
			var oNewManifest = AddLibrary.applyChange(oManifest, this.oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["minVersion"], "1.44", "the sap.me minVerison is updated correctly.");
			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["lazy"], true, "the sap.me lazy is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with a change containing one library and no manifest libs", function (assert) {
			var oManifest = {
				"sap.ui5": {
					_version: "1.1.0",
					dependencies: {
						minUI5Version: "1.32.0"
					}
				}
			};
			var oNewManifest = AddLibrary.applyChange(oManifest, this.oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["minVersion"], "1.44", "the sap.me minVerison is updated correctly.");
			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["lazy"], true, "the sap.me lazy is updated correctly.");
		});

		QUnit.test("when calling 'applyChange' with a change containing one library update and lazy false", function (assert) {
			var oManifest = {
				"sap.ui5": {
					_version: "1.1.0",
					dependencies: {
						minUI5Version: "1.32.0",
						libs: {
							"sap.me": {
								minVersion: "1.40",
								lazy: false
							}
						}
					}
				}
			};

			var oNewManifest = AddLibrary.applyChange(oManifest, this.oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["minVersion"], "1.44", "the sap.me minVerison is updated correctly.");
			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["lazy"], false, "the sap.me lazy is updated correctly.");
		});

		QUnit.test("when calling 'applyChange' with a change containing one library update and lazy missing", function (assert) {
			var oManifest = {
				"sap.ui5": {
					_version: "1.1.0",
					dependencies: {
						minUI5Version: "1.32.0",
						libs: {
							"sap.me": {
								minVersion: "1.100.0"
							}
						}
					}
				}
			};

			var oNewManifest = AddLibrary.applyChange(oManifest, this.oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["minVersion"], "1.100.0", "the sap.me minVerison is updated correctly.");
			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["lazy"], false, "the sap.me lazy is updated correctly.");
		});

		QUnit.test("when calling 'applyChange' with a change containing one library update and minVersion and lazy missing", function (assert) {
			var oManifest = {
				"sap.ui5": {
					_version: "1.1.0",
					dependencies: {
						minUI5Version: "1.32.0",
						libs: {
							"sap.me": {
							}
						}
					}
				}
			};

			var oNewManifest = AddLibrary.applyChange(oManifest, this.oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["minVersion"], "1.44", "the sap.me minVerison is updated correctly.");
			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["lazy"], false, "the sap.me lazy is updated correctly.");
		});

		QUnit.test("when calling 'applyChange' with a change containing one library downgrade", function (assert) {
			var oManifest = {
				"sap.ui5": {
					_version: "1.1.0",
					dependencies: {
						minUI5Version: "1.32.0",
						libs: {
							"sap.me": {
								minVersion: "1.58",
								lazy: true
							}
						}
					}
				}
			};

			var oNewManifest = AddLibrary.applyChange(oManifest, this.oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["minVersion"], "1.58", "the sap.me minVerison is not downgraded correctly.");
			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["lazy"], true, "the sap.me lazy is not downgraded correctly.");
		});

		QUnit.test("when calling 'applyChange' with a change containing one new library", function (assert) {
			var oManifest = {
				"sap.ui5": {
					_version: "1.1.0",
					dependencies: {
						minUI5Version: "1.32.0",
						libs: {
							"sap.ushell": {
								minVersion: "1.35"
							}
						}
					}
				}
			};

			var oNewManifest = AddLibrary.applyChange(oManifest, this.oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.ushell"]["minVersion"], "1.35", "the sap.me minVerison is not changed correctly.");
			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.ushell"]["lazy"], undefined, "the sap.me lazy is not changed correctly.");

			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["minVersion"], "1.44", "the sap.me minVerison is added  correctly.");
			assert.strictEqual(oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"]["lazy"], true, "the sap.me lazy is added correctly.");
		});

		QUnit.test("when calling 'applyChange' on a more complicated change", function (assert) {
			var oManifest = {
				"sap.ui5": {
					_version: "1.1.0",
					dependencies: {
						minUI5Version: "1.32.0",
						libs: {
							"sap.m": {
								minVersion: "1.30"
							},
							"sap.me": {
								minVersion: "1.30",
								lazy: true
							},
							"sap.ushell": {
								minVersion: "1.30",
								lazy: false
							}
						}
					}
				}
			};

			var oChange = new Change({
				content: {
					libraries: {
						"descriptor.mocha133": {
							minVersion: "1.44"
						},
						"sap.ushell": {
							minVersion: "1.44",
							lazy: true
						},
						"sap.m": {
							minVersion: "1.24"
						},
						"sap.me": {
							minVersion: "1.44",
							lazy: true
						}
					}
				}
			});

			var oExpectedManifest = {
				"sap.ui5": {
					_version: "1.1.0",
					dependencies: {
						minUI5Version: "1.32.0",
						libs: {
							"sap.m": {
								minVersion: "1.30"
							},
							"sap.me": {
								minVersion: "1.44",
								lazy: true
							},
							"sap.ushell": {
								minVersion: "1.44",
								lazy: false
							},
							"descriptor.mocha133": {
								minVersion: "1.44"
							}
						}
					}
				}
			};

			var oNewManifest = AddLibrary.applyChange(oManifest, oChange);

			var oNewLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["descriptor.mocha133"];
			var oExpectedNewLib = oExpectedManifest["sap.ui5"]["dependencies"]["libs"]["descriptor.mocha133"];
			assert.ok(oNewLib, "new library descriptor.mocha133 exists");
			assert.strictEqual(oNewLib["minVersion"], oExpectedNewLib["minVersion"], "descriptor.mocha133.minversion is added correctly");
			assert.strictEqual(oNewLib["lazy"], oExpectedNewLib["lazy"], "descriptor.mocha133.lazy is added correctly");

			var oExistingSapUshell = oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.ushell"];
			var oExpectedSapUshell = oExpectedManifest["sap.ui5"]["dependencies"]["libs"]["sap.ushell"];
			assert.ok(oNewLib, "library sap.ushell was updated");
			assert.strictEqual(oExistingSapUshell["minVersion"], oExpectedSapUshell["minVersion"], "sap.ushell.minversion is updated correctly");
			assert.strictEqual(oExistingSapUshell["lazy"], oExpectedSapUshell["lazy"], "sap.ushell.lazy is updated correctly");

			var oExistingSapM = oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.m"];
			var oExpectedSapM = oExpectedManifest["sap.ui5"]["dependencies"]["libs"]["sap.m"];
			assert.ok(oNewLib, "library sap.m was updated");
			assert.strictEqual(oExistingSapM["minVersion"], oExpectedSapM["minVersion"], "sap.m.minversion is updated correctly");
			assert.strictEqual(oExistingSapM["lazy"], oExpectedSapM["lazy"], "sap.m.lazy is updated correctly");

			var oExistingSapMe = oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"];
			var oExpectedSapMe = oExpectedManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"];
			assert.ok(oNewLib, "library sap.me was updated");
			assert.strictEqual(oExistingSapMe["minVersion"], oExpectedSapMe["minVersion"], "sap.me.minversion is updated correctly");
			assert.strictEqual(oExistingSapMe["lazy"], oExpectedSapMe["lazy"], "sap.me.lazy is updated correctly");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
