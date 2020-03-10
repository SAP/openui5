/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/integration/util/CardMerger"
], function (
	merge,
	CardMerger
) {
	"use strict";

	QUnit.module("getDeltaChangeDefinition", {
		beforeEach: function() {
			this.oBaseJson = {
				"sap.app": {
					id: "sap-app-id"
				},
				"sap.card": {
					configuration: {
						destinations: {
							myDestination1: {
								name: "myName1"
							},
							myDestination2: {
								name: "myName2"
							}
						},
						parameters: {
							myParameter1: {
								type: "string",
								value: "myParameter1"
							},
							myParameter2: {
								type: "int",
								value: 5
							}
						}
					}
				}
			};
			this.oChange1 = {
				content: {
					configuration: {
						destinations: {
							myDestination1: {
								name: "myNewName1"
							},
							myDestination3: {
								name: "myName3"
							}
						},
						parameters: {
							myParameter1: {
								value: "myNewParameter1"
							},
							myParameter3: {
								type: "int",
								value: 2
							}
						}
					}
				}
			};
			this.oChange2 = {
				content: {
					configuration: {
						destinations: {
							myDestination1: {
								name: "myNewName11"
							},
							myDestination4: {
								name: "myName4"
							}
						},
						parameters: {
							myParameter3: {
								value: 12
							}
						}
					}
				}
			};

		}
	}, function() {
		QUnit.test("with two changes", function (assert) {
			var oExpectedManifest = {
				"sap.app": {
					id: "sap-app-id"
				},
				"sap.card": {
					configuration: {
						destinations: {
							myDestination1: {
								name: "myNewName11"
							},
							myDestination2: {
								name: "myName2"
							},
							myDestination3: {
								name: "myName3"
							},
							myDestination4: {
								name: "myName4"
							}
						},
						parameters: {
							myParameter1: {
								type: "string",
								value: "myNewParameter1"
							},
							myParameter2: {
								type: "int",
								value: 5
							},
							myParameter3: {
								type: "int",
								value: 12
							}
						}
					}
				}
			};
			var oCopy = merge({}, this.oBaseJson);
			var oNewManifest = CardMerger.mergeCardDelta(this.oBaseJson, [this.oChange1, this.oChange2]);
			assert.deepEqual(oCopy, this.oBaseJson, "the original manifest was not mutated");
			assert.deepEqual(oNewManifest, oExpectedManifest, "the delta was merged correctly");
		});

		QUnit.test("with the same changes in a different order", function (assert) {
			var oExpectedManifest = {
				"sap.app": {
					id: "sap-app-id"
				},
				"sap.card": {
					configuration: {
						destinations: {
							myDestination1: {
								name: "myNewName1"
							},
							myDestination2: {
								name: "myName2"
							},
							myDestination3: {
								name: "myName3"
							},
							myDestination4: {
								name: "myName4"
							}
						},
						parameters: {
							myParameter1: {
								type: "string",
								value: "myNewParameter1"
							},
							myParameter2: {
								type: "int",
								value: 5
							},
							myParameter3: {
								type: "int",
								value: 2
							}
						}
					}
				}
			};
			var oCopy = merge({}, this.oBaseJson);
			var oNewManifest = CardMerger.mergeCardDelta(this.oBaseJson, [this.oChange2, this.oChange1]);
			assert.deepEqual(oCopy, this.oBaseJson, "the original manifest was not mutated");
			assert.deepEqual(oNewManifest, oExpectedManifest, "the delta was merged correctly");
		});

		QUnit.test("without changes", function (assert) {
			var oCopy = merge({}, this.oBaseJson);
			CardMerger.mergeCardDelta(this.oBaseJson, []);
			assert.deepEqual(oCopy, this.oBaseJson, "the manifest was not changed");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
