/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/ResizeHandler',
	'sap/base/Log',
	'./SimpleFixFlexRenderer'
],
function(Control, ResizeHandler, Log, SimpleFixFlexRenderer) {
	"use strict";
	/**
	 * Constructor for a new <code>sap.m.SimpleFixFlex</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.SimpleFixFlex</code> builds the container for a layout with a fixed and a flexible part.
	 * The flexible container adapts its size to the fix container.
	 * <h3>Structure</h3>
	 * The control consists of two different parts:
	 * <ul>
	 * <li>Fix content - A container that is used to render a control.</li>
	 * <li>Flex content - A container that stretches to fill the empty space in the parent container.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.65
	 * @alias sap.m.SimpleFixFlex
	 */
	var SimpleFixFlex = Control.extend("sap.m.SimpleFixFlex", /** @lends sap.m.SimpleFixFlex.prototype */ {
		metadata: {
			library: "sap.m",
			aggregations: {
				/**
				* Control in the fixed part of the layout.
				*/
				fixContent: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				/**
				* Control in the flex part of the layout.
				*/
				flexContent: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			properties: {
				/**
				* Determines whether the content of <code>sap.m.SimpleFixFlex</code> stretches
				* the parent container or wraps in order to fit.
				*/
				fitParent: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				}
			}
		},

		renderer: SimpleFixFlexRenderer
	});

	/*************************************** Static members ******************************************/

	SimpleFixFlex.FIX_AREA_CHARACTER_COUNT_RECOMMENDATION = 200;
	SimpleFixFlex.FIX_AREA_CHARACTERS_ABOVE_RECOMMENDED_WARNING = "It is recommended to use less than " +
	SimpleFixFlex.FIX_AREA_CHARACTER_COUNT_RECOMMENDATION + " characters as a value state text.";

	SimpleFixFlex.prototype.onBeforeRendering = function () {
		this._deregisterFixContentResizeHandler();
		var oFixContent = this.getFixContent();

		if (oFixContent && oFixContent.isA("sap.m.Text") &&
			oFixContent.getText().length > SimpleFixFlex.FIX_AREA_CHARACTER_COUNT_RECOMMENDATION) {
			Log.warning(SimpleFixFlex.FIX_AREA_CHARACTERS_ABOVE_RECOMMENDED_WARNING, "", this.getId());
		}
	};

	SimpleFixFlex.prototype.onAfterRendering = function () {
		if (this.getFitParent()) {
			this._registerFixContentResizeHandler();
		}
	};

	SimpleFixFlex.prototype._registerFixContentResizeHandler = function() {
		var oFixContent = this.getFixContent();
		if (!this._sResizeListenerId && oFixContent && oFixContent.getDomRef()) {
			this._sResizeListenerId = ResizeHandler.register(oFixContent.getDomRef(), this._onFixContentResize.bind(this));
			this._onFixContentResize();
		}
	};

	SimpleFixFlex.prototype._deregisterFixContentResizeHandler = function () {
		if (this._sResizeListenerId) {
			ResizeHandler.deregister(this._sResizeListenerId);
			this._sResizeListenerId = null;
		}
	};

	SimpleFixFlex.prototype._onFixContentResize = function () {
		var	$simpleFixFlex = this.$(),
			$fixContent = this.getFixContent().$(),
			oFixedDom = $fixContent.get(0);

		// In case the fixed content is already hidden / destroyed when the handler is executed
		if (!oFixedDom || !oFixedDom.clientHeight) {
			return null;
		}

		//using clientHeight as jQuery's innerHeight() method returns the height
		//even if the fix content has style of "display: none;"
		$simpleFixFlex.css("padding-top", oFixedDom.clientHeight);
	};

	SimpleFixFlex.prototype.exit = function() {
		this._deregisterFixContentResizeHandler();
	};

	return SimpleFixFlex;
});