/*global QUnit */

sap.ui.define([
	"sap/ui/unified/calendar/IndexPicker",
	"sap/ui/core/Core"
], function(IndexPicker, oCore) {
	"use strict";

		QUnit.module("API ", {
			beforeEach: function () {
				this.oIP = new IndexPicker();
				this.oIP.placeAt("qunit-fixture");
				oCore.applyChanges();
			},
			afterEach: function () {
				this.oIP.destroy();
				this.oIP = null;
			}
		});

		QUnit.test("Init", function (assert) {
			// Act
			var oHeader = this.oIP.getHeader();

			// Assert
			assert.ok(oHeader, "Header is created");
		});

		QUnit.test("_handleNext", function(assert) {
			// Act
			this.oIP._handleNext();

			// Assert
			assert.equal(this.oIP.getStartIndex(), 12, "Start index has change");

			// Act
			this.oIP._handleNext();

			// Assert
			assert.equal(this.oIP.getStartIndex(), 24, "The start index is increased");
		});

		QUnit.test("_handlePrevious", function(assert) {
			// Act
			this.oIP._handlePrevious();

			// Assert
			assert.equal(this.oIP.getStartIndex(), 0, "Start index has change");
		});

		QUnit.test("_Select", function(assert) {
			// Prepare
			var oFakeEvent = {
				target: {
					getAttribute: function (){
						return "4";
					}
				}
			};
			var oSpy = this.spy(this.oIP, "_selectIndex");

			// Act
			this.oIP.onmouseup(oFakeEvent);

			// Assert
			assert.ok(oSpy.calledOnce, "_selectIndex called once after mouse up");
			assert.equal(this.oIP.getSelectedIndex(), 4, "Select index has change");
		});
});