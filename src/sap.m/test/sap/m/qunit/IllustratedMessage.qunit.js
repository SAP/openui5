/*global QUnit*/
sap.ui.define([
	"sap/m/IllustratedMessageSize",
	"sap/tnt/IllustratedMessageType",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/Button",
	'sap/ui/core/library',
	"sap/ui/core/InvisibleText",
	"sap/ui/dom/getScrollbarSize",
	"sap/ui/test/utils/nextUIUpdate"
],
function(
	IllustratedMessageSize,
	IllustratedMessageTypeTNT,
	Library,
	jQuery,
	IllustratedMessage,
	IllustratedMessageType,
	Button,
	coreLibrary,
	InvisibleText,
	getScrollbarSize,
	nextUIUpdate
) {
	"use strict";

	// shortcut for sap.m.IllustratedMessageType
	var IllustratedMessageType = IllustratedMessageType/*Redundant shortcut*/;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/* --------------------------- IllustratedMessage API -------------------------------------- */
	QUnit.module("IllustratedMessage - API ", {
		beforeEach: async function() {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage({
				title: "Test title",
				description: "Test description",
				additionalContent: new Button({text: "Test button"})
			});
			this.oIllustratedMessage.placeAt("qunit-fixture");
			await nextUIUpdate();
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
		assert.notOk(this.oIllustratedMessage.getEnableVerticalResponsiveness(), "The IllustratedMessage enableVerticalResponsiveness is false by default");
		assert.strictEqual(aPublicProperties["enableVerticalResponsiveness"].type, "boolean", "The type of the enableVerticalResponsiveness property is boolean");
		assert.strictEqual(aPublicProperties["illustrationSize"].type, "sap.m.IllustratedMessageSize", "The type of the illustrationSize property is sap.m.IllustratedMessageSize");
		assert.strictEqual(aPublicProperties["illustrationType"].type, "string", "The type of the illustrationType property is string");
		assert.ok(this.oIllustratedMessage.getAdditionalContent(), "The IllustratedMessage additional content has instantiated successfully");
		assert.strictEqual(aPublicAggregations["additionalContent"].type, "sap.ui.core.Control", "The type of the additionalContent aggregation is sap.ui.core.Control");
		assert.notOk(this.oIllustratedMessage.getAggregation("_formattedText"), "The IllustratedMessage _formattedText is not instantiated by default");
		assert.strictEqual(aPrivateAggregations["_formattedText"].type, "sap.m.FormattedText", "The type of the _formattedText aggregation is sap.m.FormattedText");
		assert.ok(this.oIllustratedMessage.getAggregation("_illustration"), "The IllustratedMessage _illustration has instantiated successfully");
		assert.strictEqual(aPrivateAggregations["_illustration"].type, "sap.m.Illustration", "The type of the _illustration aggregation is sap.m.Illustration");
		assert.ok(this.oIllustratedMessage.getAggregation("_text"), "The IllustratedMessage _text has instantiated successfully");
		assert.strictEqual(this.oIllustratedMessage.getAggregation("_text").getTextAlign(), "Center", "The IllustratedMessage _text textAlign is 'Center'");
		assert.strictEqual(aPrivateAggregations["_text"].type, "sap.m.Text", "The type of the _text aggregation is sap.m.Text");
		assert.ok(this.oIllustratedMessage.getAggregation("_title"), "The IllustratedMessage _title has instantiated successfully");
		assert.ok(this.oIllustratedMessage.getAggregation("_title").getWrapping(), "The IllustratedMessage _title wrapping is 'true'");
		assert.strictEqual(aPrivateAggregations["_title"].type, "sap.m.Title", "The type of the _title aggregation is sap.m.Title");
		assert.strictEqual(this.oIllustratedMessage.getIllustrationSize(), IllustratedMessageSize.Auto, "The IllustratedMessage illustrationSize property has the correct default value");
		assert.strictEqual(this.oIllustratedMessage.getIllustrationType(), IllustratedMessageType.NoSearchResults, "The IllustratedMessage illustrationType property has the correct default value");
	});

	/* --------------------------- IllustratedMessage Lifecycle -------------------------------------- */
	QUnit.module("IllustratedMessage - Lifecycle ", {
		beforeEach: async function() {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage();
			this.oIllustratedMessage.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("init", function (assert) {
		// Arrange
		var fnUpdateInternalSpy = this.spy(this.oIllustratedMessage, "_updateInternalIllustrationSetAndType");

		// Act
		this.oIllustratedMessage.init();

		// Assert
		assert.ok(fnUpdateInternalSpy.calledOnce, "_updateInternalIllustrationSetAndType called once on init");
	});

	QUnit.test("onBeforeRendering", function (assert) {
		// Arrange
		var fnDetachResizeSpy = this.spy(this.oIllustratedMessage, "_detachResizeHandlers");

		// Act
		this.oIllustratedMessage.onBeforeRendering();

		// Assert
		assert.ok(fnDetachResizeSpy.calledOnce, "_detachResizeHandlers called once onBeforeRendering");
	});

	QUnit.test("onAfterRendering", function (assert) {
		// Arrange
		var fnUpdateDomSizeSpy = this.spy(this.oIllustratedMessage, "_updateDomSize"),
			fnAttachResizeSpy = this.spy(this.oIllustratedMessage, "_attachResizeHandlers"),
			fnPreventWidowResizeSpy = this.spy(this.oIllustratedMessage, "_preventWidowWords");

		// Act
		this.oIllustratedMessage.onAfterRendering();

		// Assert
		assert.ok(fnUpdateDomSizeSpy.calledOnce, "_updateDomSize called once onAfterRendering");
		assert.ok(fnAttachResizeSpy.calledOnce, "_attachResizeHandlers called once onAfterRendering");
		assert.ok(fnPreventWidowResizeSpy.calledTwice, "_preventWidowWords called twice onAfterRendering");
		assert.ok(fnPreventWidowResizeSpy.firstCall.calledWithExactly(this.oIllustratedMessage._getTitle().getDomRef()),
			"_preventWidowWords first call is with IllustratedMessage's title Dom Ref as argument");
		assert.ok(fnPreventWidowResizeSpy.secondCall.calledWithExactly(this.oIllustratedMessage._getDescription().getDomRef()),
			"_preventWidowWords second call is with IllustratedMessage's description Dom Ref as argument");
	});

	QUnit.test("exit", function (assert) {
		// Arrange
		var fnDetachResizeSpy = this.spy(this.oIllustratedMessage, "_detachResizeHandlers");

		// Act
		this.oIllustratedMessage.exit();

		// Assert
		assert.ok(fnDetachResizeSpy.calledOnce, "_detachResizeHandlers called once on exit");
	});

	/* --------------------------- IllustratedMessage GETTERS/SETTERS -------------------------------------- */
	QUnit.module("IllustratedMessage - getters and setters ", {
		beforeEach: async function() {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage();
			this.oIllustratedMessage.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("setIllustrationType", async function(assert) {
		// Arrange
		var fnUpdateInternalSpy = this.spy(this.oIllustratedMessage, "_updateInternalIllustrationSetAndType"),
			sNewType = IllustratedMessageType.UnableToLoad;

		// Act
		this.oIllustratedMessage.setIllustrationType(sNewType);

		// Assert
		assert.ok(fnUpdateInternalSpy.calledOnce, "_updateInternalIllustrationSetAndType called once on setIllustrationType");

		// Act
		this.oIllustratedMessage.setIllustrationType(undefined);
		assert.ok(fnUpdateInternalSpy.calledOnce, "_updateInternalIllustrationSetAndType isn't called second time if the type isn't string");

		this.oIllustratedMessage.setIllustrationType("sapIllus-Connection");
		await nextUIUpdate();

		var sUseHrefValue = this.oIllustratedMessage
			.getDomRef()
			.querySelector("use")
			.getAttribute("href");

		assert.ok(sUseHrefValue.includes("Connection"),
			"The new expected illustration type " + "Connection" + " IS reflected in the reference to illustration via href: " + sUseHrefValue
		);
	});

	QUnit.test("setSrc", async function(assert) {
		// Arrange
		var fnUpdateInternalSpy = this.spy(this.oIllustratedMessage, "_updateInternalIllustrationSetAndType");

		// Act
		this.oIllustratedMessage.setSrc("sap-illustration://NoData");

		// Assert
		assert.ok(fnUpdateInternalSpy.calledOnce, "_updateInternalIllustrationSetAndType called once on setSrc");

		// Act
		this.oIllustratedMessage.setSrc(undefined);
		assert.ok(fnUpdateInternalSpy.calledOnce, "_updateInternalIllustrationSetAndType isn't called second time if the type isn't string");

		this.oIllustratedMessage.setSrc("sap-illustration://NoMail");
		await nextUIUpdate();

		var sUseHrefValue = this.oIllustratedMessage
			.getDomRef()
			.querySelector("use")
			.getAttribute("href");

		assert.ok(sUseHrefValue.includes("NoMail"),
			"The new expected illustration type " + "NoMail" + " IS reflected in the reference to illustration via href: " + sUseHrefValue
		);
	});

	QUnit.test("_getDescription - sap.m.FormattedText", async function(assert) {
		// Arrange
		var oDescription,
			sCurrDescrVal,
			sEmptyString = '',
			sDefaultText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.DESCRIPTION + this.oIllustratedMessage._sIllustrationType, undefined, true),
			sTestDescrVal = "Test descr";

		// Act - Force use of FormattedText
		this.oIllustratedMessage.setEnableFormattedText(true);
		oDescription = this.oIllustratedMessage._getDescription();
		sCurrDescrVal = oDescription.getHtmlText();

		// Assert
		assert.strictEqual(this.oIllustratedMessage.getAggregation("_formattedText").getTextAlign(), "Center", "The IllustratedMessage _formattedText textAlign is 'Center'");
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

		// Act
		this.oIllustratedMessage.setDescription(sEmptyString);
		this.oIllustratedMessage.setEnableDefaultTitleAndDescription(false);
		sCurrDescrVal = this.oIllustratedMessage._getDescription().getHtmlText();
		await nextUIUpdate();

		// Assert
		assert.notEqual(sCurrDescrVal, sDefaultText,
			"The default text for the current _sIllustrationType is not used as text for the sap.m.FormattedText even if description is set to empty string,"
			+ "if enableDefaultTitleAndDescription is false");
		assert.strictEqual(sCurrDescrVal, sEmptyString, "The FormattedText is correctly set to empty string");
		assert.strictEqual(oDescription.getDomRef(), null, "The description control instance is not rendered when no text is present");
	});

	QUnit.test("_getDescription - sap.m.Text", async function(assert) {
		// Arrange
		var oDescription = this.oIllustratedMessage._getDescription(),
			sEmptyString = '',
			sCurrDescrVal = oDescription.getText(),
			sDefaultText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.DESCRIPTION + this.oIllustratedMessage._sIllustrationType, undefined, true),
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

		// Act
		this.oIllustratedMessage.setDescription(sEmptyString);
		this.oIllustratedMessage.setEnableDefaultTitleAndDescription(false);
		sCurrDescrVal = this.oIllustratedMessage._getDescription().getText();
		await nextUIUpdate();

		// Assert
		assert.notEqual(sCurrDescrVal, sDefaultText,
			"The default text for the current _sIllustrationType is not used as text for the sap.m.Text even if description is set to empty string,"
			+ "if enableDefaultTitleAndDescription is false");
		assert.strictEqual(sCurrDescrVal, sEmptyString, "The Text is correctly set to empty string");
		assert.strictEqual(oDescription.getDomRef(), null, "The description control instance is not rendered when no text is present");
	});

	QUnit.test("_getIllustration", function (assert) {
		// Arrange
		var oIllustration = this.oIllustratedMessage._getIllustration();

		// Assert
		assert.ok(oIllustration.isA("sap.m.Illustration"), "Internal getter _getIllustration is correctly returning an sap.m.Illustration");
	});

	QUnit.test("_getResourceBundle", function (assert) {
		// Assert
		assert.strictEqual(this.oIllustratedMessage._getResourceBundle(), Library.getResourceBundleFor("sap.m"),
			"Internal getter _getResourceBundle is correctly returning the sap.m resource bundle");
	});

	QUnit.test("_getTitle", async function(assert) {
		// Arrange
		var sTitleText = this.oIllustratedMessage._getTitle().getText(),
		sEmptyString = '',
		sNewTitleVal = "Test title",
		sDefaultText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.TITLE + this.oIllustratedMessage._sIllustrationType, undefined, true);

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

		// Act
		this.oIllustratedMessage.setTitle(sEmptyString);
		this.oIllustratedMessage.setEnableDefaultTitleAndDescription(false);
		sTitleText = this.oIllustratedMessage._getTitle().getText();
		await nextUIUpdate();

		// Assert
		assert.notEqual(sTitleText, sDefaultText,
			"The default text for the current _sIllustrationType is not used as text for the Title even if title is set to empty string,"
			+ "if enableDefaultTitleAndDescription is false");
		assert.strictEqual(sTitleText, sEmptyString, "The Title is correctly set to empty string");
		assert.strictEqual(this.oIllustratedMessage._getTitle().getDomRef(), null, "The description control instance is not rendered when no text is present");
	});

	QUnit.test("ariaTitleLevel is set correctly", async function(assert) {
		// Arrange
		this.oIllustratedMessage.setTitle("Test Title");

		// Assert
		assert.strictEqual(this.oIllustratedMessage.getAriaTitleLevel(), TitleLevel.Auto, "IllustratedMessage is initialized with default titleLevel");

		// Act
		this.oIllustratedMessage.setAriaTitleLevel(TitleLevel.H3);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(this.oIllustratedMessage._getTitle().getLevel(), TitleLevel.H3, "IllustratedMessage ariaTitleLevel is correctly set to the title instance");
	});

	/* --------------------------- IllustratedMessage Private methods -------------------------------------- */

	QUnit.module("IllustratedMessage - Private methods ", {
		beforeEach: async function() {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage();
			this.oIllustratedMessage.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("_preventWidowWords", function (assert) {
		// Arrange
		var oPara = document.createElement("p"),
			oNode = document.createTextNode("This is a new paragraph"),
			sExpectedResult = 'new&nbsp;paragraph',
			aParaWords;

		// Act
		oPara.appendChild(oNode);
		this.oIllustratedMessage._preventWidowWords(oPara);
		aParaWords = jQuery(oPara).html().split(" ");

		// Assert
		assert.strictEqual(aParaWords[aParaWords.length - 1], sExpectedResult,
			"Last two words of the paragraph are transformed into one with the inclusion of a non-breaking space");
	});

	QUnit.test("_updateDomSize", function (assert) {
		// Arrange
		var fnUpdateMediaSpy = this.spy(this.oIllustratedMessage, "_updateMedia"),
			fnUpdateSymbolSpy = this.spy(this.oIllustratedMessage, "_updateSymbol"),
			fnUpdateMediaStyleSpy = this.spy(this.oIllustratedMessage, "_updateMediaStyle"),
			sNewSize = IllustratedMessageSize.Medium;

		// Act
		this.oIllustratedMessage._updateDomSize();

		// Assert
		assert.ok(fnUpdateMediaSpy.calledOnce, "_updateMedia is called once when illustrationSize is IllustratedMessageSize.Auto");
		assert.ok(fnUpdateMediaSpy.calledWithExactly(this.oIllustratedMessage.getDomRef().getBoundingClientRect().width,
			this.oIllustratedMessage.getDomRef().getBoundingClientRect().height),
			"_updateMedia called width the IllustratedMessage's Dom Reference width and height");

		// Act
		fnUpdateMediaSpy.resetHistory();
		fnUpdateMediaStyleSpy.resetHistory();
		fnUpdateSymbolSpy.resetHistory();
		this.oIllustratedMessage.setIllustrationSize(sNewSize);
		this.oIllustratedMessage._updateDomSize();

		// Assert
		assert.ok(fnUpdateMediaStyleSpy.calledOnce,
			"_updateMediaStyle is called once inside the _updateDomSize call when illustrationSize is different from IllustratedMessageSize.Auto");
		assert.ok(fnUpdateMediaStyleSpy.calledWithExactly(IllustratedMessage.MEDIA_SIZE[sNewSize.toUpperCase()]),
			"_updateMediaStyle called width the IllustratedMessage's media with new illustrationSize to upper case as key");
		assert.ok(fnUpdateSymbolSpy.calledOnce,
			"_updateSymbol is called once inside the _updateDomSize call when illustrationSize is different from IllustratedMessageSize.Auto");
		assert.ok(fnUpdateSymbolSpy.calledWithExactly(IllustratedMessage.MEDIA_SIZE[sNewSize.toUpperCase()]),
			"_updateSymbol called width the IllustratedMessage's media with new illustrationSize to upper case as key");
		assert.strictEqual(fnUpdateMediaSpy.callCount, 0, "_updateMedia is not called when illustrationSize is different from IllustratedMessageSize.Auto");
	});

	QUnit.test("_updateInternalIllustrationSetAndType", function (assert) {
		// Arrange
		var sNewType = IllustratedMessageType.UnableToLoad,
			aValues = sNewType.split("-"),
			sIllustrationSet = aValues[0],
			sIllustrationType = aValues[1];

		// Act
		this.oIllustratedMessage.setIllustrationType(sNewType);

		// Assert
		assert.strictEqual(this.oIllustratedMessage._sIllustrationSet, sIllustrationSet,
			"Internal variable _sIllustrationSet is correctly set on _updateInternalIllustrationSetAndType call with a new type");
		assert.strictEqual(this.oIllustratedMessage._sIllustrationType, sIllustrationType,
			"Internal variable _sIllustrationType is correctly set on _updateInternalIllustrationSetAndType call with a new type");
	});

	QUnit.test("_attachResizeHandlers", function (assert) {
		// Arrange
		var sResizeHandlerId = IllustratedMessage.RESIZE_HANDLER_ID.CONTENT,
			fnRegisterResizeSpy = this.spy(this.oIllustratedMessage, "_registerResizeHandler");

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
		fnRegisterResizeSpy.resetHistory();
		this.oIllustratedMessage[sResizeHandlerId] = null;
		this.oIllustratedMessage.setIllustrationSize(IllustratedMessageSize.Small);

		// Assert
		assert.strictEqual(fnRegisterResizeSpy.callCount, 0,
			"_registerResizeHandler is not called inside the _attachResizeHandlers call when illustrationSize is different from IllustratedMessageSize.Auto");
		assert.strictEqual(this.oIllustratedMessage[sResizeHandlerId], null,
			"No new resize handler is registered after calling the _registerResizeHandler function");
	});

	QUnit.test("_detachResizeHandlers", function (assert) {
		// Arrange
		var sResizeHandlerId = IllustratedMessage.RESIZE_HANDLER_ID.CONTENT,
			fnDeregisterResizeSpy = this.spy(this.oIllustratedMessage, "_deRegisterResizeHandler");

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
	});

	/* --------------------------- IllustratedMessage Updating Media Breakpoints -------------------------------------- */

	QUnit.test("_onResize", function (assert) {
		// Arrange
		var oMockEvent = {size: {width: 666, height: 666}},
			fnUpdateMediaSpy = this.spy(this.oIllustratedMessage, "_updateMedia");

		// Act
		this.oIllustratedMessage._onResize(oMockEvent);

		// Assert
		assert.ok(fnUpdateMediaSpy.calledOnce,
			"_updateMedia is called once inside the _onResize call");
		assert.ok(fnUpdateMediaSpy.calledWithExactly(oMockEvent.size.width, oMockEvent.size.height),
			"_updateMedia is called with the oMockEvent's new width size");
	});

	QUnit.test("_updateMedia (with altered width to prevent infinite resize)", function (assert) {
		// Arrange
		var oMockEvent = {size: {width: 666, height: 666},
			target: { parentNode: {
				scrollHeight: 2,
				clientHeight: 1
			}}
		},
		fnUpdateMediaSpy = this.spy(this.oIllustratedMessage, "_updateMedia");

		// Act
		this.oIllustratedMessage._onResize(oMockEvent);

		// Assert
		assert.ok(fnUpdateMediaSpy.calledWithExactly(oMockEvent.size.width + getScrollbarSize().width, oMockEvent.size.height),
			"_updateMedia is called with the correct arguments. Scrollbar width is added to the usual width in the needed case.");

		// Clear
		fnUpdateMediaSpy.resetHistory();
	});

	QUnit.test("_updateMedia (with invalid input)", function (assert) {
		// Arrange
		var fnUpdateMediaStyleSpy = this.spy(this.oIllustratedMessage, "_updateMediaStyle");
		var fnUpdateSymbolSpy = this.spy(this.oIllustratedMessage, "_updateSymbol");

		// Act
		this.oIllustratedMessage._updateMedia(0);

		// Assert
		assert.strictEqual(fnUpdateMediaStyleSpy.callCount, 0,
			"_updateMediaStyle is not called inside the _updateMedia call when an invalid argument is passed");
		assert.strictEqual(fnUpdateSymbolSpy.callCount, 0,
			"_updateSymbol is not called inside the _updateMedia call when an invalid argument is passed");

		// Clear
		fnUpdateMediaStyleSpy.resetHistory();
		fnUpdateSymbolSpy.resetHistory();
	});

	QUnit.test("_updateMedia (horizontal)", function (assert) {
		// Assert
		assert.expect(20);

		// Arrange
		var fnUpdateMediaStyleSpy = this.spy(this.oIllustratedMessage, "_updateMediaStyle");
		var fnUpdateSymbolSpy = this.spy(this.oIllustratedMessage, "_updateSymbol");

		Object.keys(jQuery.extend(IllustratedMessage.BREAK_POINTS, {SCENE: 800})).forEach(function (sBreakPoint) {
			// Act
			this.oIllustratedMessage._updateMedia(IllustratedMessage.BREAK_POINTS[sBreakPoint]);

			// Assert
			assert.ok(fnUpdateMediaStyleSpy.calledOnce,
				"_updateMediaStyle is called once inside the _updateMedia call when a valid argument/width is passed");
			assert.ok(fnUpdateMediaStyleSpy.calledWithExactly(IllustratedMessage.MEDIA[sBreakPoint]),
				"_updateMediaStyle called with the correct class ( " + IllustratedMessage.MEDIA[sBreakPoint] + " ) for breakpoint: " + sBreakPoint);
			assert.ok(fnUpdateSymbolSpy.calledOnce,
				"_updateSymbol is called once inside the _updateMedia call when a valid arguments width and height are passed");
			assert.ok(fnUpdateSymbolSpy.calledWithExactly(IllustratedMessage.MEDIA[sBreakPoint]),
				"_updateSymbol called with the correct class ( " + IllustratedMessage.MEDIA[sBreakPoint] + " ) for breakpoint: " + sBreakPoint);

			// Clear
			fnUpdateMediaStyleSpy.resetHistory();
			fnUpdateSymbolSpy.resetHistory();
		}, this);
	});

	QUnit.test("_updateMedia (vertical) with enableVerticalResponsiveness property", async function(assert) {
		// Assert
		assert.expect(24);

		// Arrange
		var fnUpdateMediaStyleSpy = this.spy(this.oIllustratedMessage, "_updateMediaStyle");
		var fnUpdateSymbolSpy = this.spy(this.oIllustratedMessage, "_updateSymbol");
		var sScalableClass = 'sapMIllustratedMessageScalable';

		// Act
		this.oIllustratedMessage._updateMedia(9999, IllustratedMessage.BREAK_POINTS_HEIGHT[IllustratedMessage.BREAK_POINTS_HEIGHT.Dialog]);

		// Assert
		assert.ok(fnUpdateMediaStyleSpy.calledOnce,
			"_updateMediaStyle is called once inside the _updateMedia call even if enableVerticalResponsiveness is 'false'");
		assert.ok(fnUpdateSymbolSpy.calledOnce,
			"_updateSymbol is called once inside the _updateMedia call even if enableVerticalResponsiveness is 'false'");
		assert.notOk(this.oIllustratedMessage.$().hasClass(sScalableClass),
			"IllustratedMessage doesn't have the scalable class which allows scalable SVG when EVS property is false");

		// Act Enable vertical responsiveness in order to test the height breakpoints
		this.oIllustratedMessage.setEnableVerticalResponsiveness(true);
		await nextUIUpdate();

		// Assert
		assert.ok(this.oIllustratedMessage.$().hasClass(sScalableClass),
			"IllustratedMessage has the scalable class which allows scalable SVG when EVS property is true");

		// Act Reset the _updateSymbol and _updateMediaStyle call count due to few calls up to this point
		fnUpdateMediaStyleSpy.resetHistory();
		fnUpdateSymbolSpy.resetHistory();

		Object.keys(jQuery.extend(IllustratedMessage.BREAK_POINTS_HEIGHT, {SCENE: 999})).forEach(function (sBreakPoint) {
			// Act
			this.oIllustratedMessage._updateMedia(9999, IllustratedMessage.BREAK_POINTS_HEIGHT[sBreakPoint]);

			// Assert
			assert.ok(fnUpdateMediaStyleSpy.calledOnce,
				"_updateMediaStyle is called once inside the _updateMedia call when a valid arguments width and height are passed");
			assert.ok(fnUpdateMediaStyleSpy.calledWithExactly(IllustratedMessage.MEDIA[sBreakPoint]),
				"_updateMediaStyle called with the correct class ( " + IllustratedMessage.MEDIA[sBreakPoint] + " ) for breakpoint: " + sBreakPoint);
			assert.ok(fnUpdateSymbolSpy.calledOnce,
				"_updateSymbol is called once inside the _updateMedia call when a valid arguments width and height are passed");
			assert.ok(fnUpdateSymbolSpy.calledWithExactly(IllustratedMessage.MEDIA[sBreakPoint]),
				"_updateSymbol called with the correct class ( " + IllustratedMessage.MEDIA[sBreakPoint] + " ) for breakpoint: " + sBreakPoint);

			// Clear
			fnUpdateMediaStyleSpy.resetHistory();
			fnUpdateSymbolSpy.resetHistory();
		}, this);
	});

	QUnit.test("IllustratedMessage should fit its container height when enableVerticalResponsiveness property is true", async function(assert) {
		var oFixtureDOM = document.getElementById("qunit-fixture"),
			sFixtureOriginalHeight = oFixtureDOM.style.height,
			sFixtureTargetHeight = '160px',
			oIMDOMRef = this.oIllustratedMessage.getDomRef();

		// Act Enable vertical responsiveness in order to test the height breakpoints
		this.oIllustratedMessage.setEnableVerticalResponsiveness(true);
		oFixtureDOM.style.height = sFixtureTargetHeight;
		await nextUIUpdate();

		// Assert
		assert.ok(oIMDOMRef.getBoundingClientRect().height > oIMDOMRef.querySelector('.sapMIllustratedMessageMainContent').getBoundingClientRect().height,
			'IllustratedMessage sapMIllustratedMessageMainContent is not overflowing when enableVerticalResponsiveness property is true');

		// Clear
		oFixtureDOM.style.height = sFixtureOriginalHeight;
	});

	QUnit.test("_updateMediaStyle", function (assert) {
		// Assert
		assert.expect(28);

		// Arrange
		var sIdMedia, sCurrStyleClass,
			aIllustratedMessageMediaKeys = Object.keys(IllustratedMessage.MEDIA),
			fnUpdateInternalSpy = this.spy(this.oIllustratedMessage, "toggleStyleClass"),
			sCurrTestMedia;

		aIllustratedMessageMediaKeys.forEach(function (sMedia, iIndex) {
			// Arrange
			sIdMedia = sMedia.charAt(0) + sMedia.slice(1).toLowerCase();
			sCurrTestMedia = IllustratedMessage.MEDIA[sMedia];

			// Act
			this.oIllustratedMessage._updateMediaStyle(sCurrTestMedia);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;
			sCurrStyleClass = sCurrTestMedia;

			// Assert
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

		// Assert
		assert.strictEqual(fnUpdateInternalSpy.callCount, 25, 'toggleStyleClass method of the IM is called five times for each media');
		assert.strictEqual(this.oIllustratedMessage._sLastKnownMedia, sCurrTestMedia, '_sLastKnownMedia private var of IM is correct');

		// Act
		fnUpdateInternalSpy.resetHistory();
		this.oIllustratedMessage._updateMediaStyle(sCurrTestMedia); // insert the last known test media intentionally

		// Assert
		assert.strictEqual(fnUpdateInternalSpy.callCount, 0, 'toggleStyleClass is not called if we try to set the previously used media');
	});

	QUnit.test("_updateSymbol", function (assert) {
		// Arrange
		var sIdMedia, sExpectedNewSymbolId, sUseHrefValue,
			aIllustratedMessageMediaKeys = Object.keys(IllustratedMessage.MEDIA);

		aIllustratedMessageMediaKeys.forEach(function (sMedia) {
			// Arrange
			sIdMedia = sMedia.charAt(0) + sMedia.slice(1).toLowerCase();

			// Act
			this.oIllustratedMessage._sLastKnownMedia = null; // the method compares the proposed media to _sLastKnownMedia, to update only when necessary
			this.oIllustratedMessage._updateSymbol(IllustratedMessage.MEDIA[sMedia]);
			nextUIUpdate.runSync()/*context not obviously suitable for an async function*/;

			sExpectedNewSymbolId = this.oIllustratedMessage._sIllustrationSet + "-" + sIdMedia + "-" + this.oIllustratedMessage._sIllustrationType;
			sUseHrefValue = this.oIllustratedMessage
				.getDomRef()
				.querySelector("use")
				.getAttribute("href");

			// Assert
			if (sMedia === "BASE") {
				assert.notEqual(this.oIllustratedMessage._getIllustration()._sSymbolId, sExpectedNewSymbolId,
				"symbolId ( " + sExpectedNewSymbolId + " ) of the IllustratedMessage's illustration is untouched according to the current media (" + sIdMedia + ")");

				assert.notEqual(sUseHrefValue.replace("#", ""), sExpectedNewSymbolId,
				"The new expected illustration symbol id " + sExpectedNewSymbolId + " IS NOT reflected in the reference to illustration via href: " + sUseHrefValue);
			} else {
				assert.strictEqual(this.oIllustratedMessage._getIllustration()._sSymbolId, sExpectedNewSymbolId,
				"symbolId ( " + sExpectedNewSymbolId + " ) of the IllustratedMessage's illustration is correctly set according to the current media (" + sIdMedia + ")");

				assert.strictEqual(sExpectedNewSymbolId, sUseHrefValue.replace("#", ""),
				"The new expected illustration symbol id " + sExpectedNewSymbolId + " IS reflected in the reference to illustration via href: " + sUseHrefValue);
			}
		}, this);
	});

	QUnit.test("_getFallbackMedia", async function(assert) {
		// Arrange
		var sExpectedFallbackMedia;

		// Act
		this.oIllustratedMessage._updateMedia(IllustratedMessage.BREAK_POINTS.DOT);
		await nextUIUpdate();
		sExpectedFallbackMedia = this.oIllustratedMessage._getFallbackMedia();

		// Assert
		assert.strictEqual(sExpectedFallbackMedia, IllustratedMessage.MEDIA.SPOT, "returns Spot as fallback Media when current is Dot");

		// Act
		this.oIllustratedMessage._updateMedia(IllustratedMessage.BREAK_POINTS.DIALOG);
		await nextUIUpdate();
		sExpectedFallbackMedia = this.oIllustratedMessage._getFallbackMedia();

		// Assert
		assert.strictEqual(sExpectedFallbackMedia, IllustratedMessage.MEDIA.SCENE, "returns Scene as fallback Media when current is Dialog");
	});

	/* --------------------------- IllustratedMessage Accessibility -------------------------------------- */
	QUnit.module("IllustratedMessage - Accessibility ", {
		beforeEach: async function() {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage();
			this.oIllustratedMessage.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("getAccessibilityReferences", function (assert) {
		assert.strictEqual(this.oIllustratedMessage._getTitle().getId(),
		this.oIllustratedMessage.getAccessibilityReferences().title, "Title reference is correct");

		assert.strictEqual(this.oIllustratedMessage._getDescription().getId(),
		this.oIllustratedMessage.getAccessibilityReferences().description, "Description reference is correct");
	});

	QUnit.test("getAccessibilityInfo", function (assert) {
		// Message Accessibility with no properties set
		var oAccInfo = this.oIllustratedMessage.getAccessibilityInfo();
		var sDescription = this.oIllustratedMessage._getTitle().getText() + ". " + this.oIllustratedMessage._getDescription().getText();
		assert.strictEqual(oAccInfo.description, sDescription, "Accessibility description is correct");
		assert.notOk(oAccInfo.focusable, "Message is not focusable");
		assert.equal(oAccInfo.children.length, 0, "Message has no children");

		// Message Accessibility with custom properties set
		this.oIllustratedMessage.setTitle("Example Title");
		this.oIllustratedMessage.setDescription("Example Description");
		var oButton = new Button({text: "Example Button"});
		this.oIllustratedMessage.addAdditionalContent(oButton);

		oAccInfo = this.oIllustratedMessage.getAccessibilityInfo();
		assert.strictEqual(oAccInfo.description, "Example Title. Example Description", "Accessibility description is correct");
		assert.ok(oAccInfo.focusable, "Message is focusable");
		assert.strictEqual(oAccInfo.children.length, 1, "Message has button as child");
	});

	QUnit.test("Tests the accessibility attributes with decorative property", async function (assert) {
		var $illustration = this.oIllustratedMessage._getIllustration().$();

		assert.notOk($illustration.attr("role"), "The SVG element does not have role=presentation when it is with decorative default value false");
		assert.notOk($illustration.attr("aria-hidden"), "The SVG element does not have aria-hidden=true when it is with decorative default value false");

		this.oIllustratedMessage.setDecorative(true);
		await nextUIUpdate();

		assert.strictEqual($illustration.attr("role"), "presentation", "The SVG element has role=presentation when decorative is true");
		assert.strictEqual($illustration.attr("aria-hidden"), "true", "The SVG element has aria-hidden=true when decorative is true");
	});

	/* --------------------------- IllustratedMessage Default Text Fallback -------------------------------------- */
	QUnit.module("IllustratedMessage - Default Text Fallback logic ", {
		beforeEach: async function() {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage();
			this.oIllustratedMessage.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
		}
	});

	QUnit.test("Testing version fallback functionality", function (assert) {

		// Arrange
		var sOriginalType = IllustratedMessage.ORIGINAL_TEXTS.NoSearchResults,
			sOriginalDefaultDescrText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.DESCRIPTION + sOriginalType, undefined, true),
			sOriginalDefaultTitleText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.TITLE + sOriginalType, undefined, true),
			sVersionType = IllustratedMessageType.NoSearchResults;

		// Act
		this.oIllustratedMessage.setIllustrationType(sVersionType);

		// Assert
		assert.strictEqual(this.oIllustratedMessage._getDescription().getText(),
			sOriginalDefaultDescrText, "Version Description fallbacks to the original one.");

		assert.strictEqual(this.oIllustratedMessage._getTitle().getText(),
			sOriginalDefaultTitleText, "Version Title fallbacks to the original one.");
	});

	QUnit.test("Testing original text fallback functionality", function (assert) {

		// Arrange
		var sOriginalType = IllustratedMessage.ORIGINAL_TEXTS.UnableToLoad,
			sOriginalDefaultDescrText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.DESCRIPTION + sOriginalType, undefined, true),
			sOriginalDefaultTitleText = this.oIllustratedMessage._getResourceBundle().getText(IllustratedMessage.PREPENDS.TITLE + sOriginalType, undefined, true),
			sNewType = IllustratedMessageType.UnableToLoad;

		// Act
		this.oIllustratedMessage.setIllustrationType(sNewType);

		// Assert
		assert.strictEqual(this.oIllustratedMessage._getDescription().getText(),
			sOriginalDefaultDescrText, "UnableToLoad Description text is correct.");

		assert.strictEqual(this.oIllustratedMessage._getTitle().getText(),
			sOriginalDefaultTitleText, "UnableToLoad Title text is correct.");
	});

	/* --------------------------- IllustratedMessage Associations -------------------------------------- */
	QUnit.module("IllustratedMessage - Associations ", {
		beforeEach: async function() {
			// Arrange
			this.oIllustratedMessage = new IllustratedMessage();
			this.oIllustratedMessage.placeAt("qunit-fixture");
			this.oIllustration = this.oIllustratedMessage._getIllustration();
			await nextUIUpdate();
		},
		afterEach: function () {
			// Clean
			this.oIllustratedMessage.destroy();
			this.oIllustratedMessage = null;
			this.oIllustration.destroy();
			this.oIllustration = null;
		}
	});

	QUnit.test("Testing the default ariaLabelledBy association in combination with calls of the other ariaLabelledBy related methods ", async function(assert) {

		// Arrange
		var $illustration = this.oIllustration.$(),
			sTitleId = this.oIllustratedMessage._getTitle().getId();

		// Assert
		assert.equal($illustration.attr("aria-labelledby"), sTitleId);

		// Arrange
		new InvisibleText("illustration_label", {text: "My label"}).toStatic();

		// Act
		this.oIllustratedMessage.addIllustrationAriaLabelledBy('illustration_label');
		await nextUIUpdate();

		// Assert
		assert.equal($illustration.attr("aria-labelledby"), 'illustration_label');

		// Act
		this.oIllustratedMessage.removeIllustrationAriaLabelledBy('illustration_label');
		await nextUIUpdate();

		// Assert
		assert.equal($illustration.attr("aria-labelledby"), sTitleId);

		// Act
		this.oIllustratedMessage.addIllustrationAriaLabelledBy('illustration_label');
		await nextUIUpdate();

		// Assert
		assert.equal($illustration.attr("aria-labelledby"), 'illustration_label');

		// Act
		this.oIllustratedMessage.removeAllAriaLabelledBy('illustration_label');
		await nextUIUpdate();

		// Assert
		assert.equal($illustration.attr("aria-labelledby"), sTitleId);
	});

	QUnit.test("Testing illustrationAriaLabelledBy association", async function(assert) {

		// Arrange
		new InvisibleText("illustration_label2", {text: "My label"}).toStatic();

		var $illustration = this.oIllustration.$();

		// Act
		this.oIllustratedMessage.addIllustrationAriaLabelledBy('illustration_label2');
		await nextUIUpdate();

		// Assert
		assert.equal($illustration.attr("aria-labelledby"), 'illustration_label2');
	});

	QUnit.test("Testing illustrationAriaDescribedBy association", async function(assert) {

		// Arrange
		new InvisibleText("illustration_label3", {text: "My label"}).toStatic();

		var $illustration = this.oIllustration.$();

		// Act
		this.oIllustratedMessage.addIllustrationAriaDescribedBy('illustration_label3');
		await nextUIUpdate();

		// Assert
		assert.equal($illustration.attr("aria-describedby"), 'illustration_label3');
	});

	QUnit.test("Should clear aria associations when decorative=true", async function (assert) {
		// Arrange
		new InvisibleText("illustration_label4", {text: "My label"}).toStatic();
		this.oIllustratedMessage.setDecorative(true);
		this.oIllustratedMessage.addIllustrationAriaLabelledBy("illustration_label4");
		await nextUIUpdate();

		// Assert
		var $illustration = this.oIllustratedMessage._getIllustration().$();
		assert.notOk($illustration.attr("aria-labelledby"), "Clears aria-labelledby when decorative");
	});

	QUnit.module("Assets ", {

	});

	QUnit.test("All SVG assets should not include style tag or attribute (full async coverage)", async function(assert) {
		const baseConfigs = [
			{
				baseUrl: "sap/m/themes/base/illustrations/",
				symbolTypes: Object.values(IllustratedMessageType),
				prefix: "sapIllus-"
			},
			{
				baseUrl: "sap/tnt/themes/base/illustrations/",
				symbolTypes: Object.values(IllustratedMessageTypeTNT),
				prefix: "tnt-"
			}
		];
		const sizes = ["Dot", "Spot", "Dialog", "Scene"];
		const requested = new Set();
		const fetchPromises = [];

		function resolveSymbolName(pathConfig, pathKey, symbol, size) {
			const symbolKey = symbol.split("-")[1] || symbol;
			const symbolMap = pathConfig[pathKey] || {};
			let symbolName = symbolKey;
			let finalSize = size;
			if (typeof symbolMap[symbolKey] === "string") {
				symbolName = symbolMap[symbolKey];
			} else {
				finalSize = (symbolMap[symbolKey] && symbolMap[symbolKey].sizeReplacement && symbolMap[symbolKey].sizeReplacement[finalSize]) || finalSize;
			}
			return { symbolName, finalSize };
		}

		for (const config of baseConfigs) {
			const metadataUrl = sap.ui.require.toUrl(config.baseUrl + "metadata.json");
			// eslint-disable-next-line no-await-in-loop
			const metadata = await fetch(metadataUrl).then((r) => r.json());
			const pathConfig = metadata.pathSymbolsConfig;
			const pathKeys = Object.keys(pathConfig);

			for (const pathKey of pathKeys) {
				for (const symbol of config.symbolTypes) {
					const symbolKey = symbol.split("-")[1] || symbol;
					const symbolEntry = pathConfig[pathKey] && pathConfig[pathKey][symbolKey];
					// Only fetch for this pathKey if symbol is present in the mapping (as string or object), or always for root
					// For each pathKey, if the symbol is present in the mapping for that key, fetch the SVG for that pathKey using the correct mapped value and sizeReplacement logic.
					if (pathKey === "root" || (symbolEntry !== undefined)) {
						for (const size of sizes) {
							const { symbolName, finalSize } = resolveSymbolName(pathConfig, pathKey, symbol, size);
							const prefix = config.prefix;
							const pathSegment = pathKey === "root" ? "" : pathKey;
							const resourcePath = config.baseUrl + pathSegment + prefix + finalSize + "-" + symbolName + ".svg";
							const url = sap.ui.require.toUrl(resourcePath);
							if (!requested.has(url)) {
								requested.add(url);
								fetchPromises.push(
									fetch(url)
										.then((response) => {
											if (!response.ok) { throw new Error(`Failed: ${url}`); }
											return response.text();
										})
										.then((textResponse) => {
											assert.strictEqual(textResponse.match(/style/gi), null, url + " does not include style tag or attr");
										})
										.catch((error) => {
											assert.ok(false, url + " fetch failed: " + error.message);
										})
								);
							}
						}
					}
				}
			}
		}

		assert.expect(requested.size);
		const done = assert.async();
		Promise.all(fetchPromises).then(() => done());
	});
});
