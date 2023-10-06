/*!
 * ${copyright}
 */

sap.ui.define([
	'./Splitter',
	'./SplitterRenderer',
	"sap/base/Log"
], function(Splitter, SplitterRenderer, Log) {
	"use strict";

	/**
	 * Constructor for a new AssociativeSplitter.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * AssociativeSplitter is a version of Splitter that uses an association in addition to the <code>contentAreas</code> aggregation.
	 * It is used to visualize controls aggregated in {@link sap.ui.layout.PaneContainer PaneContainer} panes.
	 *
	 * @extends sap.ui.layout.Splitter
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.layout.AssociativeSplitter
	 */
	var AssociativeSplitter = Splitter.extend("sap.ui.layout.AssociativeSplitter", /** @lends sap.ui.layout.AssociativeSplitter.prototype */ {
		metadata : {
			associations : {
				/**
				 * The same as <code>contentAreas</code>, but provided in the form of an association.
				 */
				associatedContentAreas: {type : "sap.ui.core.Control", multiple : true, singularName : "associatedContentArea"}
			}
		},
		renderer: SplitterRenderer
	});

	AssociativeSplitter.prototype.init = function () {
		Splitter.prototype.init.call(this);
		// We need to have different step size than the existing in the Splitter
		this._keyListeners = {
			increase     : this._onKeyboardResize.bind(this, "inc", 1),
			decrease     : this._onKeyboardResize.bind(this, "dec", 1),
			increaseMore : this._onKeyboardResize.bind(this, "incMore", 2),
			decreaseMore : this._onKeyboardResize.bind(this, "decMore", 2),
			max          : this._onKeyboardResize.bind(this, "max", 1),
			min          : this._onKeyboardResize.bind(this, "min", 1)
		};
		this._enableKeyboardListeners();
	};

	AssociativeSplitter.prototype.addAssociatedContentArea = function (oContent) {
		this._ensureLayoutData(oContent);
		return this.addAssociation("associatedContentAreas", oContent);
	};

	/**
	 * Adds shift + arrows keyboard handling to the existing one
	 * @returns {void}
	 * @private
	 * @override
	 */
	AssociativeSplitter.prototype._enableKeyboardListeners = function () {
		Splitter.prototype._enableKeyboardListeners.call(this);
		this.onsaprightmodifiers = this._keyListeners.increase;
		this.onsapleftmodifiers = this._keyListeners.decrease;
		this.onsapupmodifiers = this._keyListeners.decrease;
		this.onsapdownmodifiers = this._keyListeners.increase;
		this.onsapright = this._keyListeners.increaseMore;
		this.onsapdown = this._keyListeners.increaseMore;
		this.onsapleft = this._keyListeners.decreaseMore;
		this.onsapup = this._keyListeners.decreaseMore;
		this.onsapend = this._keyListeners.max;
		this.onsaphome = this._keyListeners.min;

		this._keyboardEnabled = true;
	};

	/**
	 * @override
	 */
	AssociativeSplitter.prototype._getContentAreas = function () {
		var aAssociatedContentAreas = this.getAssociatedContentAreas() || [];
		var aContentAreas = this.getContentAreas();

		var aValidAssContentAreas = aAssociatedContentAreas.map(function (sId) {
			return sap.ui.getCore().byId(sId);
		}).filter(function (oContent) { return oContent; });

		return aContentAreas.concat(aValidAssContentAreas);
	};

	AssociativeSplitter.prototype.ondblclick = function (oEvent) {
		// For some reason dblclick returns the whole Splitter not only the clicked splitbar
		var sId = this.getId(),
			iBar, oContentArea;
		if (!(oEvent.target.contains(this._oLastDOMclicked) && (this._oLastDOMclicked.id.indexOf(sId + "-splitbar") > -1))) {
			// The clicked element was not one of my splitter bars
			return;
		}

		iBar = parseInt(this._oLastDOMclicked.id.substr((sId + "-splitbar-").length));
		oContentArea = this._getContentAreas()[iBar];
		oContentArea._currentPosition = this.getCalculatedSizes()[iBar];
		oContentArea._lastPosition = oContentArea._lastPosition || oContentArea._currentPosition;

		if (oContentArea._currentPosition === oContentArea._lastPosition) {
			this._resizeContents(iBar, (this.getCalculatedSizes()[iBar]) * -1, true);
		} else {
			this._resizeContents(iBar, oContentArea._lastPosition, true);
			oContentArea._lastPosition = null;
		}
	};

	/**
	 * @override
	 * If there is single "%"-sized area after pagination, let it take the remaining size
	 */
	AssociativeSplitter.prototype._calcPercentBasedSizes = function (aPercentSizeIdx, iRemainingSize) {
		var aContentAreas = this._getContentAreas(),
			iAvailableContentSize = this._calcAvailableContentSize();

		// single area sized with % - let it take the full size
		if (aPercentSizeIdx.length === 1 && aContentAreas.length === 1) {
			this._calculatedSizes[aPercentSizeIdx[0]] = iAvailableContentSize;
			iRemainingSize -= iAvailableContentSize;
		} else {
			iRemainingSize = Splitter.prototype._calcPercentBasedSizes.apply(this, arguments);
		}

		return iRemainingSize;
	};

	/**
	 * @override
	 */
	AssociativeSplitter.prototype._logConstraintsViolated = function () {
		Log.warning(
			"The set sizes and minimal sizes of the splitter contents are bigger than the available space in the UI. " +
			"Consider enabling the pagination mechanism by setting the 'requiredParentWidth' property of the panes",
			null,
			"sap.ui.layout.ResponsiveSplitter"
		);
	};

	AssociativeSplitter.prototype.containsControl = function (sControlId) {
		var aContentAreas = this._getContentAreas(),
			oContentArea,
			i;

		for (i = 0; i < aContentAreas.length; i++) {

			oContentArea = aContentAreas[i];

			if (oContentArea.isA("sap.ui.layout.AssociativeSplitter")) {
				if (oContentArea.containsControl(sControlId)) {
					return true;
				}
			} else {
				if (oContentArea.getId() === sControlId) {
					return true;
				}
			}
		}
	};

	return AssociativeSplitter;
});