/*global QUnit,oTable*/

sap.ui.require([
], function() {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;

	QUnit.module("Hidden experimental feature", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Loading of TableDragDropExtension.js", function(assert) {
		assert.equal(sap.ui.table.TableDragDropExtension, null, "The extension file has not been loaded");
	});

	QUnit.test("Applied extensions", function(assert) {
		var bExtensionsAreValid = true;

		var aAllowedExtensions = [
			"sap.ui.table.TablePointerExtension",
			"sap.ui.table.TableScrollExtension",
			"sap.ui.table.TableKeyboardExtension",
			"sap.ui.table.TableAccExtension",
			"sap.ui.table.TableAccRenderExtension"
		];

		oTable._aExtensions.forEach(function(oExtension) {
			var bIsValidExtension = false;

			aAllowedExtensions.forEach(function(sAllowedExtension) {
				if (oExtension.getMetadata()._sClassName === sAllowedExtension) {
					bIsValidExtension = true;
				}
			});

			if (!bIsValidExtension) {
				bExtensionsAreValid = false;
			}
		});

		assert.ok(bExtensionsAreValid, "The table has only the expected extensions. No Drag&Drop extension exists.");
	});
});