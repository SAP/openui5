/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/integration/util/CardMerger"
], function (
	merge,
	CardMerger
) {
	"use strict";

	function getBaseJson(sNamespace) {
		var oJson = {
			"sap.app": {
				id: "sap-app-id"
			}
		};
		oJson[sNamespace] = {
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
		};
		return oJson;
	}

	QUnit.module("mergeCardDelta", {
		beforeEach: function() {
			this.oBaseJson = getBaseJson("sap.card");
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
			this.oChange3 = {
				"/sap.card/header/icon/src": "sap-icon://call",
				"/sap.card/content/options/attributes/enableInteraction": true,
				":errors": false,
				":layer": 0
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

		QUnit.test("with change which path not exist 01", function (assert) {
			var oExpectedManifest = merge({}, this.oBaseJson, {
				"sap.card": {
					"header": {
						"icon": {
							"src": "sap-icon://call"
						}
					},
					"content": {
						"options": {
							"attributes": {
								"enableInteraction": true
							}
						}
					}
				}
			});
			var oCopy = merge({}, this.oBaseJson);
			var oNewManifest = CardMerger.mergeCardDelta(this.oBaseJson, [this.oChange3]);
			assert.deepEqual(oCopy, this.oBaseJson, "the original manifest was not mutated");
			assert.deepEqual(oNewManifest, oExpectedManifest, "the delta was merged correctly");
		});

		QUnit.test("with change which path not exist 02", function (assert) {
			var oExpectedManifest = merge({}, this.oBaseJson, {
				"sap.card": {
					"header": {
						"icon": {
							"src": "sap-icon://call"
						},
						"icon1": {
							"src": "sap-icon://call1"
						}
					},
					"content": {
						"options": {
							"attributes": {
								"enableInteraction": true
							}
						},
						"options1": {
							"attributes": {
								"enableInteraction": false
							}
						}
					}
				}
			});
			var oCopy = merge({}, this.oBaseJson);
			var oBaseJsonUpdated = merge({}, this.oBaseJson, {
				"sap.card": {
					"header": {
						"icon1": {
							"src": "sap-icon://call1"
						}
					},
					"content": {
						"options1": {
							"attributes": {
								"enableInteraction": false
							}
						}
					}
				}
			});
			var oNewManifest = CardMerger.mergeCardDelta(oBaseJsonUpdated, [this.oChange3]);
			assert.deepEqual(oCopy, this.oBaseJson, "the original manifest was not mutated");
			assert.deepEqual(oNewManifest, oExpectedManifest, "the delta was merged correctly");
		});
	});

	function createDTChange(aChanges) {
		return {
			content: {
				entityPropertyChange: aChanges
			}
		};
	}

	QUnit.module("mergeCardDesigntimeMetadata", {
		beforeEach: function() {
			this.oBaseDTMetadata = {
				"path/to/key/1": "foo",
				"path/to/key/2": { bar: "foobar" },
				"path/to/key/3": true,
				"path/to/key/4": false,
				"path/to/key/5": "foo"
			};
			this.oChange1 = {
				propertyPath: "path/to/key/1",
				operation: "UPDATE",
				propertyValue: "newValue"
			};
			this.oChange2 = {
				propertyPath: "path/to/key/4",
				operation: "UPDATE",
				propertyValue: true
			};
			this.oChange3 = {
				propertyPath: "path/to/key/3",
				operation: "UPDATE",
				propertyValue: false
			};
			this.oChange4 = {
				propertyPath: "path/to/key/5",
				operation: "DELETE"
			};
			this.oChange5 = {
				propertyPath: "path/to/key/6",
				operation: "INSERT",
				propertyValue: "newInsert"
			};
			this.oChange6 = {
				propertyPath: "path/to/key/5",
				operation: "UPDATE",
				propertyValue: "value"
			};
			this.oChange7 = {
				propertyPath: "path/to/key/1",
				operation: "UPDATE",
				propertyValue: "newNewValue"
			};
			this.oChange8 = {
				propertyPath: "path/to/key/2",
				operation: "UPDATE",
				propertyValue: { newObject: "foo" }
			};
			this.oChange9 = {
				propertyPath: "path/to/key/6",
				operation: "INSERT",
				propertyValue: "newNewInsert"
			};
		},
		afterEach: function() {
		}
	}, function() {
		QUnit.test("with multiple changes in one change", function(assert) {
			var oExpectedDTMetadata = {
				"path/to/key/1": "newValue",
				"path/to/key/2": { newObject: "foo" },
				"path/to/key/3": false,
				"path/to/key/4": true,
				"path/to/key/6": "newInsert"
			};
			var oChange = createDTChange([this.oChange1, this.oChange2, this.oChange3, this.oChange4, this.oChange5, this.oChange8]);

			assert.deepEqual(CardMerger.mergeCardDesigntimeMetadata(this.oBaseDTMetadata, [oChange]), oExpectedDTMetadata, "the changes got merged correctly");
		});

		QUnit.test("with multiple changes in multiple changes", function(assert) {
			var oExpectedDTMetadata = {
				"path/to/key/1": "newNewValue",
				"path/to/key/2": { bar: "foobar" },
				"path/to/key/3": true,
				"path/to/key/4": false,
				"path/to/key/6": "newInsert"
			};
			var oChange1 = createDTChange([this.oChange4, this.oChange5, this.oChange1]);
			// second delete is ignored
			var oChange2 = createDTChange([this.oChange4, this.oChange7]);
			// second insert and update after delete are ignored
			var oChange3 = createDTChange([this.oChange6, this.oChange9]);

			assert.deepEqual(CardMerger.mergeCardDesigntimeMetadata(this.oBaseDTMetadata, [oChange1, oChange2, oChange3]), oExpectedDTMetadata, "the changes got merged correctly");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
