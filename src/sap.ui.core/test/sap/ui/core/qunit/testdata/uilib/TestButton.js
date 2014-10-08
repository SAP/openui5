// Provides control sap.ui.testlib.TestButton.
jQuery.sap.declare("sap.ui.testlib.TestButton");
jQuery.sap.require("sap.ui.testlib.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new TestButton.
 * 
 * It accepts one JSON-like object (object literal) as parameter <code>mSettings</code> that can define values for any property,
 * aggregation, association or event.<br/>
 * If for a control a specific name is ambiguous (a property has the same name as an event),
 * then the framework assumes property, aggregation, association, event in that order.<br/>
 * To resolve ambiguities, add an "aggregation:", "association:" or "event:" prefix to the key in the JSON object.<br/>
 * Allowed values are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>text : string</li>
 * <li>enabled : boolean</li>
 * <li>visible : boolean</li>
 * </ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>press : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul>

 *
 * @param {string}
 *        [sId] optional id for the new control; generated automatically if no id is given.
 *        Note: this can be omitted, no matter whether <code>mSettings</code> is given or not!
 * @param {object}
 *        [mSettings] optional map/JSON-object with initial values for the new control.<br/>
 *
 * @class
 * 
 * <p>
 * Using the button control you enable end users to trigger actions such as Save or Print. For the button UI, you can define some text or an icon, or both.
 * </p>
 * 
 * @extends sap.ui.core.Control
 *
 * @author SAP SE
 * @version 0.0.1-SNAPSHOT
 *
 * @constructor
 * @public
 */
sap.ui.core.Control.extend("sap.ui.testlib.TestButton", {

	metadata : {
		  library : "sap.ui.commons",
		  properties : {
		    "text" : {name : "text", type : "string", group : "Appearance", defaultValue : ''},
		    "enabled" : {name : "enabled", type : "boolean", group : "Behavior", defaultValue : true},
		    "visible" : {name : "visible", type : "boolean", group : "", defaultValue : true},
		    "width" : {name : "width", type : "int", group : "", defaultValue : 200}
		  },
		  events : {
		    "press" : "press"
		  }
	},
	
	onclick : function(oEvent) {
		if (this.getEnabled()){
			this.firePress({/* no parameters */});
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();
	},
	
	focus : function() { }
	
});

jQuery.sap.require("sap.ui.core.EnabledPropagator");

sap.ui.core.EnabledPropagator.call(sap.ui.testlib.TestButton.prototype);

