/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.core.DeclarativeSupport
jQuery.sap.declare("sap.ui.core.DeclarativeSupport");





/**
 * @class Static class for enabling declarative UI support.  
 *
 * @author Peter Muessig, Tino Butz
 * @version 1.9.0-SNAPSHOT
 * @since 1.7.0
 * @public
 */
sap.ui.core.DeclarativeSupport = {
};



/**
 * Defines the attributes of an element that should be handled differently.
 * Set key/value pairs. The key indicates the attribute. The value can be of type <code>Boolean</code> or <code>Function</code>.
 * When the value is of type <code>Function</code> it will receive three arguments: 
 * <code>sValue</code> the value of the attribute,
 * <code>oSettings</code> the settings of the control
 * <code>oControl</code> the instance of the control
 * @private
 */
sap.ui.core.DeclarativeSupport.attributes = {
	"data-sap-ui-type" : true,
	"data-sap-ui-aggregation" : true,
	"data-sap-ui-default-aggregation" : true,
	"data-tooltip" : function(sValue, oSettings) {
		// special handling for tooltip (which is an aggregation)
		// but can also be applied as property
		oSettings["tooltip"] = sValue;
	},
	"tooltip" : function(sValue, oSettings, oControl) {
		// TODO: Remove this key / value when deprecation is removed
		oSettings["tooltip"] = sValue;
		jQuery.sap.log.warning('[Deprecated] Control "' + oControl.getId() + '": The attribute "tooltip" is not prefixed with "data-*". Future version of declarative support will only suppport attributes with "data-*" prefix.');
	},
	"class" : function(sValue, oSettings, oControl) {
		oControl.addStyleClass(sValue);
	},
	"style" : true,
	"id" : true
};


/**
 * Enhances the given element by parsing the Control and Elements and create
 * the SAPUI5 controls for them.
 * @param {DomElement} oElement the element to compile
 * @public
 */
sap.ui.core.DeclarativeSupport.compile = function(oElement) {
	// Find all defined classes
	var self = this;
	jQuery(oElement).find("[data-sap-ui-type]").filter(function() {
		return jQuery(this).parents("[data-sap-ui-type]").length === 0;
	}).each(function() {
		self._compile(this);
	});
};



/**
 * Enhances the given element by parsing the attributes and child elements.
 * 
 * @param {DomElement} oElement the element to compile
 * @private
 */
sap.ui.core.DeclarativeSupport._compile = function(oElement) {
	var $element = jQuery(oElement);

	var sType = $element.attr("data-sap-ui-type");
	var aControls = [];

	if (sType === "sap.ui.core.UIArea") { 
		// use a UIArea / better performance when rendering multiple controls
		// parse and create the controls / children of element
		var self = this;
		$element.children().each(function() {
			var oControl = self._createControl(this);
			if (oControl) {
				aControls.push(oControl);
			}
		}); 
	} else {
		var oControl = this._createControl(oElement);
		if (oControl) {
			aControls.push(oControl);
		}
	}

	
	// remove the old content
	$element.empty();
	// remove the attributes for declarative support, so that it won't get
	// executed for a second time
	$element.removeAttr("data-sap-ui-type");	

	// add the controls
	jQuery.each(aControls, function(vKey, oControl) {
		if (oControl instanceof sap.ui.core.Control) {
			// add the controls
			oControl.placeAt(oElement);
		}
	});
};



/**
 * Parses a given DOM ref and converts it into a Control.
 * @param {DomElement} oElement reference to a DOM element
 * @return {sap.ui.core.Control} reference to a Control
 * @private
 */
sap.ui.core.DeclarativeSupport._createControl = function(oElement) {
	var $element = jQuery(oElement);

	var oControl = null;

	var sType = $element.attr("data-sap-ui-type");
	if (sType) {
		var oClass = jQuery.sap.getObject(sType);
		jQuery.sap.assert(typeof oClass !== "undefined", "Class not found: " + sType);
		var oControl = new oClass(this._getId($element));

		var oSettings = {};
		this._addSettingsForAttributes(oSettings, oControl, oElement);
		this._addSettingsForAggregations(oSettings, oControl, oElement);
		oControl.applySettings(oSettings);

		// mark control as parsed
		$element.removeAttr("data-sap-ui-type");

	} else {
		oControl = this._createHtmlControl(oElement);
	}

	return oControl;
};


