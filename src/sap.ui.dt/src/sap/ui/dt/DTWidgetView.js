/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DTWidgetView.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/base/Object',
	'sap/ui/dt/DTWidgetPresenter',
	'sap/ui/dt/DragManager'
],

function(jQuery, BaseObject, DTWidgetPresenter, DragManager) {
	"use strict";

	/**
	 * Constructor for a new DTWidgetView.
	 *
	 * @param {sap.ui.core.Control} oControl The control which is associated with the widget
	 * @param {sap.ui.dt.Widget} oWidget The widget which is associated with widget view
	 *
	 * @class
	 * The DTWidgetView 
	 * <ul>
	 * <li> creates and provides methods for the Widget overlays (e.g. show selected, resizable, highlight)</li>
	 * <li> creates DTWidgetPresenter instance</li>
	 * <li> creates a DragManager instance for this control</li>
	 * </ul>
	 * 
	 * @extends sap.ui.base.BaseObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.DesignTime
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var DTWidgetView = BaseObject.extend("sap.ui.dt.DTWidgetView", /** @lends sap.ui.dt.DTWidgetView.prototype */ {

		constructor : function(oControl, oWidget) {
			// TODO _private Members
			this.oControl = oControl;

			this.eventBus = oWidget.eventBus;

			this._oWidget = oWidget;
			this.scope = oWidget.oScope;
			this.selectedClass = "sapUiDtControlOverlaySelected";
			this.presenter = new DTWidgetPresenter(this, oControl);
			this.oDragManager = new DragManager(this.scope, this.eventBus, this.oControl);

			this.bNeedDelegateFromParent = this._oWidget.getDesignTimeProperty("needDelegateFromParent");

			if (this.bNeedDelegateFromParent) {
				this.delegateFromParentIfNeeded();
			} else {
				// we must save the whole delegation object, because removeDelegate compars objects and not single delegations
				this.oDelegate = {
					onAfterRendering: this.onAfterControlRender
				};
				this.oControl.addDelegate(this.oDelegate, this);
			}
			//Needed for controls which do not rerender on property changes,
			//and something needs to be done onAfterRendering in the adapter.js
			this.oControl.attachEvent("_change", this._onControlChanged, this);

			this.onAfterControlRender();
			this.createOverlay();
		}
	});

	/*
	 * For Control/Element that does not have its own renderer, it needs to delegate its parent's onBefore/AfterRendering event
	 *  Also need to remove and add stored bind calls, so that event such as dragenter, etc are properly triggered.
	 *  Control/Element that make use of this delegateFromParentIfNeeded must make sure call to getDomRef return the correct DOM reference.
	 * */
	DTWidgetView.prototype.delegateFromParentIfNeeded = function() {
		if (this.bNeedDelegateFromParent) {
			var parent = this.oControl.getParent();
			if (parent) {
				this.bNeedDelegateFromParent = false;
				// we must save the whole delegation object, because removeDelegate compars objects and not single delegations
				this.oDelegationFromParent = {
					onBeforeRendering: this._onBeforeRenderingParent,
					onAfterRendering: this._onAfterRenderingParent
				};
				parent.addDelegate(this.oDelegationFromParent, this);
			}
		}
	};
	
	
	/*
	 * @private
	 */
	DTWidgetView.prototype._onBeforeRenderingParent = function(){
		var oControl = this.oControl;
		var aBindings = oControl.aBindParameters;
		if (aBindings && aBindings.length > 0) { // if we have stored bind calls...
			var jDomRef = oControl.$();
			if (jDomRef && jDomRef[0]) { // ...and we have a DomRef
				for (var i = 0; i < aBindings.length; i++) {
					var oParams = aBindings[i];
					jDomRef.unbind(oParams.sEventType, oParams.fnProxy);
				}
			}
		}
	};

	/*
	 * @private
	 */
	DTWidgetView.prototype._onAfterRenderingParent = function(){
		var oControl = this.oControl;
		// Re-bind any generically bound browser event handlers (must happen after restoring focus to avoid focus event)
		var aBindings = oControl.aBindParameters;
		if (aBindings && aBindings.length > 0) { // if we have stored bind calls...
			var jDomRef = oControl.$();
			if (jDomRef && jDomRef[0]) {
				for (var j = 0; j < aBindings.length; j++) {
					var oParams = aBindings[j];
					jDomRef.bind(oParams.sEventType, oParams.fnProxy);
				}
			}
		}
		this.onAfterControlRender();
	};
	
	/*
	 * @private
	 */
	DTWidgetView.prototype._onControlChanged = function(evt) {
		// TODO why is this needed? Control should always rerender / adapt dom, when a property has changed! This is error-prone as we can not rerender during rendering phase.
		var oControl = evt.oSource;
		var that = this;
		if (oControl && oControl.onAfterRendering) {
			clearTimeout(that._iControlNeedsRerenderTimeout);
			that._iControlNeedsRerenderTimeout = setTimeout(function() {
				oControl.rerender();
			});
		}
	};

	/*
	 * @protected
	 */
	DTWidgetView.prototype.onAfterControlRender = function() {
		if (this.oControl.getDomRef()
			&& (   this.oControl.$().hasClass('sapMFlexBox')
				|| this.oControl.$().hasClass('sapUiVlt')
				|| this.oControl.$().hasClass('sapUiHLayout')) ) {

			if (this.oControl.findAggregatedObjects().length === 0 ||
					this.oControl.findAggregatedObjects().length === 1 && this.oControl.findAggregatedObjects()[0].sParentAggregationName === "layoutData") {

				this.oControl.$().addClass("sapUiDtEmptyContainer");
				this.oControl.$().addClass("sapUiDtEmptyBackground");
				//TODO: remove this in future, must be handled by mutation observer
				this.eventBus.publish("dom.changed");
			}
		}
		this.presenter.attachContentDragEvents();
		this.fixOverlaySize();
	};

	/*
	 * @private
	 */
	DTWidgetView.prototype._gatherChildOverlays = function() {

		var children = this.oControl.__widget.getChildren();
		var that = this;
		var overlayContainer = this.getOverlayContainer();

		children.forEach(function(oChild) {

			var $childOverlay = jQuery('#overlay-container [data-overlay-id="' + oChild.__widget.getEscapedId() + '"]', that.scope.getDocument().body);
			if (overlayContainer.has($childOverlay).length && !that.$overlayElement.has($childOverlay).length) {

				jQuery.sap.log.info("gathering child [" + oChild.__widget.getEscapedId() + "] of " + that.oControl.__widget.getEscapedId());
				$childOverlay.appendTo(that.$overlayElement);
			}
		});
	};


	DTWidgetView.prototype.getOverlayContainer = function() {

		var overlayContainer = jQuery(this.scope.getElementById("overlay-container"));
		if (!overlayContainer.length) {
			overlayContainer = jQuery("<div id='overlay-container'></div>").appendTo(this.scope.getBodyElement());
		}
		return overlayContainer;
	};
	
	DTWidgetView.prototype.createOverlay = function() {
		// We don't want to create overlays for filtered controls
		if (this.oControl.__widget.isFiltered()) {
			return;
		}
		var that = this;
		var oResizable;

		if (this.$overlayElement) {
			this.fixOverlaySize();
			return; //TODO: return the existing overlay.
		}

		function onClick(evt, data) {
			var realEvent = window._uiTestEvent || evt || data;
			// Check if doesn't have unsupported ancestor (otherwise just skip it)
			// Prevent clicking on the top most overlay 
			if (evt.currentTarget.id == "overlay-container") {
				realEvent.stopPropagation();
				return;
			}
			var $parent = jQuery(evt.currentTarget).parent();
			if (!$parent.closest(".sapUiDtControlOverlayForUnsupportedControl").length && !$parent.closest(".controlOverlayForTemplates").length) {
			// Fixing click after resize
				if (!realEvent.target.classList.contains("ui-resizable-handle")) {
					realEvent.stopPropagation();
					that.presenter.select(realEvent.ctrlKey || realEvent.metaKey, false, true);
				}
			}
		}

		function resizePreparation(sCssResizeCursor) {
			var oDoc = that.scope.getWindow().document;
			var overlayContainer = oDoc.getElementById("overlay-container");
			//add a click handler to the overlay-container so that the user wont accidentally click on another control
			//right after the resize is finished. So the selected control will stay the resized control
			overlayContainer.addEventListener("click", onClick, true);
			overlayContainer.style.width = "100%";
			overlayContainer.style.height = "100%";

			that.$overlayElement.css("cursor", sCssResizeCursor);
			that.$overlayElement.parent().css("cursor", sCssResizeCursor);
		}

		function resizeCleanup() {
			var oDoc = that.scope.getWindow().document;
			var overlayContainer = oDoc.getElementById("overlay-container");
			overlayContainer.removeEventListener("click", onClick, true);
			overlayContainer.style.width = "";
			overlayContainer.style.height = "";

			that.$overlayElement.css("cursor", "");
			that.$overlayElement.parent().css("cursor", "");
		}

		jQuery.sap.log.warning("Creating overlay for control " + that.oControl.__widget.getEscapedId());
		this.$overlayElement = jQuery('<div class="sapUiDtControlOverlay"></div>').attr("data-overlay-id", this.oControl.getId());

		var bNestedView = false;
		if (this.oControl.getMetadata()._sClassName == "sap.ui.core.mvc.XMLView" && 
				this.oControl.getParent() && this.oControl.getParent().getMetadata()._sClassName !== "sap.ui.core.UIArea") {
			bNestedView = true;
		}
		
		// creating special overlay for unsupported controls
		var $badge;
		if (this.oControl.getMetadata().__designTimeOptions.unsupported || bNestedView) {
			this.$overlayElement.addClass("sapUiDtControlOverlayForUnsupportedControl");
			$badge = jQuery("<div class='sapUiDtControlOverlayBadge'>unsupported</div>");
			this.$overlayElement.append($badge);
		}

		if (this.oControl.__widget.hasBoundAggregations) {
			this.$overlayElement.addClass("controlOverlayForTemplateParents");
			$badge = jQuery("<div class='sapUiDtControlOverlayBadge'>template</div>");
			this.$overlayElement.append($badge);
		}

		if (this.oControl.__widget.isTemplate) {
			this.$overlayElement.addClass("controlOverlayForTemplates");
		}

		this.$overlayElement[0].addEventListener("click", onClick, false);


		function helperSetter(sName, oLayoutData, ui) {
			var fResizeOption = oLayoutData.getMetadata().__designTimeOptions.behavior.resize[sName];
			if (fResizeOption) {
				that.scope.jQuery(this).resizable("option", sName, fResizeOption.call(that.oControl, ui));
			}
		}

		function startHandler(evt, ui) {
			var oLayoutData = that.oControl.getLayoutData() || getHiddenLayoutData(that.oControl);
			var sCssResizeCursor = jQuery(evt.toElement).css("cursor");
			resizePreparation(sCssResizeCursor);

			if (oLayoutData && oLayoutData.getMetadata().__designTimeOptions) {
				if (oLayoutData.getMetadata().__designTimeOptions.behavior.resize.start) {
					oLayoutData.getMetadata().__designTimeOptions.behavior.resize.start.call(that.oControl, ui);
				}
				helperSetter.call(this, "grid", oLayoutData, ui);
				helperSetter.call(this, "minWidth", oLayoutData, ui);
				helperSetter.call(this, "minHeight", oLayoutData, ui);
				helperSetter.call(this, "maxWidth", oLayoutData, ui);
				helperSetter.call(this, "maxHeight", oLayoutData, ui);
			}
		}

		function getHiddenLayoutData(oControl) {
			var oLayoutData;
			var oParent = oControl.getParent();
			if (oParent.__widget) {
				var oParentLayoutDataFactory = oParent.__widget.getLayoutDataFactory(oControl.sParentAggregationName);
				var oParentLayoutData = oParentLayoutDataFactory && oParentLayoutDataFactory();
				var oLayoutData = oControl._layoutData && oParentLayoutData && (oControl._layoutData[oParentLayoutData.getMetadata().getName()] || oParentLayoutData);
				if (oLayoutData) {
					oControl.setLayoutData(oLayoutData);
				}
			}
			return oLayoutData;
		}


		function stopHandler(evt, ui) {
			
			var oLayoutData = that.oControl.getLayoutData() || getHiddenLayoutData(that.oControl);
			var fStop = oLayoutData ? oLayoutData.getMetadata() : undefined;
			fStop = fStop ? fStop.__designTimeOptions : undefined;
			fStop = fStop ? fStop.behavior : undefined;
			fStop = fStop ? fStop.resize : undefined;
			fStop = fStop ? fStop.stop : undefined;
			
			if (fStop) {
				fStop.call(that.oControl, ui);
				//Normal behaviour
			} else {
				if (oResizable.width) {
					that.oControl.setWidth(ui.size.width + "px");
				}
				if (oResizable.height) {
					that.oControl.setHeight(ui.size.height + "px");
				}
			}

			that.eventBus.publish("control.resized", {
				oControl: that.oControl
			});
			//needed if some controls rerender after resizing: eg icon control
			that.fixOverlaySize();
			//remove the handler of the container
			setTimeout(function() {
				resizeCleanup();
			},10);

		}

		this.moveOverLayToParent();
		if (this.presenter.selected) {
			this.onSelect();
		}

		if (this.oControl.__widget.isResizable()) {
			// TODO change __widget.getResizableOptions!!!!!
			oResizable = this.oControl.__widget.getResizableOptions();
			var handlesList = "";
			if (oResizable.width && oResizable.height) {
				handlesList = "all";
			} else if (oResizable.width) {
				handlesList = "e, w";
			} else if (oResizable.height) {
				handlesList = "n, s";
			}
			//var element = this.oControl.getDomRef().parentNode;
			this.scope.jQuery(this.$overlayElement).resizable({
				handles: handlesList,
				stop: stopHandler,
				grid: null,
				start: startHandler,
				minWidth: 48,
				minHeight: 48,
				maxWidth: null,
				maxHeight: null

				// TODO ask Core team for max/max Width/Height for every control
				//,
				//maxWidth: element && element.offsetWidth,
				//maxHeight: element && element.offsetHeight
			});
			this.hideResizable();
		}
		this.fixOverlaySize();
		
		if (this.oControl.getMetadata().__designTimeOptions.aggregations && !this.$scrollContainerOverlay) {
			var that = this;
			var oAggregations = this.oControl.getMetadata().__designTimeOptions.aggregations;
			
			Object.keys(oAggregations).forEach(function(key) {
				var $scrollContainer = jQuery(that.oControl.__widget.getCSSElement(oAggregations[key]));
				if ($scrollContainer.css("overflow") == "auto" || $scrollContainer.css("overflow") == "scroll") {
					that.createScrollContainer(oAggregations[key], key);
				}
				return;
			});
		}
		return this.$overlayElement;

	};
	
	
	
	DTWidgetView.prototype.createScrollContainer = function(oCSSSelector, sKey) {
		var that = this;
		var oCSSSelector = oCSSSelector;
		
		this.$scrollContainerOverlay = jQuery('<div class="scrollContainerOverlay"></div>').attr("data-scroll-id", this.oControl.getId()).attr("data-container", sKey);
		this.$scrollDummy = jQuery('<div class="dummyScroller"></div>').attr("data-scroll-dummy-id", this.oControl.getId()).attr("data-container", sKey);
		
		this.$scrollContainerOverlay[0].addEventListener("scroll", function(oEvent) {
			jQuery(that.oControl.__widget.getCSSElement(oCSSSelector)).scrollTop(that.$scrollContainerOverlay.scrollTop());
		}, true);

		this.$scrollDummy.appendTo(this.$scrollContainerOverlay);
		this.$scrollContainerOverlay.appendTo(this.$overlayElement);
		
		this.updateScrollContainers();
	};
	
	DTWidgetView.prototype.updateScrollContainers = function() {
		if (!this.$overlayElement) {
			return;
		}
		var $aScrollContainer = this.$overlayElement.find(".scrollContainerOverlay[data-scroll-id='" + this.oControl.getId() + "']");
		
		if ($aScrollContainer.length == 0) {
			return;
		}
		
		var oScrollContainers = this.oControl.getMetadata().__designTimeOptions.aggregations;
		
		for (var i = 0; i < $aScrollContainer.length; i++) {
			var $oContainer = jQuery($aScrollContainer[i]);
			var $oDummy = $oContainer.find(".dummyScroller[data-scroll-dummy-id='" + this.oControl.getId() + "']");
			
			var sContainer = $oContainer.attr("data-container");
			var $scrollContainer = jQuery(this.oControl.__widget.getCSSElement(oScrollContainers[sContainer]));
			
			if ($scrollContainer.length == 0) {
				continue;
			}
			
			this._adaptScrollContainerStyles($oContainer, $scrollContainer);
			this._adaptScrollContainerStyles($oDummy, $scrollContainer);
		}
	};
	
	/*
	 * @private
	 */
	DTWidgetView.prototype._adaptScrollContainerStyles = function($oScrollContainer, $oDesignTimeScrollableContainer) {
		var bDummyScroller = $oScrollContainer.hasClass("dummyScroller");
		var oScrollableContainerOffsetFromParent = $oDesignTimeScrollableContainer.position() ? $oDesignTimeScrollableContainer.position() : {top: 0, left: 0};
		
		$oScrollContainer.scrollTop($oDesignTimeScrollableContainer.scrollTop());
		
		var iHeight = bDummyScroller ? $oDesignTimeScrollableContainer[0].scrollHeight : $oDesignTimeScrollableContainer.outerHeight();
		var iWidth = bDummyScroller ? $oDesignTimeScrollableContainer[0].scrollWidth : $oDesignTimeScrollableContainer.outerWidth();
		var sOverflow = bDummyScroller ? "hidden" : "auto";
		var iTop = bDummyScroller ? 0 : oScrollableContainerOffsetFromParent.top;
		var iLeft = bDummyScroller ? 0 : oScrollableContainerOffsetFromParent.left;
		$oScrollContainer.css({
			height: iHeight,
			width : iWidth,
			top : iTop,
			left : iLeft,
			position: "absolute",
			"overflow-x" : "hidden",
			"overflow-y": sOverflow
		});
	};

	DTWidgetView.prototype.moveOverLayToParent = function() {
		var parent = this.presenter._getFirstSelectableParent(this.presenter.oControl);
		var overlayContainer = this.getOverlayContainer();
		var parentId = parent && parent.__widget.getEscapedId();
		
		var parentOverlay = parentId ? overlayContainer.find("[data-overlay-id='" + parentId + "']") : overlayContainer;
		
		var scrollContainer = overlayContainer.find("[data-scroll-dummy-id='" + parentId + "'][data-container='" + this.oControl.sParentAggregationName + "']");
		if (scrollContainer.length !== 0) {
			parentOverlay = scrollContainer;
		}

		jQuery.sap.log.info("createOverlay: " + this.oControl.__widget.getEscapedId() + " parent: " + parentId);

		if (!parentOverlay.length) {
			jQuery.sap.log.info("parent is not present");
			//TODO: check why this happens
			//parentOverlay = overlayContainer;
		}
		if (this.$overlayElement.parent()[0] !== parentOverlay[0]) {
			//TODO: check why this is needed
			if (parentOverlay.find("> [data-overlay-id='" + this.$overlayElement.attr("data-overlay-id") + "']").length == 0){
				this.$overlayElement.appendTo(parentOverlay);
			}
		}
		this._gatherChildOverlays();
	};

	DTWidgetView.prototype.getWidget = function() {
		return this._oWidget;
	};

	DTWidgetView.prototype.destroy = function(oData) {
		var bNeedDelegateFromParent = this._oWidget.getDesignTimeProperty("needDelegateFromParent");
		if (bNeedDelegateFromParent){
			var oParent = this.oControl.getParent();
			oParent.removeDelegate(this.oDelegationFromParent, this);
		} else {
			this.oControl.removeDelegate(this.oDelegate, this);
		}
		
		clearTimeout(this._iControlNeedsRerenderTimeout);
	
		this.oControl.detachEvent("_change", this._onControlChanged, this);
		
		this.presenter.destroy(oData);
		delete this.presenter;

		this.removeOverlay();
		delete this.oControl;
		delete this.eventBus;
		delete this._oWidget;
		delete this.scope;
		delete this.selectedClass;
		delete this.needDelegateFromParent;
		// TODO destroy drag manager
		delete this.oDragManager;

	};

	DTWidgetView.prototype.removeOverlay = function() {
		if (this.$overlayElement) {
			jQuery.sap.log.info("removeOverlay: " + this.oControl.__widget.getEscapedId());
			this.$overlayElement.remove();
			delete this.$overlayElement;
			this.destroyOverlayContainerIfNeeded();
		}
	};

	// if the container has no overlays it will be destroyed
	DTWidgetView.prototype.destroyOverlayContainerIfNeeded = function() {
		var $overlayContainer = jQuery(this.scope.getElementById("overlay-container"));
		if ($overlayContainer.length) {
			var bNoOverlays = $overlayContainer.find(".sapUiDtControlOverlay").length === 0;
			if (bNoOverlays) {
				$overlayContainer.remove();
			}
		}
	};

	DTWidgetView.prototype.getOverlay = function() {
		if (this.$overlayElement) {
			return this.$overlayElement;
		} else if (this.oControl.__widget.isSelectable()) {
			return this.createOverlay();
		}
	};

	DTWidgetView.prototype.showOverlay = function() {
		if (this.$overlayElement) {
			this.$overlayElement.show();
			if (this.presenter.selected) {
				this.showResizable();
			} else {
				this.hideResizable();
			}
		}
	};

	DTWidgetView.prototype.hideOverlay = function() {
		if (this.$overlayElement) {
			this.$overlayElement.hide();
			this.presenter.deselect();
		}
	};

	DTWidgetView.prototype.showResizable = function() {
		this.getOverlay().children(".ui-resizable-handle").show();
	};

	DTWidgetView.prototype.hideResizable = function() {
		this.getOverlay().children(".ui-resizable-handle").hide();
	};

	DTWidgetView.prototype.highlight = function() {
		this.getOverlay().addClass("sapUiDtWidget-overlay-highlighted");
	};

	DTWidgetView.prototype.downplay = function() {
		this.getOverlay().removeClass("sapUiDtWidget-overlay-highlighted");
	};

	DTWidgetView.prototype.onSelect = function() {
		jQuery.sap.log.info("add selected class: " + this.oControl.__widget.getEscapedId());
		this.delegateFromParentIfNeeded();
		this.getOverlay().addClass(this.selectedClass);
		this.showResizable();
	};

	DTWidgetView.prototype.onDeselect = function() {
		this.getOverlay().removeClass(this.selectedClass);
		this.hideResizable();
	};

	/*
	 * @private
	 */
	DTWidgetView.prototype._getOverlayZIndex = function($elem, $parent) {
		// parsing, because .zIndex() throws an error in iframe here... (document !== document)
		var getZIndex = function($el) {
			return parseInt($el.css("z-index"), 10) || 0;
		};
		
		if ($parent.length) {
			var zIndex = 0;

			var $curElement = $elem;
			while ($curElement.length && !$curElement.is("html") && $curElement[0] !== $parent[0]) {
				$curElement = $curElement.parent();
				zIndex += getZIndex($curElement);
			}

			return zIndex;
		}
	};

	DTWidgetView.prototype.fixOverlaySize = function() {
		var $elem = this.oControl.$();
		
		this.updateScrollContainers();
		
		if (!$elem[0] || !this.$overlayElement) {
			// Hide overlay of control without DOM element
			if ( this.$overlayElement && this.$overlayElement.is(":visible") ) {
				this.hideOverlay();
			}
			return;
		}
		if (this.$overlayElement.css("visibility") == "hidden") {
			return;
		}

		if ($elem.is(":visible")) {
			// DO NOT USE jQuery's outerHeight / outerWidget

			var parent = this.presenter._getFirstSelectableParent(this.oControl);

			var offset = $elem.offset();
			var zIndex = 0;

			if (parent && parent.$()) {
				this.moveOverLayToParent();
				var parentOffset = null;
				var $parrentOverlay = this.$overlayElement.parent();
				if ($parrentOverlay.hasClass("sapUiDtControlOverlay")) {
					parentOffset = this.$overlayElement.parent().offset();
				} else {
					parentOffset = this.$overlayElement.closest(".scrollContainerOverlay").offset();
					parentOffset.top -= this.$overlayElement.closest(".scrollContainerOverlay").scrollTop();
					parentOffset.left -= this.$overlayElement.closest(".scrollContainerOverlay").scrollLeft();
				}
				if (parentOffset) {
					offset.left -= parentOffset.left;
					offset.top -= parentOffset.top;
				}

				zIndex = this._getOverlayZIndex($elem, parent.$());

			}
			// Weird height and width
			var width = $elem[0].offsetWidth;
			var height = $elem[0].offsetHeight;

			this.$overlayElement.css({
				"position": "absolute",
				"left": offset.left,
				"top": offset.top,
				height: height,
				width: width,
				"zIndex" : zIndex || $elem.css("z-index")
			});
			this.showOverlay();
			this.presenter.setDraggable(this.oControl.__widget.isDraggable(this.presenter._getParentSelection().selectedParents.length));
		} else {
			this.hideOverlay();
		}
		
	};

	// TDOD check if the element is in the View box
	DTWidgetView.prototype.isVisible = function() {
		var $control = this.oControl.$();
		if ($control) {
			return $control.css('visibility') !== 'hidden';
		}
		return false;
	};

	return DTWidgetView;
}, /* bExport= */ true);