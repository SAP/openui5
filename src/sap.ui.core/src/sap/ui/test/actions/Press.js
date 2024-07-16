/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/extend",
	"sap/ui/test/actions/Action"
], function (extend, Action) {
	"use strict";

	/**
	 * @class
	 * The <code>Press</code> action is used to simulate a press interaction with a
	 * control. Most controls are supported, for example buttons, links, list items,
	 * tables, filters, and form controls.
	 *
	 * The <code>Press</code> action targets a special DOM element representing the
	 * control. This DOM element can be customized.
	 *
	 * For most most controls (even custom ones), the DOM focus reference is an
	 * appropriate choice. You can choose a different DOM element by specifying its ID
	 * suffix. You can do this by directly passing the ID suffix to the Press constructor,
	 * or by defining a control adapter.
	 *
	 * There are some basic controls for which OPA5 has defined <code>Press</code> control
	 * adapters. For more information, see <code>controlAdapters</code> at {@link sap.ui.test.actions.Press}.
	 *
	 * @param {string}
	 *            [sId] Optional ID for the new instance; generated automatically if
	 *            no non-empty ID is given. Note: this can be omitted, no matter
	 *            whether <code>mSettings</code> are given or not!
	 * @param {object}
	 *            [mSettings] Optional object with initial settings for the new instance
	 * @extends sap.ui.test.actions.Action
	 * @public
	 * @alias sap.ui.test.actions.Press
	 * @author SAP SE
	 * @since 1.34
	 */
	var Press = Action.extend("sap.ui.test.actions.Press", /** @lends sap.ui.test.actions.Press.prototype */ {

		metadata : {
			properties: {
				/**
				 * If it is set to <code>true</code>, the Alt Key modifier will be used
				 * @since 1.97
				 */
				altKey: {
					type: "boolean"
				},
				/**
				 * If it is set to <code>true</code>, the Shift Key modifier will be used
				 * @since 1.97
				 */
				shiftKey: {
					type: "boolean"
				},
				/**
				 * If it is set to <code>true</code>, the Control Key modifier will be used
				 * @since 1.97
				 */
				ctrlKey: {
					type: "boolean"
				},
				/**
				 * Provide percent value for the X coordinate axis to calculate the position of the click event.
				 * The value must be in the range [0 - 100]
				 * @since 1.98
				 */
				xPercentage: {
					type: "float"
				},
				/**
				 * Provide percent value for the Y coordinate axis to calculate the position of the click event.
				 * The value must be in the range [0 - 100]
				 * @since 1.98
				 */
				yPercentage: {
					type: "float"
				}
			}
		},

		init: function () {
			Action.prototype.init.apply(this, arguments);
			this.controlAdapters = extend(this.controlAdapters, Press.controlAdapters);
		},

		/**
		 * Sets focus on given control and triggers a 'tap' event on it (which is
		 * internally translated into a 'press' event).
		 * Logs an error if control is not visible (i.e. has no dom representation)
		 *
		 * @param {sap.ui.core.Control} oControl the control on which the 'press' event is triggered
		 * @public
		 */
		executeOn : function (oControl) {
			var $ActionDomRef = this.$(oControl),
				oActionDomRef = $ActionDomRef[0];

			var iClientX, iClientY;

			var bAltKey = this.getAltKey();
			var bCtrlKey = this.getCtrlKey();
			var bShiftKey = this.getShiftKey();

			var iXPercentage = this.getXPercentage();
			var iYPercentage = this.getYPercentage();

			// check if the percentage is in the range 0-100
			if (iXPercentage < 0 || iXPercentage > 100){
				this.oLogger.error("Please provide a valid X percentage in the range: 0 - 100");
				return;
			}

			if (iYPercentage < 0 || iYPercentage > 100){
				this.oLogger.error("Please provide a valid Y percentage in the range: 0 - 100");
				return;
			}

			// get the width and the height of the control
			var oRect = oActionDomRef.getBoundingClientRect();

			var iWidth = oRect.width;
			var iHeight = oRect.height;

			var iX = oRect.left + window.scrollX;
			var iY = oRect.top + window.scrollY;

			if (iXPercentage || iXPercentage === 0){
				iClientX = ((iXPercentage / 100) * iWidth) + iX;
			}

			if (iYPercentage || iYPercentage === 0){
				iClientY = ((iYPercentage / 100) * iHeight) + iY;
			}

			if ($ActionDomRef.length) {
				this.oLogger.timestamp("opa.actions.press");
				this.oLogger.debug("Pressed the control " + oControl);

				this._tryOrSimulateFocusin($ActionDomRef, oControl);

				// the missing events like saptouchstart and tap will be fired by the event simulation
				this._createAndDispatchMouseEvent("mousedown", oActionDomRef, null, null, null, iClientX, iClientY);
				this.getUtils().triggerEvent("selectstart", oActionDomRef);
				this._createAndDispatchMouseEvent("mouseup", oActionDomRef, null, null, null, iClientX, iClientY);
				this._createAndDispatchMouseEvent("click", oActionDomRef, bShiftKey, bAltKey, bCtrlKey);
				//Focusout simulation removed in order to fix Press action behavior
				//since in real scenario manual press action does not fire focusout event
			}
		}
	});

	/**
	 * A map of ID suffixes for controls that require a special DOM reference for
	 * <code>Press</code> interaction.
	 *
	 * You can specify an ID suffix for specific controls in this map.
	 * The press action will be triggered on the DOM element with the specified suffix.
	 *
	 * Here is a sublist of supported controls and their <code>Press</code> control adapter:
	 * <ul>
	 *  <li>sap.m.ComboBox - Arrow button</li>
	 *  <li>sap.m.SearchField - Search Button</li>
	 *  <li>sap.m.Input - Value help</li>
	 *  <li>sap.m.List - More Button</li>
	 *  <li>sap.m.Table - More Button</li>
	 *  <li>sap.m.ObjectIdentifier - Title</li>
	 *  <li>sap.m.ObjectAttribute - Text</li>
	 *  <li>sap.m.Page - Back Button</li>
	 *  <li>sap.m.semantic.FullscreenPage - Back Button</li>
	 *  <li>sap.m.semantic.DetailPage - Back Button</li>
	 *  <li>sap.ui.comp.smartfilterbar.SmartFilterBar - Go Button</li>
	 * </ul>
	 *
	 * @since 1.63 a control adapter can also be a function.
	 * This is useful for controls with different modes where a different control adapter makes sense in different modes.
	 *
	 * When you extended a UI5 controls the adapter of the control will be taken.
	 * If you need an adapter for your own control you can add it here. For example:
	 * You wrote a control with the namespace my.Control it renders two buttons and you want the press action to press the second one by default.
	 *
	 * <pre>
	 * <code>
	 *     new my.Control("myId");
	 * </code>
	 * </pre>
	 *
	 * It contains two button tags in its dom.
	 * When you render your control it creates the following dom:
	 *
	 *
	 * <pre>
	 * <code>
	 *     &lt;div id="myId"&gt;
	 *         &lt;button id="myId-firstButton"/&gt;
	 *         &lt;button id="myId-secondButton"/&gt;
	 *     &lt;/div&gt;
	 * </code>
	 * </pre>
	 *
	 * Then you may add a control adapter like this
	 *
	 * <pre>
	 * <code>
	 *     Press.controlAdapters["my.control"] = "secondButton"; //This can be used by setting the Target Property of an action
	 *
	 *     // Example usage
	 *     new Press(); // executes on second Button since it is set as default
	 *     new Press({ idSuffix: "firstButton"}); // executes on the first button has to be the same as the last part of the id in the dom
	 * </code>
	 * </pre>
	 *
	 *
	 * @public
	 * @static
	 * @type Object<string,(string|function(sap.ui.core.Control):string)>
	 */
	Press.controlAdapters = {};
	Press.controlAdapters["sap.m.Input"] = "vhi"; // focusDomRef: <input>
	Press.controlAdapters["sap.m.SearchField"] = "search"; // suffix is the same if refresh button is shown. focusDomRef: <input>
	Press.controlAdapters["sap.m.ListBase"] = "trigger"; // focusDomRef: <table>
	Press.controlAdapters["sap.m.Page"] = "navButton"; // focusDomRef: <div> -- root
	Press.controlAdapters["sap.m.semantic.FullscreenPage"] = "navButton"; // focusDomRef: <div> -- root
	Press.controlAdapters["sap.m.semantic.DetailPage"] = "navButton"; // focusDomRef: <div> -- root
	Press.controlAdapters["sap.m.ComboBox"] = "arrow"; // focusDomRef: <input>
	Press.controlAdapters["sap.ui.comp.smartfilterbar.SmartFilterBar"] = "btnGo"; // always available?

	Press.controlAdapters["sap.m.ObjectAttribute"] = "text"; // suffix is the same in active state. focusDomRef: <div> -- root
	Press.controlAdapters["sap.m.ObjectStatus"] = function (oControl) {
		if (oControl.getActive()) {
			return "link";
		} else {
			return null; // focusDomRef: <div> -- root
		}
	};

	Press.controlAdapters["sap.m.ObjectIdentifier"] = function (oControl) {
		if (oControl.getTitleActive()) {
			return "link";
		} else if (oControl.getTitle()) {
			return "title";
		} else if (oControl.getText()) {
			return "text";
		} else {
			return null; // focusDomRef: <div> -- root
		}
	};

	return Press;

});