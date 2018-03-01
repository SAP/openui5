/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableRendererUtils.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control'],
	function(jQuery, Control) {
	"use strict";

	var TAGCONTEXT = null;

	/**
	 * Static collection of utility functions related to the sap.ui.table.TableRenderer
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.table.TableRendererUtils
	 * @private
	 */
	var TableRendererUtils = {

		/**
		 * Adds the given CSS class if no condition is given or the condition is truthy.
		 *
		 * @param {sap.ui.core.RenderManager} rm Instance of the rendermanager
		 * @param {string} sClassName The CSS class which should be written
		 * @param {boolean} [bShouldAdd] optional condition
		 *
		 * @returns TableRendererUtils to allow method chaining
		 * @private
		 */
		addClass : function(rm, sClassName, bShouldAdd) {
			if (sClassName && (!!bShouldAdd || arguments.length == 2)) {
				rm.addClass(sClassName);
				if (TAGCONTEXT) {
					TAGCONTEXT.writeClasses = true;
				}
			}
			return TableRendererUtils;
		},

		/**
		 * Adds the given style if no condition is given or the condition is truthy.
		 *
		 * @param {sap.ui.core.RenderManager} rm Instance of the rendermanager
		 * @param {string} sName The style name which should be written
		 * @param {string} oValue The style value which should be written
		 * @param {boolean} [bShouldAdd] optional condition
		 *
		 * @returns TableRendererUtils to allow method chaining
		 * @private
		 */
		addStyle : function(rm, sName, oValue, bShouldAdd) {
			if (sName && oValue && (!!bShouldAdd || arguments.length == 3)) {
				rm.addStyle(sName, oValue);
				if (TAGCONTEXT) {
					TAGCONTEXT.writeStyles = true;
				}
			}
			return TableRendererUtils;
		},

		/**
		 * Writes the starting tag of an element with the given settings.
		 *
		 * @param {sap.ui.core.RenderManager} rm Instance of the rendermanager
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {object} oConfig the configuration of the start tag
		 *
		 * @param {string} [oConfig.tag] 					The tag type which should be used. If nothing is given <code>div</code> is used.
		 * @param {string|string[]} [oConfig.classname] 	CSS class(es) which should be added to the element.
		 * @param {string} [oConfig.id]						The id which should be used. The id is automatically prefixed with the id of the <code>oTable</code>
		 * 													of with the id of <code>oConfig.element</code> (if given).
		 * @param {sap.ui.core.Element} [oConfig.element]	If an id is given, the id is prefixed with the id of <code>oConfig.element</code>. If no id is given
		 * 													the control/element data of this element is written.
		 * @param {number} [oConfig.tabindex]				The value of the tabindex attribute, if needed.
		 * @param {object} [oConfig.attributes]				Map of name value pairs of further attributes which should be written (NOTE: No escaping is done!)
		 * @param {string} [oConfig.aria]					The key as defined in the AccRenderExtension to render the aria attributes (see writeAriaAttributesFor)
		 * @param {object} [oConfig.ariaconfig]				Map of further aria configurations (see <code>writeAriaAttributesFor</code>)
		 * @param {function} [oConfig.furtherSettings]		Callback function which can be used for additional settings (which are not covered by the features of this function)
		 * 													on the start element
		 * @param {boolean} [oConfig.writeClasses]			Whether the <code>writeClasses</code> function of the render manager should be called. This flag is automatically set
		 * 													when the <code>classname</code> attribute is given or when the <code>TableRendererUtils.addClass</code> function is
		 * 													used within the <code>furtherSettings</code> callback.
		 * @param {boolean} [oConfig.writeStyles]			Whether the <code>writeStyles</code> function of the render manager should be called. This flag is automatically set
		 * 													when the <code>TableRendererUtils.addStyle</code> function is used within the <code>furtherSettings</code> callback.
		 *
		 * @returns TableRendererUtils to allow method chaining
		 * @private
		 */
		startElement : function(rm, oTable, oConfig) {
			oConfig = oConfig || {};

			rm.write("<", oConfig.tag || "div");
			TAGCONTEXT = oConfig;

			if (oConfig.furtherSettings) {
				oConfig.furtherSettings(rm, oTable);
			}

			if (jQuery.isArray(oConfig.classname) && oConfig.classname.length) {
				for (var i = 0; i < oConfig.classname.length; i++) {
					TableRendererUtils.addClass(rm, oConfig.classname[i]);
				}
			} else if (oConfig.classname) {
				TableRendererUtils.addClass(rm, oConfig.classname);
			}

			if (oConfig.id) {
				rm.writeAttribute("id", (oConfig.element || oTable).getId() + "-" + oConfig.id);
			} else if (oConfig.element) {
				if (oConfig.element instanceof Control) {
					rm.writeControlData(oConfig.element);
				} else {
					rm.writeElementData(oConfig.element);
				}
			}

			if (oConfig.attributes) {
				for (var name in oConfig.attributes) {
					if (oConfig.attributes.hasOwnProperty(name)) {
						rm.writeAttribute(name, oConfig.attributes[name]);
					}
				}
			}

			if (typeof oConfig.tabindex === "number") {
				rm.writeAttribute("tabindex", "" + oConfig.tabindex);
			}

			if (oConfig.aria) {
				oTable._getAccRenderExtension().writeAriaAttributesFor(rm, oTable, oConfig.aria, oConfig.ariaconfig);
			}

			if (TAGCONTEXT.writeClasses) {
				rm.writeClasses();
			}
			if (TAGCONTEXT.writeStyles) {
				rm.writeStyles();
			}
			TAGCONTEXT = null;
			rm.write(">");

			return TableRendererUtils;
		},

		/**
		 * Writes the end tag of an element with the given settings.
		 *
		 * @param {sap.ui.core.RenderManager} rm Instance of the rendermanager
		 * @param {string} sTag The tag type which should be used. If nothing is given <code>div</code> is used.
		 *
		 * @returns TableRendererUtils to allow method chaining
		 * @private
		 */
		endElement : function(rm, sTag) {
			rm.write("</", sTag || "div", ">");
			return TableRendererUtils;
		},

		/**
		 * Writes the starting and end tag of an element with the given settings.
		 *
		 * @param {sap.ui.core.RenderManager} rm Instance of the rendermanager
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {object} oConfig the configuration of the start tag
		 * @returns TableRendererUtils to allow method chaining
		 * @see TableRendererUtils#startElement
		 * @see TableRendererUtils#endElement
		 * @private
		 */
		renderElement : function(rm, oTable, oConfig) {
			TableRendererUtils.startElement(rm, oTable, oConfig);
			TableRendererUtils.endElement(rm, oConfig ? oConfig.tag : null);
			return TableRendererUtils;
		}

	};

	return TableRendererUtils;

}, /* bExport= */ true);