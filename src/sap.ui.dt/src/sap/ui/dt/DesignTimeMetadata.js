/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/DOMUtil",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/util/includes"
],
function(
	jQuery,
	ManagedObject,
	ElementUtil,
	DOMUtil,
	merge,
	ObjectPath,
	includes
) {
	"use strict";

	function evaluateAction(vAction, oElement) {
		if (typeof (vAction) === "function") {
			vAction = vAction(oElement);
		}

		if (typeof (vAction) === "string") {
			return { changeType: vAction };
		}
		return vAction;
	}

	/**
	 * Constructor for a new DesignTimeMetadata.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DesignTimeMetadata is a wrapper for the DesignTimeMetadata of the associated element
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.DesignTimeMetadata
	 */
	var DesignTimeMetadata = ManagedObject.extend("sap.ui.dt.DesignTimeMetadata", /** @lends sap.ui.dt.DesignTimeMetadata.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				/**
				 * Data to be used as DT metadata
				 */
				data: {
					type: "any",
					defaultValue: {}
				}
			}
		}
	});

	/**
	 * Sets the data as DT metadata, uses default settings, if some fields are not defined in oData
	 * @param {object} oData to set
	 * @return {sap.ui.dt.DesignTimeMetadata} returns this
	 * @protected
	 */
	DesignTimeMetadata.prototype.setData = function(oData) {
		this.setProperty("data", merge({}, this.getDefaultData(), oData));
		return this;
	};

	/**
	 * Returns the default DT metadata
	 * @return {Object} default data
	 * @protected
	 */
	DesignTimeMetadata.prototype.getDefaultData = function() {
		return {
			ignore: false,
			domRef: undefined
		};
	};

	/**
	 * Returns property "ignore" of the DT metadata
	 * @param {Object} oElement Element instance
	 * @return {boolean} if ignored
	 * @public
	 */
	DesignTimeMetadata.prototype.isIgnored = function(oElement) {
		var vIgnore = this.getData().ignore;
		if (!vIgnore || (vIgnore && typeof vIgnore === "function" && !vIgnore(oElement))) {
			return false;
		}
		return true;
	};

	/**
	 * Returns 'not-adaptable' flag as boolean
	 * @return {boolean} Returns 'true' if not adaptable
	 * @public
	 */
	DesignTimeMetadata.prototype.markedAsNotAdaptable = function() {
		var vActions = this.getData().actions;
		return vActions === "not-adaptable";
	};

	/**
	 * Returns property "domRef" of the DT metadata
	 * @return {string|Element} Returns reference to the relevant DOM element or its selector
	 * @public
	 */
	DesignTimeMetadata.prototype.getDomRef = function() {
		return this.getData().domRef;
	};

	/**
	 * Returns a DOM representation for an Element or aggregation, if it can be found or undefined.
	 * @param {sap.ui.core.Element} oElement Element we need DomRef for
	 * @param {string|function} vDomRef Selector or Function for fetchting DomRef
	 * @param {string} [sAggregationName] Aggregation Name
	 * @return {jQuery} Returns associated DOM references wrapped by jQuery object
	 * @public
	 */
	DesignTimeMetadata.prototype.getAssociatedDomRef = function(oElement, vDomRef, sAggregationName) {
		if (oElement) {
			var oElementDomRef = ElementUtil.getDomRef(oElement);
			var aArguments = [];
			aArguments.push(oElement);
			if (sAggregationName) {
				aArguments.push(sAggregationName);
			}

			if (typeof (vDomRef) === "function") {
				try {
					var vRes = vDomRef.apply(null, aArguments);
					return vRes && jQuery(vRes);
				} catch (error) {
					return undefined;
				}
			} else if (oElementDomRef && typeof (vDomRef) === "string") {
				return DOMUtil.getDomRefForCSSSelector(oElementDomRef, vDomRef);
			}
		}
		return undefined;
	};

	/**
	 * Returns action sAction part of designTime metadata (object or changeType string)
	 * @param  {string} sAction action name
	 * @param  {object} oElement element instance
	 * @param {string} [sSubAction] Sub-action
	 * @return {map} part of designTimeMetadata, which describes sAction in a map format
	 * @public
	 */
	DesignTimeMetadata.prototype.getAction = function(sAction, oElement, sSubAction) {
		var mData = this.getData();
		var aActionPath = ["actions", sAction];
		if (sSubAction) {
			aActionPath.push(sSubAction);
		}
		return evaluateAction(ObjectPath.get(aActionPath, mData), oElement);
	};

	/**
	 * Returns the command name for the action of the given change type
	 * @param {string} sChangeType Name of the change type
	 * @param {object} oElement Element instance
	 * @param {string} [sAggregationName] Aggregation to which the action belongs
	 * @return {string} Name of the command
	 * @public
	 */
	DesignTimeMetadata.prototype.getCommandName = function(sChangeType, oElement, sAggregationName) {
		var mData = this.getData();
		var mActions = merge(
			{},
			sAggregationName && mData.aggregations[sAggregationName]
				? mData.aggregations[sAggregationName].actions
				: {},
			mData.actions
		);
		function findAction(mActionMap) {
			return Object.keys(mActionMap)
			.map(function(sCommandName) {
				var vAction = mActionMap[sCommandName];
				if (sCommandName === "add" && !vAction.changeType) {
					// Handle nested subactions
					return {
						delegate: "addDelegateProperty",
						custom: "customAdd"
					}[findAction(vAction)];
				}
				try {
					var oActionData = evaluateAction(vAction, oElement);
					return oActionData && (oActionData.changeType === sChangeType) && sCommandName;
				} catch (vError) {
					// If a function action expects to be called with a certain element
					// it might throw an error when trying with other/without elements
					// Silently fail in such cases
					return undefined;
				}
			})
			.filter(Boolean)[0];
		}

		return findAction(mActions);
	};

	/**
	 * Returns a locale-specific string value for the given key sKey.
	 *
	 * The text is searched in this resource bundle according to the fallback chain described in
	 * {@link module:sap/base/i18n/ResourceBundle}. If no text could be found, the key itself is used as text.
	 *
	 * If text parameters are given, then any occurrences of the pattern "{<i>n</i>}" with <i>n</i> being an integer
	 * are replaced by the parameter value with index <i>n</i>.  Note: This replacement is also applied if no text had been found (key).
	 * For more details on this replacement mechanism refer also:
	 * @see {@link module:sap/base/strings/formatMessage formatMessage}
	 *
	 * @param {sap.ui.core.Element} oElement Element for which the text is being retrieved
	 * @param {string} sKey Key
	 * @param {string[]} [aArgs] List of parameters which should replace the place holders "{n}" (n is the index) in the found locale-specific string value.
	 * @return {string} The value belonging to the key, if found; otherwise the key itself.
	 *
	 * @function
	 * @public
	 */
	DesignTimeMetadata.prototype.getLibraryText = function(oElement, sKey, aArgs) {
		var oElementMetadata = oElement.getMetadata();
		return this._lookForLibraryTextInHierarchy(oElementMetadata, sKey, aArgs);
	};

	DesignTimeMetadata.prototype._lookForLibraryTextInHierarchy = function(oMetadata, sKey, aArgs) {
		var sLibraryName;
		var oParentMetadata;
		var sResult;

		sLibraryName = oMetadata.getLibraryName();
		sResult = this._getTextFromLibrary(sLibraryName, sKey, aArgs);
		if (!sResult) {
			oParentMetadata = oMetadata.getParent();
			if (oParentMetadata && oParentMetadata.getLibraryName) { // Parents from the core library don't have Library Name
				// If the control is inheriting from another library, the text must be searched in the hierarchy
				sResult = this._lookForLibraryTextInHierarchy(oParentMetadata, sKey, aArgs);
			} else {
				// Nothing was found -> return the key
				sResult = sKey;
			}
		}

		return sResult;
	};

	DesignTimeMetadata.prototype._getTextFromLibrary = function(sLibraryName, sKey, aArgs) {
		var oLibResourceBundle = sap.ui.getCore().getLibraryResourceBundle(`${sLibraryName}.designtime`);
		if (oLibResourceBundle && oLibResourceBundle.hasText(sKey)) {
			return oLibResourceBundle.getText(sKey, aArgs);
		}

		// Fallback to old logic that tries to get the text from the libraries resource bundle
		// TODO: remove the fallback after all libraries have introduced a library.designtime.js that will provide the resource bundle and texts
		oLibResourceBundle = sap.ui.getCore().getLibraryResourceBundle(sLibraryName);
		if (oLibResourceBundle && oLibResourceBundle.hasText(sKey)) {
			return oLibResourceBundle.getText(sKey, aArgs);
		}
		return undefined;
	};

	/**
	 * Returns "label" from designtime metadata
	 * @return {string|undefined} Returns the label calculated from getLabel() in designtime metadata
	 * @public
	 */
	DesignTimeMetadata.prototype.getLabel = function() {
		var vLabel = this.getData().getLabel;
		return typeof vLabel === "function"
			? vLabel.apply(this, arguments)
			: undefined;
	};

	DesignTimeMetadata.prototype.getControllerExtensionTemplate = function() {
		return this.getData().controllerExtensionTemplate;
	};

	/**
	 * Returns responsible element from the designTimeMetadata
	 * @param {sap.ui.core.Element} oElement Source element
	 * @returns {sap.ui.core.Element|undefined} Responsible element if available
	 * @public
	 */
	DesignTimeMetadata.prototype.getResponsibleElement = function(oElement) {
		var mData = this.getData();
		var fnResponsibleElement = ObjectPath.get(["actions", "getResponsibleElement"], mData);
		if (fnResponsibleElement) {
			return fnResponsibleElement(oElement);
		}
		return undefined;
	};

	/**
	 * Returns true if responsible element action is available in the designTimeMetadata
	 * @param {string} [sActionName] - Action name
	 * @returns {boolean} Indicates if action is available
	 * @public
	 */
	DesignTimeMetadata.prototype.isResponsibleActionAvailable = function(sActionName) {
		var mData = this.getData();
		var aActionsFromResponsibleElement = ObjectPath.get(["actions", "actionsFromResponsibleElement"], mData);
		if (aActionsFromResponsibleElement) {
			return includes(aActionsFromResponsibleElement, sActionName);
		}
		return false;
	};

	return DesignTimeMetadata;
});