/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Action'], function ($, Action) {
	"use strict";

	/**
	 * The Press action is used to simulate a press interaction on a Control's dom ref.
	 * This will work out of the box for most of the controls (even custom controls).
	 *
	 * Here is a List of supported controls (some controls will trigger the press on a specific region):
	 *
	 * <ul>
	 *     <li>sap.m.Button</li>
	 *     <li>sap.m.Link</li>
	 *     <li>sap.m.StandardListItem</li>
	 *     <li>sap.m.IconTabFilter</li>
	 *     <li>sap.m.Input - Value help</li>
	 *     <li>sap.m.SearchField - Search Button</li>
	 *     <li>sap.m.Page - Back Button</li>
	 *     <li>sap.m.semantic.FullscreenPage - Back Button</li>
	 *     <li>sap.m.semantic.DetailPage - Back Button</li>
	 *     <li>sap.m.List - More Button</li>
	 *     <li>sap.m.Table - More Button</li>
	 *     <li>sap.m.StandardTile</li>
	 *     <li>sap.m.ComboBox</li>
	 *     <li>sap.m.ObjectIdentifier</li>
	 *     <li>sap.ui.comp.smartfilterbar.SmartFilterBar - Go Button</li>
	 * </ul>
	 *
	 * @class
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
			this.controlAdapters = $.extend(this.controlAdapters, Press.controlAdapters);
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
				$.sap.log.debug("Pressed the control " + oControl, this._sLogPrefix);
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
	 * A map that contains the id suffixes for certain controls of the library.
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
	Press.controlAdapters["sap.m.Input"] = "vhi";
	Press.controlAdapters["sap.m.SearchField"] = "search";
	Press.controlAdapters["sap.m.ListBase"] = "trigger";
	Press.controlAdapters["sap.m.Page"] = "navButton";
	Press.controlAdapters["sap.m.semantic.FullscreenPage"] = "navButton";
	Press.controlAdapters["sap.m.semantic.DetailPage"] = "navButton";
	Press.controlAdapters["sap.m.ComboBox"] = "arrow";
	Press.controlAdapters["sap.ui.comp.smartfilterbar.SmartFilterBar"] = "btnGo";
	Press.controlAdapters["sap.m.ObjectAttribute"] = "text";
	Press.controlAdapters["sap.m.ObjectIdentifier"] = "link";

	return Press;

});
