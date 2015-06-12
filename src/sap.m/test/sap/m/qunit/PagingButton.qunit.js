(function ($, QUnit) {
	"use strict";

	jQuery.sap.require("sap.m.PagingButton");

	var core = sap.ui.getCore(),
		helpers = {
			renderObject: function (oSapUiObject) {
				oSapUiObject.placeAt("qunit-fixture");
				core.applyChanges();
				return oSapUiObject;
			},
			objectIsInTheDom: function (sSelector) {
				var $object = $(sSelector);
				return $object.length > 0;
			},
			getPagingButton: function (iCount) {
				return new sap.m.PagingButton({
					count: iCount || 1
				});
			}
		};

	QUnit.module("sap.m.PagingButton API", {
		setup: function () {
			this.oPagingButton = helpers.getPagingButton()
		},
		teardown: function () {
			this.oPagingButton.destroy();
		}
	});

	QUnit.test("Default values", function (assert) {
		assert.strictEqual(this.oPagingButton.getPosition(), 1, "for position should be 1");
		assert.strictEqual(this.oPagingButton.getCount(), 1, "for count should be 1");
	});

	QUnit.test("Changing values", function (assert) {
		var iValidCount = 10,
			iInvalidCount = -123,
			iValidPosition = 4,
			iInvalidPosition = -10,
			oPagingButton = this.oPagingButton;

		oPagingButton.setCount(iValidCount);

		assert.strictEqual(oPagingButton.getCount(), iValidCount, "the valid count is correctly set");

		oPagingButton.setCount(iInvalidCount);

		assert.strictEqual(oPagingButton.getCount(), iValidCount,
			"the invalid value of count is not set, and the original value is kept");

		oPagingButton.setPosition(iValidPosition);

		assert.strictEqual(oPagingButton.getPosition(), iValidPosition, "the valid position is correctly set");

		oPagingButton.setPosition(iInvalidPosition);

		assert.strictEqual(oPagingButton.getPosition(), iValidPosition,
			"the invalid value of position is not set, and the original value is kept");

		oPagingButton.setCount(iValidCount);
	});

	QUnit.module("sap.m.PagingButton Rendering", {
		setup: function () {
			this.oPagingButton = helpers.getPagingButton(10);
			helpers.renderObject(this.oPagingButton);
		},
		teardown: function () {
			this.oPagingButton.destroy();
		}
	});

	QUnit.test("The control is rendered", function (assert) {
		assert.ok(helpers.objectIsInTheDom("#" + this.oPagingButton.getId()));
	});

	QUnit.module("sap.m.PagingButton Events", {
		setup: function () {
			var that = this;

			this.oSpies = {};
			this.oParams = {};

			this.oSpies.positionChanged = sinon.spy(function (event) {
				that.oParams.oldPosition = event.getParameter("oldPosition");
				that.oParams.newPosition = event.getParameter("newPosition");
			});

			this.oPagingButton = helpers.getPagingButton().attachPositionChange(this.oSpies.positionChanged);

			helpers.renderObject(this.oPagingButton);
		},
		teardown: function () {
			this.oPagingButton.destroy();
			this.oPagingButton = null;
		}
	});

	QUnit.test("positionChanged event should be fired on each position change", function (assert) {
		var oPagingButton = this.oPagingButton,
			oPositionChangedEvent = this.oSpies.positionChanged;

		oPagingButton._getNextButton().firePress();
		assert.ok(oPositionChangedEvent.calledOnce, "PositionChanged is once");

		oPagingButton._getPreviousButton().firePress();
		assert.ok(oPositionChangedEvent.calledTwice, "PositionChanged is twice");

		oPagingButton.setPosition(oPagingButton.getCount());
		oPagingButton._getNextButton().$().click();
		assert.ok(oPositionChangedEvent.calledTwice, "PositionChanged is not fired when the position doesn't change");
	});

}(jQuery, QUnit));