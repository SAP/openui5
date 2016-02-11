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
	 *     <li>sap.m.SearchField - Search Button</li>
	 *     <li>sap.m.Page - Back Button</li>
	 *     <li>sap.m.semantic.FullscreenPage - Back Button</li>
	 *     <li>sap.m.semantic.DetailPage - Back Button</li>
	 *     <li>sap.m.List - More Button</li>
	 *     <li>sap.m.Table - More Button</li>
	 *     <li>sap.m.StandardTile</li>
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
			this.controlAdapters = jQuery.extend(this.controlAdapters, Press.controlAdapters);
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
			var $ActionDomRef = this.$(oControl);

			if ($ActionDomRef.length) {
				$ActionDomRef.focus();
				$.sap.log.debug("Pressed the control " + oControl, this._sLogPrefix);

				// the missing events like saptouchstart and tap will be fired by the event simulation
				this._triggerEvent("mousedown", $ActionDomRef);
				this.getUtils().triggerEvent("selectstart", $ActionDomRef);
				this._triggerEvent("mouseup", $ActionDomRef);
				this._triggerEvent("click", $ActionDomRef);
			}
		},

		/**
		 * Create the correct event object for a mouse event
		 * @param sName the mouse event name
		 * @param $ActionDomRef the domref on that the event is going to be triggered
		 * @private
		 */
		_triggerEvent : function (sName,$ActionDomRef) {
			var oFocusDomRef = $ActionDomRef[0],
				x = $ActionDomRef.offset().x,
				y = $ActionDomRef.offset().y;

			// See file jquery.sap.events.js for some insights to the magic
			var oMouseEventObject = {
				identifier: 1,
				// Well offset should be fine here
				pageX: x,
				pageY: y,
				// ignore scrolled down stuff in OPA
				clientX: x,
				clientY: y,
				// Assume stuff is over the whole screen
				screenX: x,
				screenY: y,
				target: $ActionDomRef[0],
				radiusX: 1,
				radiusY: 1,
				rotationAngle: 0,
				// left mouse button
				button: 0,
				// include the type so jQuery.event.fixHooks can copy properties properly
				type: sName
			};
			this.getUtils().triggerEvent(sName, oFocusDomRef, oMouseEventObject);
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
	 *     <div id="myId">
	 *         <button id="myId-firstButton"/>
	 *         <button id="myId-secondButton"/>
	 *     </div>
	 * </code>
	 * </pre>
	 *
	 * Then you may add a control adapter like this
	 *
	 * <pre>
	 * <code>
	 *     Press.controlAdapters["my.control"] = "secondButton" //This can be used by setting the Target Property of an action
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
	 * @name sap.ui.test.actions.Press#.controlAdapters
	 * @type map
	 */
	Press.controlAdapters = {};
	Press.controlAdapters["sap.m.SearchField"] = "search";
	Press.controlAdapters["sap.m.ListBase"] = "trigger";
	Press.controlAdapters["sap.m.Page"] = "navButton";
	Press.controlAdapters["sap.m.semantic.FullscreenPage"] = "navButton";
	Press.controlAdapters["sap.m.semantic.DetailPage"] = "navButton";

	return Press;

}, /* bExport= */ true);
