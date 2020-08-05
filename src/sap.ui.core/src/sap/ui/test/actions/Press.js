/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/actions/Action",
	"sap/ui/thirdparty/jquery"
], function (Action, jQueryDOM) {
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
	 * adapters. For more information, see {@link sap.ui.test.actions.Press.controlAdapters}.
	 *
	 * @extends sap.ui.test.actions.Action
	 * @public
	 * @name sap.ui.test.actions.Press
	 * @author SAP SE
	 * @since 1.34
	 */
	var Press = Action.extend("sap.ui.test.actions.Press", /** @lends sap.ui.test.actions.Press.prototype */ {

		metadata : {
			publicMethods : [ "executeOn" ]
		},

		init: function () {
			Action.prototype.init.apply(this, arguments);
			this.controlAdapters = jQueryDOM.extend(this.controlAdapters, Press.controlAdapters);
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

			if ($ActionDomRef.length) {
				this.oLogger.timestamp("opa.actions.press");
				this.oLogger.debug("Pressed the control " + oControl);

				this._tryOrSimulateFocusin($ActionDomRef, oControl);

				// the missing events like saptouchstart and tap will be fired by the event simulation
				this._createAndDispatchMouseEvent("mousedown", oActionDomRef);
				this.getUtils().triggerEvent("selectstart", oActionDomRef);
				this._createAndDispatchMouseEvent("mouseup", oActionDomRef);
				this._createAndDispatchMouseEvent("click", oActionDomRef);
				//Focusout simulation removed in order to fix Press action behavior
				//since in real scenario manual press action does not fire focusout event
			}
		}
	});

	/**
	 * A map of ID suffixes for controls that require a special DOM reference for
	 * <code>Press</code> interaction.
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
	 * @name sap.ui.test.actions.Press.controlAdapters
	 * You can specify an Id suffix for specific controls in this map.
	 * The press action will be triggered on the DOM element with the specified suffix
	 * @type map
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