/**
 * Parses a given DOM ref and converts it into a HTMLControl.
 * @param {DomElement} oElement reference to a DOM element
 * @return {sap.ui.core.HTML} reference to a Control
 * @private
 */
sap.ui.core.DeclarativeSupport._createHtmlControl = function(oElement) {
	//include HTML content
	var oHTML = new sap.ui.core.HTML();
	oHTML.setDOMContent(oElement);
	// check for declarative content
	this.compile(oElement);
	return oHTML;	
};


/**
 * Adds all defined attributes to the settings object of a control.
 * 
 * @param {object} oSettings reference of the settings of the control
 * @param {sap.ui.core.Control} reference to a Control
 * @param {DomElement} oElement reference to a DOM element
 * @return {object} the settings of the control.
 * @private
 */
sap.ui.core.DeclarativeSupport._addSettingsForAttributes = function(oSettings, oControl, oElement) {	
	var self = this;
	var oSpecialAttributes = sap.ui.core.DeclarativeSupport.attributes;

	jQuery.each(oElement.attributes, function(index, oAttr) {
		var sName = oAttr.name;
		var sValue = oAttr.value;
		if (typeof oSpecialAttributes[sName] === "undefined") {
			sName = self._convertAttributeToSettingName(oControl, sName);
			var oProperty = self._getProperty(oControl, sName);
			if (oProperty) {
				oSettings[sName] = self._convertValueToPropertyType(oProperty, sValue);
			} else if (self._getAssociation(oControl, sName)) {
				oSettings[sName] = sValue; // use the value as ID
			} else if (self._getEvent(oControl, sName)) {
				var fnHandler = jQuery.sap.getObject(sValue);
				if (typeof fnHandler === "function") {
					oSettings[sName] = fnHandler;
				} else {
					throw new Error('Control "' + oControl.getId() + '": The function "' + sValue + '" for the event "' + sName + '" is not defined');
					
				}
			}
		} else if (typeof oSpecialAttributes[sName] === "function") {
			oSpecialAttributes[sName](sValue, oSettings, oControl);
		}
	});
	return oSettings;
};


/**
 * Adds all defined aggregations to the settings object of a control.
 * 
 * @param {object} oSettings reference of the settings of the control
 * @param {sap.ui.core.Control} reference to a Control
 * @param {DomElement} oElement reference to a DOM element
 * @return {object} the settings of the control.
 * @private
 */
sap.ui.core.DeclarativeSupport._addSettingsForAggregations = function(oSettings, oControl, oElement) {
	var $element = jQuery(oElement);

	var sDefaultAggregation = this._getDefaultAggregation(oControl, oElement);

	var self = this;
	var oAggregations = oControl.getMetadata().getAllAggregations();

	$element.children().each(function() {
		// check for an aggregation tag of in case of a sepcifiying the
		// aggregration on the parent control this will be used in case
		// of no meta tag was found
		var $child = jQuery(this);
		var sAggregation = $child.attr("data-sap-ui-aggregation");
		var sType = $child.attr("data-sap-ui-type");

		var bUseDefault = false;
		if (!sAggregation) {
			bUseDefault = true;
			sAggregation = sDefaultAggregation;
		}

		// add the child to the aggregation
		if (sAggregation && oAggregations[sAggregation]) {
			var bMultiple = oAggregations[sAggregation].multiple;

			var addControl = function(oChildElement) {
				var oControl = self._createControl(oChildElement);
				if (oControl) {
					if (bMultiple) {
						// 1..n AGGREGATION
						oSettings[sAggregation] = oSettings[sAggregation] || [];
						oSettings[sAggregation].push(oControl);
					} else {
						// 1..1 AGGREGATION
						oSettings[sAggregation] = oControl;
					}
				}
			};

			if (bUseDefault || (sType && !bUseDefault)) {
				addControl(this);
			} else {
				$child.children().each(function() {
					addControl(this);
				});
			}
		}

		$child.removeAttr("data-sap-ui-aggregation");
		$child.removeAttr("data-sap-ui-type");
	});
	return oSettings;
	
};


/**
 * Returns the id of the element.
 *
 * @param {DomElement} oElement reference to a DOM element
 * @return {string} the id of the element
 * @private
 */
sap.ui.core.DeclarativeSupport._getId = function(oElement) {
	var $element = jQuery(oElement);
	var sId = $element.attr("id");
	if (sId) {
		// in case of having an ID retrieve it and clear it in the placeholder
		// DOM element to avoid double IDs
		$element.attr("id", "");
	}
	return sId;
};


