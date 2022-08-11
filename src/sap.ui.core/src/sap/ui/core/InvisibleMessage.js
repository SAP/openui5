/*!
 * ${copyright}
 */

sap.ui.define(["./library", "sap/ui/base/ManagedObject", "sap/base/Log"],
function (coreLibrary, ManagedObject, Log) {
	"use strict";

	var oInstance;

	var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

	/**
	 * @class
	 *
	 * The InvisibleMessage provides a way to programmatically expose dynamic content changes in a way
	 * that can be announced by screen readers.
	 *
	 * <h3>Overview</h3>
	 * This class is a singleton. The class instance can be retrieved via the static method
	 * {@link sap.ui.core.InvisibleMessage.getInstance}.
	 *
	 * <b>Note:</b> Keep in mind that, according to the ARIA standard, the live regions should be presented
	 * and should be empty. Thus, we recommend to instantiate <code>InvisibleMessage</code> via
	 * <code>sap.ui.core.InvisibleMessage.getInstance()</code> as early as possible in the application logic,
	 * e.g. with the Component initialization, with the main Controller initialization, after Core initialization, etc.
	 * Then, you should specify the text that has to be announced by the screen reader and the live region’s mode
	 * using the <code>announce</code> method.
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @hideconstructor
	 * @public
	 * @since 1.78
	 * @alias sap.ui.core.InvisibleMessage
	 */

	var InvisibleMessage = ManagedObject.extend("sap.ui.core.InvisibleMessage", /** @lends sap.ui.core.InvisibleMessage.prototype */ {

		constructor: function () {
			if (oInstance) {
				Log.warning('This is a singleton, therefore you are not able to create another instance of this class.');

				return oInstance;
			}

			oInstance = this;

			ManagedObject.apply(this, arguments);
		}
	});

	/**
	 * Returns the instance of the class.
	 * @return {sap.ui.core.InvisibleMessage} oInstance
	 * @static
	 * @public
	 */
	InvisibleMessage.getInstance = function () {
		if (!oInstance) {
			oInstance = new InvisibleMessage("__invisiblemessage",{});
		}

		return oInstance;
	};

	InvisibleMessage.prototype.init = function () {
		var oCore = sap.ui.getCore(),
			oStatic = oCore.getStaticAreaRef();

		oStatic.insertAdjacentHTML("beforeend", this.getPoliteInstance());
		oStatic.insertAdjacentHTML("beforeend", this.getAssertiveInstance());
	};

	/**
	 * Inserts the string into the respective span, depending on the mode provided.
	 *
	 * @param {string} sText String to be announced by the screen reader.
	 * @param {sap.ui.core.InvisibleMessageMode} sMode The mode to be inserted in the aria-live attribute.
	 * @public
	 */
	InvisibleMessage.prototype.announce = function (sText, sMode) {
		var oCore = sap.ui.getCore(),
			oStatic = oCore.getStaticAreaRef(),
			oPoliteMarkup = oStatic.querySelector(".sapUiInvisibleMessagePolite"),
			oAssertiveMarkup = oStatic.querySelector(".sapUiInvisibleMessageAssertive");

		if (!oPoliteMarkup || !oAssertiveMarkup) {
			return;
		}

		var oNode = sMode === InvisibleMessageMode.Assertive ? oAssertiveMarkup : oPoliteMarkup;

		// Set textContent to empty string in order to trigger screen reader's announce.
		oNode.textContent = "";
		oNode.textContent = sText;

		if (sMode !== InvisibleMessageMode.Assertive && sMode !== InvisibleMessageMode.Polite) {
			Log.info(
				'You have entered an invalid mode. Valid values are: ' + '"Polite" ' + 'and "Assertive".'
				+ ' The framework will automatically set the mode to "Polite".');
		}

		// clear the span in order to avoid reading it out while in JAWS reading node
		setTimeout(function () {
			// ensure that we clear the text node only if no announce is made in the meantime
			if (oNode.textContent === sText) {
				oNode.textContent = "";
			}
		}, 3000);
	};

	/**
	 * @return {string} Returns the span to be rendered for the polite instance.
	 * @private
	 * @function
	 */
	InvisibleMessage.prototype.getPoliteInstance = function() {
		var sId = this.getId();
		return '<span id="' + sId + '-polite' + '" data-sap-ui="' + sId + '-polite' +
				'" class="sapUiInvisibleMessagePolite" role="status" aria-live="polite">' +
				'</span>';
	};

	/**
	 * @return {string} Returns the span to be rendered for the assertive instance.
	 * @private
	 * @function
	 */
	InvisibleMessage.prototype.getAssertiveInstance = function() {
		var sId = this.getId();
		return '<span id="' + sId + '-assertive' + '" data-sap-ui="' + sId + '-assertive' +
				'" class="sapUiInvisibleMessageAssertive" role="status" aria-live="assertive">' +
				'</span>';
	};

	return InvisibleMessage;

});