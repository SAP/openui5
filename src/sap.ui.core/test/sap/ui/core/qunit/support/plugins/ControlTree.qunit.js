/*global QUnit*/

/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/core/support/plugins/ControlTree",
	"sap/ui/model/json/JSONModel"
], function (
	Text,
	Core,
	ControlTree,
	JSONModel
) {
	"use strict";

	QUnit.module("Binding Infos", {
		before: function () {
			this.oCT = new ControlTree({
				isToolStub: function () {
					return true;
				}
			});
			this.oCT.oCore = Core;
		},
		after: function () {
			this.oCT.destroy();
		}
	});

	QUnit.test("Invalid absolute path", function (assert) {
		// Arrange
		var oTestStub = new Text({
			text: "{/invalidKey}"
		});
		oTestStub.setModel(new JSONModel({}));

		// Act
		var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;

		// Assert
		assert.ok(bInvalid, "'invalidPath' flag should be true");
	});

	QUnit.test("Invalid relative path. With binding context.", function (assert) {
		// Arrange
		var oTestStub = new Text({
			text: "{invalidKey}"
		});
		var oModel = new JSONModel({
			context: {
				key: "some value"
			}
		});

		oTestStub.setModel(oModel);
		oTestStub.setBindingContext(oModel.createBindingContext("/context"));

		// Act
		var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;

		// Assert
		assert.ok(bInvalid, "'invalidPath' flag should be true");
	});

	QUnit.test("Invalid relative path. No binding context.", function (assert) {
		// Arrange
		var oTestStub = new Text({
			text: "{invalidKey}"
		});
		var oModel = new JSONModel({
			context: {
				key: "some value"
			}
		});

		oTestStub.setModel(oModel);

		// Act
		var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;

		// Assert
		assert.ok(bInvalid, "'invalidPath' flag should be true");
	});

	QUnit.test("Valid absolute path", function (assert) {
		// Arrange
		var oTestStub = new Text({
			text: "{/validKey}"
		});
		oTestStub.setModel(new JSONModel({
			validKey: "some value"
		}));

		// Act
		var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;

		// Assert
		assert.notOk(bInvalid, "'invalidPath' flag should be false");
	});

	QUnit.test("Valid relative path. With binding context.", function (assert) {
		// Arrange
		var oTestStub = new Text({
			text: "{validKey}"
		});
		var oModel = new JSONModel({
			context: {
				validKey: "some value"
			}
		});

		oTestStub.setModel(oModel);
		oTestStub.setBindingContext(oModel.createBindingContext("/context"));

		// Act
		var bInvalid = this.oCT.getControlBindingInfos(oTestStub.getId()).bindings[0].bindings[0].invalidPath;

		// Assert
		assert.notOk(bInvalid, "'invalidPath' flag should be false");
	});

});