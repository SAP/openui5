/*global QUnit, sinon*/
sap.ui.define([
	"sap/f/library",
	"sap/ui/thirdparty/jquery",
	"sap/f/IllustratedMessage",
	"sap/m/Button",
	"sap/ui/core/Core"
],
function (
	library,
	jQuery,
	IllustratedMessage,
	Button,
	Core
) {
	"use strict";

	// shortcut for sap.f.IllustratedMessageSize
	var IllustratedMessageSize = library.IllustratedMessageSize;

	// shortcut for sap.f.IllustratedMessageType
	var IllustratedMessageType = library.IllustratedMessageType;

	/* --------------------------- IllustratedMessage API -------------------------------------- */
	QUnit.module("IllustratedMessage - API ", {
		beforeEach: function () {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage({
				title: "Test title",
				description: "Test description",
				additionalContent: new Button({text: "Test button"})
			});
			this.oIllustratedMessage.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("Instantiation", function (assert) {
		// Arrange
		var oIllustratedMessageMetadata = this.oIllustratedMessage.getMetadata(),
			aPublicProperties = oIllustratedMessageMetadata._mAllProperties,
			aPublicAggregations = oIllustratedMessageMetadata._mAllAggregations,
			aPrivateAggregations = oIllustratedMessageMetadata._mAllPrivateAggregations;

		// Assert
		assert.ok(this.oIllustratedMessage, "The IllustratedMessage has instantiated successfully");
		assert.ok(this.oIllustratedMessage.getTitle(), "The IllustratedMessage title has instantiated successfully");
		assert.strictEqual(aPublicProperties["title"].type, "string", "The type of the title property is string");
		assert.ok(this.oIllustratedMessage.getDescription(), "The IllustratedMessage description has instantiated successfully");
		assert.strictEqual(aPublicProperties["description"].type, "string", "The type of the description property is string");
		assert.notOk(this.oIllustratedMessage.getEnableFormattedText(), "The IllustratedMessage enableFormattedText is false by default");
		assert.strictEqual(aPublicProperties["enableFormattedText"].type, "boolean", "The type of the enableFormattedText property is boolean");
		assert.strictEqual(aPublicProperties["illustrationSize"].type, "sap.f.IllustratedMessageSize", "The type of the illustrationSize property is sap.f.IllustratedMessageSize");
		assert.strictEqual(aPublicProperties["illustrationType"].type, "string", "The type of the illustrationType property is string");
		assert.ok(this.oIllustratedMessage.getAdditionalContent(), "The IllustratedMessage additional content has instantiated successfully");
		assert.strictEqual(aPublicAggregations["additionalContent"].type, "sap.m.Button", "The type of the additionalContent aggregation is sap.m.Button");
		assert.notOk(this.oIllustratedMessage.getAggregation("_formattedText"), "The IllustratedMessage _formattedText is not instantiated by default");
		assert.strictEqual(aPrivateAggregations["_formattedText"].type, "sap.m.FormattedText", "The type of the _formattedText aggregation is sap.m.FormattedText");
		assert.ok(this.oIllustratedMessage.getAggregation("_illustration"), "The IllustratedMessage _illustration has instantiated successfully");
		assert.strictEqual(aPrivateAggregations["_illustration"].type, "sap.f.Illustration", "The type of the _illustration aggregation is sap.f.Illustration");
		assert.ok(this.oIllustratedMessage.getAggregation("_text"), "The IllustratedMessage _text has instantiated successfully");
		assert.strictEqual(aPrivateAggregations["_text"].type, "sap.m.Text", "The type of the _text aggregation is sap.m.Text");
		assert.ok(this.oIllustratedMessage.getAggregation("_title"), "The IllustratedMessage _title has instantiated successfully");
		assert.strictEqual(aPrivateAggregations["_title"].type, "sap.m.Title", "The type of the _title aggregation is sap.m.Title");
		assert.strictEqual(this.oIllustratedMessage.getIllustrationSize(), IllustratedMessageSize.Auto, "The IllustratedMessage illustrationSize property has the correct default value");
		assert.strictEqual(this.oIllustratedMessage.getIllustrationType(), IllustratedMessageType.NoSearchResults, "The IllustratedMessage illustrationType property has the correct default value");
	});

	/* --------------------------- IllustratedMessage Lifecycle -------------------------------------- */
	QUnit.module("IllustratedMessage - Lifecycle ", {
		beforeEach: function () {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage();
			this.oIllustratedMessage.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("init", function (assert) {
		// Arrange
		var fnUpdateInternalSpy = sinon.spy(this.oIllustratedMessage, "_updateInternalIllustrationSetAndType");

		// Act
		this.oIllustratedMessage.init();

		// Assert
		assert.ok(fnUpdateInternalSpy.calledOnce, "_updateInternalIllustrationSetAndType called once on init");
		assert.ok(fnUpdateInternalSpy.calledWithExactly(this.oIllustratedMessage.getIllustrationType()),
			"_updateInternalIllustrationSetAndType called width the illustrationType");

		// Clean
		fnUpdateInternalSpy.restore();
	});

	QUnit.test("onBeforeRendering", function (assert) {
		// Arrange
		var fnDetachResizeSpy = sinon.spy(this.oIllustratedMessage, "_detachResizeHandlers");

		// Act
		this.oIllustratedMessage.onBeforeRendering();

		// Assert
		assert.ok(fnDetachResizeSpy.calledOnce, "_detachResizeHandlers called once onBeforeRendering");

		// Clean
		fnDetachResizeSpy.restore();
	});

	QUnit.test("onAfterRendering", function (assert) {
		// Arrange
		var fnUpdateDomSizeSpy = sinon.spy(this.oIllustratedMessage, "_updateDomSize"),
			fnAttachResizeSpy = sinon.spy(this.oIllustratedMessage, "_attachResizeHandlers");

		// Act
		this.oIllustratedMessage.onAfterRendering();

		// Assert
		assert.ok(fnUpdateDomSizeSpy.calledOnce, "_updateDomSize called once onAfterRendering");
		assert.ok(fnAttachResizeSpy.calledOnce, "_attachResizeHandlers called once onAfterRendering");

		// Clean
		fnUpdateDomSizeSpy.restore();
		fnAttachResizeSpy.restore();
	});

	QUnit.test("exit", function (assert) {
		// Arrange
		var fnDetachResizeSpy = sinon.spy(this.oIllustratedMessage, "_detachResizeHandlers");

		// Act
		this.oIllustratedMessage.exit();

		// Assert
		assert.ok(fnDetachResizeSpy.calledOnce, "_detachResizeHandlers called once on exit");

		// Clean
		fnDetachResizeSpy.restore();
	});

	/* --------------------------- IllustratedMessage GETTERS/SETTERS -------------------------------------- */
	QUnit.module("IllustratedMessage - getters and setters ", {
		beforeEach: function () {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage();
			this.oIllustratedMessage.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("setIllustrationType", function (assert) {
		// Arrange
		var fnUpdateInternalSpy = sinon.spy(this.oIllustratedMessage, "_updateInternalIllustrationSetAndType"),
			sNewType = IllustratedMessageType.UnableToLoad;

		// Act
		this.oIllustratedMessage.setIllustrationType(sNewType);

		// Assert
		assert.ok(fnUpdateInternalSpy.calledOnce, "_updateInternalIllustrationSetAndType called once on setIllustrationType");
		assert.ok(fnUpdateInternalSpy.calledWithExactly(sNewType),
			"_updateInternalIllustrationSetAndType called with the new IllustratedMessageType.UnableToLoad illustrationType");

		// Clean
		fnUpdateInternalSpy.restore();
	});

	QUnit.test("_getDescription - sap.m.FormattedText", function (assert) {
		// Arrange
		var oDescription,
			sCurrDescrVal,
			sDefaultText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.DESCRIPTION + this.oIllustratedMessage._sIllustrationType, [], true),
			sTestDescrVal = "Test descr";

		// Act - Force use of FormattedText
		this.oIllustratedMessage.setEnableFormattedText(true);
		oDescription = this.oIllustratedMessage._getDescription();
		sCurrDescrVal = oDescription.getHtmlText();

		// Assert
		assert.ok(oDescription.isA("sap.m.FormattedText"),
			"Internal getter _getDescription is correctly returning an sap.m.FormattedText if enableFormattedText property is true");
		assert.strictEqual(sCurrDescrVal, sDefaultText,
			"The default text for the current _sIllustrationType is correctly set as htmlText for the sap.m.FormattedText,"
			+ "if there is no description input from the app developer");

		// Act
		this.oIllustratedMessage.setDescription(sTestDescrVal);
		oDescription = this.oIllustratedMessage._getDescription();
		sCurrDescrVal = oDescription.getHtmlText();

		// Assert
		assert.notEqual(sCurrDescrVal, sDefaultText,
			"The default text for the current _sIllustrationType is no longer used as htmlText for the sap.m.FormattedText,"
			+ "if there is description input from the app developer");
		assert.strictEqual(sCurrDescrVal, sTestDescrVal, "The FormattedText is correctly set, if there is description input from the app developer");
	});

	QUnit.test("_getDescription - sap.m.Text", function (assert) {
		// Arrange
		var oDescription = this.oIllustratedMessage._getDescription(),
			sCurrDescrVal = oDescription.getText(),
			sDefaultText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.DESCRIPTION + this.oIllustratedMessage._sIllustrationType, [], true),
			sTestDescrVal = "Test descr";

		// Assert
		assert.ok(oDescription.isA("sap.m.Text"),
			"Internal getter _getDescription is correctly returning an sap.m.Text if enableFormattedText property is false (default)");
		assert.strictEqual(sCurrDescrVal, sDefaultText,
			"The default text for the current _sIllustrationType is correctly set as text for the sap.m.Text,"
			+ "if there is no description input from the app developer");

		// Act
		this.oIllustratedMessage.setDescription(sTestDescrVal);
		oDescription = this.oIllustratedMessage._getDescription();
		sCurrDescrVal = oDescription.getText();

		// Assert
		assert.notEqual(sCurrDescrVal, sDefaultText,
			"The default text for the current _sIllustrationType is no longer used as text for the sap.m.Text,"
			+ "if there is description input from the app developer");
		assert.strictEqual(sCurrDescrVal, sTestDescrVal, "The Text is correctly set, if there is description input from the app developer");
	});

	QUnit.test("_getIllustration", function (assert) {
		// Arrange
		var oIllustration = this.oIllustratedMessage._getIllustration();

		// Assert
		assert.ok(oIllustration.isA("sap.f.Illustration"), "Internal getter _getIllustration is correctly returning an sap.f.Illustration");
	});

	QUnit.test("_getResourceBundle", function (assert) {
		// Assert
		assert.strictEqual(this.oIllustratedMessage._getResourceBundle(), Core.getLibraryResourceBundle("sap.f"),
			"Internal getter _getResourceBundle is correctly returning the sap.f resource bundle");
	});

	QUnit.test("_getTitle", function (assert) {
		// Arrange
		var sTitleText = this.oIllustratedMessage._getTitle().getText(),
		sNewTitleVal = "Test title",
		sDefaultText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.TITLE + this.oIllustratedMessage._sIllustrationType, [], true);

		// Assert
		assert.ok(this.oIllustratedMessage._getTitle().isA("sap.m.Title"), "Internal getter _getTitle is correctly returning an sap.m.Title");
		assert.strictEqual(sTitleText, sDefaultText,
			"The default text for the current _sIllustrationType is correctly set as text for the Title,"
			+ "if there is no title input from the app developer");

		// Act
		this.oIllustratedMessage.setTitle(sNewTitleVal);
		sTitleText = this.oIllustratedMessage._getTitle().getText();

		// Assert
		assert.notEqual(sTitleText, sDefaultText,
			"The default text for the current _sIllustrationType is no longer used as text for the Title,"
			+ "if there is title input from the app developer");
		assert.strictEqual(sTitleText, sNewTitleVal, "The Title is correctly set, if there is title input from the app developer");
	});

	/* --------------------------- IllustratedMessage Private methods -------------------------------------- */

	QUnit.module("IllustratedMessage - Private methods ", {
		beforeEach: function () {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage();
			this.oIllustratedMessage.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("_updateDomSize", function (assert) {
		// Arrange
		var fnUpdateMediaSpy = sinon.spy(this.oIllustratedMessage, "_updateMedia"),
			fnUpdateMediaStyleSpy = sinon.spy(this.oIllustratedMessage, "_updateMediaStyle"),
			sNewSize = IllustratedMessageSize.Dialog;

		// Act
		this.oIllustratedMessage._updateDomSize();

		// Assert
		assert.ok(fnUpdateMediaStyleSpy.calledOnce,
			"_updateMediaStyle is called once inside the _updateMedia call when illustrationSize is IllustratedMessageSize.Auto");
		assert.ok(fnUpdateMediaSpy.calledOnce, "_updateMedia is called once when illustrationSize is IllustratedMessageSize.Auto");
		assert.ok(fnUpdateMediaSpy.calledWithExactly(this.oIllustratedMessage.getDomRef().getBoundingClientRect().width),
			"_updateMedia called width the IllustratedMessage's Dom Reference width");

		// Act
		fnUpdateMediaSpy.reset();
		fnUpdateMediaStyleSpy.reset();
		this.oIllustratedMessage.setIllustrationSize(sNewSize);
		this.oIllustratedMessage._updateDomSize();

		// Assert
		assert.ok(fnUpdateMediaStyleSpy.calledOnce,
			"_updateMediaStyle is called once inside the _updateDomSize call when illustrationSize is different from IllustratedMessageSize.Auto");
		assert.ok(fnUpdateMediaStyleSpy.calledWithExactly(IllustratedMessage.MEDIA[sNewSize.toUpperCase()]),
			"_updateMediaStyle called width the IllustratedMessage's media with new illustrationSize to upper case as key");
		assert.strictEqual(fnUpdateMediaSpy.callCount, 0, "_updateMedia is not called when illustrationSize is different from IllustratedMessageSize.Auto");

		// Clean
		fnUpdateMediaSpy.restore();
		fnUpdateMediaStyleSpy.restore();
	});

	QUnit.test("_updateInternalIllustrationSetAndType", function (assert) {
		// Arrange
		var sNewType = IllustratedMessageType.UnableToLoad,
			aValues = sNewType.split("-"),
			sIllustrationSet = aValues[0],
			sIllustrationType = aValues[1];

		// Act
		this.oIllustratedMessage._updateInternalIllustrationSetAndType(sNewType);

		// Assert
		assert.strictEqual(this.oIllustratedMessage._sIllustrationSet, sIllustrationSet,
			"Internal variable _sIllustrationSet is correctly set on _updateInternalIllustrationSetAndType call with a new type");
		assert.strictEqual(this.oIllustratedMessage._sIllustrationType, sIllustrationType,
			"Internal variable _sIllustrationType is correctly set on _updateInternalIllustrationSetAndType call with a new type");
	});

	QUnit.test("_attachResizeHandlers", function (assert) {
		// Arrange
		var sResizeHandlerId = IllustratedMessage.RESIZE_HANDLER_ID.CONTENT,
			fnRegisterResizeSpy = sinon.spy(this.oIllustratedMessage, "_registerResizeHandler");

		this.oIllustratedMessage[sResizeHandlerId] = null;

		// Act
		this.oIllustratedMessage._attachResizeHandlers();

		// Assert
		assert.ok(fnRegisterResizeSpy.calledOnce,
			"_registerResizeHandler called once inside the _attachResizeHandlers call when illustrationSize is IllustratedMessageSize.Auto");
		assert.strictEqual(fnRegisterResizeSpy.args[0][0], IllustratedMessage.RESIZE_HANDLER_ID.CONTENT,
			"First argument of the _registerResizeHandler call is the correct IllustratedMessage.RESIZE_HANDLER_ID.CONTENT");
		assert.strictEqual(fnRegisterResizeSpy.args[0][1], this.oIllustratedMessage,
			"Second argument is the instance of the IllustratedMessage");
		assert.strictEqual(typeof this.oIllustratedMessage[sResizeHandlerId], 'string',
			"New resize handler is registered after calling the _registerResizeHandler function");

		// Act
		fnRegisterResizeSpy.reset();
		this.oIllustratedMessage[sResizeHandlerId] = null;
		this.oIllustratedMessage.setIllustrationSize(IllustratedMessageSize.Spot);

		// Assert
		assert.strictEqual(fnRegisterResizeSpy.callCount, 0,
			"_registerResizeHandler is not called inside the _attachResizeHandlers call when illustrationSize is different from IllustratedMessageSize.Auto");
		assert.strictEqual(this.oIllustratedMessage[sResizeHandlerId], null,
			"No new resize handler is registered after calling the _registerResizeHandler function");

		// Clean
		fnRegisterResizeSpy.restore();
	});

	QUnit.test("_detachResizeHandlers", function (assert) {
		// Arrange
		var sResizeHandlerId = IllustratedMessage.RESIZE_HANDLER_ID.CONTENT,
			fnDeregisterResizeSpy = sinon.spy(this.oIllustratedMessage, "_deRegisterResizeHandler");

		// Assert
		assert.strictEqual(typeof this.oIllustratedMessage[sResizeHandlerId], 'string',
			"Resize handler is initially registered when illustrationSize is from IllustratedMessageSize.Auto");

		// Act
		this.oIllustratedMessage._detachResizeHandlers();

		// Assert
		assert.ok(fnDeregisterResizeSpy.calledOnce,
			"_deRegisterResizeHandler is called once inside the _detachResizeHandlers call");
		assert.ok(fnDeregisterResizeSpy.calledWithExactly(sResizeHandlerId),
			"_deRegisterResizeHandler is called with the IllustratedMessage.RESIZE_HANDLER_ID.CONTENT as argument");
		assert.strictEqual(this.oIllustratedMessage[sResizeHandlerId], null,
			"IllustratedMessage's ResizeHandler is set to null after _deRegisterResizeHandler function execution");

		// Clean
		fnDeregisterResizeSpy.restore();
	});

	/* --------------------------- IllustratedMessage Updating Media Breakpoints -------------------------------------- */

	QUnit.test("_onResize", function (assert) {
		// Arrange
		var oMockEvent = {size: {width: 666}},
			fnUpdateMediaSpy = sinon.spy(this.oIllustratedMessage, "_updateMedia");

		// Act
		this.oIllustratedMessage._onResize(oMockEvent);

		// Assert
		assert.ok(fnUpdateMediaSpy.calledOnce,
			"_updateMedia is called once inside the _onResize call");
		assert.ok(fnUpdateMediaSpy.calledWithExactly(oMockEvent.size.width),
			"_updateMedia is called with the oMockEvent's new width size");

		// Clean
		fnUpdateMediaSpy.restore();
	});

	QUnit.test("_updateMedia", function (assert) {
		// Assert
		assert.expect(9);

		// Arrange
		var fnUpdateMediaStyleSpy = sinon.spy(this.oIllustratedMessage, "_updateMediaStyle");

		// Act
		this.oIllustratedMessage._updateMedia(0);

		// Assert
		assert.strictEqual(fnUpdateMediaStyleSpy.callCount, 0,
			"_updateMediaStyle is not called inside the _updateMedia call when an invalid argument is passed");

		Object.keys(jQuery.extend(IllustratedMessage.BREAK_POINTS, {SCENE: 800})).forEach(function (sBreakPoint) {
			// Act
			this.oIllustratedMessage._updateMedia(IllustratedMessage.BREAK_POINTS[sBreakPoint]);

			// Assert
			assert.ok(fnUpdateMediaStyleSpy.calledOnce,
				"_updateMediaStyle is called once inside the _updateMedia call when a valid argument/width is passed");
			assert.ok(fnUpdateMediaStyleSpy.calledWithExactly(IllustratedMessage.MEDIA[sBreakPoint]),
				"_updateMediaStyle called with the correct class ( " + IllustratedMessage.MEDIA[sBreakPoint] + " ) for breakpoint: " + sBreakPoint);

			// Clear
			fnUpdateMediaStyleSpy.reset();
		}, this);

		// Clean
		fnUpdateMediaStyleSpy.restore();
	});

	QUnit.test("_updateMediaStyle", function (assert) {
		// Assert
		assert.expect(20);

		// Arrange
		var sIdMedia, sNewSymbolId, sCurrStyleClass,
			aIllustratedMessageMediaKeys = Object.keys(IllustratedMessage.MEDIA);

		aIllustratedMessageMediaKeys.forEach(function (sMedia, iIndex) {
			// Arrange
			sIdMedia = sMedia.charAt(0) + sMedia.slice(1).toLowerCase();

			// Act
			this.oIllustratedMessage._updateMediaStyle(IllustratedMessage.MEDIA[sMedia]);
			Core.applyChanges();
			sNewSymbolId = this.oIllustratedMessage._sIllustrationSet + "-" + sIdMedia + "-" + this.oIllustratedMessage._sIllustrationType;
			sCurrStyleClass = IllustratedMessage.MEDIA[sMedia];

			// Assert
			if (sMedia === "BASE") {
				assert.notEqual(this.oIllustratedMessage._getIllustration()._sSymbolId, sNewSymbolId,
				"symbolId ( " + sNewSymbolId + " ) of the IllustratedMessage's illustration is untouched according to the current media (" + sIdMedia + ")");
			} else {
				assert.strictEqual(this.oIllustratedMessage._getIllustration()._sSymbolId, sNewSymbolId,
				"symbolId ( " + sNewSymbolId + " ) of the IllustratedMessage's illustration is correctly set according to the current media (" + sIdMedia + ")");
			}

			assert.ok(this.oIllustratedMessage.hasStyleClass(sCurrStyleClass),
				"IllustratedMessage has the correct style class ( " + sCurrStyleClass + " ) according to the current media (" + sIdMedia + ")");

			aIllustratedMessageMediaKeys.forEach(function (sNestedMedia, iNestedIndex) {
				if (iIndex !== iNestedIndex) {
					sCurrStyleClass = IllustratedMessage.MEDIA[sNestedMedia];
					assert.notOk(this.oIllustratedMessage.hasStyleClass(sCurrStyleClass),
						"IllustratedMessage doesn't have the style class ( " + sCurrStyleClass + " ) according to the current media (" + sIdMedia + ")");
				}
			}, this);
		}, this);

	});

});
