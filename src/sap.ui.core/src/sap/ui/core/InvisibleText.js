/*!
 * ${copyright}
 */

// Provides control sap.ui.core.InvisibleText.
sap.ui.define(['./Control', './library', "sap/base/Log", "sap/base/security/encodeXML"],
	function(Control, library, Log, encodeXML) {
	"use strict";


	/**
	 * Constructor for a new InvisibleText.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * An InvisibleText is used to bring hidden texts to the UI for screen reader support. The hidden text can e.g. be referenced
	 * in the ariaLabelledBy or ariaDescribedBy associations of other controls.
	 *
	 * The inherited properties busy, busyIndicatorDelay and visible and the aggregation tooltip is not supported by this control.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.27.0
	 * @alias sap.ui.core.InvisibleText
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InvisibleText = Control.extend("sap.ui.core.InvisibleText", /** @lends sap.ui.core.InvisibleText.prototype */ {
		metadata : {
			library : "sap.ui.core",
			publicMethods: ["toStatic"],
			properties : {

				/**
				 * The text of the InvisibleText.
				 */
				text : {type : "string", defaultValue : ""}
			}
		},

		renderer : {
			apiVersion : 2,
			render: function(oRm, oControl) {
				// The text is hidden through "display: none" in the shared CSS class
				// "sapUiInvisibleText", as an alternative in case screen readers have trouble with
				// "display: none", the following class definition could be used:
				//	.sapUiInvisibleText {
				//		display: inline-block !important;
				//		visibility: hidden !important;
				//		width: 0 !important;
				//		height: 0 !important;
				//		overflow: hidden !important;
				//		position: absolute !important;
				//	}

				oRm.openStart("span", oControl);
				oRm.class("sapUiInvisibleText");
				oRm.attr("aria-hidden", "true");
				oRm.openEnd();
				oRm.text(oControl.getText() || "");
				oRm.close("span");
			}
		}
	});

	// helper to create a dummy setter that logs a warning
	function makeNotSupported(what) {
		return function() {
			Log.warning(what + " is not supported by control sap.ui.core.InvisibleText.");
			return this;
		};
	}

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.27, local BusyIndicator is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setBusy = makeNotSupported("Property busy");

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.27, local BusyIndicator is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setBusyIndicatorDelay = makeNotSupported("Property busy");

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.54, local BusyIndicator is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setBusyIndicatorSize = makeNotSupported("Property busy");

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.27, property <code>visible</code> is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setVisible = makeNotSupported("Property visible");

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated As of version 1.27, tooltip is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setTooltip = makeNotSupported("Aggregation tooltip");

	InvisibleText.prototype.setText = function(sText) {
		// For performance reasons, we suppress the invalidation and update the DOM directly.
		// A lot of controls don't really render the invisible Text in their own DOM,
		// but use it to store aria information and then call toStatic().
		this.setProperty("text", sText, true);
		this.$().html(encodeXML(this.getText() || ""));
		return this;
	};

	InvisibleText.prototype.getRendererMarkup = function() {
		var sId = this.getId();
		return	'<span id="' + sId + '" data-sap-ui="' + sId + '" class="sapUiInvisibleText" aria-hidden="true">' +
					encodeXML(this.getText()) +
				'</span>';
	};

	/**
	 * Adds <code>this</code> control into the static, hidden area UI area container.
	 *
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @see sap.ui.core.Control#placeAt
	 */
	InvisibleText.prototype.toStatic = function() {
		var oCore = sap.ui.getCore();

		try {
			var oStatic = oCore.getStaticAreaRef();
			oStatic.insertAdjacentHTML("beforeend", this.getRendererMarkup());
			this.bOutput = true;
		} catch (e) {
			this.placeAt("sap-ui-static");
		}

		return this;
	};

	// map of text IDs
	var mTextIds = Object.create(null);

	/**
	 * Returns the ID of a shared <code>InvisibleText</code> instance whose <code>text</code> property
	 * is retrieved from the given library resource bundle and text key.
	 *
	 * Calls with the same library and text key will return the same instance. The instance will be
	 * rendered statically.
	 *
	 * When accessibility has been switched off by configuration or when the text key is empty
	 * or falsy, no ID will be returned.
	 *
	 * @param {string} sLibrary Name of the library to load the resource bundle for
	 * @param {string} [sTextKey] Key of the text to retrieve from the resource bundle
	 * @returns {sap.ui.core.ID} ID of the shared control
	 * @public
	 */
	InvisibleText.getStaticId = function(sLibrary, sTextKey) {
		var sTextId = "", sKey, oBundle, oText;

		if ( sap.ui.getCore().getConfiguration().getAccessibility() && sTextKey ) {
			// Note: identify by lib and text key, not by text to avoid conflicts after a language change
			sKey = sLibrary + "|" + sTextKey;
			sTextId = mTextIds[sKey];
			if ( sTextId == null ) {
				oBundle = sap.ui.getCore().getLibraryResourceBundle(sLibrary);
				oText = new InvisibleText().setText( oBundle.getText(sTextKey) );
				oText.toStatic();
				sTextId = mTextIds[sKey] = oText.getId();
			}
		}

		return sTextId;
	};

	// listen to localizationChange event and update shared texts
	sap.ui.getCore().attachLocalizationChanged(function(oEvent) {
		var oCore = sap.ui.getCore(),
			sKey, p, oBundle, oText;
		for ( sKey in mTextIds ) {
			p = sKey.indexOf('|');
			oBundle = oCore.getLibraryResourceBundle(sKey.slice(0, p));
			oText = oCore.byId(mTextIds[sKey]);
			oText && oText.setText(oBundle.getText(sKey.slice(p + 1)));
		}
	});

	return InvisibleText;

});