/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Icon",
	"sap/ui/core/IconPool",
	"sap/ui/core/_IconRegistry",
	"sap/base/Log",
	"sap/ui/Device",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Icon, IconPool, _IconRegistry, Log, Device, Library, library, KeyCodes, jQuery, qutils, nextUIUpdate) {
	"use strict";

	// shortcut for type from sap.ui.core
	var IconColor = library.IconColor;

	// create page content
	["dummy", "uiAreaA", "uiAreaB"].forEach(function(sId) {
		var oDIV = document.createElement("div");
		oDIV.id = sId;
		document.body.appendChild(oDIV);
	});
	document.getElementById("dummy").style.display = "none";

	var oIcon = new Icon("icon1", {
		src: _IconRegistry.getIconURI("wrench"),
		size: "20px",
		color: "#666666",
		backgroundColor: "#FFFFFF",
		activeColor: "#222222",
		activeBackgroundColor: "#999999",
		hoverColor: "#444444",
		hoverBackgroundColor: "#CCCCCC",
		width: "24px",
		height: "24px"
	}), $icon, $dummy;
	oIcon.placeAt("uiAreaA");

	function getIconTitle(oIcon) {
		return oIcon.$().children(".sapUiIconTitle").attr("title");
	}

	QUnit.module("Icon Control");

	QUnit.test("Initial Check", function(assert) {
		assert.ok(document.getElementById("icon1"), "Icon is rendered");
		$icon = oIcon.$();
		$dummy = jQuery("#dummy");
	});

	QUnit.test("Loading font file", function(assert) {
		var done = assert.async();

		setTimeout(function() {
			assert.notEqual(jQuery("#icon1").height(), 0, "Font file is loaded successfully");
			done();
		}, 500);
	});

	QUnit.test("Normal state properties", function(assert) {
		$dummy.css({
			"color": "#666666",
			"backgroundColor": "#FFFFFF"
		});
		assert.equal(parseInt($icon.css("font-size")), 20);
		assert.equal($icon.width(), 24);
		assert.equal($icon.height(), 24);
		assert.equal($icon.css("color"), $dummy.css("color"));
		assert.equal($icon.css("background-color"), $dummy.css("background-color"));
	});

	QUnit.test("Active color", function(assert) {
		$dummy.css("color", "#222222");
		$dummy.css("background-color", "#999999");
		if (Device.support.touch) {
			qutils.triggerTouchEvent("touchstart", oIcon.getId());
		} else {
			qutils.triggerEvent("mousedown", oIcon.getId());
		}
		assert.equal($icon.css("color"), $dummy.css("color"));
		assert.equal($icon.css("background-color"), $dummy.css("background-color"));
		if (Device.support.touch) {
			qutils.triggerTouchEvent("touchend", oIcon.getId());
		} else {
			qutils.triggerEvent("mouseup", oIcon.getId());
		}
	});


	if (!Device.support.touch) {
		QUnit.test("Hover color", function(assert) {
			$dummy.css("color", "#444444");
			$dummy.css("background-color", "#CCCCCC");
			var sHoverColor = $dummy.css("color"),
				sHoverBackgroundColor = $dummy.css("background-color");

			qutils.triggerEvent("mouseover", oIcon.getId());
			assert.equal($icon.css("color"), sHoverColor);
			assert.equal($icon.css("background-color"), sHoverBackgroundColor);

			$dummy.css("color", "#222222");
			$dummy.css("background-color", "#999999");
			qutils.triggerEvent("mousedown", oIcon.getId());
			assert.equal($icon.css("color"), $dummy.css("color"));
			assert.equal($icon.css("background-color"), $dummy.css("background-color"));

			qutils.triggerEvent("mouseup", oIcon.getId());
			assert.equal($icon.css("color"), sHoverColor);
			assert.equal($icon.css("background-color"), sHoverBackgroundColor);
		});

		QUnit.test("Icon without Hover color", async function(assert) {
			var sColor = "#666666",
				sBackgroundColor = "#CCCCCC",
				oIcon = new Icon({
					color: sColor,
					backgroundColor: sBackgroundColor
				}),
				$dummy = jQuery("#dummy");

			$dummy.css("color", sColor);
			$dummy.css("background-color", sBackgroundColor);

			var sTestColor = $dummy.css("color"),
				sTestBackgroundColor = $dummy.css("background-color");
			oIcon.placeAt("uiAreaA");
			await nextUIUpdate();

			var $icon = oIcon.$();
			qutils.triggerEvent("mousedown", oIcon.getId());
			assert.equal($icon.css("color"), sTestColor);
			assert.equal($icon.css("background-color"), sTestBackgroundColor);

			qutils.triggerEvent("mouseup", oIcon.getId());
			assert.equal($icon.css("color"), sTestColor);
			assert.equal($icon.css("background-color"), sTestBackgroundColor);

			oIcon.destroy();
		});
	}

	QUnit.test("Attach press handler", async function(assert) {
		var fn1 = function(){}, fn2 = function(){};
		var oIcon = new Icon({
			src: _IconRegistry.getIconURI("manager"),
			press: fn1
		});

		oIcon.placeAt("uiAreaA");
		await nextUIUpdate();
		assert.equal(oIcon.$().css("cursor"), "pointer", "Icon which has press event handler should show pointer cursor");

		oIcon.attachPress(fn2);
		await nextUIUpdate();
		assert.equal(oIcon.$().css("cursor"), "pointer", "Icon which has press event handler should show pointer cursor");

		oIcon.detachPress(fn1);
		await nextUIUpdate();
		assert.equal(oIcon.$().css("cursor"), "pointer", "Icon which still has press event handler should show pointer cursor");

		oIcon.detachPress(fn2);
		await nextUIUpdate();
		assert.equal(oIcon.$().css("cursor"), "default", "Icon which has no press event handler should not show pointer cursor");

		oIcon.destroy();
	});

	QUnit.test("Set mark on the tap/click event", function(assert) {
		var oIcon = new Icon({
			src: _IconRegistry.getIconURI("manager")
		});

		var fnClick = oIcon.ontap ? oIcon.ontap : oIcon.onclick;
		var bMarked = false;

		var oEvent = {
			setMarked: function() {
				bMarked = true;
			}
		};

		fnClick.apply(oIcon, [oEvent]);
		assert.ok(!bMarked, "The event should not be marked when no press handler is attached");

		oIcon.attachPress(function() {});
		fnClick.apply(oIcon, [oEvent]);
		assert.ok(bMarked, "The event should be marked");

		oIcon.destroy();
	});

	QUnit.test("Set invalid color", function(assert) {
		var sInvalidColor = "Invalid color",
			oErrorLogSpy = sinon.spy(Log, "error");

		var oIcon = new Icon({
			src: _IconRegistry.getIconURI("manager"),
			color: sInvalidColor
		});

		sinon.assert.calledWithExactly(oErrorLogSpy, "\"" + sInvalidColor + "\" is not of type sap.ui.core.CSSColor " +
				"nor of type sap.ui.core.IconColor.");
		assert.equal(oIcon.getColor(), "", "No color set");

		oIcon.setColor("#666666");
		assert.equal(oIcon.getColor(), "#666666", "Color set");

		oIcon.setColor(sInvalidColor);
		assert.equal(oIcon.getColor(), "#666666", "Previous valid color still set");

		sinon.assert.calledTwice(oErrorLogSpy);

		oErrorLogSpy.restore();
		oIcon.destroy();
	});

	QUnit.test("Set color with values in sap.ui.core.IconColor enum", async function(assert) {
		var oIcon = new Icon({
			src: _IconRegistry.getIconURI("manager"),
			color: IconColor.Critical
		});

		oIcon.placeAt("uiAreaA");
		await nextUIUpdate();
		assert.ok(oIcon.$().hasClass("sapUiIconColorCritical"), "The color property set in instantiation is applied");
		oIcon.setColor(IconColor.Positive);
		assert.ok(oIcon.$().hasClass("sapUiIconColorPositive"), "Positive class is set");
		oIcon.setColor(IconColor.Negative);
		assert.ok(!oIcon.$().hasClass("sapUiIconColorPositive"), "Positive class is removed");
		assert.ok(oIcon.$().hasClass("sapUiIconColorNegative"), "Negative class is set");
		oIcon.setColor("red");
		assert.ok(!oIcon.$().hasClass("sapUiIconColorNegative"), "Negative class is removed");

		oIcon.setColor(IconColor.NonInteractive);
		assert.ok(oIcon.$().hasClass("sapUiIconColorNonInteractive"), "NonInteractive class is set");
		oIcon.setColor(IconColor.Tile);
		assert.ok(oIcon.$().hasClass("sapUiIconColorTile"), "Tile class is set");
		assert.ok(!oIcon.$().hasClass("sapUiIconColorNonInteractive"), "NonInteractive class is removed");
		oIcon.setColor(IconColor.Marker);
		assert.ok(oIcon.$().hasClass("sapUiIconColorMarker"), "Marker class is set");
		assert.ok(!oIcon.$().hasClass("sapUiIconColorTile"), "Tile class is removed");

		oIcon.destroy();
	});

	QUnit.test("Set background-color with values in sap.ui.core.IconColor enum", async function(assert) {
		var oIcon = new Icon({
			src: _IconRegistry.getIconURI("manager"),
			backgroundColor: IconColor.Critical
		});

		oIcon.placeAt("uiAreaA");
		await nextUIUpdate();
		assert.ok(oIcon.$().hasClass("sapUiIconBGColorCritical"), "The backgroundColor property set in instantiation is applied");
		oIcon.setBackgroundColor(IconColor.Positive);
		assert.ok(oIcon.$().hasClass("sapUiIconBGColorPositive"), "Positive class is set");
		oIcon.setBackgroundColor(IconColor.Negative);
		assert.ok(!oIcon.$().hasClass("sapUiIconBGColorPositive"), "Positive class is removed");
		assert.ok(oIcon.$().hasClass("sapUiIconBGColorNegative"), "Negative class is set");
		oIcon.setBackgroundColor("red");
		assert.ok(!oIcon.$().hasClass("sapUiIconBGColorNegative"), "Negative class is removed");

		oIcon.setBackgroundColor(IconColor.NonInteractive);
		assert.ok(oIcon.$().hasClass("sapUiIconBGColorNonInteractive"), "NonInteractive class is set");
		oIcon.setBackgroundColor(IconColor.Tile);
		assert.ok(oIcon.$().hasClass("sapUiIconBGColorTile"), "Tile class is set");
		assert.ok(!oIcon.$().hasClass("sapUiIconBGColorNonInteractive"), "NonInteractive class is removed");
		oIcon.setBackgroundColor(IconColor.Marker);
		assert.ok(oIcon.$().hasClass("sapUiIconBGColorMarker"), "Marker class is set");
		assert.ok(!oIcon.$().hasClass("sapUiIconGColorTile"), "Tile class is removed");

		oIcon.destroy();
	});

	QUnit.test("set src should also change the tooltip", async function(assert) {
		var oIcon = new Icon({
			src: _IconRegistry.getIconURI("delete"),
			decorative: false
		});

		oIcon.placeAt("uiAreaA");
		await nextUIUpdate();

		var sTitle = getIconTitle(oIcon);
		var sLabel = oIcon.$().attr("aria-label");
		var sLabelledBy = oIcon.$().attr("aria-labelledby");

		assert.ok(!!sTitle, "tooltip has been set");
		assert.ok(sLabel, "aria-label has been set");
		assert.ok(!sLabelledBy, "No aria-labelledby has been set");

		oIcon.setSrc(_IconRegistry.getIconURI("add"));
		await nextUIUpdate();

		assert.notEqual(getIconTitle(oIcon), sTitle, "Tooltip should have changed when changing the icon src.");
		assert.notEqual(oIcon.$().attr("aria-label"), sLabel, "ARIA label is changed when changing the icon src");
		assert.equal(oIcon.$().attr("aria-labelledby"), undefined, "ARIA labelledby should still not be set when changing the icon src.");

		oIcon.destroy();
	});

	QUnit.test("set src should not change aria-label when 'labelledby' is set", async function(assert) {
		var sLabelledById = "foo",
			oIcon = new Icon({
				src: _IconRegistry.getIconURI("delete"),
				ariaLabelledBy: sLabelledById,
				decorative: false
			});

		oIcon.placeAt("uiAreaA");
		await nextUIUpdate();

		var sTitle = getIconTitle(oIcon);
		var sLabel = oIcon.$().attr("aria-label");
		var sLabelledBy = oIcon.$().attr("aria-labelledby");
		var $InvisibleText = oIcon.$("label");
		var sInvisibleTextValue = $InvisibleText.text();

		assert.ok(!!sTitle, "A tooltip has been set");
		assert.ok(!sLabel, "No aria-label has been set");
		assert.ok(!!sLabelledBy, "aria-labelledby has been set");
		assert.equal($InvisibleText.length, 1, "InvisibleText control is created");

		var aLabels = sLabelledBy.split(" ");

		assert.equal(aLabels.length, 2, "ARIA labelledby should have the set ariaLabelledBy and the default translation text");
		assert.equal(aLabels[0], sLabelledById, "The first label id in aLabelledBy should be the one set to ariaLabelledBy");

		oIcon.setSrc(_IconRegistry.getIconURI("add"));
		await nextUIUpdate();

		assert.notEqual(getIconTitle(oIcon), sTitle, "Tooltip should have changed when changing the icon src.");
		assert.equal(oIcon.$().attr("aria-label"), undefined, "ARIA label should still not be set when changing the icon src.");
		assert.equal(oIcon.$().attr("aria-labelledby"), sLabelledBy, "ARIA labelledby should still be the same when changing the icon src.");
		assert.equal(oIcon.$("label").length, 1, "InvisibleText control is kept when changing the icon src");
		assert.notEqual(oIcon.$("label").text(), sInvisibleTextValue, "Invisible text value is changed");

		oIcon.destroy();
	});

	QUnit.test("src with icon name only should use default icon collection", async function(assert) {
		var oIcon = new Icon({
			src: "delete"
		});

		oIcon.placeAt("uiAreaA");
		await nextUIUpdate();

		assert.equal(
			oIcon.$().attr("data-sap-ui-icon-content"),
			IconPool.getIconInfo("sap-icon://delete").content,
			"Content attribute should be set correctly"
		);

		oIcon.destroy();
	});

	QUnit.module("ARIA Support", {
		beforeEach: function () {
			this.sIconName = "add";
			this.sTooltip = "tooltip";
			this.sAlt = "alt";
			this.oAriaIcon = new Icon({
				src: _IconRegistry.getIconURI(this.sIconName)
			});

			this.oAriaIcon.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oAriaIcon.destroy();
			this.oAriaIcon = null;
		}
	});

	QUnit.test("When decorative is defaulting to true", async function (assert) {
		var $icon = this.oAriaIcon.$();

		assert.strictEqual($icon.attr("role"), "presentation", "role should be set to presentation");
		assert.strictEqual($icon.attr("tabindex"), undefined, "no tabindex is set");
		assert.strictEqual($icon.attr("aria-hidden"), 'true', "aria-hidden is enabled");
		assert.notEqual(getIconTitle(this.oAriaIcon), undefined, "title is output using icon text");
		assert.notEqual($icon.attr("aria-label"), undefined, "aria-label is output");

		this.oAriaIcon.setTooltip(this.sTooltip);
		await nextUIUpdate();

		$icon = this.oAriaIcon.$();
		assert.strictEqual(getIconTitle(this.oAriaIcon), this.sTooltip, "title is rendered with property 'tooltip'");
		assert.strictEqual($icon.attr("aria-label"), this.sTooltip, "aria-label is output with property 'tooltip'");
	});

	QUnit.test("When decorative is set to false", async function (assert) {
		this.oAriaIcon.setDecorative(false);
		this.oAriaIcon.setTooltip(this.sTooltip);
		await nextUIUpdate();

		var $icon = this.oAriaIcon.$();

		assert.strictEqual($icon.attr("role"), "img", "role should be set to img");
		assert.strictEqual($icon.attr("aria-hidden"), undefined, "aria-hidden isn't output in DOM");
		assert.strictEqual(getIconTitle(this.oAriaIcon), this.sTooltip, "title is rendered with property 'tooltip'");
		assert.strictEqual($icon.attr("aria-label"), this.sTooltip, "aria-label is output using the 'tooltip'");
		assert.strictEqual($icon.attr("tabindex"), undefined, "no tabindex is set");

		// setting alt makes the aria-label differ from the title.
		this.oAriaIcon.setAlt(this.sAlt);
		await nextUIUpdate();

		$icon = this.oAriaIcon.$();
		assert.strictEqual(getIconTitle(this.oAriaIcon), this.sTooltip, "title is rendered with property 'tooltip'");
		assert.strictEqual($icon.attr("aria-label"), this.sAlt, "aria-label still doesn't exist in the DOM");
	});

	QUnit.test("press handler, noTabStop and accessbility", async function(assert) {
		var fnPressHandler = function() {};

		this.oAriaIcon.attachPress(fnPressHandler);
		await nextUIUpdate();

		var $icon = this.oAriaIcon.$();
		assert.strictEqual($icon.attr("role"), "presentation", "role is set to presentation");
		assert.strictEqual($icon.attr("tabindex"), "0", "tabindex is set to 0");
		assert.notEqual(getIconTitle(this.oAriaIcon), undefined, "title is set");

		this.oAriaIcon.setNoTabStop(true);
		await nextUIUpdate();
		$icon = this.oAriaIcon.$();
		assert.strictEqual($icon.attr("tabindex"), undefined, "no tabindex when noTabStop is set to true");

		this.oAriaIcon.setNoTabStop(false);
		await nextUIUpdate();
		$icon = this.oAriaIcon.$();
		assert.strictEqual($icon.attr("tabindex"), "0", "tabindex is restored when noTabStop is set to false");

		this.oAriaIcon.detachPress(fnPressHandler);
		await nextUIUpdate();
		assert.strictEqual($icon.attr("role"), "presentation", "role is set back to presentation");
		assert.strictEqual($icon.attr("tabindex"), undefined, "no tabindex is output");

		this.oAriaIcon.setDecorative(false);
		this.oAriaIcon.attachPress(fnPressHandler);

		await nextUIUpdate();
		$icon = this.oAriaIcon.$();
		assert.strictEqual($icon.attr("role"), "button", "role is set to button");
		assert.strictEqual($icon.attr("tabindex"), "0", "tabindex is set to 0");

		this.oAriaIcon.detachPress(fnPressHandler);
		await nextUIUpdate();
		$icon = this.oAriaIcon.$();
		assert.strictEqual($icon.attr("role"), "img", "role is set back to img");
		assert.strictEqual($icon.attr("tabindex"), undefined, "no tabindex is output");
	});

	QUnit.test("alt and accessbility", async function(assert) {
		this.oAriaIcon.setAlt(this.sAlt);
		this.oAriaIcon.setTooltip(this.sTooltip);
		await nextUIUpdate();

		var $icon = this.oAriaIcon.$();
		assert.strictEqual(getIconTitle(this.oAriaIcon), this.sTooltip, "title is output using tooltip");
		assert.strictEqual($icon.attr("aria-label"), this.sAlt, "aria-label is output using alt property");
	});

	QUnit.test("When ariaLabelledBy IS set", async function (assert) {
		var sId = "non-existing-id",
			$Icon, $InvisibleText, sText;

		this.oAriaIcon.addAriaLabelledBy(sId);
		await nextUIUpdate();

		$Icon = this.oAriaIcon.$();
		$InvisibleText = this.oAriaIcon.$("label");

		assert.notEqual(getIconTitle(this.oAriaIcon), undefined, "title attribute is set");
		assert.strictEqual($Icon.attr("aria-label"), undefined, "aria-label should be undefined");
		assert.strictEqual($Icon.attr("aria-labelledby"), sId + " " + $InvisibleText.attr("id"), "aria-labelledby is output correctly");
		assert.strictEqual($InvisibleText.length, 1, "Invisible text is created");

		// setting alt makes the refered aria-labelledby text differ from the title.
		this.oAriaIcon.setAlt(this.sAlt);
		await nextUIUpdate();

		$Icon = this.oAriaIcon.$();
		$InvisibleText = this.oAriaIcon.$("label");
		sText = $InvisibleText.text();

		assert.notEqual(getIconTitle(this.oAriaIcon), undefined, "title attribute is set");
		assert.strictEqual($Icon.attr("aria-label"), undefined, "aria-label should be undefined");
		assert.strictEqual($Icon.attr("aria-labelledby"), sId + " " + $InvisibleText.attr("id"), "aria-labelledby should be " + sId + " " + $InvisibleText.attr("id"));
		assert.strictEqual(sText, this.sAlt, "The content of InvisibleText is set with the given alt");
	});

	QUnit.test("Property noTabStop", async function (assert) {
		var fnPressHandler = function() {};

		this.oAriaIcon.setNoTabStop(true);
		await nextUIUpdate();

		var $Icon = this.oAriaIcon.$();
		assert.strictEqual($Icon.attr("tabindex"), undefined, "no tabindex exists");

		this.oAriaIcon.attachPress(fnPressHandler);
		assert.strictEqual($Icon.attr("tabindex"), undefined, "no tabindex exists after attach press event handler");

		this.oAriaIcon.detachPress(fnPressHandler);
		assert.strictEqual($Icon.attr("tabindex"), undefined, "no tabindex exists after detach press event handler");
	});

	QUnit.test("getAccessibilityInfo", function (assert) {
		var oIcon = new Icon({alt: "Alt", tooltip: "Tooltip", src: "sap-icon://search"});
		assert.ok(!!oIcon.getAccessibilityInfo, "Icon has a getAccessibilityInfo function");
		var oInfo = oIcon.getAccessibilityInfo();
		assert.ok(!oInfo, "getAccessibilityInfo returns no info object in case of decorative icons");
		oIcon.setDecorative(false);
		oInfo = oIcon.getAccessibilityInfo();
		assert.strictEqual(oInfo.role, "img", "AriaRole");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.ui.core").getText("ACC_CTR_TYPE_IMAGE"), "Type");
		assert.strictEqual(oInfo.description, "Alt", "Description");
		assert.strictEqual(oInfo.focusable, false, "Focusable");
		assert.ok(oInfo.enabled === undefined || oInfo.enabled === null, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		oIcon.setAlt("");
		oIcon.attachPress(function(){});
		oInfo = oIcon.getAccessibilityInfo();
		assert.strictEqual(oInfo.role, "button", "AriaRole");
		assert.strictEqual(oInfo.type, Library.getResourceBundleFor("sap.ui.core").getText("ACC_CTR_TYPE_BUTTON"), "Type");
		assert.strictEqual(oInfo.description, "Tooltip", "Description");
		assert.strictEqual(oInfo.focusable, true, "Focusable");
		oIcon.setTooltip("");
		oInfo = oIcon.getAccessibilityInfo();
		var oIconInfo = IconPool.getIconInfo(oIcon.getSrc());
		assert.strictEqual(oInfo.description, oIconInfo ? oIconInfo.text || oIconInfo.name : "", "Description");
		oIcon.destroy();
	});

	QUnit.module("Property 'useIconTooltip'", {
		createIcon: async function(mSettings) {
			this.oIcon = new Icon(mSettings).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			if (this.oIcon) {
				this.oIcon.destroy();
				this.oIcon = null;
			}
		}
	});

	QUnit.test("useIconTooltip = true (default) / without tooltip", async function (assert) {
		var oIconInfo = IconPool.getIconInfo("add");

		await this.createIcon({
			src: oIconInfo.uri
		});

		assert.equal(this.oIcon.getUseIconTooltip(), true, "Default value of property 'useIconTooltip' should be 'true'");
		assert.notEqual(getIconTitle(this.oIcon), undefined, "title should not be empty");
		assert.notEqual(this.oIcon.$().attr("aria-label"), undefined, "aria-label should not be empty");
		assert.equal(this.oIcon.$().attr("aria-labelledby"), undefined, "aria-labelledby should be undefined");
	});

	QUnit.test("useIconTooltip = true (default) / with tooltip", async function (assert) {
		var sTooltip = "this is a tooltip";
		await this.createIcon({
			src: _IconRegistry.getIconURI("add"),
			tooltip: sTooltip
		});
		assert.equal(getIconTitle(this.oIcon), sTooltip, "title should be set");
		assert.equal(this.oIcon.$().attr("aria-label"), sTooltip, "aria-label should be undefined");
		assert.equal(this.oIcon.$().attr("aria-labelledby"), undefined, "aria-labelledby should be undefined");
	});

	QUnit.test("useIconTooltip = false / without tooltip", async function (assert) {
		await this.createIcon({
			src: _IconRegistry.getIconURI("add"),
			useIconTooltip: false
		});
		assert.equal(getIconTitle(this.oIcon), undefined, "title should be undefined");
		assert.equal(this.oIcon.$().attr("aria-label"), undefined, "aria-label should be undefined");
		assert.equal(this.oIcon.$().attr("aria-labelledby"), undefined, "aria-labelledby should be undefined");
	});

	QUnit.test("useIconTooltip = false / with tooltip", async function (assert) {
		var sTooltip = "this is a tooltip";
		await this.createIcon({
			src: _IconRegistry.getIconURI("add"),
			useIconTooltip: false,
			tooltip: sTooltip
		});
		assert.equal(getIconTitle(this.oIcon), sTooltip, "title should be set");
		assert.equal(this.oIcon.$().attr("aria-label"), sTooltip, "aria-label should be undefined");
		assert.equal(this.oIcon.$().attr("aria-labelledby"), undefined, "aria-labelledby should be undefined");
	});

	QUnit.module("Loading of additional icon fonts", {
		createIcon: async function(mSettings, fnCallback) {
			this.oIcon = new Icon(mSettings).placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			if (this.oIcon) {
				this.oIcon.destroy();
				this.oIcon = null;
			}
		}
	});

	QUnit.test("Render icon without loading the corresponding font", async function (assert) {
		assert.ok(Log, "Log module should be available");
		var oErrorSpy = sinon.spy(Log, "error");

		await this.createIcon({src: "sap-icon://tnt/technicalsystem"});
		assert.strictEqual(oErrorSpy.callCount, 1, "Rendering of an icon without loading the corresponding font throws an error");

		oErrorSpy.restore();
	});

	QUnit.test("Refresh icon content after font was loaded lazily", async function (assert) {
		// load additional icon font
		IconPool.registerFont({
			collectionName: "tnt",
			fontFamily: "SAP-icons-TNT",
			fontURI: sap.ui.require.toUrl("sap/tnt/themes/base/fonts"),
			lazy: true
		});

		var oLoadFontMetadataSpy = sinon.spy(_IconRegistry, "_loadFontMetadata");

		// instantiate icon
		await this.createIcon({src: "sap-icon://tnt/technicalsystem"});
		assert.strictEqual(this.oIcon.$().attr("data-sap-ui-icon-content"), undefined, "The icon content attribute is not set yet while the font is loading");
		assert.ok(oLoadFontMetadataSpy.called, "The loading of metadata for new font is triggered");

		return _IconRegistry.getIconInfo("sap-icon://tnt/technicalsystem", "async").then(async function() {
			await nextUIUpdate();

			assert.strictEqual(this.oIcon.$().attr("data-sap-ui-icon-content"), String.fromCharCode(0xe000), "Icon content has been set properly after the font is loaded");
			assert.strictEqual(this.oIcon.$().css("font-family").replace(/"|'/g, ""), "SAP-icons-TNT", "Icon font family has been set properly after the font is loaded");

			oLoadFontMetadataSpy.restore();
		}.bind(this));
	});

	QUnit.test("Render a non-existent icon", async function (assert) {
		var oErrorSpy = sinon.spy(Log, "warning");

		await this.createIcon({src: "sap-icon://tnt/doesnotexist"});
		assert.ok(oErrorSpy.called, "Rendering of an icon without loading the corresponding font throws warning");

		oErrorSpy.restore();
	});

	QUnit.test("The same icon is displayed immediately after font was loaded lazily", async function (assert) {
		await this.createIcon({src: "sap-icon://tnt/technicalsystem"});

		assert.strictEqual(this.oIcon.$().attr("data-sap-ui-icon-content"), String.fromCharCode(0xe000), "The icon content attribute is not set yet while the font is loading");
		assert.strictEqual(this.oIcon.$().css("font-family").replace(/"|'/g, ""), "SAP-icons-TNT", "Icon font family has been set properly after the font is loaded");
	});

	QUnit.test("A different icon is displayed immediately after font was loaded lazily", async function (assert) {
		await this.createIcon({src: "sap-icon://tnt/python"});

		assert.strictEqual(this.oIcon.$().attr("data-sap-ui-icon-content"), String.fromCharCode(0xe00f), "The icon content attribute is not set yet while the font is loading");
		assert.strictEqual(this.oIcon.$().css("font-family").replace(/"|'/g, ""), "SAP-icons-TNT", "Icon font family has been set properly after the font is loaded");
	});

	QUnit.module("Keyboard Support");

	QUnit.test("Pressing 'Enter' key should fire 'press' on keydown", async function(assert) {
		// System under Test
		const pressSpy = this.spy(),
			oIcon = new Icon({
				press: pressSpy
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Action
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.ENTER);

		// Assert
		assert.equal(pressSpy.callCount, 1, "Press event should be fired once");

		pressSpy.resetHistory();

		// Action
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.ENTER, false, false, true);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event was not fired for Ctrl+ENTER");

		// Cleanup
		oIcon.destroy();
	});

	QUnit.test("Pressing 'Enter' key should not fire 'press' on keyup", async function(assert) {
		// System under Test
		const pressSpy = this.spy(),
			oIcon = new Icon({
				press: pressSpy
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Action
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.ENTER);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oIcon.destroy();
	});

	QUnit.test("Pressing 'Space' key should not fire 'press' on keydown", async function(assert) {
		// System under Test
		const pressSpy = this.spy(),
			oIcon = new Icon({
				press: pressSpy
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Action
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oIcon.destroy();
	});

	QUnit.test("Pressing 'Space' key should fire 'press' on keyup", async function(assert) {
		// System under Test
		const pressSpy = this.spy(),
			oIcon = new Icon({
				press: pressSpy
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Action
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.equal(pressSpy.callCount, 1, "Press event should be fired once");

		// Cleanup
		oIcon.destroy();
	});

	QUnit.test("Pressing 'Space' key should not fire 'press' if 'ESCAPE' key is pressed and released after the Space is released", async function(assert) {
		// System under Test
		const pressSpy = this.spy(),
			oIcon = new Icon({
				press: pressSpy
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Action
		// first keydown on SPACE, keydown on ESCAPE, release SPACE then release ESCAPE
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.ESCAPE);
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.ESCAPE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oIcon.destroy();
	});

	QUnit.test("Pressing 'Space' key should not fire 'press' if 'ESCAPE' key is pressed then 'Space' key is released and then Escape is released", async function(assert) {
		// System under Test
		const pressSpy = this.spy(),
			oIcon = new Icon({
				press: pressSpy
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Action
		// first keydown on SPACE, keydown on ESCAPE, release ESCAPE then release SPACE
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.ESCAPE);
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.ESCAPE);
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oIcon.destroy();
	});

	QUnit.test("_bPressedSpace is reset on pressing 'Escape' key", async function(assert) {
		// System under Test
		const oIcon = (new Icon()).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Action
		// first keydown on SPACE, keydown on ESCAPE, release ESCAPE then the flag should be set to false
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.ESCAPE);
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.ESCAPE);

		// Assert
		assert.ok(!oIcon._bPressedSpace, "_bPressedSpace is set to false once the escape is released");

		// Cleanup
		oIcon.destroy();
  });

	QUnit.test("Pressing 'Space' key should not fire 'press' if 'SHIFT' key is pressed and released after the 'Space' key is released", async function(assert) {
		// System under Test
		const pressSpy = this.spy(),
			oIcon = new Icon({
				press: pressSpy
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Action
		// first keydown on SPACE, keydown on SHIFT, release SPACE then release SHIFT
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.SHIFT);
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.SHIFT);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oIcon.destroy();
	});

	QUnit.test("Pressing 'Space' key should not fire 'press' if 'SHIFT' key is pressed then 'Space' key is released and then 'SHIFT' key is released", async function(assert) {
		// System under Test
		const pressSpy = this.spy(),
			oIcon = new Icon({
				press: pressSpy
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		// Action
		// first keydown on SPACE, keydown on SHIFT, release ESCAPE then release SHIFT
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.SHIFT);
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.SHIFT);
		qutils.triggerKeyup(oIcon.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.equal(pressSpy.callCount, 0, "Press event should not be fired");

		// Cleanup
		oIcon.destroy();
	});

	QUnit.test("All keys should be ignored when 'Space' key is pressed", async function(assert) {
		// System under Test
		var oEvent = { preventDefault: this.spy() },
			oIcon = new Icon().placeAt("qunit-fixture");

		await nextUIUpdate(this.clock);

		// Action
		// first keydown on SPACE, keydown on ESCAPE, release ESCAPE then release SPACE
		qutils.triggerKeydown(oIcon.getDomRef(), KeyCodes.SPACE);
		oIcon.onkeydown(oEvent);

		// Assert
		assert.equal(oEvent.preventDefault.callCount, 1, "PreventDefault is called");

		// Cleanup
		oIcon.destroy();
	});
});
