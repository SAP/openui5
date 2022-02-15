/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/mdc/enum/EditMode",
	"sap/ui/mdc/enum/ContentMode",
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
], function(BaseObject, EditMode, ContentMode, loadModules, DefaultContent, SearchContent, DateContent, TimeContent, DateTimeContent, LinkContent, BooleanContent, UnitContent, ConditionType, ConditionsType, SyncPromise) {
	"use strict";

	/**
	 * Object-based factory that handles the content creation process of the {@link sap.ui.mdc.field.FieldBase}.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.ContentFactory
	 * @extends sap.ui.base.Object
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var ContentFactory = BaseObject.extend("sap.ui.mdc.field.content.ContentFactory", {
		metadata: {
			library: "sap.ui.mdc"
		},
		constructor: function(sId, mSettings) {
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

	var mContentTypes = {
		Default: DefaultContent,
		Search: SearchContent,
		Date: DateContent,
		Time: TimeContent,
		DateTime: DateTimeContent,
		Link: LinkContent,
		Boolean: BooleanContent,
		Unit: UnitContent
	};

	ContentFactory.prototype.init = function() {
		this._oContentTypeClass;
		this._sOperator;
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
	 * @param {sap.ui.mdc.enum.ContentMode} sContentMode A given content mode
	 * @param {string} sId ID of the {@link sap.ui.mdc.field.FieldBase}
	 * @returns {sap.ui.core.Control[]} Array containing the created controls
	 */
	ContentFactory.prototype.createContent = function(oContentType, sContentMode, sId) {
		var aControlNames = oContentType.getControlNames(sContentMode, this._sOperator);
		var oLoadModulesPromise;

		if (aControlNames.every(function(sControlName) {
			return !sControlName;
		})
		) {
			return Promise.resolve([]);
		}

		try {
			oLoadModulesPromise = loadModules(aControlNames)
				.catch(function(oError) {
					throw new Error("loadModules promise rejected in sap.ui.mdc.field.content.ContentFactory:createContent function call - could not load controls " + JSON.stringify(aControlNames));
				})
				.then(function(aControls) {
					if (this.getField() && !this.getField()._bIsBeingDestroyed) {
						return oContentType.create(this, sContentMode, this._sOperator, aControls, sId);
					} else {
						return [];
					}
				}.bind(this))
				.unwrap();
		} catch (oError) {
			throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:createContent function call ErrorMessage: '" + oError.message + "'");
		}

		if (oLoadModulesPromise.then) {
			oLoadModulesPromise.catch(function(oError) {
				throw new Error("Error in sap.ui.mdc.field.content.ContentFactory:createContent function call ErrorMessage: '" + oError.message + "'");
			});
			return oLoadModulesPromise;
		}

		return SyncPromise.resolve(oLoadModulesPromise);
	};

	/**
	 * Determines in which {@link sap.ui.mdc.enum.ContentMode} the given content type is displayed.
	 * @param {sap.ui.mdc.field.content.DefaultContent} oContentType The content type object
	 * @param {sap.ui.mdc.enum.EditMode} sEditMode The display mode of the {@link sap.ui.mdc.field.FieldBase}
	 * @param {int} iMaxConditions Maximum number of conditions of the {@link sap.ui.mdc.field.FieldBase}
	 * @param {boolean} bMultipleLines Determines if the content type has a multiple line input
	 * @param {string[]} aOperators Names of the operators if the <code>EditOperator</code> content mode is used
	 * @returns {sap.ui.mdc.enum.ContentMode} sContentMode A given content mode
	 */
	ContentFactory.prototype.getContentMode = function(oContentType, sEditMode, iMaxConditions, bMultipleLines, aOperators) {
		var sContentMode = ContentMode.Edit;
		if (sEditMode === EditMode.Display) {
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
		} else if (aOperators.length === 1 && oContentType.getEditOperator() && oContentType.getEditOperator()[aOperators[0]]) {
			this._sOperator = aOperators[0];
			sContentMode = ContentMode.EditOperator;
		} else if (this.getField().getFieldHelp()) { // if FieldHelp assigned use control supporting help
			sContentMode = ContentMode.EditForHelp;
		}
		return sContentMode;
	};

	/**
	 * Determines which content type object to use.
	 * @param {sap.ui.mdc.enum.BaseType} sBaseType Base type determined by {@link sap.ui.mdc.field.FieldBase}
	 * @param {int} iMaxConditions Maximum number of conditions of the {@link sap.ui.mdc.field.FieldBase}
	 * @param {boolean} bIsTriggerable Checks if the {@link sap.ui.mdc.field.FieldBase} is triggerable or not - needed for link content type
	 * @returns {sap.ui.mdc.field.content.DefaultContent} oContentType Content type object
	 */
	ContentFactory.prototype.getContentType = function(sBaseType, iMaxConditions, bIsTriggerable) {
		var oField = this.getField();
		var oContentType = mContentTypes[sBaseType] ? mContentTypes[sBaseType] : null;
		if (!oContentType) {
			if (oField.getFieldInfo() && bIsTriggerable) {
				oContentType = mContentTypes.Link;
			} else {
				var regexp = new RegExp("^\\*(.*)\\*|\\$search$");
				if (regexp.test(oField.getFieldPath()) && iMaxConditions === 1) {
					oContentType = mContentTypes.Search;
				} else {
					oContentType = mContentTypes.Default;
				}
			}
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
		return (sEditMode && sEditMode !== EditMode.Disabled);
	};

	ContentFactory._getEditable = function(sEditMode) {
		return (sEditMode === EditMode.Editable || sEditMode === EditMode.EditableReadOnly || sEditMode === EditMode.EditableDisplay);
	};

	ContentFactory._getDisplayOnly = function(sEditMode) {
		return sEditMode && sEditMode !== EditMode.Editable;
	};

	ContentFactory._getEditableUnit = function(sEditMode) {
		return sEditMode === EditMode.Editable;
	};

	ContentFactory.prototype.getField = function() {
		return this._oField;
	};

	ContentFactory.prototype.getFieldHelpIcon = function() {
		return this.getField()._getFieldHelpIcon();
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

	/**
	 * Defines to which property the field value is bound.
	 * @param {string} sBoundProperty the name of the property.
	 */
	ContentFactory.prototype.setBoundProperty = function(sBoundProperty) {
		this._sBoundProperty = sBoundProperty;
	};

	ContentFactory.prototype.getBoundProperty = function() {
		return this._sBoundProperty;
	};

	ContentFactory.prototype.setAriaLabelledBy = function(oContent) {
		if (oContent.addAriaLabelledBy) {
			var aAriaLabelledBy = this.getField().getAriaLabelledBy();

			for (var i = 0; i < aAriaLabelledBy.length; i++) {
				var sId = aAriaLabelledBy[i];
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
				var oFormatOptions = fnGetFormatOptions();
				this[sCondType] = new CondType(oFormatOptions);
				this[sCondType]._bCreatedByField = true;
			}
		}
		return this[sCondType];

	}

	ContentFactory.prototype.getConditionType = function(bSkipConditionTypeGeneration) {
		return _getCondType.call(this, "_oConditionType", ConditionType, this.getField()._getFormatOptions.bind(this.getField()), bSkipConditionTypeGeneration);
	};

	ContentFactory.prototype.setConditionType = function(oConditionType) {
		this._oConditionType = oConditionType;
	};

	ContentFactory.prototype.getConditionsType = function (bSkipConditionsTypeGeneration, CustomConditionsType) {
		var UsedConditionType = CustomConditionsType || ConditionsType; // CustomConditionsType used for DynamicDateRange
		return _getCondType.call(this, "_oConditionsType", UsedConditionType, this.getField()._getFormatOptions.bind(this.getField()), bSkipConditionsTypeGeneration);
	};

	ContentFactory.prototype.setConditionsType = function(oConditionsType) {
		this._oConditionsType = oConditionsType;
	};

	ContentFactory.prototype.getUnitConditionsType = function(bSkipConditionsTypeGeneration) {
		return _getCondType.call(this, "_oUnitConditionsType", ConditionsType, this.getField()._getUnitFormatOptions.bind(this.getField()), bSkipConditionsTypeGeneration);
	};

	ContentFactory.prototype.getContentConditionTypes = function() {
		return this._oContentConditionTypes;
	};

	ContentFactory.prototype.setContentConditionTypes = function(oContentConditionTypes) {
		this._oContentConditionTypes = oContentConditionTypes;
	};

	ContentFactory.prototype._setUsedConditionType = function(oContent, sEditMode) {

		// remove external types
		if (this._oConditionType && !this._oConditionType._bCreatedByField) {
			this._oConditionType = undefined;
		}
		if (this._oConditionsType && !this._oConditionsType._bCreatedByField) {
			this._oConditionsType = undefined;
		}

		// set types from current content (if external)
		var oConditionType;
		var oConditionsType;

		if (oContent) {
			if (this._oContentConditionTypes.content) {
				oConditionType = this._oContentConditionTypes.content.oConditionType;
				oConditionsType = this._oContentConditionTypes.content.oConditionsType;
			}
		} else if (sEditMode === EditMode.Display && this.getField().getContentDisplay()) {
			if (this._oContentConditionTypes.contentDisplay) {
				oConditionType = this._oContentConditionTypes.contentDisplay.oConditionType;
				oConditionsType = this._oContentConditionTypes.contentDisplay.oConditionsType;
			}
		} else if (sEditMode !== EditMode.Display && this.getField().getContentEdit()) {
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

		this.updateConditionType();
	};

	ContentFactory.prototype.getDataType = function() {
		return this._oDataType;
	};

	ContentFactory.prototype.setDataType = function(oDataType) {
		this._oDataType = oDataType;
	};

	ContentFactory.prototype.retrieveDataType = function() {
		if (!this._oDataType) {
			var sDataType = this.getField().getDataType();
			if (typeof sDataType === "string") {
				this._oDataType = this.getField().getTypeUtil().getDataTypeInstance(sDataType, this.getField().getDataTypeFormatOptions(), this.getField().getDataTypeConstraints());
				this._oDataType._bCreatedByField = true;
			}
		}
		return this._oDataType;
	};

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

	ContentFactory.prototype.getCompositeTypes = function() {
		return this._aCompositeTypes;
	};

	ContentFactory.prototype.setCompositeTypes = function(aCompositeTypes) {
		this._aCompositeTypes = aCompositeTypes;
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
		var oConditionType = this._oConditionType;
		var oConditionsType = this._oConditionsType;
		if (oConditionType || oConditionsType) {
			var oFormatOptions = this.getField()._getFormatOptions();
			if (oConditionType) {
				oConditionType.setFormatOptions(oFormatOptions);
			}
			if (oConditionsType) {
				oConditionsType.setFormatOptions(oFormatOptions);
			}
			if (this._oUnitConditionsType) {
				oFormatOptions = this.getField()._getUnitFormatOptions();
				this._oUnitConditionsType.setFormatOptions(oFormatOptions);
			}
		}
	};

	return ContentFactory;
});
