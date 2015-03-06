/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.PartsDragManager.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/DragManager',
	'sap/ui/dt/Widget'
],
function(jQuery, DragManager, Widget) {
	"use strict";

	/**
	 * Constructor for a new PartsDragManager.
	 *
	 * @param {sap.ui.core.Control} oControl The control to handle for drag and drop
	 * @param {sap.ui.dt.DesignTime} oDesignTime The design time object
	 *
	 * @class
	 * The PartsDragManager is responsible for D&D handling coming from the outside of the canvas, e.g. the Palette. 
	 * Instances are currently (TODO find better place) created in Wysiwyg.makeDraggable.
	 *
	 * @extends sap.ui.dt.PartsDragManager
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.PartsDragManager
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	var PartsDragManager = DragManager.extend("sap.ui.dt.PartsDragManager", /** @lends sap.ui.dt.PartsDragManager.prototype */ {
		constructor : function(oControl, oDesignTime) {
			this.oDesignTime = oDesignTime;
			this.oScope = oDesignTime.getScope();
			this.oWindow = this.oScope.getWindow();
			this.oEventBus = oDesignTime.oEventBus;
			this.oControl = oControl;
		},
		
		/*
		 * @private
		 */
		_createControlBasedOnDesignTimeAdapter : function(){
			var oControl = new this.oControl(this.oControl.getMetadata().__designTimeOptions.defaultSettings);

			if (!oControl) {
				jQuery.sap.log.error("An error occurred during widget construction");
				return;
			}

			var oBehaviour = this.oControl.getMetadata().__designTimeOptions.behavior;
			if (oBehaviour.constructor) {
				oBehaviour.constructor.call(oControl);
			}
			this.oControl = oControl;
			return oControl;
		},
		
		fnStart : function(evt, ui) {

			var oControl = this._createControlBasedOnDesignTimeAdapter();
            
            //has the side effect of adding the widget artefacts to the control
            /*eslint-disable no-unused-vars */
			var widget = new Widget(oControl, this.oDesignTime);
			/*eslint-enable no-unused-vars */
			this.oEventBus.publish("drag.started", {
				oControl : oControl
			});
            
            //TODO: all the following code seam to be only necessary for rendering the control as ghost, which is commented
			//START POTENTIAL GHOST HANDLING
			var oDragElementWrapper;
			if (!(oControl instanceof this.oWindow.sap.ui.core.Control)) {
				oDragElementWrapper = this.oWindow.sap.ui.dt.DragElementWrapper.create(oControl.getId());
			}
			
			if (oDragElementWrapper) {
				oDragElementWrapper.placeAt(this.oScope.getDropArea());
			} else {
				oControl.placeAt(this.oScope.getDropArea());
			}
			this.oScope.getCore().applyChanges();
			
			var domElement = oDragElementWrapper ? oDragElementWrapper.getDomRef() : oControl.getDomRef();

			if (!domElement) {
				domElement = jQuery("<div>Rendering fail</div>")[0];
			}

			//Make sure that the ghost has a non-null size. Otherwise chrome will cancel the drag
			var $domElement = jQuery(domElement);
			if ($domElement.width() === 0) {
				$domElement.width("1px");
				jQuery.sap.log.warning("Ghost for control " + oControl.getMetadata().getName() + " does not have a width set!");
			}
			if ($domElement.height() === 0) {
				$domElement.height("1px");
				jQuery.sap.log.warning("Ghost for control " + oControl.getMetadata().getName() + " does not have a height set!");
			}

/*			FIXME: The ghost created interrupts the drag operation of the sap.m.IconTabBar control 			
			var ghost = this._fnCreateGhost(domElement);
			evt.dataTransfer.setDragImage(ghost, 0, 0);
*/			

			jQuery(domElement).hide();
			//END POTENTIAL GHOST HANDLING
			
			// not related to ghost handling!!!!!!
			this.oScope.hideOverlayContainer();
			
/*			FIXME: see above - part 2
			setTimeout(function() {
				jQuery(ghost).remove();
			});
		},

		_fnCreateGhost : function(elem) {
			// getComputedStyleText :: DOMElement -> String
			function getComputedStyleText(elem) {
				var cssObj, cssTxt = "";

				cssObj = window.getComputedStyle(elem);

				for ( var key in cssObj) {
					var value = cssObj.getPropertyValue(cssObj[key]);
					if (value) {
						cssTxt += cssObj[key] + ":" + value + "; ";
					}
				}
				return cssTxt;
			}

			var clonedElement = elem.cloneNode(true);
			var originalChildren = elem.querySelectorAll('*');
			var children = clonedElement.querySelectorAll('*');

			[].forEach.call(children, function(child, i) {
				child.style.cssText = getComputedStyleText(originalChildren[i]);
			});
			clonedElement.style.cssText = getComputedStyleText(elem);

			//Needed otherwise Chrome will display no element...
			return document.body.appendChild(clonedElement);
*/			
		}
	});

	return PartsDragManager;
}, /* bExport= */ true);