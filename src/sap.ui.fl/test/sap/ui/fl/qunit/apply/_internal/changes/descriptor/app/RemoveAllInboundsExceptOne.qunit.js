/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/RemoveAllInboundsExceptOne",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange"
], function(
	RemoveAllInboundsExceptOne,
	AppDescriptorChange
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							SomeInboundId1: {
								semanticObject: "SemanticObject1",
								action: "configure",
								title: "Title1",
								subTitle: "SubTitle1",
								icon: "Icon1"
							},
							SomeInboundId2: {
								semanticObject: "SemanticObject2",
								action: "configure",
								title: "Title2",
								subTitle: "SubTitle2",
								icon: "Icon2"
							},
							SomeInboundId3: {
								semanticObject: "SemanticObject3",
								action: "configure",
								title: "Title3",
								subTitle: "SubTitle3",
								icon: "Icon3"
							}
						}
					}
				}
			};

			this.oManifestSingleInbound = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
							SomeInboundId1: {
								semanticObject: "SemanticObject1",
								action: "configure",
								title: "Title1",
								subTitle: "SubTitle1",
								icon: "Icon1"
							}
						}
					}
				}
			};

			this.oManifestNoInbounds = {
				"sap.app": {
					crossNavigation: {
						inbounds: {
						}
					}
				}
			};

			this.oManifestNoPathToInbounds1 = {
				"sap.app": {}
			};

			this.oManifestNoPathToInbounds2 = {
				"sap.app": {
					crossNavigation: {}
				}
			};

			this.oChange = new AppDescriptorChange({
				changeType: "appdescr_app_removeAllInboundsExceptOne",
				content: {
					inboundId: "SomeInboundId1"
				}
			});

			// Empty inbound id
			this.oChangeEmptyInboundId = new AppDescriptorChange({
				changeType: "appdescr_app_removeAllInboundsExceptOne",
				content: {
					inboundId: ""
				}
			});

			// Empty Object
			this.oChangeTypeObject = new AppDescriptorChange({
				changeType: "appdescr_app_removeAllInboundsExceptOne",
				content: {
					inboundId: {}
				}
			});

			// Empty Array
			this.oChangeTypeArray = new AppDescriptorChange({
				changeType: "appdescr_app_removeAllInboundsExceptOne",
				content: {
					inboundId: []
				}
			});

			// Type Number
			this.oChangeTypeNumber = new AppDescriptorChange({
				changeType: "appdescr_app_removeAllInboundsExceptOne",
				content: {
					inboundId: 12
				}
			});

			// Type Boolean
			this.oChangeTypeBoolean = new AppDescriptorChange({
				changeType: "appdescr_app_removeAllInboundsExceptOne",
				content: {
					inboundId: true
				}
			});
		}
	}, function() {
		QUnit.test("when calling '_applyChange' all inbounds except one is removed in the manifest", function(assert) {
			var oNewManifest = RemoveAllInboundsExceptOne.applyChange(this.oManifest, this.oChange);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 1, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds.SomeInboundId1, "SomeInboundId1 still exits");
		});

		QUnit.test("when calling '_applyChange' all inbounds except one is removed in the manifest", function(assert) {
			var oNewManifest = RemoveAllInboundsExceptOne.applyChange(this.oManifestSingleInbound, this.oChange);
			assert.equal(Object.keys(oNewManifest["sap.app"].crossNavigation.inbounds).length, 1, "expected inbounds size is correct");
			assert.ok(oNewManifest["sap.app"].crossNavigation.inbounds.SomeInboundId1, "SomeInboundId1 still exits");
		});

		QUnit.test("when calling '_applyChange' removing inbound with empty inboud", function(assert) {
			assert.throws(function() {
				RemoveAllInboundsExceptOne.applyChange(this.oManifest, this.oChangeEmptyInboundId);
			}, Error("The ID of your inbound is empty"),
			"throws error that the id of the inbound must not be empty");
		});

		QUnit.test("when calling '_applyChange' removing inbound with empty value type object", function(assert) {
			assert.throws(function() {
				RemoveAllInboundsExceptOne.applyChange(this.oManifest, this.oChangeTypeObject);
			}, Error("The type of your inbound ID must be string"),
			"throws error that the inboundId value must be string");
		});

		QUnit.test("when calling '_applyChange' removing inbound with empty value type array", function(assert) {
			assert.throws(function() {
				RemoveAllInboundsExceptOne.applyChange(this.oManifest, this.oChangeTypeArray);
			}, Error("The type of your inbound ID must be string"),
			"throws error that the inboundId value must be string");
		});

		QUnit.test("when calling '_applyChange' removing inbound with empty value type number", function(assert) {
			assert.throws(function() {
				RemoveAllInboundsExceptOne.applyChange(this.oManifest, this.oChangeTypeNumber);
			}, Error("The type of your inbound ID must be string"),
			"throws error that the inboundId value must be string");
		});

		QUnit.test("when calling '_applyChange' removing inbound with empty value type boolean", function(assert) {
			assert.throws(function() {
				RemoveAllInboundsExceptOne.applyChange(this.oManifest, this.oChangeTypeBoolean);
			}, Error("The type of your inbound ID must be string"),
			"throws error that the inboundId value must be string");
		});

		QUnit.test("when calling '_applyChange' in a manifest which does not have inbounds", function(assert) {
			assert.throws(function() {
				RemoveAllInboundsExceptOne.applyChange(this.oManifestNoInbounds, this.oChange);
			}, Error("No inbound exists with the ID \"SomeInboundId1\" in sap.app/crossNavigation/inbounds"),
			"throws error that no inbound exists with the to be kept id");
		});

		QUnit.test("when calling '_applyChange' in a manifest which does only have sap.app path", function(assert) {
			assert.throws(function() {
				RemoveAllInboundsExceptOne.applyChange(this.oManifestNoPathToInbounds1, this.oChange);
			}, Error("No sap.app/crossNavigation path exists in the manifest"),
			"throws error that path to inbound does not exists");
		});

		QUnit.test("when calling '_applyChange' in a manifest which does only have sap.app/crossNavigation path", function(assert) {
			assert.throws(function() {
				RemoveAllInboundsExceptOne.applyChange(this.oManifestNoPathToInbounds2, this.oChange);
			}, Error("No sap.app/crossNavigation/inbounds path exists in the manifest"),
			"throws error that path to inbound does not exists");
		});
	});
});