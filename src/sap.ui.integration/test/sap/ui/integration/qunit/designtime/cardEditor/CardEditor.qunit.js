/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/cardEditor/CardEditor"
], function (
	CardEditor
) {
	"use strict";

	QUnit.module("getDeltaChangeDefinition", {
		beforeEach: function() {
			this.oCardEditor = new CardEditor();
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
			this.oCardEditor.setJson(this.oBaseJson);
			this.oPropertyBag = {
				layer: "ADMIN"
			};
		},
		afterEach: function() {
			this.oCardEditor.destroy();
		}
	}, function() {
		QUnit.test("without any changes", function (assert) {
			return this.oCardEditor.getDeltaChangeDefinition(this.oPropertyBag)
			.then(function(){
				assert.ok(false, "should not go here");
			})
			.catch(function(sError) {
				assert.equal(sError, "No Change", "the function rejects with a text");
			});
		});

		QUnit.test("with some changes", function (assert) {
			this.oBaseJson["sap.card"].configuration.destinations.myDestination1.name = "myNewName1";
			this.oBaseJson["sap.card"].configuration.destinations.myDestination3 = {
				name: "myName3"
			};
			this.oBaseJson["sap.card"].configuration.parameters.myParameter1.value = "myNewParameter1";
			this.oBaseJson["sap.card"].configuration.parameters.myParameter3 = {
				type: "int",
				value: 2
			};
			this.oCardEditor.setJson(this.oBaseJson);

			return this.oCardEditor.getDeltaChangeDefinition(this.oPropertyBag)
			.then(function(oChange) {
				var oExpectedContent = {
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
				};
				assert.deepEqual(oChange.content, oExpectedContent, "the content is set correctly");
				assert.equal(oChange.changeType, "appdescr_card", "the change type is set correctly");
				assert.equal(oChange.fileType, "change", "the fileType is set correctly");
				assert.ok(oChange.creation, "the creation is filled");
				assert.equal(oChange.layer, this.oPropertyBag.layer, "the layer is set correctly");
				assert.equal(oChange.reference, "sap-app-id", "the reference is set correctly");
				assert.equal(oChange.support.generator, "CardEditor", "the generator is set correctly");
				assert.equal(oChange.appDescriptorChange, true, "the appDescriptorChange is set correctly");

				// make another change and save again
				this.oBaseJson["sap.card"].configuration.destinations.myDestination1.name = "myNewName111";
				this.oBaseJson["sap.card"].configuration.destinations.myDestination3 = {
					name: "myName333"
				};
				this.oBaseJson["sap.card"].configuration.parameters.myParameter1.value = "myNewParameter111";
				this.oCardEditor.setJson(this.oBaseJson);

				return this.oCardEditor.getDeltaChangeDefinition(this.oPropertyBag);
			}.bind(this))
			.then(function(oChange) {
				var oExpectedContent = {
					configuration: {
						destinations: {
							myDestination1: {
								name: "myNewName111"
							},
							myDestination3: {
								name: "myName333"
							}
						},
						parameters: {
							myParameter1: {
								value: "myNewParameter111"
							}
						}
					}
				};
				assert.deepEqual(oChange.content, oExpectedContent, "the content is set correctly");
				assert.equal(oChange.changeType, "appdescr_card", "the change type is set correctly");
				assert.equal(oChange.fileType, "change", "the fileType is set correctly");
				assert.ok(oChange.creation, "the creation is filled");
				assert.equal(oChange.layer, this.oPropertyBag.layer, "the layer is set correctly");
				assert.equal(oChange.reference, "sap-app-id", "the reference is set correctly");
				assert.equal(oChange.support.generator, "CardEditor", "the generator is set correctly");
				assert.equal(oChange.appDescriptorChange, true, "the appDescriptorChange is set correctly");
			}.bind(this));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
