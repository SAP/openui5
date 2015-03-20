/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.GestureRecognizer.
sap.ui.define([
	'sap/ui/base/Object'
],
function(BaseObject) {
	"use strict";

	/**
	 * Constructor for a new GestureRecognizer.
	 * 
	 * @param {sap.ui.dt.DesignTime} oDesignTime The design time object
	 *
	 * @class
	 * The GestureRecognizer is a finite state machine to recognize specific user interaction 
	 * from lower level design time events.
	 * 
	 * @extends sap.ui.core.BaseObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.GestureRecognizer
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var GestureRecognizer = BaseObject.extend("sap.ui.dt.GestureRecognizer", /** @lends sap.ui.dt.GestureRecognizer.prototype */{

		constructor : function(oDesignTime) {

			this.STATES = {
				initial : "initial",
				moveStarted : "move_started",
				controlCreated : "control_created"
			};

			this.oDesignTime = oDesignTime;
			this.state = this.STATES.initial;
			this._sSourceContainerId = null;
			this._iSourceIndex = null;
			this._gestureListeners = [];

		}
	});

	/*
	 * @protected
	 */
	GestureRecognizer.prototype.init = function() {
		this.oDesignTime.attachEvent("controlDragStarted", this._eventHandlerMoveStarted, this);
		this.oDesignTime.attachEvent("controlDragEnded", this._eventHandlerMoveEnded, this);
		this.oDesignTime.attachEvent("controlChanged", this._eventHandlerControlChanged, this);
		this.oDesignTime.attachEvent("controlRemoved", this._eventHandlerControlRemoved, this);
		this.oDesignTime.attachEvent("controlCreated", this._eventHandlerControlCreated, this);
	};

	GestureRecognizer.prototype.destroy = function() {
		this.oDesignTime.detachEvent("controlDragStarted", this._eventHandlerMoveStarted, this);
		this.oDesignTime.detachEvent("controlDragEnded", this._eventHandlerMoveEnded, this);
		this.oDesignTime.detachEvent("controlChanged", this._eventHandlerControlChanged, this);
		this.oDesignTime.detachEvent("controlRemoved", this._eventHandlerControlRemoved, this);
		this.oDesignTime.detachEvent("controlCreated", this._eventHandlerControlCreated, this);
	};

	GestureRecognizer.prototype._eventHandlerMoveStarted = function(oData) {
		var oControl = oData.getParameter("oControl");

		var mParent = this._parentPath(oControl);
		if (oControl && mParent.parent) {
			var aChildren = this._getChildren(mParent);
			this._iSourceIndex = aChildren.indexOf(oControl);
			this.state = this.STATES.moveStarted;
			this._sSourceContainerId = mParent.parent.getId();
			this._sParentAggregationName = mParent.aggregation;

		}
	};

	GestureRecognizer.prototype._eventHandlerMoveEnded = function(oData) {
		if (this.state == this.STATES.initial) {
			return;
		}
		var oControl = oData.getParameter("oControl");
		if (oControl) {
			var mParent = this._parentPath(oControl);

			if (mParent.parent) {
				var aChildren = this._getChildren(mParent);
				var iTargetIndex = aChildren.indexOf(oControl);
				// A move ends, so check what did happen before:
				if (this.state == this.STATES.moveStarted) {
					this._handleMove(oControl, mParent.parent, mParent.aggregation, iTargetIndex);
				} else if (this.state == this.STATES.controlCreated) {
					this._handleAddControl(oControl, mParent.parent, mParent.aggregation, iTargetIndex);
				}
			}
		}
		this.state = this.STATES.initial; // reset the state: move ended here
	};

	/*
	 * @private
	 */
	GestureRecognizer.prototype._handleMove = function(oControl, oParent, sAggregation, iTargetIndex) {
		// reject the move if its the same parent and index
		if (this._sSourceContainerId !== oParent.getId() || this._iSourceIndex !== iTargetIndex
				|| this._sParentAggregationName !== oControl.sParentAggregationName) {
			this.emitMoveEvent(oControl, sAggregation, this._sSourceContainerId, oParent.getId(), iTargetIndex);
		}
		this._sSourceContainerId = null;
		this._iSourceIndex = null;
	};

	/*
	 * @private
	 */
	GestureRecognizer.prototype._handleAddControl = function(oControl, oParent, sAggregation, iTargetIndex) {
		this.emitAddEvent(oControl, sAggregation, oParent.getId(), iTargetIndex);
	};

	/*
	 * @private
	 */
	GestureRecognizer.prototype._eventHandlerControlCreated = function(oData) {
        if (this.state !== this.STATES.moveStarted) {
            this.state = this.STATES.controlCreated;
        }
	};

	/*
	 * @private
	 */
	GestureRecognizer.prototype._eventHandlerControlRemoved = function(oData) {
		var oControl = oData.getParameter("oControl");
		this.emitHideEvent(oControl);
	};

	/*
	 * @private
	 */
	GestureRecognizer.prototype._eventHandlerControlChanged = function(oData) {
		var oControl = oData.getParameter("oControl");
		var oChangedProperty = oData.getParameter("mParameters");
		if (oChangedProperty) {
			this.emitPropertyChangeEvent(oControl, oChangedProperty.name, oChangedProperty.newValue);
		}
	};

	GestureRecognizer.prototype.addGestureListener = function(oGestureListener) {
		if (oGestureListener) {
			this._gestureListeners.push(oGestureListener);
		}
	};

	GestureRecognizer.prototype.emitAddEvent = function(oControl, sAggregation, oTargetId, iTargetIndex) {
		for ( var i in this._gestureListeners) {
			this._gestureListeners[i].emitAddEvent(oControl, sAggregation, oTargetId, iTargetIndex);
		}
	};

	GestureRecognizer.prototype.emitHideEvent = function(oControl) {
		for ( var i in this._gestureListeners) {
			this._gestureListeners[i].emitHideEvent(oControl);
		}
	};

	GestureRecognizer.prototype.emitPropertyChangeEvent = function(oControl, sPropertyName, sPropertyValue) {
		for ( var i in this._gestureListeners) {
			this._gestureListeners[i].emitPropertyChangeEvent(oControl, sPropertyName, sPropertyValue);
		}
	};

	GestureRecognizer.prototype.emitMoveEvent = function(oControl, sAggregation, sourceId, targetId, iTargetIndex) {
		for (var i = 0; i < this._gestureListeners.length; i++) {
			this._gestureListeners[i].emitMoveEvent(oControl, sAggregation, sourceId, targetId, iTargetIndex);
		}
	};

	/*
	 * @private
	 */
	GestureRecognizer.prototype._parentPath = function(oControl) {

		var oParent = oControl.getParent();
		var sGetter = oParent ? oParent.getMetadata() : undefined;
		sGetter = sGetter ? sGetter._mAggregations : undefined;
		sGetter = sGetter ? sGetter[oControl.sParentAggregationName] : undefined;
		sGetter = sGetter ? sGetter._sGetter : undefined;

		var oResult = {
			parent : oParent,
			aggregation : oControl.sParentAggregationName,
			getter : sGetter
		};

		var oTmpControl = oControl;

		while (oParent) {
			var oParentMeta  = oParent.getMetadata();
			if (oParentMeta._mPrivateAggregations[oTmpControl.sParentAggregationName]) {
				// find aggregation
				for ( var agg in oParentMeta._mAggregations) {
					var oAct = oParentMeta._mAggregations[agg];
					sGetter = oAct._sGetter;
					var aMember = oParent[sGetter]();
					if (aMember.indexOf(oControl) > -1) {
						oResult.aggregation = agg;
						oResult.getter = sGetter;
						oResult.parent = oParent;
						return oResult;
					}
				}
			}
			oTmpControl = oParent;
			oParent = oParent.getParent();
		}

		return oResult;

	};

	/*
	 * @private
	 */
	GestureRecognizer.prototype._getChildren = function(mParent) {
		var aChildren = [];
		if (mParent.getter) {
			aChildren = mParent.parent[mParent.getter]();
		} else if (mParent.aggregation) {
			aChildren = mParent.parent.getAggregation(mParent.aggregation);
		}
		return aChildren;
	};


	return GestureRecognizer;
}, /* bExport= */ true);