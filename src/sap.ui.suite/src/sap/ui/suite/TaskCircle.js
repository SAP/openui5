/*!
 * ${copyright}
 */

// Provides control sap.ui.suite.TaskCircle.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/EnabledPropagator',
	'./library',
	"./TaskCircleRenderer"
],
	function(Control, EnabledPropagator, library, TaskCircleRenderer) {
	"use strict";

	// shortcut
	var TaskCircleColor = library.TaskCircleColor;

	/**
	 * Constructor for a new TaskCircle.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control shows a circle which radius and color depends on the given parameters
	 * @extends sap.ui.core.Control
	 *
	 * @author Svetozar Buzdumovic
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental Since version 1.2.
	 * The API may change. User with care.
	 * @alias sap.ui.suite.TaskCircle
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TaskCircle = Control.extend("sap.ui.suite.TaskCircle", /** @lends sap.ui.suite.TaskCircle.prototype */ { metadata : {

		library : "sap.ui.suite",
		properties : {

			/**
			 * Current value of the task circle to be displayed. In dependency of the parameters maxValue and minValue it controls the size of the circle.
			 */
			value : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Upper limit of the displayed values. Default is 100.
			 */
			maxValue : {type : "int", group : "Misc", defaultValue : 100},

			/**
			 * Lower limit of the displayed values. Default is 0.
			 */
			minValue : {type : "int", group : "Misc", defaultValue : 0},

			/**
			 * Color of the circle. The default color is red.
			 */
			color : {type : "sap.ui.suite.TaskCircleColor", group : "Misc", defaultValue : TaskCircleColor.Gray}
		},
		associations : {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"},

			/**
			 * Association to controls / ids which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"}
		},
		events : {

			/**
			 * Event is fired when the user clicks the control.
			 */
			press : {}
		}
	}});




	EnabledPropagator.call(TaskCircle.prototype);


	/**
	 * init is called when the control is initialized
	 */
	TaskCircle.prototype.init = function(){
	};



	/**
	 * Function is called when control is clicked.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	TaskCircle.prototype.onclick = function(oEvent){
	  this.firePress({});
	  oEvent.preventDefault();
	  oEvent.stopPropagation();
	};


	// Implementation of API method focus(). Documentation available in generated code.

	/**
	 * Puts the focus to the control.
	 *
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	TaskCircle.prototype.focus = function() {
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			oDomRef.focus();
		}
	};

	return TaskCircle;

});