/**
 * Returns the property of a given control and property name.
 *
 * @param {sap.ui.core.Control} oControl reference to a Control
 * @param {string} sName the name of the property
 * @return {object} reference to the property object
 * @private
 */
sap.ui.core.DeclarativeSupport._getProperty = function(oControl, sName) {
	return oControl.getMetadata().getAllProperties()[sName];
};


/**
 * Converts a given value to the right property type.
 *
 * @param {object} oProperty reference to the property object
 * @param {string} sValue the value to convert
 * @param {string} sName the property name
 * @return {string} the converted value
 * @private
 */
sap.ui.core.DeclarativeSupport._convertValueToPropertyType = function(oProperty, sValue) {
	if (!this._isBindingExpression(sValue)) {
		var oType = this._getPropertyDataType(oProperty);
		if (oType instanceof sap.ui.base.DataType) {
			sValue = oType.parseValue(sValue);
		}
		// else return original sValue (e.g. for enums)
	}
	return sValue;
};


/**
 * Checks if a given value is a binding expression.
 *
 * @param {string} sValue the value to check
 * @return {boolean} whether the value is a binding expression or not.
 * @private
 */
sap.ui.core.DeclarativeSupport._isBindingExpression = function(sValue) {
	// check for a binding expression (string)
	// TODO factor out and move to Element or ExpressionLanguage to guarantee that the check is in sync with the data binding
	// See XMLView "parseScalarType"
	return sValue && sValue.slice(0,1) === '{' && sValue.slice(-1) === '}';
};


/**
 * Returns the data type object for a certain property.
 *
 * @param {object} oProperty reference to the property object
 * @return {object} the type of the property
 * @throws {Error} if no type for the property is found
 * @private
 */
sap.ui.core.DeclarativeSupport._getPropertyDataType = function(oProperty) {
	var oType = sap.ui.base.DataType.getType(oProperty.type);
	if (!oType) {
		throw new Error("Property " + oProperty.name + " has no known type");
	}
	return oType;
};



/**
 * Returns the settings name for a given html attribute
 *
 * @param {sap.ui.core.Control} oControl reference to a Control
 * @param {string} sName the name of the association
 * @return {string} the settings name
 * @private
 */
sap.ui.core.DeclarativeSupport._convertAttributeToSettingName = function(oControl, sAttribute) {
	if (sAttribute.indexOf("data-") === 0) {
		sAttribute = sAttribute.substr(5);
	} else {
		jQuery.sap.log.warning('[Deprecated] Control "' + oControl.getId() + '": The attribute "' + sAttribute + '" is not prefixed with "data-*". Future version of declarative support will only suppport attributes with "data-*" prefix.');
		// Todo: Use Error instead of warning
		//throw new Error('Control "' + oControl.getId() + '": The attribute "' + sAttribute + '" is not prefixed with "data-*"');
	}
	return jQuery.sap.camelCase(sAttribute);
};


/**
 * Returns the association of a given control and event name.
 *
 * @param {sap.ui.core.Control} oControl reference to a Control
 * @param {string} sName the name of the association
 * @return {object} reference to the association object
 * @private
 */
sap.ui.core.DeclarativeSupport._getAssociation = function(oControl, sName) {
	return oControl.getMetadata().getAllAssociations()[sName];
};


/**
 * Returns the event of a given control and event name.
 *
 * @param {sap.ui.core.Control} oControl reference to a Control
 * @param {string} sName the name of the event
 * @return {object} reference to the event object
 * @private
 */
sap.ui.core.DeclarativeSupport._getEvent = function(oControl, sName) {
	return oControl.getMetadata().getAllEvents()[sName];
};


/**
 * Returns the default aggregation of the control.
 *
 * @param {sap.ui.core.Control} oControl reference to a Control
 * @param {DomElement} oElement reference to a DOM element
 * @return {string} the default aggregation
 * @private
 */
sap.ui.core.DeclarativeSupport._getDefaultAggregation = function(oControl, oElement) {
	var $element = jQuery(oElement);
	var sDefaultAggregation = $element.attr("data-sap-ui-default-aggregation") || oControl.getMetadata().getDefaultAggregationName();
	$element.removeAttr("data-sap-ui-default-aggregation");
	return sDefaultAggregation;
};