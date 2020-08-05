/*global QUnit */
sap.ui.define([
	"sap/m/Link",
	'sap/m/changeHandler/ChangeLinkTarget',
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/core/mvc/View",
	"sap/ui/fl/Change"
], function (
	Link,
	ChangeLinkTarget,
	elementDesigntimeTest,
	JsControlTreeModifier,
	elementActionTest,
	View,
	Change
) {
	"use strict";

	return Promise.resolve()
	.then(function () {
		return elementDesigntimeTest({
			type: "sap.m.Link",
			create: function () {
				return new Link();
			}
		});
	})
	.then(function() {
		// Rename action
		var fnConfirmLinkIsRenamedWithNewValue = function (oLink, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myLink").getText(),
				"New Value",
				"then the control has been renamed to the new value (New Value)");
		};

		var fnConfirmLinkIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myLink").getText(),
				"Link 1",
				"then the control has been renamed to the old value (Link 1)");
		};

		elementActionTest("Checking the rename action for a Link", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:Link text="Link 1" id="myLink" />' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "myLink",
				parameter: function (oView) {
					return {
						newValue: 'New Value',
						renamedElement: oView.byId("myLink")
					};
				}
			},
			afterAction: fnConfirmLinkIsRenamedWithNewValue,
			afterUndo: fnConfirmLinkIsRenamedWithOldValue,
			afterRedo: fnConfirmLinkIsRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmLinkIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myLink").getVisible(), false, "then the Link element is invisible");
		};

		var fnConfirmLinkIsVisible = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("myLink").getVisible(), true, "then the Link element is visible");
		};

		elementActionTest("Checking the remove action for Link", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<Link id="myLink" text="Open SAP Homepage" target="_blank" href="http://www.sap.com"/>' +
			'</mvc:View>'
			,
			action: {
				name: "remove",
				controlId: "myLink"
			},
			afterAction: fnConfirmLinkIsInvisible,
			afterUndo: fnConfirmLinkIsVisible,
			afterRedo: fnConfirmLinkIsInvisible
		});

		elementActionTest("Checking the reveal action for a Link", {
			xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">"' +
			'<Link id="myLink" text="Open SAP Homepage" target="_blank" href="http://www.sap.com" visible="false"/>' +
			'</mvc:View>'
			,
			action: {
				name: "reveal",
				controlId: "myLink"
			},
			afterAction: fnConfirmLinkIsVisible,
			afterUndo: fnConfirmLinkIsInvisible,
			afterRedo: fnConfirmLinkIsVisible
		});


		QUnit.module("Checking the ChangeLinkTarget action: ", {
			beforeEach: function () {
				this.oMockedAppComponent = {
					getLocalId: function () {
						return undefined;
					},
					createId: function (id) {
						return id;
					}
				};
			},
			afterEach: function () {
			}
		});

		QUnit.test('Checking the ChangeLinkTarget action', function (assert) {
			// Arrange
			this.oLink = new Link({
				id: "btn1",
				text: "link",
				href: "www.sap.com",
				target: "_self"
			});

			var oView = new View({content : [
				this.oLink
			]});

			var oChange = new Change({"changeType" : "changeLinkTarget", "content" : "_blank"});

			// Act
			ChangeLinkTarget.applyChange(oChange, this.oLink, {modifier: JsControlTreeModifier, view : oView, appComponent : this.oMockedAppComponent});
			// Assert
			assert.equal(this.oLink.getTarget(), "_blank", "After applying the change the Link target is _blank");

			// Act
			ChangeLinkTarget.revertChange(oChange, this.oLink, {modifier: JsControlTreeModifier, view : oView, appComponent : this.oMockedAppComponent});
			// Assert
			assert.equal(this.oLink.getTarget(), "_self", "After reverting the change the Link target is _self");

			// Act
			ChangeLinkTarget.applyChange(oChange, this.oLink, {modifier: JsControlTreeModifier, view : oView, appComponent : this.oMockedAppComponent});
			// Assert
			assert.equal(this.oLink.getTarget(), "_blank", "After applying the change again the Link target is _blank");

			this.oLink.destroy();
		});

	});
});