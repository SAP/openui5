/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/m/Button",
	"sap/m/ColorPalette",
	"sap/m/ColorPalettePopover",
	"sap/ui/unified/ColorPickerDisplayMode",
	"sap/m/Dialog",
	"sap/m/ResponsivePopover",
	"sap/ui/Device",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/events/KeyCodes"
], function(
	Button,
	ColorPalette,
	ColorPalettePopover,
	ColorPickerDisplayMode,
	Dialog,
	ResponsivePopover,
	Device,
	ItemNavigation,
	coreLibrary,
	Control,
	containsOrEquals,
	EventExtension,
	KeyCodes
) {
	// shortcut for sap.ui.core.CSSColor
	var CSSColor = coreLibrary.CSSColor;


	var ItemNavigationHomeEnd = ColorPalette.prototype._ItemNavigation;

	var DEFAULT_COLORS = ["gold", "darkorange", "indianred", "darkmagenta", "cornflowerblue", "deepskyblue", "darkcyan",
		"olivedrab", "darkslategray", "azure", "white", "lightgray", "darkgray", "dimgray", "black"];

	QUnit.module("Internal API", function() {

		QUnit.test("init", function (assert) {
			//Act
			var oCP = new ColorPalette();

			// Assert
			assert.strictEqual(oCP._bShowDefaultColorButton, false, "should lead to default value of _bShowDefaultColorButton");
			assert.strictEqual(oCP._bShowMoreColorsButton, false, "should lead to default value of _bShowMoreColorsButton");

			assert.deepEqual(oCP.onsapenter, oCP.ontap, "Keyboard handler for <sapenter> shuld be the same as for <tap>");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("exit", function (assert) {
			//Prepare
			var oCP = new ColorPalette(),
				oSpyMoreColorsDialogDestroy,
				oSpyItemNavDestroy,
				oSpyRemoveDelegate,
				oItemNavigation = new ColorPalette.prototype._ItemNavigation();

			oCP._oMoreColorsDialog = new Dialog();
			oCP._oPaletteColorItemNavigation = oItemNavigation;

			oSpyMoreColorsDialogDestroy = this.spy(oCP._oMoreColorsDialog, "destroy");
			oSpyItemNavDestroy = this.spy(oCP._oPaletteColorItemNavigation, "destroy");
			oSpyRemoveDelegate = this.spy(oCP, "removeDelegate");

			// Act
			oCP.destroy();

			// Assert
			assert.equal(oSpyMoreColorsDialogDestroy.callCount, 1, "'More colors' dialog #destroy is called");
			assert.strictEqual(this._oMoreColorsDialog, undefined, "There is no reference to the 'More colors' dialog");

			assert.equal(oSpyItemNavDestroy.callCount, 1, "ItemNavigation#destroy is called");
			assert.strictEqual(this._oPaletteColorItemNavigation, undefined, "There is no reference to the ItemNavigation");

			assert.equal(oSpyRemoveDelegate.callCount, 1, "Call to removeDelegate should be executed");
			assert.strictEqual(oSpyRemoveDelegate.getCall(0).args[0], oItemNavigation, "Delegate to the ItemNavigation" +
				" instance should be removed");

			// Cleanup
			oSpyMoreColorsDialogDestroy.restore();
			oSpyItemNavDestroy.restore();
			oSpyRemoveDelegate.restore();
		});


		QUnit.test("ItemNavigation after rendering", function (assert) {
			// Prepare
			var oCP = new ColorPalette();

			oCP.placeAt("qunit-fixture");
			// Act
			oCP.onAfterRendering();

			// Assert
			assert.ok(oCP._oPaletteColorItemNavigation, ".. should be initialized");
			assert.ok(oCP._oPaletteColorItemNavigation instanceof ColorPalette.prototype._ItemNavigation, "..should be of expected type");

			// Cleanup
			oCP.destroy();

		});

		QUnit.test("_bShowDefaultColorButton - default value", function (assert) {
			// Act
			var oCP = new ColorPalette();

			// Assert
			assert.equal(oCP._getShowDefaultColorButton(), false, "..should be initially <false>");
			assert.equal(oCP._getDefaultColorButton(), null, "..should not lead to creation of defaultColor button aggregation");

			// Cleanup
			oCP.destroy();
		});


		QUnit.test("_setShowDefaultColorButton with invalid type", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				sInvalidType = "invalid type of string";

			// Act
			assert.throws(function () {

					oCP._setShowDefaultColorButton(sInvalidType);
				}, Error("Cannot set internal property 'showDefaultColorButton' - invalid value: " + sInvalidType),
				"..should throw a certain exception");

			// Cleanup
			oCP.destroy();
		});


		QUnit.test("_setShowDefaultColorButton, _getShowDefaultColorButton", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				oResult;

			// Act
			oResult = oCP._setShowDefaultColorButton(true);

			// Assert
			assert.equal(oCP._getShowDefaultColorButton(), true, "..should be <true> after setter with <true> is called");
			assert.ok(oCP._getDefaultColorButton(), "..should create a default button aggregation");
			assert.equal(oCP._getDefaultColorButton().getVisible(), true, "..should set visibility of the defaultColorButton accordingly");
			assert.deepEqual(oResult, oCP, "..setter returns this");

			// Act
			oCP._setShowDefaultColorButton(false);

			// Assert
			assert.equal(oCP._getShowDefaultColorButton(), false, "..should be <false> after setter with <false> is called");
			assert.equal(oCP._getDefaultColorButton().getVisible(), false, "..should set visibility of the defaultColorButton accordingly");

			// Cleanup
			oCP.destroy();
		});


		QUnit.test("_bShowMoreColorsButton - default value", function (assert) {
			// Act
			var oCP = new ColorPalette();

			// Assert
			assert.equal(oCP._getShowMoreColorsButton(), false, "..should be initially <false>");
			assert.equal(oCP._getMoreColorsButton(), null, "..should not lead to creation of moreColors button aggregation");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("_setShowMoreColorsButton with invalid type", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				sInvalidType = "invalid type of string";

			// Act
			assert.throws(function () {

					oCP._setShowMoreColorsButton(sInvalidType);
				}, Error("Cannot set internal property 'showMoreColorsButton' - invalid value: " + sInvalidType),
				"..should throw a certain exception");

			// Cleanup
			oCP.destroy();
		});


		QUnit.test("_setShowMoreColorsButton, _getShowMoreColorsButton", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				oResult;

			// Act
			oResult = oCP._setShowMoreColorsButton(true);

			// Assert
			assert.equal(oCP._getShowMoreColorsButton(), true, "..should be <true> after setter with <true> is called");
			assert.ok(oCP._getMoreColorsButton(), null, "..should create moreColors button aggregation");
			assert.equal(oCP._getMoreColorsButton().getVisible(), true, "..should set visibility of the moreColors button accordingly");
			assert.deepEqual(oResult, oCP, "..setter returns this");

			// Act
			oCP._setShowMoreColorsButton(false);

			// Assert
			assert.equal(oCP._getShowMoreColorsButton(), false, "..should be <false> after setter with <false> is called");
			assert.equal(oCP._getMoreColorsButton().getVisible(), false, "..should set visibility of the moreColors button accordingly");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("_setDefaultColor - invalid value", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				spyCSSColorIsValid = this.spy(CSSColor, "isValid");

			// Act & Assert
			assert.throws(function () {
					oCP._setDefaultColor("mycolor");
				}, Error("Cannot set internal property '_defaultColor' - invalid value: mycolor"),
				"..should throw a certain exception");
			assert.equal(spyCSSColorIsValid.callCount, 1, "..CSSColor validation is called");
			assert.deepEqual(spyCSSColorIsValid.getCall(0).args, ["mycolor"], "..with certain argument");
			assert.notOk(oCP._oDefaultColor, "..defaultColor should not be set");

			// Cleanup
			spyCSSColorIsValid.restore();
			oCP.destroy();
		});

		QUnit.test("_setDefaultColor - valid value", function (assert) {
			// Prepare
			var oCP = new ColorPalette();

			// Pre-assert
			assert.notOk(oCP._oDefaultColor, ".. defaultColor initially should not be defined");

			// Act & Assert
			assert.deepEqual(oCP._setDefaultColor("red"), oCP, "..setter return this");
			assert.equal(oCP._oDefaultColor, "red", "..works for named color");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("_getDefaultColor", function (assert) {
			// Prepare
			var oCP = new ColorPalette();

			oCP._oDefaultColor = "orange";

			// Act & Assert
			assert.equal(oCP._getDefaultColor(), "orange", ".. uses the private variable _oDefaultColor");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("_setDisplayMode calls ColorPicker.prototype.setDisplayMode", function (assert) {
			// Prepare
			var oColorPalette = new ColorPalette(),
				oColorPicker = oColorPalette._getColorPicker(),
				oSpyColorPickerSetDisplayMode = this.spy(oColorPicker, "setDisplayMode");

			// Act
			oColorPalette._setDisplayMode(ColorPickerDisplayMode.Simplified);

			// Assert
			assert.ok(oSpyColorPickerSetDisplayMode.calledOnce, "..should call the setDisplayMode to the ColorPicker");
			assert.ok(oSpyColorPickerSetDisplayMode.calledWithExactly(ColorPickerDisplayMode.Simplified),"ColorPicker setDisplayMode is called with correct parameters");

			// Cleanup
			oSpyColorPickerSetDisplayMode.restore();
			oColorPalette.destroy();
		});

		QUnit.test("_setDisplayMode - invalid value", function (assert) {
			// Prepare
			var oColorPalette = new ColorPalette();

			// Act & Assert
			assert.throws(function () {
					oColorPalette._setDisplayMode("myDisplayMode");
				},
				Error("\"myDisplayMode\" is of type string, expected sap.ui.unified.ColorPickerDisplayMode for property \"displayMode\" of Element sap.ui.unified.ColorPicker#__picker1"),
				"..should throw a certain exception");
			assert.equal(oColorPalette._oDisplayMode, ColorPickerDisplayMode.Default, "displayMode should have its default value");

			// Cleanup
			oColorPalette.destroy();
		});

		QUnit.test("_setDisplayMode - valid value", function (assert) {
			// Prepare
			var oCP = new ColorPalette();

			// Pre-assert
			assert.ok(oCP._oDisplayMode, ColorPickerDisplayMode.Default, "displayMode initially have its default value");

			// Act & Assert
			assert.deepEqual(oCP._setDisplayMode(ColorPickerDisplayMode.Simplified), oCP, "..setter return this");
			assert.strictEqual(oCP._oDisplayMode, ColorPickerDisplayMode.Simplified, "ColorPalette internal _oDisplayMode property is set");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("_getDisplayMode", function (assert) {
			// Prepare
			var oCP = new ColorPalette();

			oCP._oDisplayMode = ColorPickerDisplayMode.Simplified;

			// Act & Assert
			assert.equal(oCP._getDisplayMode(), ColorPickerDisplayMode.Simplified, ".. uses the private variable _oDefaultColor");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("_openColorPicker", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				oSpyBeforeOpen = this.spy(),
				oSpyOpenDialog = this.spy(),
				oStubOpenDialog = this.stub(oCP, "_ensureMoreColorsDialog", function () {
					return {open: oSpyOpenDialog};
				});

			oCP.attachEvent("_beforeOpenColorPicker", oSpyBeforeOpen);

			// Act
			oCP._openColorPicker();

			// Assert
			assert.equal(oSpyBeforeOpen.callCount, 1, "..should fire _beforeOpenColorPicker event");
			assert.equal(oSpyOpenDialog.callCount, 1, "..should open call Dialog's open method");

			// Cleanup
			oStubOpenDialog.restore();
			oCP.destroy();
		});

		QUnit.test("_ensureMoreColorsDialog creates dialog only once", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				oStubDialog = {
					fakeProp: "1", destroy: function () {
					}
				},
				oResult,
				oDialogFirstTimeCreation,
				oStubCreateMoreColors = this.stub(oCP, "_createMoreColorsDialog", function () {
					return oStubDialog;
				});

			// Pre-Assert
			assert.notOk(oCP._oMoreColorsDialog, "..initially no dialog is created");

			// Act
			oResult = oCP._ensureMoreColorsDialog();

			// Assert
			assert.ok(oCP._oMoreColorsDialog, "..first time ensuring the dialog leads to an object creation");
			assert.deepEqual(oCP._oMoreColorsDialog, oStubDialog, "..where the object is the one that function " +
				"createMoreColorsDialog creates");
			assert.deepEqual(oCP._oMoreColorsDialog, oResult, "..and the same instance if being returned");

			oDialogFirstTimeCreation = oCP._oMoreColorsDialog;

			// Act
			oCP._ensureMoreColorsDialog();

			// Prepare
			assert.deepEqual(oCP._oMoreColorsDialog, oDialogFirstTimeCreation, ".. second time ensuring dialog reuses the" +
				" just crated instance");

			// Cleanup
			oStubCreateMoreColors.restore();
			oCP.destroy();
		});

		QUnit.test("_createMoreColorsDialog for Desktop", function (assert) {
			// Prepare
			var oDialog,
				sTitleMoreColors = "More Colors...",
				oDeviceDesktopStub = this.stub(Device.system, "phone", false),
				oCP = new ColorPalette();


			// Act
			oDialog = oCP._createMoreColorsDialog();

			// Assert
			assert.ok(oDialog, "..returns an object");
			assert.equal(oDialog.getMetadata().getName(), "sap.m.Dialog", "..of type sap.m.Dialog");
			assert.equal(oDialog.getStretch(), false, ".. with no stretch");

			assert.ok(oDialog.getBeginButton(), "..and with begin button");
			assert.ok(oDialog.getEndButton(), "..and with end button");

			// Cleanup
			oCP.destroy();
			oDeviceDesktopStub.restore();
		});

		QUnit.test("_createMoreColorsDialog for phone", function (assert) {
			// Prepare
			var oDialog,
				sTitleMoreColors = "More Colors...",
				oDevicePhoneStub = this.stub(Device.system, "phone", true),
				oCP = new ColorPalette();


			// Act
			oDialog = oCP._createMoreColorsDialog();

			// Assert
			assert.ok(oDialog, "..returns an object");
			assert.equal(oDialog.getMetadata().getName(), "sap.m.Dialog", "..of type sap.m.Dialog");
			assert.equal(oDialog.getContentWidth(), "", "..with no contentWidth");
			assert.equal(oDialog.getStretch(), true, ".. with stretch=true");

			assert.ok(oDialog.getBeginButton(), "..and with begin button");
			assert.ok(oDialog.getEndButton(), "..and with end button");

			// Cleanup
			oCP.destroy();
			oDevicePhoneStub.restore();
		});

		QUnit.test("_focusFirstElement when 'Default Color' button is available", function (assert) {
			// Prepare
			var oCP = new ColorPalette({}),
				oSpyFocusDefaultButton;

			oCP._setShowDefaultColorButton(true);
			oCP.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			oSpyFocusDefaultButton = this.spy(oCP._getDefaultColorButton().getDomRef(), "focus");

			// Act
			oCP._focusFirstElement();

			// Assert
			assert.ok(oSpyFocusDefaultButton.called, "..focuses the 'Default Color' button");

			// Cleanup
			oSpyFocusDefaultButton.restore();
			oCP.destroy();
		});

		QUnit.test("_focusFirstElement when 'Default Color' button is not available", function (assert) {
			// Prepare
			var oCP = new ColorPalette({}),
				oSpyFocusFirstSwatch;

			oCP._setShowDefaultColorButton(false);
			oCP.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			oSpyFocusFirstSwatch = this.spy(oCP._getAllPaletteColorSwatches()[0], "focus");

			// Act
			oCP._focusFirstElement();

			// Assert
			assert.ok(oSpyFocusFirstSwatch.called, "..focuses the first swatch");

			// Cleanup
			oSpyFocusFirstSwatch.restore();
			oCP.destroy();
		});

		QUnit.test("_fireColorSelect", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				oSpyFireColorSelect = this.spy(oCP, "fireColorSelect"),
				oOriginalEvent = jQuery.Event();

			// Act
			oCP._fireColorSelect("red", true, oOriginalEvent);

			// Assert
			assert.equal(oSpyFireColorSelect.callCount, 1, "..calls fireColorSelect once");
			assert.deepEqual(oSpyFireColorSelect.getCall(0).args[0], {
					_originalEvent: oOriginalEvent,
					value: "red",
					id: oCP.getId(),
					defaultAction: true
				},
				"..with certain parameters");

			oSpyFireColorSelect.reset();

			// Act
			oCP._fireColorSelect("green", false, oOriginalEvent);

			// Assert
			assert.equal(oSpyFireColorSelect.callCount, 1, "..calls fireColorSelect once");
			assert.deepEqual(oSpyFireColorSelect.getCall(0).args[0], {
					_originalEvent: oOriginalEvent,
					value: "green",
					id: oCP.getId(),
					defaultAction: false
				},
				"..with certain parameters");

			// Cleanup
			oSpyFireColorSelect.restore();
			oCP.destroy();

		});

		QUnit.test("ColorPalette.prototype.onsaphome for 'Default Color' or 'More Colors..' button", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				oEvent = new jQuery.Event(),
				oStubGetElementInfo = this.stub(ColorPalette.prototype, "_getElementInfo").returns({
					bIsDefaultColorButton: true,
					bIsMoreColorsButton: false
				}),
				oSpyEvtPreventDefault = this.spy(oEvent, "preventDefault"),
				oSpyEvtStopImmediatePropagation = this.spy(oEvent, "stopImmediatePropagation");

			// Act
			oCP.onsaphome(oEvent);

			// Assert
			assert.equal(oSpyEvtPreventDefault.callCount, 1, "..should prevent default action");
			assert.equal(oSpyEvtStopImmediatePropagation.callCount, 1, "..should prevent immediate propagation");
			assert.equal(oSpyEvtStopImmediatePropagation.getCall(0).args[0], true, "..should prevent immediate propagation with 'true'");

			// Cleanup - not needed
		});

		QUnit.test("ColorPalette.prototype.onsaphome when event does not occur on 'Default Color' nor 'More Colors..' button",
			function (assert) {
				// Prepare
				var oCP = new ColorPalette(),
					oEvent = new jQuery.Event(),
					oStubGetElementInfo = this.stub(ColorPalette.prototype, "_getElementInfo").returns({
						bIsDefaultColorButton: false,
						bIsMoreColorsButton: false
					}),
					oSpyEvtPreventDefault = this.spy(oEvent, "preventDefault"),
					oSpyEvtStopImmediatePropagation = this.spy(oEvent, "stopImmediatePropagation");

				// Act
				oCP.onsaphome(oEvent);

				// Assert
				assert.equal(oSpyEvtPreventDefault.callCount, 0, "..should not prevent default action");
				assert.equal(oSpyEvtStopImmediatePropagation.callCount, 0, "..should not prevent immediate propagation");
				// Cleanup - not needed
			});

		QUnit.test("ColorPalette.prototype.onsapend has the same implementation as ColorPalette.prototype.onsapend ",
			function (assert) {
				assert.deepEqual(ColorPalette.prototype.onsaphome, ColorPalette.prototype.onsapend,
					"Both should share a common implementation. Otherwise the onsapend should be tested as well");
			}
		);

		QUnit.module("Keyboard color select", function (hooks) {
			hooks.beforeEach(function () {
				var sSelectedColor = "red",
					oTarget = document.createElement("DIV");
				oTarget.classList.add("sapMColorPaletteSquare");
				oTarget.setAttribute("data-sap-ui-color", sSelectedColor);

				this.oCP = new ColorPalette();
				this.sSelectedColor = sSelectedColor;
				this.oTarget = oTarget;
			});

			QUnit.test("'space' key should select color on key up", function (assert) {
				// Prepare
				var fnFireColorSelectSpy = this.spy(ColorPalette.prototype, "_fireColorSelect");

				// Act
				this.oCP.onkeyup({
					which: KeyCodes.SPACE,
					preventDefault: function () {} ,
					target: this.oTarget
				});

				// Assert
				assert.equal(fnFireColorSelectSpy.callCount, 1, "_fireColorSelect should be called onkeyup when 'space' key is used");
				assert.equal(fnFireColorSelectSpy.getCall(0).args[0], this.sSelectedColor, "The selected color should be the same on the target element");

				// Cleanup
				fnFireColorSelectSpy.restore();
			});

			QUnit.test("'enter' key should select color on key down", function (assert) {
				// Prepare
				var fnFireColorSelectSpy = this.spy(ColorPalette.prototype, "_fireColorSelect");

				// Act
				this.oCP.onsapenter({
					target: this.oTarget
				});

				// Assert
				assert.equal(fnFireColorSelectSpy.callCount, 1, "_fireColorSelect should be called onkeydown when 'enter' key is used");
				assert.equal(fnFireColorSelectSpy.getCall(0).args[0], this.sSelectedColor, "The selected color should be the same on the target element");

				// Cleanup
				fnFireColorSelectSpy.restore();
			});
		});

		QUnit.test("ColorPalette.prototype.onsapspace should prevent default", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				oEvent = new jQuery.Event(),
				oSpyEvtPreventDefault = this.spy(oEvent, "preventDefault");

			// Act
			oCP.onsapspace(oEvent);

			// Assert
			assert.equal(oSpyEvtPreventDefault.callCount, 1, "..should prevent default action");

			// Cleanup - not needed
		});


		QUnit.module("_onSwatchContainerBorderReached", {
				mockEhancedKeybEvent: function (sKeybEventType, sDirection) {
					return {
						getParameter: function (sParam) {
							switch (sParam) {
								case "event":
									return { "type": sKeybEventType };
								case "direction":
									return sDirection;
								default:
									throw "unexpected parameter in event";
							}
						}
					};
				}
			},
			function () {
				// Forward Navigation
				QUnit.test("Forward Navigation outside swatch container when only more colors is available", function (assert) {
					// Prepare
					var oCP = new ColorPalette(), //without any buttons
						oSpyFocus = this.spy(),
						aMockSwatches = new Array(oCP.getColors().length),
						oMockEvent = this.mockEhancedKeybEvent("", ItemNavigationHomeEnd.BorderReachedDirectionForward),
						oMockMoreColorsButton = {focus: oSpyFocus};

					this.stub(oCP, "_getAllPaletteColorSwatches").returns(aMockSwatches);
					this.stub(oCP, "_getShowMoreColorsButton").returns(true);
					this.stub(oCP, "_getShowDefaultColorButton").returns(false);
					this.stub(oCP, "_getMoreColorsButton").returns(oMockMoreColorsButton);

					// Act
					oCP._onSwatchContainerBorderReached(oMockEvent);
					// Assert
					assert.equal(oSpyFocus.callCount, 1, "..should focus the More Colors button");
				});

				QUnit.test("Forward Navigation outside swatch container when only default color button is available", function (assert) {
					// Prepare
					var oCP = new ColorPalette(), //without any buttons
						oSpyFocus = this.spy(),
						aMockSwatches = new Array(oCP.getColors().length),
						oMockEvent = this.mockEhancedKeybEvent("", ItemNavigationHomeEnd.BorderReachedDirectionForward),
						oMockDefaulColorButton = {focus: oSpyFocus};

					this.stub(oCP, "_getAllPaletteColorSwatches").returns(aMockSwatches);
					this.stub(oCP, "_getShowMoreColorsButton").returns(false);
					this.stub(oCP, "_getShowDefaultColorButton").returns(true);
					this.stub(oCP, "_getShowRecentColorsSection").returns(false);
					this.stub(oCP,  "_getDefaultColorButton").returns(oMockDefaulColorButton);

					// Act
					oCP._onSwatchContainerBorderReached(oMockEvent);
					// Assert
					assert.equal(oSpyFocus.callCount, 1, "..should focus the Default Color button");
				});

				QUnit.test("Forward Navigation with 'sapend' outside swatch container when only default color button is available",
					function (assert) {
						// Prepare
						var oCP = new ColorPalette(), //without any buttons
							oSpyFocus = this.spy(),
							aMockSwatches = new Array(oCP.getColors().length),
							oMockEvent = this.mockEhancedKeybEvent("sapend", ItemNavigationHomeEnd.BorderReachedDirectionForward),
							oMockDefaultColorButton = {focus: oSpyFocus},
							vResult;

						this.stub(oCP, "_getAllPaletteColorSwatches").returns(aMockSwatches);
						this.stub(oCP, "_getShowMoreColorsButton").returns(false);
						this.stub(oCP, "_getShowDefaultColorButton").returns(true);
						this.stub(oCP, "_getShowRecentColorsSection").returns(false);
						this.stub(oCP,  "_getDefaultColorButton").returns(oMockDefaultColorButton);

						// Act
						vResult = oCP._onSwatchContainerBorderReached(oMockEvent);
						// Assert
						assert.equal(oSpyFocus.callCount, 0, "..should not focus any element");
						assert.equal(vResult, null, "..should return null");
				});

				QUnit.test("Forward Navigation outside swatch container when both more colors and default color buttons are unavailable",
					function (assert) {
						// Prepare
						var oCP = new ColorPalette(), //without any buttons
							oSpyFocus = this.spy(),
							oMockFirstSwatch = {focus: oSpyFocus},
							aMockSwatches = new Array(oCP.getColors().length),
							oMockEvent = this.mockEhancedKeybEvent("", ItemNavigationHomeEnd.BorderReachedDirectionForward);

						aMockSwatches[0] = oMockFirstSwatch;
						this.stub(oCP, "_getAllPaletteColorSwatches").returns(aMockSwatches);
						this.stub(oCP, "_getShowRecentColorsSection").returns(false);

						// Act
						oCP._onSwatchContainerBorderReached(oMockEvent);
						// Assert
						assert.equal(oSpyFocus.callCount, 1, "..should focus the first swatch color");
				});

				// Backward Navigation
				QUnit.test("Backward Navigation outside swatch container when only more colors is available", function (assert) {
					// Prepare
					var oCP = new ColorPalette(), //without any buttons
						oSpyFocus = this.spy(),
						aMockSwatches = new Array(oCP.getColors().length),
						oMockEvent = this.mockEhancedKeybEvent("", ItemNavigationHomeEnd.BorderReachedDirectionBackward),
						oMockMoreColorsButton = {focus: oSpyFocus};

					this.stub(oCP, "_getAllPaletteColorSwatches").returns(aMockSwatches);
					this.stub(oCP, "_getShowMoreColorsButton").returns(true);
					this.stub(oCP, "_getShowDefaultColorButton").returns(false);
					this.stub(oCP, "_getMoreColorsButton").returns(oMockMoreColorsButton);

					// Act
					oCP._onSwatchContainerBorderReached(oMockEvent);
					// Assert
					assert.equal(oSpyFocus.callCount, 1, "..should focus the More Colors button");
				});

				QUnit.test("Backward Navigation outside swatch container when only default color button is available", function (assert) {
					// Prepare
					var oCP = new ColorPalette(), //without any buttons
						oSpyFocus = this.spy(),
						aMockSwatches = new Array(oCP.getColors().length),
						oMockEvent = this.mockEhancedKeybEvent("", ItemNavigationHomeEnd.BorderReachedDirectionBackward),
						oMockDefaulColorButton = {focus: oSpyFocus};

					this.stub(oCP, "_getAllPaletteColorSwatches").returns(aMockSwatches);
					this.stub(oCP, "_getShowMoreColorsButton").returns(false);
					this.stub(oCP, "_getShowDefaultColorButton").returns(true);
					this.stub(oCP,  "_getDefaultColorButton").returns(oMockDefaulColorButton);

					// Act
					oCP._onSwatchContainerBorderReached(oMockEvent);
					// Assert
					assert.equal(oSpyFocus.callCount, 1, "..should focus the Default Color button");
				});

				QUnit.test("Backward Navigation with 'saphome' outside swatch container when only more colors button is available",
					function (assert) {
						// Prepare
						var oCP = new ColorPalette(), //without any buttons
							oSpyFocus = this.spy(),
							aMockSwatches = new Array(oCP.getColors().length),
							oMockEvent = this.mockEhancedKeybEvent("sapend", ItemNavigationHomeEnd.BorderReachedDirectionBackward),
							oMockMoreColorsButton = {focus: oSpyFocus},
							vResult;

						this.stub(oCP, "_getAllPaletteColorSwatches").returns(aMockSwatches);
						this.stub(oCP, "_getShowDefaultColorButton").returns(false);
						this.stub(oCP, "_getShowMoreColorsButton").returns(true);
						this.stub(oCP,  "_getMoreColorsButton").returns(oMockMoreColorsButton);

						// Act
						vResult = oCP._onSwatchContainerBorderReached(oMockEvent);
						// Assert
						assert.equal(oSpyFocus.callCount, 0, "..should not focus any element");
						assert.equal(vResult, null, "..should return null");
					});

				QUnit.test("Backward Navigation outside swatch container when both more colors and default color buttons are unavailable",
					function (assert) {
						// Prepare
						var oCP = new ColorPalette(), //without any buttons
							oSpyFocus = this.spy(),
							oMockLastSwatch = {focus: oSpyFocus},
							aMockSwatches = new Array(oCP.getColors().length),
							oMockEvent = this.mockEhancedKeybEvent("", ItemNavigationHomeEnd.BorderReachedDirectionBackward),
							iMockIndexOfTheLastItemInLastRow = aMockSwatches.length - 1;

						oCP._ensureItemNavigation();
						aMockSwatches[iMockIndexOfTheLastItemInLastRow] = oMockLastSwatch;
						this.stub(oCP, "_getAllPaletteColorSwatches").returns(aMockSwatches);
						this.stub(oCP, "_getShowRecentColorsSection").returns(false);
						this.stub(oCP._oPaletteColorItemNavigation, "_getIndexOfTheFirstItemInLastRow").returns(iMockIndexOfTheLastItemInLastRow);

						// Act
						oCP._onSwatchContainerBorderReached(oMockEvent);
						// Assert
						assert.equal(oSpyFocus.callCount, 1, "..should focus the last swatch in the last row");
					});
			});


		QUnit.module("Internal ItemNavigationHomeEnd", function() {
			QUnit.test("ItemNavigationHomeEnd._getIndexOfTheFirstItemInLastRow", function (assert) {
				// Prepare
				var oColorPalette = new ColorPalette(),
					oItemNavigation,
					oStubGetItemDomRefs,
					that = this;

				oColorPalette._ensureItemNavigation();

				oItemNavigation = oColorPalette._oPaletteColorItemNavigation;

				function callSut(iItemCount, iExpectedResult) {
					if (oStubGetItemDomRefs) {
						oStubGetItemDomRefs.restore();
					}
					oStubGetItemDomRefs = that.stub(oItemNavigation, "getItemDomRefs").returns(new Array(iItemCount));
					assert.equal(oItemNavigation._getIndexOfTheFirstItemInLastRow(iItemCount), iExpectedResult,
						"_getIndexOfTheFirstItemInLastRow(" + iItemCount + ")");
				}

				// Act & Assert
				// One row
				callSut(2, 0);

				// Two rows
				callSut(6, 5);

				// Three rows
				callSut(15, 10);

				// Cleanup
				oItemNavigation.destroy();
			});

			// ItemNavigationHomeEnd.prototype.onsapprevious
			QUnit.test(".onsapprevious fires event BorderReached only if [up] is pressed" +
				" on the 1st item",
				function (assert) {
					// Prepare
					var oCP = new ColorPalette(),
						oSpyFireEvent,
						oSpyPreventDefault = this.spy();

					this.stub(ColorPalette.prototype._ItemNavigation.prototype, "setItemDomRefs", function () {});
					oCP._ensureItemNavigation();
					oCP._oPaletteColorItemNavigation.oDomRef = document.getElementsByClassName("sapUiBody")[0];
					var oMockEvent = {keyCode: KeyCodes.ARROW_UP, preventDefault: oSpyPreventDefault, target: oCP._oPaletteColorItemNavigation.getRootDomRef()};

					oSpyFireEvent = this.spy(oCP._oPaletteColorItemNavigation, "fireEvent");
					this.stub(oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(0);
					this.stub(oCP._oPaletteColorItemNavigation, "getItemDomRefs").returns(new Array(oCP.getColors().length));

					// Act

					oCP._oPaletteColorItemNavigation.onsapprevious(oMockEvent);

					// Assert
					assert.equal(oSpyFireEvent.callCount, 1, "Event should be fired");
					assert.equal(oSpyFireEvent.getCall(0).args[0], ItemNavigation.Events.BorderReached, "of expected type");

					// Cleanup - not needed
			});

			QUnit.test(".onsapprevious does not execute custom handling, if key different than [up] is pressed" +
				" on the 1st item",
				function (assert) {
					// Prepare
					var oCP = new ColorPalette(),
						oSpyParentOnSapPrevious = this.spy(ItemNavigation.prototype, "onsapprevious");

					this.stub(ColorPalette.prototype._ItemNavigation.prototype, "setItemDomRefs", function () {});
					oCP._ensureItemNavigation();
					oCP._oPaletteColorItemNavigation.oDomRef = document.getElementsByClassName("sapUiBody")[0];
					var oMockEvent = {keyCode: KeyCodes.ARROW_LEFT, target: oCP._oPaletteColorItemNavigation.getRootDomRef()};

					this.stub(oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(0);
					this.stub(oCP._oPaletteColorItemNavigation, "getItemDomRefs").returns(new Array(oCP.getColors().length));

					// Act
					oCP._oPaletteColorItemNavigation.onsapprevious(oMockEvent);

					// Assert
					assert.equal(oSpyParentOnSapPrevious.callCount, 1, "..should forward to the parent's onsapprevious");

					// Cleanup - not needed
			});


			// ItemNavigationHomeEnd.prototype.onsapnext
			QUnit.test(".onsapnext fires event BorderReached only if [down] is pressed on the last item in the last column",
				function (assert) {
					// Prepare
					var oCP = new ColorPalette(),
						oSpyFireEvent,
						oSpyPreventDefault = this.spy();

					this.stub(ColorPalette.prototype._ItemNavigation.prototype, "setItemDomRefs", function () {});
					oCP._ensureItemNavigation();
					oCP._oPaletteColorItemNavigation.oDomRef = document.getElementsByClassName("sapUiBody")[0];
					var oMockEvent = {keyCode: KeyCodes.ARROW_DOWN, preventDefault: oSpyPreventDefault, target: oCP._oPaletteColorItemNavigation.getRootDomRef()};

					oSpyFireEvent = this.spy(oCP._oPaletteColorItemNavigation, "fireEvent");
					this.stub(oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(0);
					this.stub(oCP._oPaletteColorItemNavigation, "getItemDomRefs").returns(new Array(oCP.getColors().length));
					this.stub(oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
						bIsLastItem: true,
						bIsInTheLastColumn: true
					});

					// Act
					oCP._oPaletteColorItemNavigation.onsapnext(oMockEvent);

					// Assert
					assert.equal(oSpyFireEvent.callCount, 1, " Event should be fired");
					assert.equal(oSpyFireEvent.getCall(0).args[0], ItemNavigation.Events.BorderReached, "of expected type");

					// Cleanup - not needed
			});

			QUnit.test(".onsapnext does not execute custom handling, if key different than [down] is pressed" +
				" on the 1st item",
				function (assert) {
					// Prepare
					var oCP = new ColorPalette(),
						oSpyParentOnSapNext = this.spy(ItemNavigation.prototype, "onsapnext");

					this.stub(ColorPalette.prototype._ItemNavigation.prototype, "setItemDomRefs", function () {});
					oCP._ensureItemNavigation();
					oCP._oPaletteColorItemNavigation.oDomRef = document.getElementsByClassName("sapUiBody")[0];
					var oMockEvent = {keyCode: KeyCodes.ARROW_RIGHT, target: oCP._oPaletteColorItemNavigation.getRootDomRef()};

					this.stub(oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(0);
					this.stub(oCP._oPaletteColorItemNavigation, "getItemDomRefs").returns(new Array(oCP.getColors().length));

					// Act
					oCP._oPaletteColorItemNavigation.onsapnext(oMockEvent);

					// Assert
					assert.equal(oSpyParentOnSapNext.callCount, 1, "..should forward to the parent's onsapnext");

					// Cleanup - not needed
			});

			QUnit.test(".onsapnext with [down] key moves the focus to the next row and same column, unless item is missing",
				function (assert) {
					// Prepare
					var oCP = new ColorPalette(),
						oSpyFocus = this.spy(),
						oSpyPreventDefault = this.spy(),
						aMockItems = new Array(12),
						oMockLastItem = {focus: oSpyFocus};

					this.stub(ColorPalette.prototype._ItemNavigation.prototype, "setItemDomRefs", function () {});
					oCP._ensureItemNavigation();
					oCP._oPaletteColorItemNavigation.oDomRef = document.getElementsByClassName("sapUiBody")[0];
					var oMockEvent = {keyCode: KeyCodes.ARROW_DOWN, preventDefault: oSpyPreventDefault, target: oCP._oPaletteColorItemNavigation.getRootDomRef()};

					this.stub(oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(8);
					aMockItems[11] = oMockLastItem;
					this.stub(oCP._oPaletteColorItemNavigation, "getItemDomRefs").returns(aMockItems);

					this.stub(oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
						bIsLastItem: false,
						bIsInTheLastColumn: true,
						bNextRowExists: true,
						bItemSameColumnNextRowExists: false /*whitespace*/
					});

					// Act
					oCP._oPaletteColorItemNavigation.onsapnext(oMockEvent);

					// Assert
					assert.equal(oSpyFocus.callCount, 1, "..should focus on the last available item in the last row");
					assert.equal(oSpyPreventDefault.callCount, 1, "..should prevent the default browser's action");

					// Cleanup - not needed
				});



			QUnit.module("oItemNavigation.fireEvent", {
				beforeEach: function() {
					this.oCP = new ColorPalette();
					this.oStubSetDomRef = sinon.stub(ColorPalette.prototype._ItemNavigation.prototype, "setItemDomRefs", function() {});

					this.oCP._ensureItemNavigation();
					this.oStubGetItemDomRefs = sinon.stub(this.oCP._oPaletteColorItemNavigation, "getItemDomRefs").returns(new Array(this.oCP.getColors().length));
				},
				afterEach: function() {
					this.oStubSetDomRef.restore();
					this.oStubGetItemDomRefs.restore();
				}
			}, function() {
				QUnit.test("Enriches the event parameters in case of the Border Reached Event with first item index",
					function (assert) {
						// Prepare
						var oStubGetItemInfo = this.stub(this.oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
								bIsFirstItem: true,
								bIsLastItem: false,
								bIsInTheLastColumn: false,
								bIsInTheFirstColumn: true,
								bNextRowExists: true,
								bItemSameColumnNextRowExists: true
							}),
							oEvent = {type: "sapprevious"},
							oSpyFireEventsHandler = this.stub(ItemNavigation.prototype, "fireEvent");

						// Act
						this.oCP._oPaletteColorItemNavigation.fireEvent(ItemNavigation.Events.BorderReached, {
							index: 0,
							event: oEvent
						});

						//Assert
						assert.equal(oSpyFireEventsHandler.callCount, 1, "..event BorderReached should be fired");
						assert.deepEqual(oSpyFireEventsHandler.getCall(0).args, [
							ItemNavigation.Events.BorderReached,
							{
								"direction": ItemNavigationHomeEnd.BorderReachedDirectionBackward,
								event: oEvent,
								index: 0
							}
						], "..event BorderReached should be fired with certain parameters");

						//Cleanup - not needed
					});

				QUnit.test("Enriches the event parameters in case of the Border Reached Event with last item index",
					function (assert) {
						// Prepare
						var oStubGetItemInfo = this.stub(this.oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
								bIsFirstItem: false,
								bIsLastItem: true,
								bIsInTheLastColumn: true,
								bIsInTheFirstColumn: false,
								bNextRowExists: false,
								bItemSameColumnNextRowExists: false
							}),
							oEvent = {type: "sapnext"},
							oSpyFireEventsHandler = this.stub(ItemNavigation.prototype, "fireEvent");

						// Act
						this.oCP._oPaletteColorItemNavigation.fireEvent(ItemNavigation.Events.BorderReached, {
							index: this.oCP._oPaletteColorItemNavigation.getItemDomRefs().length - 1,
							event: oEvent
						});

						//Assert
						assert.equal(oSpyFireEventsHandler.callCount, 1, "..event BorderReached should be fired");
						assert.deepEqual(oSpyFireEventsHandler.getCall(0).args, [
							ItemNavigation.Events.BorderReached,
							{
								"direction": ItemNavigationHomeEnd.BorderReachedDirectionForward,
								event: oEvent,
								index: this.oCP._oPaletteColorItemNavigation.getItemDomRefs().length - 1
							}
						], "..event BorderReached should be fired with certain parameters");

						//Cleanup - not needed
					});

				QUnit.test("Does not modify the event parameters in case of event is not Border Reached", function(assert) {
					// Prepare
					var oEventParams = {x: 1, y: 2},
						oSpyFireEventsHandler = this.stub(ItemNavigation.prototype, "fireEvent");

					// Act
					this.oCP._oPaletteColorItemNavigation.fireEvent("MyEvent", oEventParams);

					//Assert
					assert.equal(oSpyFireEventsHandler.callCount, 1, "..event should be fired");
					assert.deepEqual(oSpyFireEventsHandler.getCall(0).args, ["MyEvent", oEventParams],
						"..event should be fired with non modified parameters");

					//Cleanup - not needed
				});
			});

			QUnit.module("Home", {
				beforeEach: function() {
					this.oCP = new ColorPalette();
					this.oEvent = jQuery.Event("saphome");
					this.oStubSetDomRef = sinon.stub(ColorPalette.prototype._ItemNavigation.prototype, "setItemDomRefs", function() {});

					this.oCP._ensureItemNavigation();
					this.oCP._oPaletteColorItemNavigation.oDomRef = document.getElementsByClassName("sapUiBody")[0];
					this.oEvent.target = document.getElementsByClassName("sapUiBody")[0];
					this.oStubGetItemDomRefs = sinon.stub(this.oCP._oPaletteColorItemNavigation, "getItemDomRefs").returns(new Array(this.oCP.getColors().length));
				},
				afterEach: function() {
					this.oStubSetDomRef.restore();
					this.oStubGetItemDomRefs.restore();
				}
			}, function() {
				QUnit.test("ItemNavigationHomeEnd.onsaphome when HOME is pressed outside items (swatch) container)",
					function(assert) {
						var oSpyGetItemInfo = this.spy(this.oCP._oPaletteColorItemNavigation, "_getItemInfo");
						this.oEvent.target = undefined;
						// Act
						this.oCP._oPaletteColorItemNavigation.onsaphome(this.oEvent);
						// Assert
						assert.equal(oSpyGetItemInfo.callCount, 0, "..should skip any further processing");
					});

				QUnit.test("ItemNavigationHomeEnd.onsaphome when HOME is pressed on a item that is not first nor last" +
					" in the row", function (assert) {
					// Prepare
					var oStubOnSaphomeParent = this.stub(ItemNavigation.prototype, "onsaphome", function() {}),
						oStubGetFocusedIndex = this.stub(this.oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(1),
						oStubGetItemInfo = this.stub(this.oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
							bNextRowExists: true,
							bItemSameColumnNextRowExists: true
						});

					// Act
					this.oCP._oPaletteColorItemNavigation.onsaphome(this.oEvent);

					// Assert
					assert.equal(oStubOnSaphomeParent.callCount, 1, "..should skip custom processing and forward to" +
						" the parent's function onsaphome");

					// Cleanup - not needed, as local stubs created with this.stub are automatically restored.
				});

				QUnit.test("ItemNavigationHomeEnd.onsaphome when HOME is pressed on a item that is first in the row",
					function (assert) {
						// Prepare
						var oStubOnSaphomeParent = this.stub(ItemNavigation.prototype, "onsaphome", function() {}),
							oStubGetFocusedIndex = this.stub(this.oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(5),
							oStubFirstItemFocusFunction = this.stub(),
							oStubGetItemDomRefs = this.oCP._oPaletteColorItemNavigation.getItemDomRefs()[0] = {
								focus: oStubFirstItemFocusFunction
							},
							oStubGetItemInfo = this.stub(this.oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
								bIsInTheFirstColumn: true,
								bNextRowExists: true,
								bItemSameColumnNextRowExists: true
							});

						// Act
						this.oCP._oPaletteColorItemNavigation.onsaphome(this.oEvent);

						// Assert
						assert.equal(oStubOnSaphomeParent.callCount, 0, "..should not forward to the parent's function onsaphome");
						assert.equal(oStubFirstItemFocusFunction.callCount, 1, "..should focus the first item");

						// Cleanup - not needed
					});

				QUnit.test("ItemNavigationHomeEnd.onsaphome when HOME is pressed on first item in the whole container",
					function (assert) {
						// Prepare
						var oStubOnSaphomeParent = this.stub(ItemNavigation.prototype, "onsaphome", function() {}),
							oStubFireEventOnInstance = this.stub(this.oCP._oPaletteColorItemNavigation, "fireEvent", function() {}),
							oStubGetFocusedIndex = this.stub(this.oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(0), //on first item
							oStubGetItemInfo = this.stub(this.oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
								bIsFirstItem: true,
								bIsInTheFirstColumn: true,
								bNextRowExists: true,
								bItemSameColumnNextRowExists: true
							});

						// Act
						this.oCP._oPaletteColorItemNavigation.onsaphome(this.oEvent);

						// Assert
						assert.equal(oStubOnSaphomeParent.callCount, 0, "..should not forward to the parent.saphome");

						assert.equal(oStubFireEventOnInstance.callCount, 1, "..should fire BorderReached event");
						assert.equal(oStubFireEventOnInstance.getCall(0).args.length, 2, ".. with 2 arguments");
						assert.equal(oStubFireEventOnInstance.getCall(0).args[0], ItemNavigation.Events.BorderReached,
							".. where the first's value is as expected");
						assert.deepEqual(oStubFireEventOnInstance.getCall(0).args[1], {index: 0, event: this.oEvent},
							".. where the second's value is as expected");
						// Cleanup - not needed
					});
			});

			QUnit.module("End", {
				beforeEach: function() {
					this.oCP = new ColorPalette();
					this.oEvent = jQuery.Event("sapend");
					this.oStubSetDomRef = sinon.stub(ColorPalette.prototype._ItemNavigation.prototype, "setItemDomRefs", function() {});

					this.oCP._ensureItemNavigation();
					this.oCP._oPaletteColorItemNavigation.oDomRef = document.getElementsByClassName("sapUiBody")[0];
					this.oEvent.target = document.getElementsByClassName("sapUiBody")[0];
					this.oStubGetItemDomRefs = sinon.stub(this.oCP._oPaletteColorItemNavigation, "getItemDomRefs").returns(new Array(this.oCP.getColors().length));
				},
				afterEach: function() {
					this.oStubSetDomRef.restore();
				}
			}, function() {

				QUnit.test("ItemNavigationHomeEnd.onsapend when END is pressed outside items (swatch) container)",
					function(assert) {
						var oSpyGetItemInfo = this.spy(this.oCP._oPaletteColorItemNavigation, "_getItemInfo");
						this.oEvent.target = undefined;
						// Act
						this.oCP._oPaletteColorItemNavigation.onsapend(this.oEvent);
						// Assert
						assert.equal(oSpyGetItemInfo.callCount, 0, "..should skip any further processing");
					});


				QUnit.test("ItemNavigationHomeEnd.onsapend when END is pressed on a item that is not first nor last" +
					" in the row", function (assert) {
					// Prepare
					var oStubOnSapendParent = this.stub(ItemNavigation.prototype, "onsapend", function() {}),
						oStubGetFocusedIndex = this.stub(this.oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(1),
						oStubGetItemInfo = this.stub(this.oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
							bNextRowExists: true,
							bItemSameColumnNextRowExists: true
						});

					// Act
					this.oCP._oPaletteColorItemNavigation.onsapend(this.oEvent);

					// Assert
					assert.equal(oStubOnSapendParent.callCount, 1, "..should skip custom processing and forward to" +
						" the parent's function onsapend");

					// Cleanup - not needed
				});

				QUnit.test("ItemNavigationHomeEnd.onsapend when END is pressed on a item that is last in the row",
					function (assert) {
						// Prepare
						var oStubOnSapendParent = this.stub(ItemNavigation.prototype, "onsapend", function() {}),
							oStubGetFocusedIndex = this.stub(this.oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(9),
							oStubLastItemFocusFunction = this.stub(),
							oStubGetItemDomRefs = this.oCP._oPaletteColorItemNavigation.getItemDomRefs()[this.oCP.getColors().length - 1] = {
								focus: oStubLastItemFocusFunction
							},
							oStubGetItemInfo = this.stub(this.oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
								bIsInTheLastColumn: true,
								bNextRowExists: true,
								bItemSameColumnNextRowExists: true
							});


						// Act
						this.oCP._oPaletteColorItemNavigation.onsapend(this.oEvent);

						// Assert
						assert.equal(oStubOnSapendParent.callCount, 0, "..should not forward to the parent.onsapend");
						assert.equal(oStubLastItemFocusFunction.callCount, 1, "..should focus the last item");

						// Cleanup - not needed
					});

				QUnit.test("ItemNavigationHomeEnd.onsapend when END is pressed on last item in the whole container",
					function (assert) {
						// Prepare
						var oStubOnSapendParent = this.stub(ItemNavigation.prototype, "onsapend", function() {}),
							oStubFireEventOnInstance = this.stub(this.oCP._oPaletteColorItemNavigation, "fireEvent", function() {}),
							oStubGetFocusedIndex = this.stub(this.oCP._oPaletteColorItemNavigation, "getFocusedIndex").returns(this.oCP.getColors().length - 1), //on last item
							oStubGetItemInfo = this.stub(this.oCP._oPaletteColorItemNavigation, "_getItemInfo").returns({
								bIsLastItem: true,
								bIsInTheLastColumn: true
							});

						// Act
						this.oCP._oPaletteColorItemNavigation.onsapend(this.oEvent);

						// Assert
						assert.equal(oStubOnSapendParent.callCount, 0, "..should not forward to the parent.onsapend");

						assert.equal(oStubFireEventOnInstance.callCount, 1, "..should fire BorderReached event");
						assert.equal(oStubFireEventOnInstance.getCall(0).args.length, 2, ".. with 2 arguments");
						assert.equal(oStubFireEventOnInstance.getCall(0).args[0], ItemNavigation.Events.BorderReached,
							".. where the first's value is as expected");
						assert.deepEqual(oStubFireEventOnInstance.getCall(0).args[1], {
							index: this.oCP.getColors().length - 1,
							event: this.oEvent
						}, ".. where the second's value is as expected");
						// Cleanup - not needed
					});
			});


			QUnit.module("._getItemInfo", {
				beforeEach: function() {
					this.oCP = new ColorPalette();
					this.oStubSetDomRef = sinon.stub(ColorPalette.prototype._ItemNavigation.prototype, "setItemDomRefs", function() {});

					this.oCP._ensureItemNavigation();
				},
				afterEach: function() {
					this.oStubSetDomRef.restore();
				},
				callGetItemInfo: function(iIndex, itemsCount, oExpected, sMsg, assert) {
					// Prepare
					var aItemDomRefs = new Array(itemsCount),
						oStubGetItemDomRefs = this.stub(this.oCP._oPaletteColorItemNavigation, "getItemDomRefs").returns(aItemDomRefs),
						oResult;

					// Act
					oResult = this.oCP._oPaletteColorItemNavigation._getItemInfo(iIndex);

					// Assert
					assert.deepEqual(oResult, oExpected, sMsg);
				}
			}, function() {
				QUnit.test("first column in first row: _getItemInfo(0), items=15", function (assert) {
					var oExpected = {
						bIsFirstItem: true,
						bIsLastItem: false,
						bIsInTheLastColumn: false,
						bIsInTheFirstColumn: true,
						bNextRowExists: true,
						bItemSameColumnNextRowExists: true
					};
					// Act
					this.callGetItemInfo(0, 15, oExpected, "..check should pass", assert);
				});

				QUnit.test("last column in last row: _getItemInfo(14), items=15", function (assert) {
					var oExpected = {
						bIsFirstItem: false,
						bIsLastItem: true,
						bIsInTheLastColumn: true,
						bIsInTheFirstColumn: false,
						bNextRowExists: false,
						bItemSameColumnNextRowExists: false
					};

					// Act
					this.callGetItemInfo(14, 15, oExpected, "..check should pass", assert);
				});

				QUnit.test("first column in second row: _getItemInfo(5), items=15", function (assert) {
					var oExpected = {
						bIsFirstItem: false,
						bIsLastItem: false,
						bIsInTheLastColumn: false,
						bIsInTheFirstColumn: true,
						bNextRowExists: true,
						bItemSameColumnNextRowExists: true
					};

					// Act
					this.callGetItemInfo(5, 15, oExpected, "..check should pass", assert);
				});

				QUnit.test("last column in second row: _getItemInfo(9), items=15", function (assert) {
					var oExpected = {
						bIsFirstItem: false,
						bIsLastItem: false,
						bIsInTheLastColumn: true,
						bIsInTheFirstColumn: false,
						bNextRowExists: true,
						bItemSameColumnNextRowExists: true
					};

					// Act
					this.callGetItemInfo(9, 15, oExpected, "..check should pass", assert);
				});

				QUnit.test("second column on the first row where no next item in the same column: _getItemInfo(3), items=6",
					function (assert) {
						var oExpected = {
							bIsFirstItem: false,
							bIsLastItem: false,
							bIsInTheLastColumn: false,
							bIsInTheFirstColumn: false,
							bNextRowExists: true,
							bItemSameColumnNextRowExists: false
						};

						// Act
						this.callGetItemInfo(3, 6, oExpected, "..check should pass", assert);
					});

			});
			QUnit.module("InternalAPI - ColorHelper", function() {
				QUnit.test("getNamedColor", function (assert) {
					// Prepare
					var oCPHelper = ColorPalette.prototype._ColorsHelper;

					// Act
					assert.equal(oCPHelper.getNamedColor("#Ffb200"), "gold", "..finds the right named color for given hex");
					assert.equal(oCPHelper.getNamedColor("#000"), "black", "..finds the right named color for given short hex");
					assert.equal(oCPHelper.getNamedColor("hsl"), undefined, "..is not supported for HSL color");
					assert.equal(oCPHelper.getNamedColor("Gold"), "gold", "..works for named colors as well");
					assert.equal(oCPHelper.getNamedColor("magentanonexisting"), undefined, "..returns undefined for named colors" +
						" that does not exist");
					assert.equal(oCPHelper.getNamedColor("#CcCcCc"), undefined, "..returns undefined for HEX colors that does not correspond" +
						" to a named color");

				});
			});
			QUnit.test("Fake test to have a root module with at least one test, otherwise qunit-2 will fail", function (assert) {
				assert.ok(true, "assert ok");
			});
		});
		QUnit.test("Fake test to have a root module with at least one test, otherwise qunit-2 will fail", function (assert) {
			assert.ok(true, "assert ok");
		});
	});


	QUnit.module("Public API", function() {
		QUnit.test("Property <colors> - default value", function (assert) {
			// Act
			var oCP = new ColorPalette();

			// Assert
			assert.deepEqual(oCP.getColors(), DEFAULT_COLORS, "..should be as expected");
			// Cleanup
			oCP.destroy();
		});

		QUnit.test("Property <colors> - setColor with allowed amount of colors", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				aColors = ["green", "#fff000"],
				oSpySetProperty = this.spy(oCP, "setProperty");

			// Act
			oCP.setColors(aColors);

			// Assert
			assert.equal(oSpySetProperty.callCount, 1, ".. should call setProperty");
			assert.deepEqual(oSpySetProperty.getCall(0).args, ["colors", aColors], ".. with the given colors");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("Property <colors> - setColor with invalid color", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				aColors = ["greenn", "#fff000#"],
				oSpySetProperty = this.spy(oCP, "setProperty"),
				oSpyValidateProperty = this.spy(oCP, "validateProperty");

			// Act
			assert.throws(function () {
					oCP.setColors(aColors);
				}, '..should throw an exception with expected message'
			);

			assert.equal(oSpyValidateProperty.callCount, 1, ".. should delegate validation to the validateProperty");
			assert.equal(oSpySetProperty.callCount, 0, ".. should not really call the setProperty");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("Property <colors> - setColor with valid colors, but less than allowed", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				aColors = DEFAULT_COLORS.slice().concat(["#FFFAAA"]);
			oSpySetProperty = this.spy(oCP, "setProperty");

			// Act
			assert.throws(function () {
					oCP.setColors(aColors);
				},
				Error("Cannot set property 'colors' - array must has minimum 2 and maximum 15 elements"),
				"..should throw an exception with expected message"
			);
			assert.equal(oSpySetProperty.callCount, 0, ".. should not really call the setProperty");

			// Cleanup
			oCP.destroy();
		});

		QUnit.test("Property <colors> - setColor with valid colors, but more than allowed", function (assert) {
			// Prepare
			var oCP = new ColorPalette(),
				aColors = ["green"],
				oSpySetProperty = this.spy(oCP, "setProperty");

			// Act
			assert.throws(function () {
					oCP.setColors(aColors);
				},
				Error("Cannot set property 'colors' - array must has minimum 2 and maximum 15 elements"),
				'.. should throw an exception with expected message'
			);

			assert.equal(oSpySetProperty.callCount, 0, ".. should not really set call the setProperty");

			// Cleanup
			oCP.destroy();
		});
	});


	QUnit.module("ColorPalette - ARIA", function() {
		// The ARIA tests are the only ones, that checks something at the DOM. DOM rendering is supposed to be tested via OPA.
		QUnit.test("ARIA attributes and tooltips are rendered", function (assert) {
			// Prepare
			var oCP = new ColorPalette({
					colors: [
						"black",
						"#ffffff",
						"#a811ff"
					]/*black, white, non-named*/
				}),
				oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
				sBlack = oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR_BLACK"),
				sWhite = oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR_WHITE"),
				$SwatchContainer,
				$aSwatches,
				sCPSwatchContainerTitle = oBundle.getText("COLOR_PALETTE_SWATCH_CONTAINER_TITLE");

			// Act
			oCP.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// Assert
			// swatch container
			$SwatchContainer = oCP.$().find(".sapMColorPaletteContent");
			assert.equal($SwatchContainer.attr("role"), "region", "Swatch Container: role");
			assert.equal($SwatchContainer.attr("aria-label"), sCPSwatchContainerTitle, "Swatch Container: aria-label");

			// swatches
			$aSwatches = oCP._getAllPaletteColorSwatches();

			assert.equal($aSwatches[0].getAttribute("role"), "button", "Swatch 1 role");
			assert.equal($aSwatches[0].getAttribute("aria-label"), oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR", [1, sBlack]),
				"Swatch 1 label");
			assert.equal($aSwatches[0].getAttribute("title"), oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR", [1, sBlack]),
				"Swatch 1 title");

			assert.equal($aSwatches[1].getAttribute("role"), "button", "Swatch 2 role");
			assert.equal($aSwatches[1].getAttribute("aria-label"), oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR", [2, sWhite]),
				"Swatch 2 label");
			assert.equal($aSwatches[1].getAttribute("title"), oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR", [2, sWhite]),
				"Swatch 2 title");

			assert.equal($aSwatches[2].getAttribute("role"), "button", "Swatch 3 role");
			assert.equal($aSwatches[2].getAttribute("aria-label"), oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR", [3,
					oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR_CUSTOM")]),
				"Swatch 3 label");
			assert.equal($aSwatches[2].getAttribute("title"), oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR", [3,
					oBundle.getText("COLOR_PALETTE_PREDEFINED_COLOR_CUSTOM")]),
				"Swatch 3 title");

			// Cleanup
			oCP.destroy();
		});
	});


	QUnit.module("ColorPalettePopover", function() {
		QUnit.module("API", function() {
			QUnit.test("exit", function (assert) {
				var oCPP = new ColorPalettePopover(),
					oSpyPopoverRemoveDelegate = this.spy(),
					oSpyPopoverDestroy = this.spy(),
					onAfterRenderingDelegate = {};

				oCPP._oPopover = {
					removeDelegate: oSpyPopoverRemoveDelegate,
					destroy: oSpyPopoverDestroy,
					_onAfterRenderingDelegate: onAfterRenderingDelegate,
					getDomRef: function () {
					}

				};

				// Act
				oCPP.destroy();

				// Assert
				assert.equal(oSpyPopoverDestroy.callCount, 1, "..should destroy internal popover");
				assert.equal(oSpyPopoverRemoveDelegate.callCount, 1, "..should call internal popover's removeDelegate");
				assert.deepEqual(oSpyPopoverRemoveDelegate.getCall(0).args, [onAfterRenderingDelegate],
					"..with the right delegate object");
				assert.notOk(oCPP._oPopover, "..should not keep reference to the popover");

			});

			QUnit.test("openBy", function (assert) {
				// Prepare
				var oOpener = new Button(),
					oCPP = new ColorPalettePopover(),
					oRPopover = new ResponsivePopover(),
					oStubEnsurePopover = this.stub(oCPP, "_ensurePopover", function () {
						return oRPopover;
					}),
					oSpyResponsivePopoverOpenBy = this.spy(ResponsivePopover.prototype, "openBy");

				// Act
				oCPP.openBy(oOpener);

				// Assert
				assert.equal(oSpyResponsivePopoverOpenBy.callCount, 1, "..should call ResponsivePopover.openBy");
				assert.deepEqual(oSpyResponsivePopoverOpenBy.getCall(0).args, [oOpener]);

				// Cleanup
				oOpener.destroy();
				oCPP.destroy();
				oStubEnsurePopover.restore();
				oSpyResponsivePopoverOpenBy.restore();
			});


			QUnit.test("getDomRef", function (assert) {
				// Prepare
				var oOpener = new Button(),
					oCPP = new ColorPalettePopover(),
					oRPopover = new ResponsivePopover(),
					oStubEnsurePopover = this.stub(oCPP, "_ensurePopover", function () {
						return oRPopover;
					}),
					oSpyResponsivePopoverGetDomRef = this.spy(ResponsivePopover.prototype, "getDomRef");

				// Act
				oCPP.getDomRef();

				// Assert
				assert.equal(oSpyResponsivePopoverGetDomRef.callCount, 1, "..should call ResponsivePopover.getDomRef");
				assert.deepEqual(oSpyResponsivePopoverGetDomRef.getCall(0).args, []);

				// Cleanup
				oOpener.destroy();
				oCPP.destroy();
				oStubEnsurePopover.restore();
				oSpyResponsivePopoverGetDomRef.restore();
			});

			QUnit.test("close", function (assert) {
				// Prepare
				var oOpener = new Button(),
					oCPP = new ColorPalettePopover(),
					oRPopover = new ResponsivePopover(),
					oStubEnsurePopover = this.stub(oCPP, "_ensurePopover", function () {
						return oRPopover;
					}),
					oSpyResponsivePopoveClose = this.spy(ResponsivePopover.prototype, "close");

				// Act
				oCPP.close();

				// Assert
				assert.equal(oSpyResponsivePopoveClose.callCount, 1, "..should call ResponsivePopover.close");
				assert.deepEqual(oSpyResponsivePopoveClose.getCall(0).args, []);

				// Cleanup
				oOpener.destroy();
				oCPP.destroy();
				oStubEnsurePopover.restore();
				oSpyResponsivePopoveClose.restore();
			});


			QUnit.test("Property <colors>", function (assert) {
				// Prepare
				var oCP = new ColorPalette(),
					oCPP = new ColorPalettePopover(),
					oStub_getPalette = this.stub(oCPP, "_getPalette").returns(oCP),
					oSpyCPSetColor = this.spy(ColorPalette.prototype.setColors, "call"),
					oSpyCPSetProperty = this.spy(ColorPalette.prototype, "setProperty");

				// Act
				oCPP.setColors(["red", "green"]);

				// Assert
				assert.equal(oSpyCPSetColor.callCount, 1, "..should call the setColors to the ColorPalette");
				assert.deepEqual(oSpyCPSetColor.getCall(0).args, [oCP, ["red", "green"]], "..with the same parameter");
				assert.equal(oSpyCPSetProperty.callCount, 1, "..should call the setProperty on the Control");
				assert.deepEqual(oSpyCPSetProperty.getCall(0).args, ["colors", ["red", "green"]], " ..with same parameter");

				// Cleanup
				oStub_getPalette.restore();
				oSpyCPSetColor.restore();
				oCP.destroy();
				oCPP.destroy();
			});

			QUnit.test("Property <showDefaultColorButton>", function (assert) {
				// Prepare
				var oCP = new ColorPalette(),
					oCPP = new ColorPalettePopover(),
					oStub_getPalette = this.stub(oCPP, "_getPalette").returns(oCP),
					oSpyCP_setShowDefaultColorButton = this.spy(ColorPalette.prototype._setShowDefaultColorButton, "call"),
					oSpyCPP_setShowDefaultColorButton = this.spy(Control.prototype.setProperty, "apply");

				// Act
				oCPP.setShowDefaultColorButton(true);

				// Assert
				assert.equal(oSpyCP_setShowDefaultColorButton.callCount, 1, "..should call the _setShowDefaultColorButton to the ColorPalette");
				assert.deepEqual(oSpyCP_setShowDefaultColorButton.getCall(0).args[1],
					/*first param is the instance, second is the value*/true, "..with the same parameter");
				assert.equal(oSpyCPP_setShowDefaultColorButton.callCount, 1, "..should call the setProperty on the Control");
				assert.deepEqual(oSpyCPP_setShowDefaultColorButton.getCall(0).args[1], {
					0: "showDefaultColorButton",
					1: true
				}, "..with same parameter");

				// Cleanup
				oStub_getPalette.restore();
				oSpyCP_setShowDefaultColorButton.restore();
				oSpyCPP_setShowDefaultColorButton.restore();
				oCP.destroy();
				oCPP.destroy();
			});

			QUnit.test("Property <showMoreColorsButton>", function (assert) {
				// Prepare
				var oCP = new ColorPalette(),
					oCPP = new ColorPalettePopover(),
					oStub_getPalette = this.stub(oCPP, "_getPalette").returns(oCP),
					oSpyCP_setShowMoreColorsButton = this.spy(ColorPalette.prototype._setShowMoreColorsButton, "call"),
					oSpyCPP_setShowMoreColorsButton = this.spy(Control.prototype.setProperty, "apply");

				// Act
				oCPP.setShowMoreColorsButton(true);

				// Assert
				assert.equal(oSpyCP_setShowMoreColorsButton.callCount, 1, "..should call the _setShowMoreColorsButton to the ColorPalette");
				assert.deepEqual(oSpyCP_setShowMoreColorsButton.getCall(0).args[1],
					/*first param is the instance, second is the value*/true, "..with the same parameter");
				assert.equal(oSpyCPP_setShowMoreColorsButton.callCount, 1, "..should call the setProperty on the Control");
				assert.deepEqual(oSpyCPP_setShowMoreColorsButton.getCall(0).args[1], {
					0: "showMoreColorsButton",
					1: true
				}, "..with same parameter");

				// Cleanup
				oStub_getPalette.restore();
				oSpyCP_setShowMoreColorsButton.restore();
				oSpyCPP_setShowMoreColorsButton.restore();
				oCP.destroy();
				oCPP.destroy();
			});

			QUnit.test("colorSelect event ", function (assert) {
				// Prepare
				var oCPP = new ColorPalettePopover(),
					/* custom spies as the event cannot be kept after it is being thrown (the framework returns it back to the pool)*/
					oSpyColorSelectParams = {},
					aColorSelectCalls = [];

				oCPP.attachEvent("colorSelect", function (oEvent) {
					aColorSelectCalls.push("");
					oSpyColorSelectParams = oEvent.getParameters();
				});

				// Act
				oCPP._getPalette().fireEvent("colorSelect", {value: 'red', defaultAction: true});

				// Assert
				assert.ok(aColorSelectCalls.length, 1, "..is fired when the inner ColorPalette fires its own colorSelect");
				assert.deepEqual(oSpyColorSelectParams.value, "red", "..and has the expected parameter 'value'");
				assert.deepEqual(oSpyColorSelectParams.defaultAction, true, "..and has the expected parameter 'defaultAction'");

				// Cleanup
				oCPP.destroy();
			});

			QUnit.test("Property displayMode", function (assert) {
				// Prepare
				var oCP = new ColorPalette(),
					oCPP = new ColorPalettePopover(),
					oStubGetPalette = this.stub(oCPP, "_getPalette").returns(oCP),
					oSpyCPsetDisplayMode = this.spy(ColorPalette.prototype._setDisplayMode, "call");

				// Act
				oCPP.setDisplayMode(ColorPickerDisplayMode.Simplified);

				// Assert
				assert.ok(oSpyCPsetDisplayMode.calledOnce, "..should call the _setDisplayMode to the ColorPalette");
				assert.deepEqual(oSpyCPsetDisplayMode.getCall(0).args[1],
					/*first param is the instance, second is the value*/ColorPickerDisplayMode.Simplified,
					"ColorPalette internal method _setDisplayMode is called with correct parameters");
				assert.ok(oCPP.getDisplayMode(), ColorPickerDisplayMode.Simplified, "Correct displayMode is set to the ColorPalettePopover");

				// Cleanup
				oStubGetPalette.restore();
				oSpyCPsetDisplayMode.restore();
				oCP.destroy();
				oCPP.destroy();
			});
		});

		QUnit.module("ColorPalettePopover - Private API functions", function() {
			QUnit.test("_ensurePopover", function (assert) {
				// Prepare
				var oCPP = new ColorPalettePopover(),
					oFakePopover = {destroy: jQuery.noop, getDomRef: jQuery.noop, removeDelegate: jQuery.noop},
					oStubCreatePopover = this.stub(oCPP, "_createPopover").returns(oFakePopover);

				oCPP._oPopover = null;

				// Act
				oCPP._ensurePopover();


				// Assert
				assert.deepEqual(oCPP._oPopover, oFakePopover, "..should assign an instance to private _oPopover like the " +
					"one returned from the _createPopover");

				// Act
				oCPP._ensurePopover();

				// Assert
				assert.deepEqual(oCPP._oPopover, oFakePopover, "..should reuse the existing instance");


				// Cleanup
				oCPP.destroy();
				oStubCreatePopover.restore();
			});


			QUnit.test("Popover is closed when ColorPalette is about to open the ColorPicker", function (assert) {
				// Prepare
				var oCPP = new ColorPalettePopover(),
					oSpyPopoverClose = this.spy(oCPP._oPopover, "close");

				// Act
				oCPP._getPalette().fireEvent("_beforeOpenColorPicker");

				// Assert
				assert.equal(oSpyPopoverClose.callCount, 1, "..popover close method should be called");


				// Cleanup
				oCPP.destroy();
				oSpyPopoverClose.restore();
			});

			QUnit.test("Popover is closed when end-user chooses a color from ColorPalette ", function (assert) {
				// Prepare
				var oCPP = new ColorPalettePopover(),
					oSpyPopoverClose = this.spy(oCPP._oPopover, "close");

				// Act
				oCPP._getPalette().fireEvent("colorSelect");

				// Assert
				assert.equal(oSpyPopoverClose.callCount, 1, "..popover close method should be called");

				// Cleanup
				oCPP.destroy();
				oSpyPopoverClose.restore();
			});

			QUnit.test("_handleNextOrPreviousUponPaletteClose - ColorPalette closed with TAB", function (assert) {
				// Prepare
				var oCPP = new ColorPalettePopover(),
					oTabEvent = jQuery.Event("saptabnext"),
					oSpyPreventDefault = this.spy(oTabEvent, "preventDefault"),
					oSpyStopPropagation = this.spy(oTabEvent, "stopPropagation");

				// Act
				oCPP._getPalette()._fireColorSelect("white", false, oTabEvent); // [TAB] on the "white" swatch

				// Assert
				assert.equal(oSpyPreventDefault.callCount, 1, "..should prevent the default event handling in order to preserve " +
					" the focus on the opener");
				assert.equal(oSpyStopPropagation.callCount, 1, "..should stop event propagation in order to preserve the focus" +
					" on the opener");

				// Cleanup
				oCPP.destroy();
			});

			QUnit.test("_handleNextOrPreviousUponPaletteClose - ColorPalette closed with SHIFT+TAB", function (assert) {
				// Prepare
				var oCPP = new ColorPalettePopover(),
					oShiftTabEvent = jQuery.Event("saptabprevious"),
					oSpyPreventDefault = this.spy(oShiftTabEvent, "preventDefault"),
					oSpyStopPropagation = this.spy(oShiftTabEvent, "stopPropagation");

				// Act
				oCPP._getPalette()._fireColorSelect("white", false, oShiftTabEvent); // [SHIFT+TAB] on the "white" swatch

				// Assert
				assert.equal(oSpyPreventDefault.callCount, 1, "..should prevent the default event handling in order to preserve " +
					" the focus on the opener");
				assert.equal(oSpyStopPropagation.callCount, 1, "..should stop event propagation in order to preserve the focus" +
					" on the opener");

				// Cleanup
				oCPP.destroy();
			});
		});

		QUnit.module("ColorPalettePopover - ARIA", function() {
			// The ARIA tests are the only ones, that checks something at the DOM. DOM rendering is supposed to be tested via OPA.
			QUnit.test("Popover has certain aria attributes", function (assert) {
				// Prepare
				var oCPP = new ColorPalettePopover(),
					oOpener = new Button();

				oOpener.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();

				// Act
				oCPP.openBy(oOpener);

				// Assert
				assert.equal(oCPP._oPopover.$().attr("aria-modal"), "true", "aria-modal");
				assert.equal(oCPP._oPopover.$().attr("aria-label"), oCPP._oPopover.getTitle(), "aria-label");

				// Cleanup
				oCPP.destroy();
			});
		});

		QUnit.module("ColorPalette Recent Colors", function() {
			QUnit.test("When color is selected it is pushed to recent colors array", function (assert) {
				// Prepare
				var oCP = new ColorPalette();

				// Act
				oCP._fireColorSelect("red", false, {});

				// Assert
				assert.strictEqual(oCP._getRecentColors().length,1,"The color is pushed into the recent colors array");

				// Cleanup
				oCP.destroy();
			});

			QUnit.test("When color is selected and it's already in the array it goes to first place", function (assert) {
				// Prepare
				var oCP = new ColorPalette(),
					aTestArray = ["blue", "pink", "red"];

				// Act
				oCP._fireColorSelect("red", false, {});
				oCP._fireColorSelect("blue", false, {});
				oCP._fireColorSelect("pink", false, {});
				oCP._fireColorSelect("blue", false, {});

				// Assert
				assert.deepEqual(oCP._getRecentColors(), aTestArray, "The color is pushed into the recent colors array");

				// Cleanup
				oCP.destroy();
			});

			QUnit.test("When color is selected and there are already 5 colors in the array it goes to first place and the last one is popped", function (assert) {
				// Prepare
				var oCP = new ColorPalette(),
					aTestArray = ["black", "green", "purple","pink","blue"];

				// Act
				oCP._fireColorSelect("red", false, {});
				oCP._fireColorSelect("blue", false, {});
				oCP._fireColorSelect("pink", false, {});
				oCP._fireColorSelect("purple", false, {});
				oCP._fireColorSelect("green", false, {});
				oCP._fireColorSelect("black", false, {});

				// Assert
				assert.deepEqual(oCP._getRecentColors(), aTestArray, "The color is pushed into the recent colors array and the last one is popped");

				// Cleanup
				oCP.destroy();
			});
		});

		QUnit.test("Fake test to have a root module with at least one test, otherwise qunit-2 will fail", function (assert) {
			assert.ok(true, "assert ok");
		});
	});

});