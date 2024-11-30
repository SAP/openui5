/*globals sinon*/
sap.ui.define([
	"sap/ui/thirdparty/qunit-2",
	"sap/ui/mdc/field/FieldBase",
	"sap/ui/mdc/field/ConditionType",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/field/content/ContentFactory",
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/mdc/field/content/LinkContent",
	"sap/ui/mdc/field/content/DateContent",
	"sap/ui/mdc/field/content/DateTimeContent",
	"sap/ui/mdc/field/content/TimeContent",
	"sap/ui/mdc/field/content/BooleanContent",
	"sap/ui/mdc/field/content/UnitContent",
	"sap/ui/mdc/field/content/SearchContent",
	'sap/ui/mdc/enums/BaseType',
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/ContentMode",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/DefaultTypeMap",
	"sap/ui/mdc/Link",
	"sap/m/Link",
	"sap/ui/model/type/String",
	"sap/base/i18n/date/CalendarType"
], function(QUnit, FieldBase, ConditionType, ConditionsType, ContentFactory, DefaultContent, LinkContent, DateContent, DateTimeContent, TimeContent, BooleanContent, UnitContent, SearchContent, BaseType, FieldEditMode, ContentMode, OperatorName, DefaultTypeMap, MdcLink, Link, StringType, CalendarType) {
	"use strict";

	QUnit.test("Constructor", function(assert) {
		const oContentFactory = new ContentFactory({});
		assert.ok(oContentFactory, "ContentFactory created using constructor.");

		const oField = new FieldBase("F1", {visible: false}); // prevent content creation
		assert.ok(oField._oContentFactory, "ContentFactory created inside FieldBase.");

		oContentFactory.destroy();
		oField.destroy();
	});

	const oFakeField = {
		getTypeMap: () => {return DefaultTypeMap;},
		getBaseType: () => {return BaseType.String;},
		_getValueHelpIcon: () => {return "sap-icon://slim-arrow-down";},
		getAriaLabelledBy: () => {return ["X"];},
		getFormatOptions:  () => {return {test: "X"};},
		getUnitFormatOptions: () => {return {test: "Y"};},
		getDataType: () => {return "sap.ui.model.type.String";},
		getDataTypeConstraints: () => {return null;},
		getDataTypeFormatOptions: () => {return null;},
		getAdditionalDataTypeConfiguration: () => {return null;},
		isFieldDestroyed: () => {return false;},
		_getValueHelp: () => {return undefined;},
		isSearchField: () => {return false;},
		getMaxConditions: () => {return -1;},
		getFieldInfo: () => {return undefined;},
		getEditMode: () => {return FieldEditMode.Editable;}
	};

	const fnHandleTokenUpdate = (oEvent) => {};
	const fnHandleContentChange = (oEvent) => {};
	const fnHndleContentLiveChange = (oEvent) => {};
	const fnHandleValueHelpRequest = (oEvent) => {};
	const fnHandleEnter = (oEvent) => {};
	const fnHandleContentPress = (oEvent) => {};

	QUnit.module("Getters", {
		beforeEach: function() {
			this.oContentFactory = new ContentFactory("CF1", {
				field: oFakeField,
				handleTokenUpdate: fnHandleTokenUpdate,
				handleContentChange: fnHandleContentChange,
				handleContentLiveChange: fnHndleContentLiveChange,
				handleValueHelpRequest: fnHandleValueHelpRequest,
				handleEnter: fnHandleEnter,
				handleContentPress: fnHandleContentPress
			});
		},
		afterEach: function() {
			this.oContentFactory.destroy();
			delete this.oContentFactory;
		}
	});

	QUnit.test("_getEnabled", function(assert) {
		assert.notOk(ContentFactory._getEnabled(null), "Return FALSE if sEditMode = null");
		assert.notOk(ContentFactory._getEnabled(undefined), "Return FALSE if sEditMode = undefined");
		assert.notOk(ContentFactory._getEnabled("Disabled"), "Return FALSE if sEditMode = 'Disabled'");

		assert.ok(ContentFactory._getEnabled("Enabled"), "Return TRUE if sEditMode = 'Enabled'");
		assert.ok(ContentFactory._getEnabled("undefinedEditMode"), "Return TRUE if sEditMode !== 'Disabled'");
	});

	QUnit.test("_getEditable", function(assert) {
		assert.notOk(ContentFactory._getEditable(null), "Return FALSE if sEditMode = null");
		assert.notOk(ContentFactory._getEditable(undefined), "Return FALSE if sEditMode = undefined");
		assert.notOk(ContentFactory._getEditable("undefinedEditMode"), "Return FALSE if sEditMode is a random string");

		assert.ok(ContentFactory._getEditable("Editable"), "Return TRUE if sEditMode = 'Editable'");
		assert.ok(ContentFactory._getEditable("EditableReadOnly"), "Return TRUE if sEditMode = 'EditableReadOnly'");
		assert.ok(ContentFactory._getEditable("EditableDisplay"), "Return TRUE if sEditMode = 'EditableDisplay'");
	});

	QUnit.test("_getDisplayOnly", function(assert) {
		assert.notOk(ContentFactory._getDisplayOnly(null), "Return FALSE if sEditMode = null");
		assert.notOk(ContentFactory._getDisplayOnly(undefined), "Return FALSE if sEditMode = undefined");
		assert.notOk(ContentFactory._getDisplayOnly("Editable"), "Return FALSE if sEditMode = 'Editable'");

		assert.ok(ContentFactory._getDisplayOnly("undefinedEditMode"), "Return TRUE if sEditMode !== 'Editable'");
	});

	QUnit.test("_getEditableUnit", function(assert) {
		assert.notOk(ContentFactory._getEditableUnit(null), "Return FALSE if sEditMode = null");
		assert.notOk(ContentFactory._getEditableUnit(undefined), "Return FALSE if sEditMode = undefined");
		assert.notOk(ContentFactory._getEditableUnit("undefinedEditMode"), "Return FALSE if sEditMode is a random string");

		assert.ok(ContentFactory._getEditableUnit("Editable"), "Return TRUE if sEditMode = 'Editable'");
	});

	QUnit.test("getField", function(assert) {
		assert.equal(this.oContentFactory.getField(), oFakeField, "Correct Field returned.");
	});

	QUnit.test("getValueHelpIcon", function(assert) {
		assert.equal(this.oContentFactory.getValueHelpIcon(), oFakeField._getValueHelpIcon(), "Correct ValueHelpIcon returned.");
	});

	QUnit.test("getDataType", function(assert) {
		const oType = new StringType();
		this.oContentFactory.setDataType(oType);
		assert.equal(this.oContentFactory.getDataType(), oType, "Correct Type returned.");
		oType.destroy();
	});

	QUnit.test("getAdditionalDataType", function(assert) {
		const oType = new StringType();
		this.oContentFactory.setAdditionalDataType(oType);
		assert.equal(this.oContentFactory.getAdditionalDataType(), oType, "Correct Type returned.");
		oType.destroy();
	});

	QUnit.test("getUnitType", function(assert) {
		const oType = new StringType();
		this.oContentFactory.setUnitType(oType);
		assert.equal(this.oContentFactory.getUnitType(), oType, "Correct Type returned.");
		oType.destroy();
	});

	QUnit.test("getDateOriginalType", function(assert) {
		const oType = new StringType();
		this.oContentFactory.setDateOriginalType(oType);
		assert.equal(this.oContentFactory.getDateOriginalType(), oType, "Correct Type returned.");
		oType.destroy();
	});

	QUnit.test("getUnitOriginalType", function(assert) {
		const oType = new StringType();
		this.oContentFactory.setUnitOriginalType(oType);
		assert.equal(this.oContentFactory.getUnitOriginalType(), oType, "Correct Type returned.");
		oType.destroy();
	});

	QUnit.test("getCompositeTypes", function(assert) {
		const aTypes = [new StringType(), new StringType()];
		this.oContentFactory.setCompositeTypes(aTypes);
		assert.equal(this.oContentFactory.getCompositeTypes(), aTypes, "Correct Type returned.");
		aTypes[0].destroy();
		aTypes[1].destroy();
	});

	QUnit.test("getAdditionalCompositeTypes", function(assert) {
		const aTypes = [new StringType(), new StringType()];
		this.oContentFactory.setAdditionalCompositeTypes(aTypes);
		assert.equal(this.oContentFactory.getAdditionalCompositeTypes(), aTypes, "Correct Type returned.");
		aTypes[0].destroy();
		aTypes[1].destroy();
	});

	QUnit.test("checkDataTypeChanged", function(assert) {
		const done = assert.async();
		const oType = new StringType();
		this.oContentFactory.setDataType(oType);
		this.oContentFactory.checkDataTypeChanged("sap.ui.model.type.String").then((bChanged) => {
			assert.notOk(bChanged, "Datatype not changed");
			this.oContentFactory.checkDataTypeChanged("sap.ui.model.type.Date").then((bChanged) => {
				assert.ok(bChanged, "Datatype changed");
				done();
			});
		});
	});

	QUnit.test("retrieveDataType", function(assert) {
		const oType = this.oContentFactory.retrieveDataType();
		assert.equal(oType?.getMetadata().getName(), "sap.ui.model.type.String", "Datatype Instance returned.");
		assert.equal(this.oContentFactory.getDataType(), oType, "Type used.");
	});

	QUnit.test("retrieveAdditionalDataType", function(assert) {
		sinon.stub(oFakeField, "getAdditionalDataTypeConfiguration").returns({name: "sap.ui.model.type.String", constraints: {maxLength: 10}});
		let oType = this.oContentFactory.retrieveAdditionalDataType();
		assert.equal(oType?.getMetadata().getName(), "sap.ui.model.type.String", "Datatype Instance returned.");
		assert.deepEqual(oType?.getConstraints(), {maxLength: 10}, "Datatype constraints.");
		assert.equal(this.oContentFactory.getAdditionalDataType(), oType, "Type used.");

		this.oContentFactory.setAdditionalDataType();
		oType.destroy();
		oType = new StringType();
		oFakeField.getAdditionalDataTypeConfiguration.returns(oType);
		assert.equal(this.oContentFactory.retrieveAdditionalDataType(), oType, "Given Datatype Instance returned.");

		oFakeField.getAdditionalDataTypeConfiguration.restore();
	});

	QUnit.test("getConditionType", function(assert) {
		assert.notOk(this.oContentFactory.getConditionType(true), "No ConditionType returned.");
		let oConditionType = this.oContentFactory.getConditionType();
		assert.ok(oConditionType, "Correct ConditionType returned.");
		assert.ok(oConditionType._bCreatedByField, "ConditionType created by ContentFactory.");
		assert.deepEqual(oConditionType.getFormatOptions(), {test: "X"}, "FormatOptions of Field used");
		oConditionType = new ConditionType();
		this.oContentFactory.setConditionType(oConditionType);
		assert.equal(this.oContentFactory.getConditionType(), oConditionType, "New ConditionType returned.");
	});

	QUnit.test("getConditionsType", function(assert) {
		assert.notOk(this.oContentFactory.getConditionsType(true), "No ConditionsType returned.");
		let oConditionsType = this.oContentFactory.getConditionsType();
		assert.ok(oConditionsType, "Correct ConditionsType returned.");
		assert.ok(oConditionsType._bCreatedByField, "ConditionsType created by ContentFactory.");
		assert.deepEqual(oConditionsType.getFormatOptions(), {test: "X"}, "FormatOptions of Field used");
		oConditionsType = new ConditionsType();
		this.oContentFactory.setConditionsType(oConditionsType);
		assert.equal(this.oContentFactory.getConditionsType(), oConditionsType, "New ConditionsType returned.");
	});

	QUnit.test("getUnitConditionsType", function(assert) {
		assert.notOk(this.oContentFactory.getUnitConditionsType(true), "No UnitConditionsType returned.");
		const oConditionsType = this.oContentFactory.getUnitConditionsType();
		assert.ok(oConditionsType, "Correct UnitConditionsType returned.");
		assert.ok(oConditionsType._bCreatedByField, "UnitConditionsType created by ContentFactory.");
		assert.deepEqual(oConditionsType.getFormatOptions(), {test: "Y"}, "UnitFormatOptions of Field used");
	});

	QUnit.test("updateConditionType", function(assert) {
		const oConditionType = new ConditionType({test: "A"});
		this.oContentFactory.setConditionType(oConditionType);
		const oConditionsType = new ConditionType({test: "B"});
		this.oContentFactory.setConditionsType(oConditionsType);
		const oUnitConditionsType = new ConditionType({test: "C"});
		this.oContentFactory._oUnitConditionsType = oUnitConditionsType; // as no setter

		this.oContentFactory.updateConditionType();

		assert.deepEqual(this.oContentFactory.getConditionType().getFormatOptions(), {test: "X"}, "ConditionType: FormatOptions of Field used");
		assert.deepEqual(this.oContentFactory.getConditionsType().getFormatOptions(), {test: "X"}, "ConditionsType: FormatOptions of Field used");
		assert.deepEqual(this.oContentFactory.getUnitConditionsType().getFormatOptions(), {test: "Y"}, "UnitConditionsType: UnitFormatOptions of Field used");
	});

	QUnit.test("getContentConditionTypes", function(assert) {
		assert.notOk(this.oContentFactory.getContentConditionTypes(), "No ContentConditionTypes returned.");
		const oContentConditionType = {};
		this.oContentFactory.setContentConditionTypes(oContentConditionType);
		assert.equal(oContentConditionType, this.oContentFactory.getContentConditionTypes(), "ContentConditionTypes returned.");
	});

	QUnit.test("_setUsedConditionType", function(assert) {
		sinon.spy(this.oContentFactory, "updateConditionType");
		const oConditionType = this.oContentFactory.getConditionType(); // just to initialize
		const oConditionsType = this.oContentFactory.getConditionsType(); // just to initialize
		const oContent = new Link("L1");
		const oContentEdit = new Link("L2");
		const oContentDisplay = new Link("L3");
		const oContentConditionType = {
			content: {oConditionType: new ConditionType(), oConditionsType: new ConditionsType()},
			contentEdit: {oConditionType: new ConditionType(), oConditionsType: new ConditionsType()},
			contentDisplay: {oConditionType: new ConditionType(), oConditionsType: new ConditionsType()},
			_content: {oConditionType: new ConditionType(), oConditionsType: new ConditionsType()}
		};
		this.oContentFactory.setContentConditionTypes(oContentConditionType);
		this.oContentFactory._setUsedConditionType(oContent, oContentEdit, oContentDisplay, FieldEditMode.Display);
		assert.equal(this.oContentFactory.getConditionType(), oContentConditionType.content.oConditionType, "ConditionType of Content returned.");
		assert.equal(this.oContentFactory.getConditionsType(), oContentConditionType.content.oConditionsType, "ConditionsType of Content returned.");
		assert.ok(oConditionType._bDestroyed, "old ConditionType destroyed");
		assert.ok(oConditionsType._bDestroyed, "old ConditionsType destroyed");

		this.oContentFactory._setUsedConditionType(undefined, oContentEdit, oContentDisplay, FieldEditMode.Display);
		assert.equal(this.oContentFactory.getConditionType(), oContentConditionType.contentDisplay.oConditionType, "ConditionType of ContentDisplay returned.");
		assert.equal(this.oContentFactory.getConditionsType(), oContentConditionType.contentDisplay.oConditionsType, "ConditionsType of ContentDisplay returned.");

		this.oContentFactory._setUsedConditionType(undefined, oContentEdit, oContentDisplay, FieldEditMode.Edit);
		assert.equal(this.oContentFactory.getConditionType(), oContentConditionType.contentEdit.oConditionType, "ConditionType of ContentEdit returned.");
		assert.equal(this.oContentFactory.getConditionsType(), oContentConditionType.contentEdit.oConditionsType, "ConditionsType of ContentEdit returned.");

		const oType = new StringType();
		this.oContentFactory.setDataType(oType); // to be sure no type created
		this.oContentFactory._setUsedConditionType(undefined, undefined, undefined, FieldEditMode.Edit);
		assert.equal(this.oContentFactory.getConditionType(), oContentConditionType._content.oConditionType, "ConditionType of _content returned.");
		assert.equal(this.oContentFactory.getConditionsType(), oContentConditionType._content.oConditionsType, "ConditionsType of _content returned.");

		assert.ok(this.oContentFactory.updateConditionType.called, "updateConditionType called");
		oType.destroy();
		oContentConditionType.content.oConditionType.destroy();
		oContentConditionType.content.oConditionsType.destroy();
		oContentConditionType.contentDisplay.oConditionType.destroy();
		oContentConditionType.contentDisplay.oConditionsType.destroy();
		oContentConditionType.contentEdit.oConditionType.destroy();
		oContentConditionType.contentEdit.oConditionsType.destroy();
		oContentConditionType._content.oConditionType.destroy();
		oContentConditionType._content.oConditionsType.destroy();
		oContent.destroy();
		oContentEdit.destroy();
		oContentDisplay.destroy();
	});

	QUnit.test("getDisplayFormat", function(assert) {
		this.oContentFactory.setDisplayFormat("medium");
		assert.equal(this.oContentFactory.getDisplayFormat(), "medium", "Correct DisplayFormat returned.");
	});

	QUnit.test("getValueFormat", function(assert) {
		this.oContentFactory.setValueFormat("yyyy-MM-dd");
		assert.equal(this.oContentFactory.getValueFormat(), "yyyy-MM-dd", "Correct ValueFormat returned.");
	});

	QUnit.test("getCalendarType", function(assert) {
		this.oContentFactory.setCalendarType(CalendarType.Gregorian);
		assert.equal(this.oContentFactory.getCalendarType(), CalendarType.Gregorian, "Correct CalendarType returned.");
	});

	QUnit.test("getSecondaryCalendarType", function(assert) {
		this.oContentFactory.setSecondaryCalendarType(CalendarType.Gregorian);
		assert.equal(this.oContentFactory.getSecondaryCalendarType(), CalendarType.Gregorian, "Correct SecondaryCalendarType returned.");
	});

	QUnit.test("getNoFormatting", function(assert) {
		this.oContentFactory.setNoFormatting(true);
		assert.ok(this.oContentFactory.getNoFormatting(), "Correct value returned.");
		this.oContentFactory.setNoFormatting(false);
		assert.notOk(this.oContentFactory.getNoFormatting(), "Correct value returned.");
	});

	QUnit.test("getHideOperator", function(assert) {
		this.oContentFactory.setHideOperator(true);
		assert.ok(this.oContentFactory.getHideOperator(), "Correct value returned.");
		this.oContentFactory.setHideOperator(false);
		assert.notOk(this.oContentFactory.getHideOperator(), "Correct value returned.");
	});

	QUnit.test("isMeasure", function(assert) {
		this.oContentFactory.setIsMeasure(true);
		assert.ok(this.oContentFactory.isMeasure(), "Correct value returned.");
		this.oContentFactory.setIsMeasure(false);
		assert.notOk(this.oContentFactory.isMeasure(), "Correct value returned.");
	});

	/* Can't check if the handler is correct as it's a local function inside of FieldBase */
	QUnit.test("Event Handlers", function(assert) {
		assert.ok(typeof this.oContentFactory.getHandleTokenUpdate() === "function", "handleTokenUpdate function returned.");
		assert.ok(typeof this.oContentFactory.getHandleContentChange() === "function", "handleContentChange function returned.");
		assert.ok(typeof this.oContentFactory.getHandleContentLiveChange() === "function", "handleContentLiveChange function returned.");
		assert.ok(typeof this.oContentFactory.getHandleValueHelpRequest() === "function", "handleValueHelpRequest function returned.");
		assert.ok(typeof this.oContentFactory.getHandleEnter() === "function", "handleEnter function returned.");
		assert.ok(typeof this.oContentFactory.getHandleContentPress() === "function", "handleContentPress function returned.");
	});

	QUnit.test("getContentMode", function(assert) {
		/* ContentMode DisplayMultiValue */
		assert.equal(this.oContentFactory.getContentMode(null, FieldEditMode.Display, -1, false, []), ContentMode.DisplayMultiValue, "ContentMode 'DisplayMultiValue' returned.");

		/* ContentMode DisplayMultiLine */
		assert.equal(this.oContentFactory.getContentMode(null, FieldEditMode.Display, 1, true, []), ContentMode.DisplayMultiLine, "ContentMode 'DisplayMultiLine' returned.");

		/* ContentMode Display */
		assert.equal(this.oContentFactory.getContentMode(null, FieldEditMode.Display, 1, false, []), ContentMode.Display, "ContentMode 'Display' returned.");

		/* ContentMode Edit */
		assert.equal(this.oContentFactory.getContentMode(null, null, 1, false, []), ContentMode.Edit, "ContentMode 'Edit' returned.");

		/* ContentMode EditMultiValue */
		assert.equal(this.oContentFactory.getContentMode(null, null, -1, false, []), ContentMode.EditMultiValue, "ContentMode 'EditMultiValue' returned.");

		/* ContentMode EditMultiLine */
		assert.equal(this.oContentFactory.getContentMode(null, null, 1, true, []), ContentMode.EditMultiLine, "ContentMode 'EditMultiLine' returned.");

		/* ContentMode EditOperator */
		assert.equal(this.oContentFactory.getContentMode(DateContent, null, 1, false, [OperatorName.BT]), ContentMode.EditOperator, "ContentMode 'EditOperator' returned.");
		assert.equal(this.oContentFactory.getContentMode(DateContent, null, 1, false, [OperatorName.EQ]), ContentMode.EditOperator, "ContentMode 'EditOperator' returned.");

		/* ContentMode EditForHelp */
		sinon.stub(oFakeField, "_getValueHelp").returns("X");
		assert.equal(this.oContentFactory.getContentMode(null, FieldEditMode.Editable, 1, false, []), ContentMode.EditForHelp, "ContentMode 'EditForHelp' returned.");
		oFakeField._getValueHelp.restore();
	});

	QUnit.test("getContentType", function(assert) {
		let sBaseType = "";
		let iMaxConditions = -1;

		/* DefaultContent */
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, false), DefaultContent, "DefaultContent returned.");
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, true), DefaultContent, "DefaultContent returned.");

		/* LinkContent */
		const oLinkContent = LinkContent.extendBaseContent(DefaultContent); // Use extended DefaultContent
		const oMDCLink = new MdcLink("L1");
		sinon.stub(oFakeField, "getFieldInfo").returns(oMDCLink);
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, false), DefaultContent, "DefaultContent returned.");
		assert.deepEqual(this.oContentFactory.getContentType(sBaseType, iMaxConditions, true), oLinkContent, "LinkContent returned.");
		oMDCLink.destroy();
		oFakeField.getFieldInfo.restore();

		sBaseType = "Date";
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, false), DateContent, "DateContent returned.");
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, true), DateContent, "DateContent returned.");

		sBaseType = "DateTime";
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, false), DateTimeContent, "DateTimeContent returned.");
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, true), DateTimeContent, "DateTimeContent returned.");

		sBaseType = "Time";
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, false), TimeContent, "TimeContent returned.");
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, true), TimeContent, "TimeContent returned.");

		sBaseType = "Boolean";
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, false), BooleanContent, "BooleanContent returned.");
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, true), BooleanContent, "BooleanContent returned.");

		sBaseType = "Unit";
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, false), UnitContent, "UnitContent returned.");
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, true), UnitContent, "UnitContent returned.");

		sBaseType = "";
		iMaxConditions = 1;
		sinon.stub(oFakeField, "isSearchField").returns(true);
		sinon.stub(oFakeField, "getMaxConditions").returns(1);
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, false), SearchContent, "SearchContent returned.");
		assert.equal(this.oContentFactory.getContentType(sBaseType, iMaxConditions, true), SearchContent, "SearchContent returned.");
		oFakeField.isSearchField.restore();
		oFakeField.getMaxConditions.restore();
	});

	QUnit.module("Other", {
		beforeEach: function() {
			this.oContentFactory = new ContentFactory("CF1", {
				field: oFakeField,
				handleTokenUpdate: fnHandleTokenUpdate,
				handleContentChange: fnHandleContentChange,
				handleContentLiveChange: fnHndleContentLiveChange,
				handleValueHelpRequest: fnHandleValueHelpRequest,
				handleEnter: fnHandleEnter,
				handleContentPress: fnHandleContentPress
			});
		},
		afterEach: function() {
			this.oContentFactory.destroy();
			delete this.oContentFactory;
			ContentFactory._init(); // to clean up default help
		}
	});

	QUnit.test("_updateLink", function(assert) {
		const oLink = new Link({
			href: "",
			target: "_self"
		});

		assert.equal(oLink.getHref(), "", "Initial Href correct.");
		assert.equal(oLink.getTarget(), "_self", "Initial Target correct.");

		const oLinkItem = {
			href: "test",
			target: "_blank"
		};

		ContentFactory._updateLink(oLink, oLinkItem);

		assert.equal(oLink.getHref(), "test", "Href changed correctly.");
		assert.equal(oLink.getTarget(), "_blank", "Target changed correctly.");
	});

	const fnCreateAllContents = function(oContentType, sContentTypeName) {
		let bUseDefaultHelp = this.oContentFactory.getProvideDefaultValueHelp(oContentType, [OperatorName.EQ], ContentMode.Display, 1, true); // operator EQ jsut to have it in, other operators are not checked here
		const oCreateDisplayPromise = this.oContentFactory.createContent(oContentType, ContentMode.Display, sContentTypeName + "-" + ContentMode.Display, bUseDefaultHelp);
		bUseDefaultHelp = this.oContentFactory.getProvideDefaultValueHelp(oContentType, [OperatorName.EQ], ContentMode.Display, -1, false);
		const oCreateDisplayMultiValuePromise = this.oContentFactory.createContent(oContentType, ContentMode.DisplayMultiValue, sContentTypeName + "-" + ContentMode.DisplayMultiValue, bUseDefaultHelp);
		bUseDefaultHelp = this.oContentFactory.getProvideDefaultValueHelp(oContentType, [OperatorName.EQ], ContentMode.Display, 1, true);
		const oCreateDisplayMultiLinePromise = this.oContentFactory.createContent(oContentType, ContentMode.DisplayMultiLine, sContentTypeName + "-" + ContentMode.DisplayMultiLine, bUseDefaultHelp);
		bUseDefaultHelp = this.oContentFactory.getProvideDefaultValueHelp(oContentType, [OperatorName.EQ], ContentMode.Edit, 1, true);
		const oCreateEditPromise = this.oContentFactory.createContent(oContentType, ContentMode.Edit, sContentTypeName + "-" + ContentMode.Edit, bUseDefaultHelp);
		bUseDefaultHelp = this.oContentFactory.getProvideDefaultValueHelp(oContentType, sContentTypeName === "DefaultContent" ? [OperatorName.EQ, OperatorName.NE] : [OperatorName.EQ], ContentMode.Edit, -1, false);
		const oCreateEditMultiValuePromise = this.oContentFactory.createContent(oContentType, ContentMode.EditMultiValue, sContentTypeName + "-" + ContentMode.EditMultiValue, bUseDefaultHelp);
		bUseDefaultHelp = this.oContentFactory.getProvideDefaultValueHelp(oContentType, [OperatorName.EQ], ContentMode.Edit, 1, true);
		const oCreateEditMutliLinePromise = this.oContentFactory.createContent(oContentType, ContentMode.EditMultiLine, sContentTypeName + "-" + ContentMode.EditMultiLine, bUseDefaultHelp);
		this.oContentFactory._sOperator = OperatorName.EQ;
		const oCreateEditOperatorEQPromise = this.oContentFactory.createContent(oContentType, ContentMode.EditOperator, sContentTypeName + "-" + ContentMode.EditOperator + OperatorName.EQ, false);
		this.oContentFactory._sOperator = OperatorName.BT;
		const oCreateEditOperatorBTPromise = this.oContentFactory.createContent(oContentType, ContentMode.EditOperator, sContentTypeName + "-" + ContentMode.EditOperator + OperatorName.BT, false);
		const oCreateEditForHelpPromise = this.oContentFactory.createContent(oContentType, ContentMode.EditForHelp, sContentTypeName + "-" + ContentMode.EditForHelp, false);

		return [
			oCreateDisplayPromise,
			oCreateDisplayMultiValuePromise,
			oCreateDisplayMultiLinePromise,
			oCreateEditPromise,
			oCreateEditMultiValuePromise,
			oCreateEditMutliLinePromise,
			oCreateEditOperatorEQPromise,
			oCreateEditOperatorBTPromise,
			oCreateEditForHelpPromise
		];
	};

	const fnCheckCreatedContent = function(oExpectedContentControl, assert, done) {
		const aContentModes = [
			ContentMode.Display,
			ContentMode.DisplayMultiValue,
			ContentMode.DisplayMultiLine,
			ContentMode.Edit,
			ContentMode.EditMultiValue,
			ContentMode.EditMultiLine,
			ContentMode.EditOperator + " (EQ)",
			ContentMode.EditOperator + " (BT)",
			ContentMode.EditForHelp
		];
		const oContentType = oExpectedContentControl.contentType;
		const sContentTypeName = oExpectedContentControl.contentTypeName;
		const aExpectedControlArrays = oExpectedContentControl.expectedControls;
		const oDefalutHelp = oExpectedContentControl.defaultHelp;

		const aCreateContentPromises = fnCreateAllContents.call(this, oContentType, sContentTypeName);

		Promise.all(aCreateContentPromises).then((aCreatedControlsArrays) => {
			aCreatedControlsArrays.forEach((aCreatedControls, iIndex) => {
				const aExpectedControls = aExpectedControlArrays[iIndex];
				const sContentMode = aContentModes[iIndex];

				assert.equal(aCreatedControls.length, aExpectedControls.length, "Correct number of controls returned for ContentType '" + sContentTypeName + "' in ContentMode '" + sContentMode + "'");

				aCreatedControls.forEach((oCreatedControl, iIndex) => {
					const sExpectedControl = aExpectedControls[iIndex];
					assert.ok(sExpectedControl && oCreatedControl.isA(sExpectedControl), "Correct controls returned for ContentType '" + sContentTypeName + "' in ContentMode '" + sContentMode + "'");

					if (sContentMode.startsWith("Edit") && oCreatedControl.getAriaLabelledBy) { // aria-label needs to be forwarded
						assert.ok(oCreatedControl.getAriaLabelledBy().indexOf("X") >= 0, "Aria-label forwarded for ContentType '" + sContentTypeName + "' in ContentMode '" + sContentMode + "'");
					}

					if (sExpectedControl === "sap.ui.mdc.ValueHelp" && oDefalutHelp) {
						const oContainer = oDefalutHelp.typeahead ? oCreatedControl.getTypeahead() : oCreatedControl.getDialog();
						const oContent = oContainer?.getContent()[0];
						const sContainerName = oDefalutHelp.typeahead || oDefalutHelp.dialog;
						assert.ok(oContainer.isA(sContainerName), "DefaultHelp for ContentType '" + sContentTypeName + ": Container");
						assert.ok(oContent.isA(oDefalutHelp.content), "DefaultHelp for ContentType '" + sContentTypeName + ": Content");
						this.oContentFactory.updateDefaultValueHelpTitle(oCreatedControl, oDefalutHelp.updateTitle);
						if (oDefalutHelp.updateTitle) { // test only if supported
							assert.equal(oContainer.getTitle(), oDefalutHelp.updateTitle, "Title updated on Container for ContentType '" + sContentTypeName + ": Content");
							assert.equal(oContent.getLabel(), oDefalutHelp.updateTitle, "Label updated on Content for ContentType '" + sContentTypeName + ": Content");
						}
					}
				});
			});
			done();
		});
	};

	QUnit.test("createContent", function(assert) {
		const aExpectedContentControls = [
			{
				contentType: BooleanContent,
				contentTypeName: "BooleanContent",
				expectedControls: [
					["sap.m.Text"], // Display
					[], // DisplayMultiValue
					[], // DisplayMultiLine
					["sap.ui.mdc.field.FieldInput", "sap.ui.mdc.ValueHelp"], // Edit
					[], // EditMultiValue
					[], // EditMultiLine
					[], // EditOperator EQ
					[], // EditOperator BT
					["sap.ui.mdc.field.FieldInput"] // EditForHelp
				],
				defaultHelp: {typeahead: "sap.ui.mdc.valuehelp.Popover", content: "sap.ui.mdc.valuehelp.content.Bool", updateTitle: ""}
			},
			{
				contentType: DateContent,
				contentTypeName: "DateContent",
				expectedControls: [
					["sap.m.Text"],
					["sap.ui.mdc.field.TokenizerDisplay"],
					["sap.m.ExpandableText"],
					["sap.m.DynamicDateRange"],
					["sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.ValueHelp"],
					[],
					["sap.m.DatePicker"],
					["sap.m.DateRangeSelection"],
					["sap.ui.mdc.field.FieldInput"]
				],
				defaultHelp: {dialog: "sap.ui.mdc.valuehelp.Dialog", content: "sap.ui.mdc.valuehelp.content.Conditions", updateTitle: "Update"}
			},
			{
				contentType: DateTimeContent,
				contentTypeName: "DateTimeContent",
				expectedControls: [
					["sap.m.Text"],
					["sap.ui.mdc.field.TokenizerDisplay"],
					["sap.m.ExpandableText"],
					["sap.m.DynamicDateRange"],
					["sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.ValueHelp"],
					[],
					["sap.m.DateTimePicker"],
					[],
					["sap.ui.mdc.field.FieldInput"]
				],
				defaultHelp: {dialog: "sap.ui.mdc.valuehelp.Dialog", content: "sap.ui.mdc.valuehelp.content.Conditions", updateTitle: "Update"}
			},
			{
				contentType: DefaultContent,
				contentTypeName: "DefaultContent",
				expectedControls: [
					["sap.m.Text"],
					["sap.ui.mdc.field.TokenizerDisplay"],
					["sap.m.ExpandableText"],
					["sap.ui.mdc.field.FieldInput"],
					["sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.ValueHelp"],
					["sap.m.TextArea"],
					[],
					[],
					["sap.ui.mdc.field.FieldInput"]
				],
				defaultHelp: {dialog: "sap.ui.mdc.valuehelp.Dialog", content: "sap.ui.mdc.valuehelp.content.Conditions", updateTitle: "Update"}
			},
			{
				contentType: LinkContent.extendBaseContent(DefaultContent), // Use extended DefaultContent
				contentTypeName: "LinkContent",
				expectedControls: [
					["sap.m.Link"],
					[],
					["sap.m.Link"],
					["sap.ui.mdc.field.FieldInput"],
					["sap.ui.mdc.field.FieldMultiInput"],
					["sap.m.TextArea"],
					[],
					[],
					["sap.ui.mdc.field.FieldInput"]
				]
			},
			{
				contentType: SearchContent,
				contentTypeName: "SearchContent",
				expectedControls: [
					["sap.m.Text"],
					[],
					[],
					["sap.m.SearchField"],
					[],
					[],
					[],
					[],
					[]
				]
			},
			{
				contentType: TimeContent,
				contentTypeName: "TimeContent",
				expectedControls: [
					["sap.m.Text"],
					["sap.ui.mdc.field.TokenizerDisplay"],
					["sap.m.ExpandableText"],
					["sap.ui.mdc.field.FieldInput"],
					["sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.ValueHelp"],
					[],
					["sap.m.TimePicker"],
					[],
					["sap.ui.mdc.field.FieldInput"]
				],
				defaultHelp: {dialog: "sap.ui.mdc.valuehelp.Dialog", content: "sap.ui.mdc.valuehelp.content.Conditions", updateTitle: "Update"}
			},
			{
				contentType: UnitContent,
				contentTypeName: "UnitContent",
				expectedControls: [
					["sap.m.Text"],
					["sap.ui.mdc.field.TokenizerDisplay"],
					["sap.m.ExpandableText"],
					["sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput"],
					["sap.ui.mdc.field.FieldMultiInput", "sap.ui.mdc.field.FieldInput"],
					[],
					[],
					[],
					["sap.ui.mdc.field.FieldInput", "sap.ui.mdc.field.FieldInput"]
				]
			}
		];
		const done = assert.async(aExpectedContentControls.length);

		aExpectedContentControls.forEach((oExpectedContentControl) => {
			fnCheckCreatedContent.call(this, oExpectedContentControl, assert, done);
		});
	});

	QUnit.test("createContent error handling", function(assert) {
		const DefaultContentError = Object.assign({}, DefaultContent);

		DefaultContentError.createDisplay = function () {
			throw new Error("Test Error");
		};

		DefaultContentError.getDisplay = function() {
			return ["sap/ui/mdc/Link"];
		};

		const oExpectedContentControl = {
			contentType: DefaultContentError,
			contentTypeName: "DefaultContent",
			expectedControls: [
				["sap.m.Text"],
				["sap.m.ExpandableText"],
				["sap.m.ExpandableText"],
				["sap.ui.mdc.field.FieldInput"],
				["sap.ui.mdc.field.FieldMultiInput"],
				["sap.m.TextArea"],
				[],
				[],
				["sap.ui.mdc.field.FieldInput"]
		]
		};
		const done = assert.async();
		const oContentType = oExpectedContentControl.contentType;
		const sContentTypeName = oExpectedContentControl.contentTypeName;

		assert.throws(
			function() {
				this.oContentFactory.createContent(oContentType, ContentMode.Display, sContentTypeName + "-" + ContentMode.Display + "-ErrorCase");
			},
			/Test Error/,
			"createContent forwards error when module is loaded synchronious.");

		DefaultContentError.getDisplay = function() {
			return ["sap/ui/mdc/ActionToolbar"];
		};

		this.oContentFactory.createContent(oContentType, ContentMode.Display, sContentTypeName + "-" + ContentMode.Display + "-ErrorCase").catch(function(oError) {
			assert.equal(oError.message, "Test Error", "createContent forwards error when module is loaded asynchronious.");
			done();
		});
	});

	QUnit.start();
});