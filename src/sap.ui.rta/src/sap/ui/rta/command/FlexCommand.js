/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/base/util/values",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/library"
], function(
	merge,
	objectValues,
	Log,
	JsControlTreeModifier,
	Element,
	ControlVariantApplyAPI,
	ChangesWriteAPI,
	FlUtils,
	BaseCommand,
	rtaLibrary
) {
	"use strict";

	/**
	 * Basic implementation for the flexibility commands, that use a flex change handler.
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.command.FlexCommand
	 */
	var FlexCommand = BaseCommand.extend("sap.ui.rta.command.FlexCommand", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				changeType: {
					type: "string"
				},
				/**
				 * Change can only be applied on js, other modifiers like xml will not work
				 */
				jsOnly: {
					type: "boolean",
					defaultValue: false
				},
				/**
				 * selector object containing id, appComponent and controlType to create a command for an element, which is not instantiated
				 */
				selector: {
					type: "object"
				},
				/**
				 * Change is independent of any Fl variant
				 */
				variantIndependent: {
					type: "boolean",
					defaultValue: false
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * Retrieves id of element or selector
	 *
	 * @returns {string} id value
	 * @public
	 */
	FlexCommand.prototype.getElementId = function() {
		var oElement = this.getElement();
		return oElement ? oElement.getId() : this.getSelector().id;
	};

	/**
	 * Retrieves app component of element or selector
	 *
	 * @returns {sap.ui.core.UIComponent} component
	 * @private
	 */
	FlexCommand.prototype.getAppComponent = function() {
		var oElement = this.getElement();
		return oElement ? FlUtils.getAppComponentForControl(oElement) : this.getSelector().appComponent;
	};

	/**
	 * Prepares and stores change to be applied later
	 * (in some cases element of a command is unstable, so change needs to be created and stored upfront)
	 * @override
	 */
	FlexCommand.prototype.prepare = function(mFlexSettings, sVariantManagementReference, sCommand) {
		var oSelector;
		if (!this.getSelector() && mFlexSettings && mFlexSettings.templateSelector) {
			oSelector = {
				id: mFlexSettings.templateSelector,
				appComponent: this.getAppComponent(),
				controlType: FlUtils.getControlType(Element.getElementById(mFlexSettings.templateSelector))
			};
			this.setSelector(oSelector);
		} else if (!this.getSelector() && this.getElement()) {
			oSelector = {
				id: this.getElement().getId(),
				appComponent: this.getAppComponent(),
				controlType: FlUtils.getControlType(this.getElement())
			};
			this.setSelector(oSelector);
		}

		return this._createChange(mFlexSettings, sVariantManagementReference, sCommand)
		.then(function(oChange) {
			this._oPreparedChange = oChange;
			return true;
		}.bind(this))
		.catch(function(oError) {
			Log.error(oError.message || oError.name);
			return false;
		});
	};

	/**
	 * Returns a prepared change if exists in the command
	 * @returns {object} Prepared change object
	 * @public
	 */
	FlexCommand.prototype.getPreparedChange = function() {
		return this._oPreparedChange;
	};

	/**
	 * @override
	 * @returns {Promise} empty promise after finishing execution
	 */
	FlexCommand.prototype.execute = function() {
		var vChange = this.getPreparedChange();
		return this._applyChange(vChange);
	};

	/**
	 * This method converts all command constructor parameters that are flagged with group 'content' into change specific data.
	 * @return {object} Returns the <code>ChangeSpecificInfo</code> for change handler
	 * @protected
	 */
	FlexCommand.prototype._getChangeSpecificData = function() {
		var mProperties = this.getMetadata().getProperties();
		var mChangeSpecificData = {
			changeType: this.getChangeType()
		};
		objectValues(mProperties)
		.filter(function(oProperty) {
			return oProperty.group === "content";
		})
		.forEach(function(oProperty) {
			mChangeSpecificData[oProperty.name] = oProperty.get(this);
		}, this);
		return mChangeSpecificData;
	};

	/**
	 * Creates a change.
	 * @param {object} mFlexSettings Map containing the flexibility settings
	 * @param {string} sVariantManagementReference Reference to the variant management
	 * @param {string} sCommand Command name
	 * @returns {object} Returns the change object
	 * @private
	 */
	FlexCommand.prototype._createChange = function(mFlexSettings, sVariantManagementReference, sCommand) {
		return this._createChangeFromData(this._getChangeSpecificData(), mFlexSettings, sVariantManagementReference, sCommand);
	};

	/**
	 * Create a Flex change from a given Change Specific Data.
	 * (This method can be reused to retrieve an Undo Change)
	 *
	 * @param {object} mChangeSpecificData - Map containing change specific data
	 * @param {object} mFlexSettings - Map containing flex settings
	 * @param {string} sVariantManagementReference - Reference to the variant management
	 * @param {string} sCommand Command name
	 * @returns {Promise.<object>} Change object wrapped in a promise.
	 * @private
	 */
	FlexCommand.prototype._createChangeFromData = function(mChangeSpecificData, mFlexSettings, sVariantManagementReference, sCommand) {
		if (mFlexSettings) {
			mChangeSpecificData = merge({}, mChangeSpecificData, mFlexSettings);
		}
		mChangeSpecificData.jsOnly = this.getJsOnly();
		var oModel = this.getAppComponent().getModel(ControlVariantApplyAPI.getVariantModelName());
		var sVariantReference;
		if (oModel && sVariantManagementReference) {
			sVariantReference = oModel.getCurrentVariantReference(sVariantManagementReference);
		}
		if (sVariantReference && !this.getVariantIndependent()) {
			var mVariantObj = {
				variantManagementReference: sVariantManagementReference,
				variantReference: sVariantReference,
				isChangeOnStandardVariant: sVariantManagementReference === sVariantReference
			};
			mChangeSpecificData = { ...mChangeSpecificData, ...mVariantObj };
		}
		mChangeSpecificData.command = sCommand;
		mChangeSpecificData.generator = mFlexSettings.generator || rtaLibrary.GENERATOR_NAME;
		return ChangesWriteAPI.create({changeSpecificData: mChangeSpecificData, selector: this._validateControlForChange(mFlexSettings)})
		.then(function(oChange) {
			// originalSelector is only present when making a change on/inside a template; the selector does not work with the JS propagation hook (the template has no parent),
			// therefore the selector is changed to the parent (already the selector of the command) and the original selector saved as dependent.
			// Also 'boundAggregation' property gets saved in the change content
			// ATTENTION! the change gets applied as soon as the parent is available, so there might be possible side effects with lazy loading
			if (mFlexSettings && mFlexSettings.originalSelector) {
				oChange.addDependentControl(mFlexSettings.originalSelector, "originalSelector", {modifier: JsControlTreeModifier, appComponent: this.getAppComponent()});
				oChange.setSelector({
					...oChange.getSelector(),
					...JsControlTreeModifier.getSelector(this.getSelector().id, this.getAppComponent())
				});
				oChange.setContent({ ...oChange.getContent(), ...mFlexSettings.content });
			}
			return oChange;
		}.bind(this));
	};

	/**
	 * @override
	 */
	FlexCommand.prototype.undo = function() {
		var vControl = this.getElement() || JsControlTreeModifier.bySelector(this.getSelector());

		var oChange = this.getPreparedChange();

		return ChangesWriteAPI.revert({change: oChange, element: vControl});
	};

	/**
	 * @private
	 * @param {sap.ui.fl.apply._internal.flexObjects.UIChange|Object} vChange Change object or map containing the change object
	 * @returns {Promise} Returns an empty promise
	 */
	FlexCommand.prototype._applyChange = function(oChange) {
		var oAppComponent = this.getAppComponent();
		var oSelectorElement = JsControlTreeModifier.bySelector(oChange.getSelector(), oAppComponent);

		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: FlUtils.getViewForControl(oSelectorElement)
		};
		return ChangesWriteAPI.apply({ change: oChange, element: oSelectorElement, ...mPropertyBag })

		.then(function(oResult) {
			if (!oResult.success) {
				return Promise.reject(oResult.error);
			}
			return undefined;
		});
	};

	FlexCommand.prototype._validateControlForChange = function(mFlexSettings) {
		if (mFlexSettings && mFlexSettings.originalSelector && mFlexSettings.content && mFlexSettings.content.boundAggregation) {
			return {
				id: mFlexSettings.originalSelector,
				appComponent: this.getAppComponent(),
				controlType: FlUtils.getControlType(Element.getElementById(mFlexSettings.originalSelector))
			};
		}
		return this.getElement() || this.getSelector();
	};

	return FlexCommand;
});
