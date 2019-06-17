/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/api/ControlPersonalizationApplyAPI",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Control",
	"sap/ui/fl/Cache",
	"sap/ui/thirdparty/sinon-4"
], function(
	Utils,
	ControlPersonalizationApplyAPI,
	UIComponent,
	Control,
	Cache,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("isPersonalized", {
		beforeEach : function() {
			this.oAppComponent = new UIComponent("AppComponent21");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach: function() {
			if (this.oControl) {
				this.oControl.destroy();
			}
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When isPersonalized() is called with controls of type sap.ui.core.Element and no change type", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({}));
			this.aChangeTypes = ["changeType1", "changeType2"];
			this.oControl = new Control("controlId1");
			var aControls = [this.oControl, {id: "controlId2", appComponent: this.oAppComponent}];
			return ControlPersonalizationApplyAPI.isPersonalized(aControls, this.aChangeTypes).then(function(bIsPersonalized) {
				assert.ok(!bIsPersonalized, "No personalization changes on control were found.");
			});
		});

		QUnit.test("When isPersonalized() is called with controls as a map and no change type", function(assert) {
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve({}));
			this.aChangeTypes = ["changeType1", "changeType2"];
			var aControls = [{id: "controlId1", appComponent: this.oAppComponent}];
			return ControlPersonalizationApplyAPI.isPersonalized(aControls, this.aChangeTypes).then(function(bIsPersonalized) {
				assert.ok(!bIsPersonalized, "No personalization changes on control were found.");
			});
		});

		QUnit.test("When isPersonalized() is called with an array of control ids and change type", function(assert) {
			this.aChangeTypes = ["changeType1", "changeType2"];
			this.oControl = new Control("controlId1");
			var aControls = [this.oControl];

			var oChangeContent0 = {fileName:"change0", fileType:"change", variantReference:"", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType1", layer: "USER"};
			var oChangeContent1 = {fileName:"change1", fileType:"change", variantReference:"variantManagementId", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType1", layer: "USER"};
			var oChangeContent2 = {fileName:"change2", fileType:"change", variantReference:"variantManagementId", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType2", layer: "USER"};
			var oChangeContent3 = {fileName:"change3", fileType:"change", variantReference:"variant1", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType2", layer: "USER"};
			var oVariantChangeContent0 = {fileName: "variantChange0", fileType: "ctrl_variant_change", layer: "USER", selector: {id: "variantManagementId"}, changeType: "changeType1"};
			var oVariantManagementChangeContent0 = {fileName: "variantManagementChange0", fileType: "ctrl_variant_management_change", layer: "USER", changeType: "changeType1", selector: {id: "variantManagementId"}, content: {defaultVariant: "defaultVariant0"}};


			var oMockedWrappedContent = {
				changes : {
					changes : [oChangeContent0],
					variantSection : {
						variantManagementId : {
							variants : [{
								content : {
									fileName: "variantManagementId",
									fileType:"ctrl_variant",
									content: {
										title: "variant 0"
									}
								},
								controlChanges : [oChangeContent1, oChangeContent2],
								variantChanges : {
									setTitle: [oVariantChangeContent0]
								}
							},
								{
									content : {
										fileName: "variant1",
										fileType:"ctrl_variant",
										variantReference:"variantManagementId",
										content: {
											title: "variant 1"
										}
									},
									controlChanges : [oChangeContent3],
									variantChanges : {}
								}],
							variantManagementChanges: {
								setDefault: [oVariantManagementChangeContent0]
							}
						}
					}
				}
			};

			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));
			return ControlPersonalizationApplyAPI.isPersonalized(aControls, this.aChangeTypes).then(function(bIsPersonalized) {
				assert.ok(bIsPersonalized, "Personalization changes were found on control.");
			});
		});

		QUnit.test("When isPersonalized() is called with an empty control ids, non-empty change types", function(assert) {
			this.aChangeTypes = ["changeType1", "changeType2"];
			assert.throws(
				ControlPersonalizationApplyAPI.isPersonalized([], this.aChangeTypes),
				"a rejection takes place"
			);
		});

		QUnit.test("When isPersonalized() is called with an array of control maps, without an app component and empty changes", function(assert) {
			var aControlIds = [{id: "controlId1"}];
			assert.throws(
				ControlPersonalizationApplyAPI.isPersonalized(aControlIds, []),
				"a rejection takes place"
			);
		});

		QUnit.test("When isPersonalized() is called with undefined change types", function(assert) {
			var oChangeContent0 = {fileName:"change0", fileType:"change", variantReference:"", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType1", layer: "USER"};
			var aControls = [{id: "controlId1", appComponent: this.oAppComponent}];
			var oMockedWrappedContent = {
				changes: {
					changes: [oChangeContent0]
				}
			};
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));
			return ControlPersonalizationApplyAPI.isPersonalized(aControls).then(function(bIsPersonalized) {
				assert.equal(!!bIsPersonalized, true, "Personalization changes were found on control.");
			});
		});

		QUnit.test("When isPersonalized() is called with an empty array of change types", function(assert) {
			var oChangeContent0 = {fileName:"change0", fileType:"change", variantReference:"", selector:{id:"controlId1", idIsLocal:false}, changeType: "changeType1", layer: "USER"};
			var aControls = [{id: "controlId1", appComponent: this.oAppComponent}];
			var oMockedWrappedContent = {
				changes: {
					changes: [oChangeContent0]
				}
			};
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));
			return ControlPersonalizationApplyAPI.isPersonalized(aControls, []).then(function(bIsPersonalized) {
				assert.equal(!!bIsPersonalized, true, "Personalization changes were found on control.");
			});
		});

		QUnit.test("When isPersonalized() is called with variant control changes", function(assert) {
			this.aChangeTypes = ["change0", "changeType2"];
			this.oControl = new Control("controlId1");

			var oChangeContent0 = {fileName:"change0", variantReference:""};
			var oChangeContent1 = {fileName:"change1", variantReference:"variant0"};
			var oChangeContent2 = {fileName:"change2", variantReference:"variant0"};
			var oChangeContent3 = {fileName:"change3", variantReference:"variant1"};
			var oChangeContent4 = {fileName:"change4", variantReference:"variant1"};

			var oMockedWrappedContent = {
				changes : {
					changes : [oChangeContent0],
					variantSection : {
						variantManagementId : {
							variants : [{
								content : {
									fileName: "variantManagementId",
									content: {
										title: "variant 0"
									}
								},
								controlChanges : [oChangeContent1, oChangeContent2],
								variantChanges : {}
							},
								{
									content : {
										fileName: "variant1",
										variantReference:"variant0",
										content: {
											title: "variant 1"
										}
									},
									controlChanges : [oChangeContent3, oChangeContent4],
									variantChanges : {}
								}],
							variantManagementChanges: {}
						}
					}
				}
			};
			sandbox.stub(Cache, "getChangesFillingCache").returns(Promise.resolve(oMockedWrappedContent));
			return ControlPersonalizationApplyAPI.isPersonalized([this.oControl], this.aChangeTypes).then(function(bIsPersonalized) {
				assert.equal(bIsPersonalized, false, "Personalization changes were found on control.");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
