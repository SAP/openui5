/*global QUnit */
sap.ui.define([
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/Label",
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	Menu,
	MenuItem,
	Label,
	Element,
	nextUIUpdate
) {
	"use strict";

	QUnit.module('MenuItem(inside Menu)', {
		beforeEach: async function () {
			this.sut = new MenuItem({
				text: "mi",
				items: [
					new MenuItem({
						text: "sub_mi_1"
					}),
					new MenuItem({
						text: "sub_mi_2"
					})
				]
			});
			// Make sure sap.m.Menu code related to sap.m.MenuItem is considered
			this.sutRootMenu = new Menu({items: this.sut});
			this.oLabel = new Label(); //.openBy needs a reference
			this.sutRootMenu.openBy(this.oLabel);
			await nextUIUpdate();
		},
		afterEach : function () {
			this.sutRootMenu.close();
			this.sut.destroy();
			this.sutRootMenu.destroy();
			this.oLabel.destroy();

			this.sut = null;
			this.sutRootMenu = null;
			this.oLabel = null;

		}
	});

	QUnit.test("addEventDelegate", function(assert) {
		// prepare
		var oDelegate = { onmouseover: function() { } };
		var oMenuItem = new MenuItem({text: "test"});
		var oSpyAddEventDelegate = this.spy(Element.getElementById(this.sut._getVisualControl()), "addEventDelegate");

		// act
		this.sut.addEventDelegate(oDelegate, oMenuItem);

		// assert
		assert.ok(oSpyAddEventDelegate.calledWith(oDelegate, oMenuItem), "eventDelegate is correctly passed to unified MenuItem");
	});

	QUnit.test("removeEventDelegate", function(assert) {
		// prepare
		var oDelegate = { onmouseover: function() { } };
		var oSpyRemoveEventDelegate = this.spy(Element.getElementById(this.sut._getVisualControl()), "removeEventDelegate");
		this.sut.addEventDelegate(oDelegate);

		// act
		this.sut.removeEventDelegate(oDelegate);

		// assert
		assert.ok(oSpyRemoveEventDelegate.calledWith(oDelegate),"eventDelegate is correctly removed from unified MenuItem");
	});

	QUnit.test("setProperty", function (assert) {
		// prepare
		var oSpySetProperty = this.spy(Element.getElementById(this.sut._getVisualControl()), "setProperty"),
			sPropertyKey = "text",
			sPropertyValue = "new_mi_text";

		//act
		this.sut.setProperty(sPropertyKey, sPropertyValue);

		//assert
		assert.ok(oSpySetProperty.calledWith(sPropertyKey, sPropertyValue), "property is correctly passed from unified MenuItem");
	});
});