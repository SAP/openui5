/*
 * ! ${copyright}
 */
// Provides control sap.ui.dt.MiniMenu.
/* globals sap */
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/unified/Menu', 'sap/ui/core/Control'
], function(jQuery, library, Menu, Control) {
    "use strict";

	/**
	 * Constructor for a new sap.ui.dt.MiniMenu control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class A simple MiniMenu.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
     * @experimental
	 * @alias sap.ui.dt.MiniMenu
	 */
	var MiniMenu = Control.extend('sap.ui.dt.MiniMenuControl', {

		metadata : {
			properties : {

                /**
                 * Defines the maximum number of buttons displayed in the non-expanded version of the control.
                 * If more than n buttons are added an overflow button will be displayed instead of the nth button (n = maxButtonsDisplayed).
                 */
                "maxButtonsDisplayed" : {type : "int", defaultValue : 4},
                /**
                 * Defines the buttons on the MiniMenu
                 * The objects should have the following properties:
                 * text - for the button text in the expanded verion and the tooltip in the non-expanded version
                 * icon - the url of the butons icon
                 * press - the function to call when the button is pressed
                 */
                "buttons" : {type : "object[]", defaultValue : []}
			}
        },

        /**
         * initializes the MiniMenu by adding a sap.m.Popover (with a sap.m.Flexbox as a content aggregation) as a Dependent of the MiniMenu
         */
        init : function () {
            this.attachBrowserEvent("contextmenu", this._onContextMenu, this);

            var oPopover = new sap.m.Popover({
                placement : "Auto",
                showHeader : false,
                verticalScrolling : false,
                horizontalScrolling : false,
                content : new sap.m.FlexBox({})
            });

            oPopover.addStyleClass("popover");
            oPopover.attachAfterClose(this._popupClosed, this);
            this.addDependent(oPopover);
        },

        exit : function(){
            this.detachBrowserEvent("contextmenu");
        },

        /**
	     * Opens the MiniMenu and sets the MiniMenu position by the oSource parameter.
	     * @param {sap.ui.core.Control} oSource - The control by which the Popover will be placed.
         * @public
	     */
        show : function(oSource) {
            // creates buttons specified in objects in property buttons
            var aButtons = this.getButtons();

            for (var i1 = this.getMaxButtonsDisplayed(); i1 < aButtons.length; i1++) {
                aButtons[i1].setVisible(false);
            }


            // hides the nth button if (n > number of buttons) and creates/displays the overflow button (n = maxButtonsDisplayed)
            if (this.getMaxButtonsDisplayed() < aButtons.length) {
                aButtons[this.getMaxButtonsDisplayed() - 1].setVisible(false);
                this.addButton(this._createOverflowButton());
                this.getButtons()[this.getMaxButtonsDisplayed() - 1].rerender();
            }

            // resets the look of the MiniMenu if it was expanded before hiding
            if (this.getDependents()[0].getContent()[0].getDirection() === "Column") {

                for (var i3 = 0; i3 < aButtons.length; i3++){
                    aButtons[i3]._bInOverflow = false;
                    aButtons[i3].rerender();
                }
            }

            this.getDependents()[0].openBy(oSource);
            this.getDependents()[0].setVisible(true);

            setTimeout(function (){
            //If the direction hasn't been updated properly (in Timeout, because it needs to be at the end of the Stack)
            if (this.getDependents()[0]){
            if (this.getDependents()[0].getContent()[0].getDirection() === "Column"){
                this.getDependents()[0].getContent()[0].setDirection("Row");
            }
            }}.bind(this),0);

            //Sets the Tooltips
            for (var i2 = 0; i2 < this.getMaxButtonsDisplayed() && i2 < aButtons.length; i2++) {
                if (typeof this.getProperty("buttons")[i2].text === "string"){
                    aButtons[i2].setTooltip(this.getProperty("buttons")[i2].text);
                } else if (typeof this.getProperty("buttons")[i2].text === "function") {
                    aButtons[i2].setTooltip(this.getProperty("buttons")[i2].text(oSource));
                }
            }

            //makes the Tooltips visible
            aButtons.forEach(function(_button){
                _button.rerender();
            });
        },

        /**
	     * Adds a button to the MiniMenu.
         * @param {Object} button the button to add
         * @param {sap.ui.dt.plugin.MiniMenu} oSource the source
         * @return {sap.m.MiniMenu} Reference to this in order to allow method chaining
         * @public
	     */
        addButton : function (button, oSource, oOverlay) {
            function handler() {
                oSource._onItemSelected(this);
            }

            if (oSource){
                if (typeof button.text === "string"){
                    this._oButton = new sap.m.OverflowToolbarButton({
                        icon: button.icon,
                        text: button.text,
                        type: "Transparent",
                        press: handler
                    });
                } else if (typeof button.text === "function"){
                    this._oButton = new sap.m.OverflowToolbarButton({
                        icon: button.icon,
                        text: button.text(oOverlay),
                        type: "Transparent",
                        press: handler
                    });
                }

                this._oButton.data({
                    id : button.id
                });
            } else {
                this._oButton = new sap.m.OverflowToolbarButton({
                    icon: button.icon,
                    text: button.text,
                    type: "Transparent",
                    press: button.handler
                });
            }
            var _tempProperty = this.getProperty("buttons");
            _tempProperty.push(button);
            this.setProperty("buttons", _tempProperty);
            this.getDependents()[0].getContent()[0].addItem(this._oButton);

            _tempProperty = null;
            return this;
        },

        /**
	     * Closes the MiniMenu.
         * @return {sap.m.MiniMenu} Reference to this in order to allow method chaining
         * @public
	     */
        close : function (){
            //deletes the overflow button
            var _tempProperty = this.getProperty("buttons");
            _tempProperty.pop();
            this.setProperty("buttons", _tempProperty);
            _tempProperty = null;

            this.getDependents()[0].getContent()[0].removeItem(this.getDependents()[0].getContent()[0].getItems().length - 1);
      //      this.getDependents()[0].close();

            this.getDependents()[0].close();
            return this;
        },

        /**
	     * Removes a button from the MiniMenu.
	     * @param {int} index the button to remove or its index or id
         * @return {sap.m.OverflowToolbarButton} The removed button or null
         * @public
	     */
        removeButton : function (index) {
            this.setProperty("buttons", this.getProperty("buttons").splice(index,1));

            return this.getDependents()[0].getContent()[0].removeItem(index);
        },

        /**
	     * Removes all buttons from the MiniMenu.
         * @return {sap.m.MiniMenu} Reference to this in order to allow method chaining
         * @return {sap.m.OverflowToolbarButton} An array of the removed buttons (might be empty)
         * @public
	     */
        removeAllButtons : function () {
            this.setProperty("buttons", []);
            return this.getDependents()[0].getContent()[0].removeAllItems();
        },

        /**
         * Gets all buttons of the MiniMenu.
         * @return {sap.m.OverflowToolbarButton[]} returns buttons
         * @public
	     */
        getButtons : function () {
            return this.getDependents()[0].getContent()[0].getItems();
        },

        /**
	     * Inserts a button to the MiniMenu.
         * @param {sap.m.OverflowToolbarButton} button the to insert
         * @param {int} index - the 0-based index the button should be inserted at
         * @return {sap.m.MiniMenu} Reference to this in order to allow method chaining
         * @public
	     */
        insertButton : function (button, index) {
            this.getDependents()[0].getContent()[0].insertItem(button, index);
            return this;
        },


        /**
	     * Sets the Buttons of the MiniMenu
         * @param {Object} _buttons the to insert
         * @param {sap.ui.dt.plugin.MiniMenu} oSource - the source
         * @public
	     */
        setButtons : function (_buttons, oSource, oOverlay){
            this.removeAllButtons();

            if (oOverlay){
                for (var i1 = 0; i1 < _buttons.length; i1++){
                    this.addButton(_buttons[i1], oSource, oOverlay);
                }
            } else {
                for (var i1 = 0; i1 < _buttons.length; i1++){
                    this.addButton(_buttons[i1], oSource);
                }
            }
        },

        /**
         * Sets the maximum amount of Buttons
         * @param {int} mBd the maximum amount of buttons to be displayed in the non-expanded version of the Mini-Menu
         * @public
	     */
        setMaxButtonsDisplayed : function (mBd) {
            if (mBd < 2) {
                throw Error("maxButtonsDisplayed can't be less than two!");
            }
            this.setProperty("maxButtonsDisplayed", mBd);
        },

        /**
         * Creates an overflow-button
         * @return {sap.m.OverflowToolbarButton} returns the newly created overflow-button
         * @private
	     */
        _createOverflowButton : function () {
            return {
                icon : "sap-icon://overflow",
                type : "Transparent",
                handler : this._onOverflowPress
            };
        },

        /**
         * Expands the MiniMenu
         * @param {jQuery.Event} evt the press event
         * @private
	     */
        _onOverflowPress : function (evt) {

            var oMiniMenu = this.getParent().getParent().getParent();
            var aButtons = oMiniMenu.getButtons();

            // gets the Popover-div
            this._popOverId = this.getParent().getParent().sId;
            this._popOverElement = jQuery("#" + this._popOverId);

            // removes all tooltips
            for (var i2 = 0; i2 < oMiniMenu.getMaxButtonsDisplayed(); i2++) {
                aButtons[i2].setTooltip("");
            }

            // makes the hidden buttons and their text visible
            aButtons.forEach(function(_button){
                _button.setVisible(true);
                _button._bInOverflow = true;
                _button.rerender();
            });

            // makes the overflow Button invisible
            aButtons[aButtons.length - 1].setVisible(false);

            // changes the layout of the FlexBox to vertical
            oMiniMenu.getDependents()[0].getContent()[0].setDirection("Column");

            //animates the opening of the context menu
            this._popOverElement.animate({                      //in order to do an expand animation, the menu has to been collapsed
                opacity: 0.25,
                height: "toggle"
              }, 0, function() {

              });

              this._popOverElement.animate(
                { opacity: 1,
                  height: "toggle" },
                {
                    duration: 'fast',
                    easing: 'swing',
                    complete: function() {
                    }

                });

        },

        /**
         * Triggered when MiniMenu is closed
         * needed to prevent flickering when opening up a MiniMenu
         * (A new Menu would show before the direction was set)
	     */
        _popupClosed : function(){
            this.getDependents()[0].getContent()[0].setDirection("Row");
        },

        renderer : function () {
        }
	});

	return MiniMenu;

}, /* bExport= */true);