/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.Widget.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/DTWidgetView'
],
function(jQuery, DTWidgetView) {
	"use strict";


	/**
	 * Constructor for a new Widget.
	 * 
	 * @param {sap.ui.core.Control} oControl The control to handle by the widget
	 * @param {sap.ui.dt.DesignTime} oDesignTime The design time object
	 *
	 * @class
	 * The Widget 
	 * <ul>
	 * <li> patches itself as __widget to the control </li>
	 * <li> creates DTWidgetView instance</li>
	 * <li> provides accessors for design time metadata</li>
	 * <li> patches methods that change the control, to fire changed events and ensures that all design time handling is adjusted (e.g. destroy, setBinding,...) </li>
	 * <li> manipulates the aggregations of a control, e.g. during D&D, which aggregations are available, allowed, reorder elements in an aggregation</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.Widget
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var Widget = function(oControl, oDesignTime) {
		var that = this;
		if (oControl.__widget) {
			return;
		}
		oControl.__widget = this;
		oControl.__publicControl = true;
		this.eventBus = oDesignTime.oEventBus;
		this.oControl = oControl;
		this.oScope = oDesignTime.oScope;
		// TODO All this variables should passed as constructor arguments (and to all the child objects as well)
		this.oDesignTime = oDesignTime;
		this._oWidgets = oDesignTime.oWidgets;
		
		this.checkBinding();
		this.checkDTOptions();
		this.dtView = new DTWidgetView(oControl, this);
		
		this.eventBus.subscribe("destroy", this._onDestroy, this);

		// We wrap the native destroy method of the control with our logic
		this._fnOriginalDestroy = oControl.destroy;
		var bDestroyed = false;
		oControl.destroy = function() {
			if (bDestroyed) {
				return;
			}
			bDestroyed = true;
			var registry = that.eventBus._defaultChannel.mEventRegistry;
			for ( var key in registry) {
				var oEvent = registry[key];
				for (var i = oEvent.length - 1; i >= 0; i--) {
					if (oEvent[i].oListener === this) {
						oEvent.splice(i, 1);
					}
				}
			}
			that.dtView.removeOverlay();

			oControl.detachEvent("_change", that._fireChanged, that);

			if (oControl.__widget) {
				oControl.__widget.destroyed = true;
			}
			that._fnOriginalDestroy.apply(this, arguments);

			that.eventBus.publish("control.destroyed", {
				oControl : this
			});
		};
		oControl.attachEvent("_change", this._fireChanged, this);

		// Wrapper for the bindProperty method to recognize changes
		this._fnOriginalBindProperty = oControl.bindProperty;
		oControl.bindProperty = function() {
			that._fnOriginalBindProperty.apply(this, arguments);
			that._fireChanged();
		};

		// Wrapper for the unbindProperty method to recognize changes
		this._fnOriginalUnBindProperty = oControl.unbindProperty;
		oControl.unbindProperty = function() {
			that._fnOriginalUnBindProperty.apply(this, arguments);
			that._fireChanged();
		};

		// Wrapper for the bindAggregation method to recognize changes
		this._fnOriginalBindAggregation = oControl.bindAggregation;
		oControl.bindAggregation = function(sAggregationName) {
			that._fnOriginalBindAggregation.apply(this, arguments);
			that.checkBinding();
			that._fireChanged();
		};

		// Wrapper for the unbindAggregation method to recognize changes
		this._fnOriginalUnBindAggregation = oControl.unbindAggregation;
		oControl.unbindAggregation = function(sAggregationName) {
			that._fnOriginalUnBindAggregation.apply(this, arguments);
			that.checkBinding();
			that._fireChanged();
		};

		// We wrap the native setParent method of the control with our logic
		this._fnOriginalSetParent = oControl.setParent;
		oControl.setParent = function(oParent, sAggregationName, bSuppressInvalidate) {
			that._fnOriginalSetParent.apply(this, arguments);
			sap.ui.dt.Utils.setDesignTimeLayoutdata(this, oParent);
			return this;
		};

		sap.ui.dt.Utils.iterateOverAllPublicAggregations(oControl, function(oAggregation, aControls) {
			for (var i = 0; i < aControls.length; i++) {
				sap.ui.dt.Utils.setDesignTimeLayoutdata(aControls[i], oControl);
			}
		}, null, sap.ui.dt.Utils.getAggregationFilter());

		this.eventBus.publish("control.created", {
			oControl: oControl
		});
	};

	Widget.prototype.checkDTOptions = function() {
		var oMetadata = this.oControl.getMetadata();
		if (!oMetadata.__designTimeOptions) {
			this.oScope.getWindow().sap.ui.dt.adapter.registerUnsupported(this.oControl);
		}

		if (oMetadata.__designTimeOptions.unsupported) {
			this.oControl.__widget.isUnsupported = true;
		} else {
			var oParent = this.oControl.getParent();
			if (oParent && oParent.__widget && (oParent.__widget.isUnsupported || oParent.__widget.isUnsupportedChild)) {
				this.oControl.__widget.isUnsupportedChild = true;
			}
		}
	};

	Widget.prototype.checkBinding = function() {
		var oControl = this.oControl;
		if (!oControl.__widget || oControl.__widget.destroyed) {
			return;
		}

		var remakeOverlay = function(oControl) {
			if (oControl.__widget && oControl.__widget.dtView) {
				oControl.__widget.dtView.removeOverlay();
				oControl.__widget.dtView.createOverlay();
			}
		};


		var oldhasBoundAggregations = oControl.__widget ? oControl.__widget.hasBoundAggregations : undefined;
		var oldIsTemplate = oControl.__widget ? oControl.__widget.isTemplate : undefined;
		var oldBoundAggregations = oControl.__widget && oControl.__widget.boundAggregations ? oControl.__widget.boundAggregations : [];

		oControl.__widget.hasBoundAggregations = false;
		oControl.__widget.boundAggregations = [];
		if (oControl.mBindingInfos) {
			jQuery.each(oControl.mBindingInfos, function(sAggregationName, oInfo) {
				if (oInfo && oInfo.template) {
					oControl.__widget.hasBoundAggregations = true;
					oControl.__widget.boundAggregations.push(sAggregationName);
					// check if was bound before
					var index = oldBoundAggregations.indexOf(sAggregationName);
					if (index > -1) {
					    oldBoundAggregations.splice(index, 1);
					}
				}
			});
		}

		if (oControl.getParent() && oControl.getParent().mBindingInfos[oControl.sParentAggregationName]) {
			oControl.__widget.isTemplate = true;
		} else {
			oControl.__widget.isTemplate = false;
		}

		if (oldhasBoundAggregations !== undefined && oldIsTemplate !== undefined) {
			// if binding was changed
			if (oldhasBoundAggregations !== oControl.__widget.hasBoundAggregations || oldIsTemplate !== oControl.__widget.isTemplate) {
				remakeOverlay(oControl);
			}
		}

		jQuery.each(oldBoundAggregations, function(i, sAggregationName) {
			var sAggregationGetter = oControl.getMetadata().getAllAggregations()[sAggregationName]._sGetter;
			var mAggregatedControls = oControl[sAggregationGetter]();
			jQuery.each(mAggregatedControls, function(index, oControl) {
				if (oControl.__widget) {
					oControl.__widget.checkBinding();
				}
			});
		});
	};
	
	/*
	 * @private
	 */
	Widget.prototype._onDestroy = function(oChannel, sPath, oData) {
		var oControl = this.oControl;
		this.dtView.destroy(oData);
		
		oControl.destroy = this._fnOriginalDestroy;
		delete this._fnOriginalDestroy;
		oControl.bindProperty = this._fnOriginalBindProperty;
		delete this._fnOriginalBindProperty;
		oControl.unbindProperty = this._fnOriginalUnBindProperty;
		delete this._fnOriginalUnBindProperty;
		oControl.bindAggregation = this._fnOriginalBindAggregation;
		delete this._fnOriginalBindAggregation;
		oControl.unbindAggregation = this._fnOriginalUnBindAggregation;
		delete this._fnOriginalUnBindAggregation;
		oControl.setParent = this._fnOriginalSetParent;
		delete this._fnOriginalSetParent;
		
		oControl.detachEvent("_change", this._fireChanged, this);
		delete this.dtView;

		delete oControl.__widget;
		delete oControl.__publicControl;

		this.eventBus.unsubscribe("destroy", this._onDestroy, this);
		delete this.eventBus;
		delete this.oDesignTime;
		delete this.oScope;
		
		delete this._oWidgets;
		delete this.oControl;
		
		delete this.boundAggregations;
		delete this.hasBoundAggregations;
		delete this.isTemplate;
	};

	/*
	 * @private
	 */
	Widget.prototype._fireChanged = function(oEvent) {
		oEvent = oEvent || {};
		oEvent.oControl = this.oControl;
		this.eventBus.publish("control.changed", oEvent);
	};

	Widget.prototype.getDTView = function() {
		return this.dtView;
	};

	Widget.prototype.isControlDecomposable = function() {
		var bResult = false;
		sap.ui.dt.Utils.findParentWYSIWYGAggregation(this.oControl, function(oAggregation, oParentControl) {
			var oDTAggregations = oParentControl.__widget.getDesignTimeProperty("aggregations");
			bResult = !!(oDTAggregations && oDTAggregations[oAggregation.name] && oDTAggregations[oAggregation.name].cssSelector);
		});
		return bResult;
	};

	Widget.prototype.isFiltered = function() {
		return sap.ui.dt.Utils.isControlFiltered(this.oControl);
	};

	Widget.prototype.isBound = function() {
		var oParent = this.oControl.getParent();
		return !!(oParent && oParent.getBindingInfo(this.oControl.sParentAggregationName));
	};

	Widget.prototype.getCSSElement = function(oDTAggregation) {
		var sCSSSelector = oDTAggregation.cssSelector;
		if (!sCSSSelector) {
			return false;
		}
		if (sCSSSelector === ":sap-domref") {
			return this.oControl.getDomRef();
		}
		// ":sap-domref > sapMPage" scenario
		if (sCSSSelector.indexOf(":sap-domref") > -1) {
			return this.oScope.getDocument().querySelector(sCSSSelector.replace(":sap-domref", "#" + this.getEscapedId()));
		}
		return this.oControl.getDomRef() ? this.oControl.getDomRef().querySelector(sCSSSelector) : undefined;
	};

	Widget.prototype.getDesignTimeOptions = function() {
		return this.oControl.getMetadata().__designTimeOptions;
	};
	
	
	Widget.prototype.getWidgets = function() {
		return this._oWidgets;
	};

	Widget.prototype.getDesignTimeProperty = function(sProperty) {
		return this.getDesignTimeOptions() && this.getDesignTimeOptions()[sProperty];
	};

	Widget.prototype.isDraggable = function(iSelecetedParents) {
		if (!this.isSelectable()) {
			return false;
		}
		return !!(this.getDesignTimeProperty("draggable") && this.isControlDecomposable() && !iSelecetedParents);
	};

	Widget.prototype.isSelectable = function() {
		if (this.isFiltered()) {
			return false;
		}
		return !!this.getDesignTimeProperty("selectable");
	};

	Widget.prototype.isRemovable = function() {
		if (this.isBound()) {
			return false;
		}
		return !!this.getDesignTimeProperty("removable");
	};

	Widget.prototype.isResizable = function() {
		if (!this.getDesignTimeProperty("resizable") || (!this.oControl.getWidth && !this.oControl.getHeight)) {
			return false;
		}
		//FIXME Why was this needed I can't remember... Check in UI5 where its being used!!!
		if (this.oControl.getFitContainer && this.oControl.getFitContainer()) {
			return false;
		}
		return true;
	};

	Widget.prototype.getWYSIWYGParent = function() {
		function internalFind(oControl) {
			var oParent = oControl.getParent();
			if (oParent && !oParent.__widget) {
				return internalFind(oParent);
			}
			return oParent;
		}
		return internalFind(this.oControl);
	};

	Widget.prototype.getResizableOptions = function() {
		if (!this.isResizable()) {
			return {
				width : false,
				height : false
			};
		}
		return {
			width : this.oControl.getWidth ? true : false,
			height : this.oControl.getHeight ? true : false
		};
	};

	Widget.prototype.accepts = function(oControl) {
		if (this.oControl.__widget.isTemplate || this.oControl.__widget.isUnsupported || this.oControl.__widget.isUnsupportedChild) {
			return [];
		}

		// To be checked if dragged control does accept this widget as a drop target
		var validateDropTarget;
		if (oControl) {
			validateDropTarget = oControl.__widget.getBehaviorAdapterFunction( "validateDropTarget");
		}

		var oSupportedAggretions = this.getDesignTimeProperty("aggregations");
		var aElements = [];
		for ( var sSupportedAggregation in oSupportedAggretions) {
			try {
				var oDTAggregation = oSupportedAggretions[sSupportedAggregation];
				var oRealAggregation = this.oControl.getMetadata().getAllAggregations()[sSupportedAggregation];
				if (!oRealAggregation) {
					jQuery.sap.log.error( "No public aggregation :'" + sSupportedAggregation +
										  "'' exists for control " + this.oControl.getMetadata().getName() );
					return;
				}
				var bMultiple = oRealAggregation.multiple;
				// 0..1 cardinality
				if (!bMultiple) {
					bMultiple = !!this.oControl[oRealAggregation._sGetter]();
				}
				if (oControl) {
					this.oControl.validateAggregation(sSupportedAggregation, oControl, bMultiple);

					// Check if draggable accepts drop target
					if (validateDropTarget) {
						validateDropTarget.call( oControl, oRealAggregation, this.oControl );
					}

					// Check if drop target aggregation accepts draggable
					var validateAsDropTarget = this.getAggregationsAdapterFunction(sSupportedAggregation, "validateAsDropTarget");
					if (validateAsDropTarget) {
						validateAsDropTarget.call(this.oControl, oRealAggregation, oControl );
					}
				}
				var cssElement = this.getCSSElement(oDTAggregation);
				if (!this.oControl.getBindingPath(sSupportedAggregation) && cssElement) {
					aElements.push({
						"oAggregation" : oRealAggregation,
						"DOMElement" : cssElement
					});
				}
			} catch (e) {
				//Don't do anything... validateAggregation simply throws an exception just because.
			}
		}

		return aElements;
	};

	Widget.prototype.getOverlay = function() {
		return this.dtView.getOverlay();
	};

	/**
	 * Retrieves the content of the specified control aggregation
	 * This method considers a drop target adjustment possibly in place for this aggregation
	 * @param  {string} sAggregationName Name of aggregation
	 * @return {object} Content of aggregation
	 */
	Widget.prototype.getAggregation = function(sAggregationName) {

		// Determine control and meta data of aggregation  to retrieve
		var oControl = this.oControl;
		sAggregationName = sAggregationName || this.oControl.getMetadata().getDefaultAggregationName();
		var oAggregationMetaData = this.oControl.getMetadata().getAllAggregations()[sAggregationName];

		// Take drop target adjustment into consideration if specified
		var fnAdjustDropTarget = this.getAggregationsAdapterFunction(sAggregationName, "adjustDropTarget");
		if (fnAdjustDropTarget) {
			var oAdjustedAggregation = fnAdjustDropTarget.call( this.oControl, oAggregationMetaData );
			if (oAdjustedAggregation) {
			    var oAggregation = { "control": this.oControl, "aggregation": oAggregationMetaData };
				if (!isSameControlAggregation( oAggregation, oAdjustedAggregation )) {
					return oAdjustedAggregation.control.__widget.getAggregation( oAdjustedAggregation.name );
				}
			}
		}

		// Retrieve aggregation content
		return aggregationGetter(oControl, oAggregationMetaData);
	};

	Widget.prototype.getLayoutDataFactory = function(sAggregationName) {
		var oDTAggregationsProperty = this.getDesignTimeProperty("aggregations");
		return oDTAggregationsProperty && oDTAggregationsProperty[sAggregationName] && oDTAggregationsProperty[sAggregationName].layoutData;
	};

	Widget.prototype.getAggregationsAdapterFunction = function(sAggregationName, sFunctionName) {
		var oDTAggregationsProperty = this.getDesignTimeProperty("aggregations");
		return oDTAggregationsProperty && oDTAggregationsProperty[sAggregationName] && oDTAggregationsProperty[sAggregationName][sFunctionName];
	};

	Widget.prototype.getBehaviorAdapterFunction = function(sFunctionName) {
		var oDTBehavior = this.getDesignTimeProperty("behavior");
		return oDTBehavior && oDTBehavior[sFunctionName];
	};

	/**
	 * Adds to or repositions a UI5 control control in an aggregation at a specified position
	 * This method considers a drop target adjustment possibly in place for this aggregation
	 * @param {string} sAggregationName Aggregation to be used for insert operation
	 * @param {sap.ui.core.Control} oDraggedControl Control to be inserted
	 * @param {number} iIndex Describes the final position the control to be added or repositioned is to appear at. Use a zero based index.
	 */
	Widget.prototype.addAggregation = function(sAggregationName, oDraggedControl, iIndex) {
		sAggregationName = sAggregationName || this.oControl.getMetadata().getDefaultAggregationName();
		var oAggregationMetaData = this.oControl.getMetadata().getAllAggregations()[sAggregationName];

		// Adjust drop target if necessary
		var fnAdjustDropTarget = this.getAggregationsAdapterFunction(sAggregationName, "adjustDropTarget");
		if (fnAdjustDropTarget) {
			var oAdjustedDropTarget = fnAdjustDropTarget.call( this.oControl, oAggregationMetaData , oDraggedControl);
			if (oAdjustedDropTarget) {
			    var oDropTarget = { "control": this.oControl, "aggregation": oAggregationMetaData };
				if (!isSameControlAggregation( oDropTarget, oAdjustedDropTarget )) {
					return oAdjustedDropTarget.control.__widget.addAggregation( oAdjustedDropTarget.aggregation.name, oDraggedControl, iIndex );
				}
			}
		}

		// Check if control to be inserted or repositioned is already in the aggregation
		var bControlAlreadyInside = false;
		var oAggregationValue = aggregationGetter(this.oControl, oAggregationMetaData);
		if (oAggregationValue)  {
			var iControlIndex = oAggregationValue.indexOf(oDraggedControl);
			if (iControlIndex !== -1) {
				bControlAlreadyInside = true;
				// Nothing to do if control is already at the expected position
				if (iIndex === iControlIndex) { return; }
			}
		}

		// Insert at last position if index is not specified or -1
		if ( typeof iIndex === "undefined" || iIndex === -1) {
			iIndex = bControlAlreadyInside ? oAggregationValue.length - 1 : oAggregationValue.length;
		}

		// Log operation
		jQuery.sap.log.debug( "Add control [" + oDraggedControl.getId() + "] " +
							  (bControlAlreadyInside ? "(already inside) " : "(as a new entry) ") +
							  "at iIndex [" + iIndex + "]" ) +
							  "to aggregation [" + sAggregationName + "] " +
							  "of control [" + this.oControl.getId() + "] ";

		// Remove control first if already part of the collection
		if (bControlAlreadyInside) {
			jQuery.sap.log.debug( "Remove control [" + oDraggedControl + "] " +
								  "at index [" + iControlIndex + "] " +
								  "from aggregation [" + sAggregationName + "] " +
								  "of control [" + this.oControl.getId() + "]" );
			aggregationRemove.call(this.oControl, this.oControl, oAggregationMetaData).call(this.oControl, oDraggedControl);
		}

		// Insert control into aggregation
		jQuery.sap.log.debug( "Insert control [" + oDraggedControl +
							  "] into aggregation [" + sAggregationName +
							  "] of control [" + this.oControl.getId() + "]" );
		aggregationInsert.call(this.oControl, this.oControl, oAggregationMetaData).call(this.oControl, oDraggedControl, iIndex);

	};

	Widget.prototype.getEscapedId = function() {
		return this.oControl.getId().replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
	};

	Widget.prototype.getChildren = function() {
		var queue = this.oControl.findAggregatedObjects();
		var result = [];
		var bLoopUntilBreak = true;
		while (bLoopUntilBreak) {
			var oControl = queue.shift();
			if (!oControl) {
				break;
			}
			if (oControl.__widget) {
				result.push(oControl);
			} else {
				queue = queue.concat(oControl.findAggregatedObjects());
			}
		}
		return result;
	};

	function aggregationGetter(oControl, oAggregation) {
		var oResult = getAggregationMethod.call(oControl, oAggregation, [ "get" ]).call(oControl);
		// Some controls return only single contrls and not array.... Bad implementation??!?
		if (!jQuery.isArray(oResult)) {
			oResult = [ oResult ];
		}
		return oResult;
	}

	function aggregationInsert(oControl, oAggregation) {
		if (!oAggregation.multiple && oAggregation._sMutator) {
			return oControl[oAggregation._sMutator];
		} else {
			return getAggregationMethod.call(oControl, oAggregation, [ "insert", "set", "add" ]);
		}
	}

	function aggregationRemove(oControl, oAggregation) {
		if (oAggregation._sRemoveMutator) {
			return oControl[oAggregation._sRemoveMutator];
		} else {
			return getAggregationMethod.call(oControl, oAggregation, [ "_sRemoveMutator" ]);
		}
	}

	/*
	 * Provides the mutation method for the this control and aggregation.
	 */

	function getAggregationMethod(oAggregation, candidatePrefixes) {
		var method;
		var sCamelCaseName;
		if (oAggregation.multiple) {
			sCamelCaseName = nameToUpperCase(oAggregation.singularName);
		}
		var sCamelCasePluralName = nameToUpperCase(oAggregation.name);
		var sMethods = candidatePrefixes || [ "insert", "set", "add" ];
		for (var _i = 0; _i < sMethods.length; _i++) {
			method = this[sMethods[_i] + sCamelCasePluralName] ?
			         this[sMethods[_i] + sCamelCasePluralName] : this[sMethods[_i] + sCamelCaseName];
			if (method) {
				break;
			}
		}
		return method;
	}

	function nameToUpperCase(sName) {
		return sName.charAt(0).toUpperCase() + sName.slice(1);
	}

	/**
	 * Checks if control aggregation 1 is the same as control aggregation 2
	 * A control aggregation is a particular aggregation of a specific control.
	 * As the parameters are data transfer objects special rules are applied.
	 * @param  {dtoControlAggregation}  oControlAggregation1 data transfer object (dto) describing control aggregation 1
	 * @param  {dtoControlAggregation}  oControlAggregation2 dto for control aggregation 2
	 * @return {Boolean}
	 */
	function isSameControlAggregation( oControlAggregation1, oControlAggregation2 ) {
		// Return false if drop target 1 has not been fully specified
		var dropTarget1IsComplete = !!oControlAggregation1 && !!oControlAggregation1.control && !!oControlAggregation1.aggregation;
		if (!dropTarget1IsComplete) { return false; }

		// True if oControlAggregation2 has not been specified
		if (!oControlAggregation2) { return true; }

		// Check if control is the same
		if (oControlAggregation2.control) {
			if (oControlAggregation1.control !== oControlAggregation2.control) { return false; }
		}

		// Check aggregation name
		if (oControlAggregation2.aggregation) {
			if (oControlAggregation2.aggregation.name !== oControlAggregation1.aggregation.name ) { return false; }
		}

		return true;
	}

	return Widget;
}, /* bExport= */ true);