/*!
 * ${copyright}
 */

// Provides control sap.m.Illustration.
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"./IllustrationRenderer",
	"./IllustrationPool",
	"sap/ui/core/Core"
], function(
	Log,
	Control,
	IllustrationRenderer,
	IllustrationPool,
	Core
) {
	"use strict";

	var oCollectionMap = {
		"sap_horizon": 'v5/',
		"sap_horizon_dark": 'v5/',
		"sap_horizon_hcb": 'v5/hc/',
		"sap_horizon_hcw": 'v5/hc/'
	};

	/**
	 * Constructor for a new <code>Illustration</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A simple control which uses a Symbol ID to visualize an SVG
	 * which has already been loaded in the {@link sap.m.IllustrationPool}.
	 *
	 * To build a Symbol ID, all of the <code>Illustration</code> properties must be populated with data.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.98
	 * @alias sap.m.Illustration
	 */
	var Illustration = Control.extend("sap.m.Illustration", /** @lends sap.m.Illustration.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines which illustration set should be used when building the Symbol ID.
				 *
				 * @since 1.98
				 */
				set: {type: "string", defaultValue: null},

				/**
				 * Defines which media/breakpoint should be used when building the Symbol ID.
				 *
				 * @since 1.98
				 */
				media: {type: "string", defaultValue: null},

				/**
				 * Defines which illustration type should be used when building the Symbol ID.
				 *
				 * @since 1.98
				 */
				type: {type: "string", defaultValue: null}
			},
			associations : {
				/**
				 * Association to controls / IDs which label those controls (see WAI-ARIA attribute aria-labelledBy).
	 			 * @since 1.106.0
				 */
				ariaLabelledBy: {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
			},
			dnd: { draggable: true, droppable: false }
		},

		renderer: IllustrationRenderer
	});

	/**
	 * STATIC MEMBERS
	 */

	Illustration.CAN_NOT_BUILD_SYMBOL_MSG = "Some of the Control's properties are missing. Can't build Symbol ID. No SVG will be displayed.";

	/**
	 * LIFECYCLE METHODS
	 */

	Illustration.prototype.init = function() {
		this._sId = this.getId();
	};

	Illustration.prototype.onBeforeRendering = function() {
		this._buildSymbolId();
		if (this._sSymbolId) {
			IllustrationPool.loadAsset(this._sSymbolId, this._sId, this._sIdPrefix);
		} else {
			Log.warning(Illustration.CAN_NOT_BUILD_SYMBOL_MSG);
		}
	};

	Illustration.prototype.onThemeChanged = function() {
		this.invalidate();
	};

	/**
	 * PRIVATE METHODS
	 */

	/**
	 * Builds the Symbol ID which will be used for requiring the Illustration asset.
	 * If mapping is provided for the current theme, the Symbol ID will be built using the mapped type.
	 * @private
	 */
	Illustration.prototype._buildSymbolId = function () {
		var sSet = this.getSet(),
			sMedia = this.getMedia(),
			sType = this.getType(),
			oResult;

		this._sSymbolId = "";
		this._sIdPrefix = "";

		if (sSet && sMedia && sType) {
			oResult = this._formatType(sSet, sType);
			this._sSymbolId = sSet + "-" + sMedia + "-" + oResult.mappedType;
			this._sIdPrefix = oResult.prefix;
		}
	};

	/**
	 * Formats the type of the Illustration based on the current theme.
	 * @param {string} sSet The name of the Illustration set
	 * @param {string} sType The type of the Illustration
	 * @returns {string} The formatted type of the Illustration
	 * @private
	 */
	Illustration.prototype._formatType = function (sSet, sType) {
		var sMappedType = sType,
			sPrefix = "",
			oMetadata = IllustrationPool.getIllustrationSetMetadata(sSet),
			sCurrentTheme = Core.getConfiguration().getTheme(),
			sCollectionPath = oCollectionMap[sCurrentTheme];

		if (
			sCollectionPath &&
			oMetadata &&
			oMetadata.aCollections &&
			oMetadata.aCollections.length
		) {
			oMetadata.aCollections.forEach(function (oThemeMapping) {
				if (oThemeMapping.prefix === sCollectionPath && oThemeMapping.mappings[sType]) {
					sMappedType = oThemeMapping.mappings[sType];
					sPrefix = oThemeMapping.prefix;
				}
			});
		}

		return {
			mappedType: sMappedType,
			prefix: sPrefix
		};
	};

	return Illustration;

});
