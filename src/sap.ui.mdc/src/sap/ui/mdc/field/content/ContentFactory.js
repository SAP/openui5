/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/mdc/enums/FieldEditMode",
	"sap/ui/mdc/enums/ContentMode",
	"sap/ui/mdc/util/loadModules",
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/mdc/field/content/SearchContent",
	"sap/ui/mdc/field/content/DateContent",
	"sap/ui/mdc/field/content/TimeContent",
	"sap/ui/mdc/field/content/DateTimeContent",
	"sap/ui/mdc/field/content/LinkContent",
	"sap/ui/mdc/field/content/BooleanContent",
	"sap/ui/mdc/field/content/UnitContent",
	'sap/ui/mdc/field/ConditionType',
	'sap/ui/mdc/field/ConditionsType',
	"sap/ui/base/SyncPromise"
], (BaseObject, FieldEditMode, ContentMode, loadModules, DefaultContent, SearchContent, DateContent, TimeContent, DateTimeContent, LinkContent, BooleanContent, UnitContent, ConditionType, ConditionsType, SyncPromise) => {
	"use strict";

	/**
	 * @namespace
	 * @name sap.ui.mdc.field.content
	 * @since 1.87.0
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */

	/**
	 * Object-based factory that handles the content creation process of the {@link sap.ui.mdc.field.FieldBase}.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.ContentFactory
	 * @extends sap.ui.base.Object
	 */
	const ContentFactory = BaseObject.extend("sap.ui.mdc.field.content.ContentFactory", {
		metadata: {
			library: "sap.ui.mdc"
		},
		constructor: function(sId, mSettings) {
			this.init();
			this._oField = mSettings ? mSettings.field : null;
			this._fnHandleTokenUpdate = mSettings ? mSettings.handleTokenUpdate : null;
			this._fnHandleContentChange = mSettings ? mSettings.handleContentChange : null;
			this._fnHandleContentLiveChange = mSettings ? mSettings.handleContentLiveChange : null;
			this._fnHandleValueHelpRequest = mSettings ? mSettings.handleValueHelpRequest : null;
			this._fnHandleEnter = mSettings ? mSettings.handleEnter : null;
			this._fnHandleContentPress = mSettings ? mSettings.handleContentPress : null;
			BaseObject.prototype.constructor.apply(this, arguments);
		}
	});

	const mContentTypes = {
		Default: DefaultContent,
		Search: SearchContent,
		Date: DateContent,
		Time: TimeContent,
		DateTime: DateTimeContent,
		Link: LinkContent,
		Boolean: BooleanContent,
		Unit: UnitContent
	};

	let mDefaultHelps;

	// private function to initialize globals for qUnit tests
	ContentFactory._init = function() {

		if (mDefaultHelps && mDefaultHelps.bool && mDefaultHelps.bool.control) {
			mDefaultHelps.bool.control.destroy();
		}
		if (mDefaultHelps && mDefaultHelps.defineConditions && mDefaultHelps.defineConditions.control) {
			mDefaultHelps.defineConditions.control.destroy();
		}

		mDefaultHelps = {
			bool: {
				modules: ["sap/ui/mdc/ValueHelp", "sap/ui/mdc/valuehelp/Popover", "sap/ui/mdc/valuehelp/content/Bool"],
				id: "BoolDefaultHelp",
				contentProperties: {},
				dialog: false,
				control: undefined,
				updateTitle: function(oValueHelp, sTitle) {
					// no title needed for boolean help (just dropdown)
				}
			},
			defineConditions: {
				modules: ["sap/ui/mdc/ValueHelp", "sap/ui/mdc/valuehelp/Dialog", "sap/ui/mdc/valuehelp/content/Conditions"],
				id: "Field-DefineConditions-Help",
				contentProperties: {},
				dialog: true,
				control: undefined,
				updateTitle: function(oValueHelp, sTitle) {
					oValueHelp.getDialog().setTitle(sTitle);
					oValueHelp.getDialog().getContent()[0].setLabel(sTitle);
				}
			}
		};

	};

	ContentFactory._init();

	ContentFactory.prototype.init = function() {
		this._oContentTypeClass = undefined;
		this._sOperator = undefined;
		this._bNoFormatting = false;
		this._bHideOperator = false;
	};

	ContentFactory.prototype.exit = function() {
		this._oField = undefined;
		this._fnHandleTokenUpdate = undefined;
		this._fnHandleContentChange = undefined;
		this._fnHandleContentLiveChange = undefined;
		this._fnHandleValueHelpRequest = undefined;
		this._fnHandleEnter = undefined;
		this._fnHandleContentPress = undefined;
		this._oContentTypeClass = undefined;
		this._sOperator = undefined;

		if (this._oConditionType && this._oConditionType._bCreatedByField) {
			this._oConditionType.destroy();
			this._oConditionType = undefined;
		}

		if (this._oConditionsType && this._oConditionsType._bCreatedByField) {
			this._oConditionsType.destroy();
			this._oConditionsType = undefined;
		}
	};

	/**
	 * Creates the suitable controls for the given content type and mode and returns the control instances.
	 * @param {sap.ui.mdc.field.content.DefaultContent} oContentType The content type object
	 * @param {sap.ui.mdc.enums.ContentMode} sContentMode A given content mode
	 * @param {string} sId ID of the {@link sap.ui.mdc.field.FieldBase}
	 * @param {boolean} bProvideDefaultValueHelp If set, a default value help should be provided.
	 * @returns {Promise<sap.ui.core.Element[]>} Array containing the created controls and the default value help, if needed
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ContentFactory.prototype.createContent = function(oContentType, sContentMode, sId, bProvideDefaultValueHelp) {
		let aControlNames = oContentType.getControlNames(sContentMode, this._sOperator);
		const sDefaultValueHelpName = bProvideDefaultValueHelp && oContentType.getUseDefaultValueHelp().name;
		const oDefaultHelp = sDefaultValueHelpName && mDefaultHelps[sDefaultValueHelpName];
		let oLoadModulesPromise;

		this.setNoFormatting(oContentType.getNoFormatting(sContentMode));

		if (aControlNames.every((sControlName) => {
				return !sControlName;
			})) {
			return Promise.resolve([]);
		}

		if (!this.getDataType()) {
			// DataType instance not already set, make sure to load module before creating control and corresponding ConditionType (In Field case Instance is set in Binding.)
			let sDataType = this.getField().getDataType();
			if (sDataType) {
				sDataType = this.getField().getTypeMap().getDataTypeClassName(sDataType); // map EDM-Types
				aControlNames.push(sDataType.replaceAll(".", "/"));
			}
		}

		if (oDefaultHelp) {
			if (oDefaultHelp.control && oDefaultHelp.control.isDestroyed()) {
				// someone destroyed ValueHelp -> initialize
				oDefaultHelp.control = undefined;
			}

			if (!oDefaultHelp.control) { // default help not created right now
				aControlNames = aControlNames.concat(oDefaultHelp.modules);
			}
		}

		try {
			oLoadModulesPromise = loadModules(aControlNames)
				.catch((oError) => {
					throw new Error("loadModules promise rejected in sap.ui.mdc.field.content.ContentFactory:createContent function call - could not load data type " + JSON.stringify(aControlNames));
				})
				.then((aControls) => {
					if (this.getField() && !this.getField().isFieldDestroyed()) {
						const oValueHelp = _createDefaultValueHelp.call(this, oDefaultHelp, aControls);

						this.updateConditionType(); // to make sure to have current FormatOptions if Condition(s)Type already exist
						const aContentControls = oContentType.create(this, sContentMode, this._sOperator, aControls, sId);
						if (oValueHelp) {
							aContentControls.push(oValueHelp);
						}
						return aContentControls;
					} else {
						return [];
					}
				})
				.unwrap();
		} catch (oError) {
			throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:createContent function call ErrorMessage: '" + oError.message + "'");
		}

		if (oLoadModulesPromise.then) {
			oLoadModulesPromise.catch((oError) => {
				throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:createContent function call ErrorMessage: '" + oError.message + "'");
			});
			return oLoadModulesPromise;
		}

		return SyncPromise.resolve(oLoadModulesPromise);
	};

	/**
	 * Determines in which {@link sap.ui.mdc.enums.ContentMode} the given content type is displayed.
	 * @param {sap.ui.mdc.field.content.DefaultContent} oContentType The content type object
	 * @param {sap.ui.mdc.enums.FieldEditMode} sEditMode The display mode of the {@link sap.ui.mdc.field.FieldBase}
	 * @param {int} iMaxConditions Maximum number of conditions of the {@link sap.ui.mdc.field.FieldBase}
	 * @param {boolean} bMultipleLines Determines if the content type has a multiple line input
	 * @param {string[]} aOperators Names of the operators if the <code>EditOperator</code> content mode is used
	 * @returns {sap.ui.mdc.enums.ContentMode} sContentMode A given content mode
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ContentFactory.prototype.getContentMode = function(oContentType, sEditMode, iMaxConditions, bMultipleLines, aOperators) {
		let sContentMode = ContentMode.Edit;

		if (sEditMode === FieldEditMode.Display) {
			if (iMaxConditions !== 1) {
				sContentMode = ContentMode.DisplayMultiValue;
			} else if (bMultipleLines) {
				sContentMode = ContentMode.DisplayMultiLine;
			} else {
				sContentMode = ContentMode.Display;
			}
		} else if (iMaxConditions !== 1) {
			sContentMode = ContentMode.EditMultiValue;
		} else if (bMultipleLines) {
			sContentMode = ContentMode.EditMultiLine;
		} else if (this.getField()._getValueHelp()) { // if ValueHelp assigned use control supporting help
			sContentMode = ContentMode.EditForHelp;
		} else if (aOperators.length === 1 && oContentType.getEditOperator() && oContentType.getEditOperator()[aOperators[0]]) {
			this._sOperator = aOperators[0];
			sContentMode = ContentMode.EditOperator;
		}

		return sContentMode;
	};

	/**
	 * Determines which content type object to use.
	 * @param {sap.ui.mdc.enums.BaseType} sBaseType Base type determined by {@link sap.ui.mdc.field.FieldBase}
	 * @param {int} iMaxConditions Maximum number of conditions of the {@link sap.ui.mdc.field.FieldBase}
	 * @param {boolean} bIsTriggerable Checks if the {@link sap.ui.mdc.field.FieldBase} is triggerable or not - needed for link content type
	 * @returns {sap.ui.mdc.field.content.DefaultContent} oContentType Content type object
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 */
	ContentFactory.prototype.getContentType = function(sBaseType, iMaxConditions, bIsTriggerable) {
		const oField = this.getField();
		let oContentType = mContentTypes[sBaseType] ? mContentTypes[sBaseType] : null;
		if (!oContentType) {
			if (oField.isSearchField()) {
				oContentType = mContentTypes.Search;
			} else {
				oContentType = mContentTypes.Default;
			}
		}

		// For Link enhance BaseContentType
		if (oField.getFieldInfo() && bIsTriggerable) {
			oContentType = mContentTypes.Link.extendBaseContent(oContentType);
		}
		return oContentType;
	};

	ContentFactory._updateLink = function(oLink, oLinkItem) {
		if (oLinkItem) {
			oLink.setHref(oLinkItem.href);
			oLink.setTarget(oLinkItem.target);
		}
	};

	ContentFactory._getEnabled = function(sEditMode) {
		return (sEditMode && sEditMode !== FieldEditMode.Disabled);
	};

	ContentFactory._getEditable = function(sEditMode) {
		return (sEditMode === FieldEditMode.Editable || sEditMode === FieldEditMode.EditableReadOnly || sEditMode === FieldEditMode.EditableDisplay);
	};

	ContentFactory._getDisplayOnly = function(sEditMode) {
		return sEditMode && sEditMode !== FieldEditMode.Editable;
	};

	ContentFactory._getEditableUnit = function(sEditMode) {
		return sEditMode === FieldEditMode.Editable;
	};

	ContentFactory.prototype.getField = function() {
		return this._oField;
	};

	ContentFactory.prototype.getValueHelpIcon = function() {
		return this.getField()._getValueHelpIcon();
	};

	ContentFactory.prototype.getHandleTokenUpdate = function() {
		return this._fnHandleTokenUpdate;
	};

	ContentFactory.prototype.getHandleContentChange = function() {
		return this._fnHandleContentChange;
	};

	ContentFactory.prototype.getHandleContentLiveChange = function() {
		return this._fnHandleContentLiveChange;
	};

	ContentFactory.prototype.getHandleValueHelpRequest = function() {
		return this._fnHandleValueHelpRequest;
	};

	ContentFactory.prototype.getHandleEnter = function() {
		return this._fnHandleEnter;
	};

	ContentFactory.prototype.getHandleContentPress = function() {
		return this._fnHandleContentPress;
	};

	ContentFactory.prototype.setAriaLabelledBy = function(oContent) {
		if (oContent.addAriaLabelledBy) {
			const aAriaLabelledBy = this.getField().getAriaLabelledBy();

			for (const sId of aAriaLabelledBy) {
				oContent.addAriaLabelledBy(sId);
			}
		}
	};

	ContentFactory.prototype.setHideOperator = function(bHideOperator) {
		this._bHideOperator = bHideOperator;
	};

	ContentFactory.prototype.getHideOperator = function() {
		return this._bHideOperator;
	};

	function _getCondType(sCondType, CondType, fnGetFormatOptions, bSkipTypeGeneration) {

		if (!bSkipTypeGeneration) {
			if (this[sCondType] && this[sCondType].getMetadata().getName() !== CondType.getMetadata().getName()) {
				// ConditionsType changed
				this[sCondType].destroy();
				this[sCondType] = undefined;
			}

			if (!this[sCondType]) {
				const oFormatOptions = fnGetFormatOptions();
				this[sCondType] = new CondType(oFormatOptions);
				this[sCondType]._bCreatedByField = true;
			}
		}
		return this[sCondType];

	}

	ContentFactory.prototype.getConditionType = function(bSkipConditionTypeGeneration) {
		return _getCondType.call(this, "_oConditionType", ConditionType, this.getField().getFormatOptions.bind(this.getField()), bSkipConditionTypeGeneration);
	};

	ContentFactory.prototype.setConditionType = function(oConditionType) {
		this._oConditionType = oConditionType;
	};

	ContentFactory.prototype.getConditionsType = function(bSkipConditionsTypeGeneration, CustomConditionsType) {
		const UsedConditionType = CustomConditionsType || ConditionsType; // CustomConditionsType used for DynamicDateRange
		return _getCondType.call(this, "_oConditionsType", UsedConditionType, this.getField().getFormatOptions.bind(this.getField()), bSkipConditionsTypeGeneration);
	};

	ContentFactory.prototype.setConditionsType = function(oConditionsType) {
		this._oConditionsType = oConditionsType;
	};

	ContentFactory.prototype.getUnitConditionsType = function(bSkipConditionsTypeGeneration) {
		return _getCondType.call(this, "_oUnitConditionsType", ConditionsType, this.getField().getUnitFormatOptions.bind(this.getField()), bSkipConditionsTypeGeneration);
	};

	ContentFactory.prototype.getContentConditionTypes = function() {
		return this._oContentConditionTypes;
	};

	ContentFactory.prototype.setContentConditionTypes = function(oContentConditionTypes) {
		this._oContentConditionTypes = oContentConditionTypes;
	};

	ContentFactory.prototype._setUsedConditionType = function(oContent, oContentEdit, oContentDisplay, sEditMode) {

		// remove external types
		if (this._oConditionType && !this._oConditionType._bCreatedByField) {
			this._oConditionType = undefined;
		}
		if (this._oConditionsType && !this._oConditionsType._bCreatedByField) {
			this._oConditionsType = undefined;
		}

		// set types from current content (if external)
		let oConditionType;
		let oConditionsType;

		if (oContent) {
			if (this._oContentConditionTypes.content) {
				oConditionType = this._oContentConditionTypes.content.oConditionType;
				oConditionsType = this._oContentConditionTypes.content.oConditionsType;
			}
		} else if (sEditMode === FieldEditMode.Display && oContentDisplay) {
			if (this._oContentConditionTypes.contentDisplay) {
				oConditionType = this._oContentConditionTypes.contentDisplay.oConditionType;
				oConditionsType = this._oContentConditionTypes.contentDisplay.oConditionsType;
			}
		} else if (sEditMode !== FieldEditMode.Display && oContentEdit) {
			if (this._oContentConditionTypes.contentEdit) {
				oConditionType = this._oContentConditionTypes.contentEdit.oConditionType;
				oConditionsType = this._oContentConditionTypes.contentEdit.oConditionsType;
			}
		}

		if (oConditionType) {
			if (this._oConditionType && this._oConditionType._bCreatedByField) {
				this._oConditionType.destroy();
			}
			this._oConditionType = oConditionType;
		}
		if (oConditionsType) {
			if (this._oConditionsType && this._oConditionsType._bCreatedByField) {
				this._oConditionsType.destroy();
			}
			this._oConditionsType = oConditionsType;
		}

		if (oConditionType || oConditionsType) {
			// as data type module might not be loaded, load it now
			if (!this.getDataType()) {
				// DataType instance not already set, make sure to load module before creating control and corresponding ConditionType (In Field case Instance is set in Binding.)
				let sDataType = this.getField().getDataType();
				if (sDataType) {
					sDataType = this.getField().getTypeMap().getDataTypeClassName(sDataType); // map EDM-Types
					sDataType = sDataType.replaceAll(".", "/");
					try {
						loadModules([sDataType])
							.catch((oError) => {
								throw new Error("loadModules promise rejected in sap.ui.mdc.field.content.ContentFactory:_setUsedConditionType function call - could not load controls " + sDataType);
							})
							.then((aModules) => {
								if (this.getField() && !this.getField().isFieldDestroyed()) {
									this.updateConditionType();
								}
							})
							.unwrap();
					} catch (oError) {
						throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:_setUsedConditionType function call ErrorMessage: '" + oError.message + "'");
					}
				}
			} else {
				this.updateConditionType();
			}

		}

	};

	// used for value/key
	ContentFactory.prototype.getDataType = function() {
		return this._oDataType;
	};

	ContentFactory.prototype.setDataType = function(oDataType) {
		this._oDataType = oDataType;
	};

	ContentFactory.prototype.checkDataTypeChanged = function(sDataType) {
		sDataType = this.getField().getTypeMap().getDataTypeClassName(sDataType); // map EDM-Types

		try {
			// check data-type after we can be sure it's loaded to perform depending actions later
			return loadModules([sDataType.replaceAll(".", "/")])
				.catch((oError) => {
					throw new Error("loadModules promise rejected in sap.ui.mdc.field.content.ContentFactory:checkDataTypeChanged function call - could not load data type " + sDataType);
				})
				.then((aModules) => {
					// TODO: also compare FormatOptions and Constraints
					return !this._oDataType || this._oDataType.getMetadata().getName() !== sDataType;
				});
		} catch (oError) {
			throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:checkDataTypeChanged function call ErrorMessage: '" + oError.message + "'");
		}
	};

	ContentFactory.prototype.retrieveDataType = function() { // make sure that data type module is loaded before
		if (!this._oDataType) {
			const sDataType = this.getField().getDataType();
			if (typeof sDataType === "string") {
				this._oDataType = this.getField().getTypeMap().getDataTypeInstance(sDataType, this.getField().getDataTypeFormatOptions(), this.getField().getDataTypeConstraints());
				this._oDataType._bCreatedByField = true;
			}
		}
		return this._oDataType;
	};

	// used for description
	ContentFactory.prototype.getAdditionalDataType = function() {
		return this._oAdditionalDataType;
	};

	ContentFactory.prototype.setAdditionalDataType = function(oDataType) {
		this._oAdditionalDataType = oDataType;
	};

	ContentFactory.prototype.retrieveAdditionalDataType = function() { // make sure that data type module is loaded before
		if (!this._oAdditionalDataType) {
			const oDataType = this.getField().getAdditionalDataTypeConfiguration();

			if (oDataType) {
				if (oDataType.isA && oDataType.isA("sap.ui.model.Type")) {
					this._oAdditionalDataType = oDataType;
				} else if (oDataType.name) {
					this._oAdditionalDataType = this.getField().getTypeMap().getDataTypeInstance(oDataType.name, oDataType.formatOptions, oDataType.constraints);
					this._oAdditionalDataType._bCreatedByField = true;
				}
			}
		}
		return this._oAdditionalDataType;
	};

	// original data type for usage from outside
	ContentFactory.prototype.getDateOriginalType = function() {
		return this._oDateOriginalType;
	};

	ContentFactory.prototype.setDateOriginalType = function(oDateOriginalType) {
		this._oDateOriginalType = oDateOriginalType;
	};

	ContentFactory.prototype.getUnitOriginalType = function() {
		return this._oUnitOriginalType;
	};

	ContentFactory.prototype.setUnitOriginalType = function(oUnitOriginalType) {
		this._oUnitOriginalType = oUnitOriginalType;
	};

	ContentFactory.prototype.getUnitType = function() {
		return this._oUnitType;
	};

	ContentFactory.prototype.setUnitType = function(oUnitType) {
		this._oUnitType = oUnitType;
	};

	// types for single parts of compositeBinding
	ContentFactory.prototype.getCompositeTypes = function() {
		return this._aCompositeTypes;
	};

	ContentFactory.prototype.setCompositeTypes = function(aCompositeTypes) {
		this._aCompositeTypes = aCompositeTypes;
	};

	ContentFactory.prototype.getAdditionalCompositeTypes = function() {
		return this._aAdditionalCompositeTypes;
	};

	ContentFactory.prototype.setAdditionalCompositeTypes = function(aCompositeTypes) {
		this._aAdditionalCompositeTypes = aCompositeTypes;
	};

	ContentFactory.prototype.isMeasure = function() {
		return this._bIsMeasure;
	};

	ContentFactory.prototype.setIsMeasure = function(bIsMeasure) {
		this._bIsMeasure = bIsMeasure;
	};

	ContentFactory.prototype.getDisplayFormat = function() {
		return this._sDisplayFormat;
	};

	ContentFactory.prototype.setDisplayFormat = function(sDisplayFormat) {
		this._sDisplayFormat = sDisplayFormat;
	};

	ContentFactory.prototype.getValueFormat = function() {
		return this._sValueFormat;
	};

	ContentFactory.prototype.setValueFormat = function(sValueFormat) {
		this._sValueFormat = sValueFormat;
	};

	ContentFactory.prototype.getCalendarType = function() {
		return this._sCalendarType;
	};

	ContentFactory.prototype.setCalendarType = function(sCalendarType) {
		this._sCalendarType = sCalendarType;
	};

	ContentFactory.prototype.getSecondaryCalendarType = function() {
		return this._sSecondaryCalendarType;
	};

	ContentFactory.prototype.setSecondaryCalendarType = function(sSecondaryCalendarType) {
		this._sSecondaryCalendarType = sSecondaryCalendarType;
	};

	ContentFactory.prototype.getFieldTypeInitialization = function() {
		return this.getField()._oTypeInitialization;
	};

	/**
	 * Updates the <code>FormatOptions</code> of the internal <code>ConditionsType</code>.
	 *
	 * @private
	 * @ui5-restricted only for controls inherit from FieldBase
	 */
	ContentFactory.prototype.updateConditionType = function() {
		const oConditionType = this._oConditionType;
		const oConditionsType = this._oConditionsType;
		if (oConditionType || oConditionsType) {
			let oFormatOptions = this.getField().getFormatOptions();
			if (oConditionType) {
				oConditionType.setFormatOptions(oFormatOptions);
			}
			if (oConditionsType) {
				oConditionsType.setFormatOptions(oFormatOptions);
			}
			if (this._oUnitConditionsType) {
				oFormatOptions = this.getField().getUnitFormatOptions();
				this._oUnitConditionsType.setFormatOptions(oFormatOptions);
			}
		}
	};

	ContentFactory.prototype.setNoFormatting = function(bNoFormatting) {
		this._bNoFormatting = bNoFormatting;
	};
	ContentFactory.prototype.getNoFormatting = function() {
		return this._bNoFormatting;
	};

	/**
	 * Determines if a default value help is needed
	 *
	 * @param {sap.ui.mdc.field.content.DefaultContent} oContentType The content type object
	 * @param {string[]} aOperators Names of the operators if the <code>EditOperator</code> content mode is used
	 * @param {sap.ui.mdc.enums.FieldEditMode} sEditMode The display mode of the {@link sap.ui.mdc.field.FieldBase}
	 * @param {int} iMaxConditions Maximum number of conditions of the {@link sap.ui.mdc.field.FieldBase}
	 * @param {boolean} bIsSingleValue If set, there is only one operator and it is a single-value operator
	 * @returns {boolean} <code>true</code> id a default value help is needed
	 *
	 * @private
	 * @ui5-restricted only for controls inherit from FieldBase
	 * @since 1.128.0
	 */
	ContentFactory.prototype.getProvideDefaultValueHelp = function(oContentType, aOperators, sEditMode, iMaxConditions, bIsSingleValue) {

		const oUseDefaultValueHelp = oContentType.getUseDefaultValueHelp();
		if (oUseDefaultValueHelp && sEditMode !== FieldEditMode.Display) {
			if ((iMaxConditions === 1 && oUseDefaultValueHelp.single) || (iMaxConditions !== 1 && oUseDefaultValueHelp.multi)) {
				if (aOperators.length === 1) {
					// not if operator is handled by special control (like DatePicker)
					if (iMaxConditions === 1) {
						if (!(oContentType.getEditOperator() && oContentType.getEditOperator()[aOperators[0]]) &&
							(oUseDefaultValueHelp.oneOperatorSingle || !bIsSingleValue)) {
							// "bool" case (always default field help) or operator needs more than one value (e.g. between)
							return true;
						}
					} else if (oUseDefaultValueHelp.oneOperatorMulti || !bIsSingleValue) {
						// DatePicker case - in multi-value use default help to get DatePicker controls
						return true;
					}
				} else {
					// multiple operators -> default help needed
					return true;
				}
			}
		}

		return false;

	};

	/**
	 * Updates the title of the default value help.
	 *
	 * This is used to forward the label of the current connected control.
	 *
	 * @param {sap.ui.mdc.ValueHelp} oValueHelp value help
	 * @param {string} sTitle title
	 *
	 * @private
	 * @ui5-restricted only for controls inherit from FieldBase
	 * @since 1.128.0
	 */
	ContentFactory.prototype.updateDefaultValueHelpTitle = function(oValueHelp, sTitle) {

		for (const sType in mDefaultHelps) {
			if (mDefaultHelps[sType].control === oValueHelp) {
				mDefaultHelps[sType].updateTitle(oValueHelp, sTitle);
				break;
			}
		}

	};

	function _createDefaultValueHelp(oDefaultHelp, aModules) {

		if (oDefaultHelp && !oDefaultHelp.control) {
			const ValueHelp = aModules[aModules.length - 3]; // assume that the VH-modules are the last ones
			const Container = aModules[aModules.length - 2];
			const Content = aModules[aModules.length - 1];
			const oValueHelp = new ValueHelp(oDefaultHelp.id, {
				delegate: { name: "sap/ui/mdc/ValueHelpDelegate", payload: { isDefaultHelp: true } } // use base-delegate as TypeUtil of delegate is not used in current ValueHelp implementation as we transfer the Type of the Field into the ValueHelp (oConfig)
			});
			const oContainer = new Container(oDefaultHelp.id + "-container", {
				content: [new Content(oDefaultHelp.id + "-content", oDefaultHelp.contentProperties)]
			});
			oValueHelp._bIsDefaultHelp = true;
			oDefaultHelp.control = oValueHelp;
			if (oDefaultHelp.dialog) {
				oValueHelp.setDialog(oContainer);
			} else {
				oValueHelp.setTypeahead(oContainer);
			}
		}

		return oDefaultHelp?.control;

	}

	return ContentFactory;
});