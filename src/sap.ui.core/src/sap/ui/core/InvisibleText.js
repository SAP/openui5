/*!
 * ${copyright}
 */

// Provides control sap.ui.core.InvisibleText.
sap.ui.define(['jquery.sap.global', './Control', './library', 'jquery.sap.encoder'],
	function(jQuery, Control, library/*, jQuerySap1 */) {
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

		renderer : function(oRm, oControl) {
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

			oRm.write("<span");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUiInvisibleText");
			oRm.writeClasses();
			oRm.writeAttribute("aria-hidden", "true");
			oRm.write(">");
			oRm.writeEscaped(oControl.getText() || "");
			oRm.write("</span>");
		}
	});

	// helper to create a dummy setter that logs a warning
	function makeNotSupported(what) {
		return function() {
			jQuery.sap.log.warning(what + " is not supported by control sap.ui.core.InvisibleText.");
			return this;
		};
	}

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Local BusyIndicator is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setBusy = makeNotSupported("Property busy");

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Local BusyIndicator is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setBusyIndicatorDelay = makeNotSupported("Property busy");

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Local BusyIndicator is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setBusyIndicatorSize = makeNotSupported("Property busy");

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Property visible is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setVisible = makeNotSupported("Property visible");

	/**
	 * @return {sap.ui.core.InvisibleText} Returns <code>this</code> to allow method chaining
	 * @public
	 * @deprecated Tooltip is not supported by control.
	 * @function
	 */
	InvisibleText.prototype.setTooltip = makeNotSupported("Aggregation tooltip");

	InvisibleText.prototype.setText = function(sText) {
		this.setProperty("text", sText, true);
		this.$().html(jQuery.sap.encodeHTML(this.getText() || ""));
		return this;
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
			var oRM = oCore.createRenderManager();
			oRM.render(this, oStatic);
			oRM.destroy();
		} catch (e) {
			this.placeAt("sap-ui-static");
		}

		return this;
	};

	// map of text IDs
	var mTextIds = Object.create(null);

	/**
	 * Returns the ID of a shared <code>InvisibleText<code> instance whose <code>text</code> property
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
