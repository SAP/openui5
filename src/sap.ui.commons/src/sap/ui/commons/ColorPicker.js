/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.ColorPicker.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";



	/**
	 * Constructor for a new ColorPicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control gives the user the opportunity to choose a color. The color can be defined using HEX-, RGB- or HSV-values or a CSS colorname.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38.
	 * @alias sap.ui.commons.ColorPicker
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColorPicker = Control.extend("sap.ui.commons.ColorPicker", /** @lends sap.ui.commons.ColorPicker.prototype */ { metadata : {

		library : "sap.ui.commons",
		properties : {

			/**
			 * This is the import-parameter of the ColorPicker.
			 * As input-parameter, it can be a Hexadecimal string (#FFFFFF), a RGB-string rgb(255,255,255), a HSV-string hsv(360,100,100) or a CSS-colorname 'red'.
			 * As output-parameter it is a RGB-string containing the current color.
			 */
			colorString : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Determines the mode the ColorPicker works with - Hue Saturation and Value (HSV) or Hue Saturation and Lightness (HSL)
			 * @since 1.38.1
			 */
			mode : {type : "sap.ui.commons.ColorPickerMode", group : "Appearance", defaultValue : sap.ui.commons.ColorPickerMode.HSV}
		},
		events : {

			/**
			 * Value was changed. This event is fired if the value has changed by an user action.
			 */
			change : {
				parameters : {

					/**
					 * Parameter containing the RED value (0-255)
					 */
					r : {type : "int"},

					/**
					 * Parameter containing the GREEN value (0-255)
					 */
					g : {type : "int"},

					/**
					 * Parameter containing the BLUE value (0-255)
					 */
					b : {type : "int"},

					/**
					 * Parameter containing the HUE value (0-360)
					 */
					h : {type : "int"},

					/**
					 * Parameter containing the SATURATION value (0-100)
					 */
					s : {type : "int"},

					/**
					 * Parameter containing the VALUE value (0-100)
					 */
					v : {type : "int"},

					/**
					 * Parameter containing the LIGHTNESS value (0-100)
					 */
					l : {type : "int"},

					/**
					 * Parameter containing the Hexadecimal string (#FFFFFF)
					 */
					hex : {type : "string"},

					/**
					 * Parameter containing the alpha value (transparency)
					 */
					alpha : {type : "string"}
				}
			},

			/**
			 * Value was changed. This event is fired during the mouse move. The normal change event ist only fired by mouseup.
			 */
			liveChange : {
				parameters : {

					/**
					 * Parameter containing the RED value (0-255)
					 */
					r : {type : "int"},

					/**
					 * Parameter containing the GREEN value (0-255)
					 */
					g : {type : "int"},

					/**
					 * Parameter containing the BLUE value (0-255)
					 */
					b : {type : "int"},

					/**
					 * Parameter containing the HUE value (0-360)
					 */
					h : {type : "int"},

					/**
					 * Parameter containing the SATURATION value (0-100)
					 */
					s : {type : "int"},

					/**
					 * Parameter containing the VALUE value (0-100)
					 */
					v : {type : "int"},

					/**
					 * Parameter containing the LIGHTNESS value (0-100)
					 */
					l : {type : "int"},

					/**
					 * Parameter containing the Hexadecimal string (#FFFFFF)
					 */
					hex : {type : "string"},

					/**
					 * Parameter containing the alpha value (transparency)
					 */
					alpha : {type : "string"}
				}
			}
		}
	}});

	// variable that will be used for browser specific prefix of the slider background gradient
	// it is set in the init function and is used inside _updateAlphaBackground() function
	var sBrowserPrefix = "";
	// get the background image of the slider
	var sBgSrc = sap.ui.resource('sap.ui.commons', 'img/ColorPicker/Alphaslider_BG.png');

	/**
	 * Initialization hook... creating composite parts
	 */
	ColorPicker.prototype.init = function() {
		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");

		// set gradient prefix depending of the browser
		if (sap.ui.Device.browser.firefox) {
			sBrowserPrefix = "-moz-linear-gradient";
		} else if (sap.ui.Device.browser.msie) {
			sBrowserPrefix = "-ms-linear-gradient";
		} else if (sap.ui.Device.browser.webkit) {
			sBrowserPrefix = "-webkit-linear-gradient";
		} else {
			sBrowserPrefix = "linear-gradient";
		}

		//	declare global variable for the ColorObject
		this.Color = {
				r   :  255,
				g   :  255,
				b   :  255,
				h   :  0,
				s   :  0,
				l   :  100,
				v   :  100,
				a   :  1,
				a_old: 1,
				hex :  "#ffffff",
				old :  "#ffffff"
		};

		//	create global variables
		this.HexString = "ffffff";
		this.rgbString = "";
		this.$cpBox = null;
		this.$cpCur = null;
		this.RGB = {
				r : 0,
				g : 0,
				b : 0
		};

		//	check if we are in RTL mode
		this.bRtl  = sap.ui.getCore().getConfiguration().getRTL();

		//	create Matrix layout (outer control)
		this.oMatrix = new sap.ui.commons.layout.MatrixLayout({
			layoutFixed : true,
			columns : 3,
			width : "270px",
			widths : [ "117px", "84px", "69px"]
		});
		this.oMatrix.setParent(this);
		this.oMatrix.addStyleClass("sapUiColorPicker-ColorPickerMatrix");

		//	HTML-Control containing the ColorPickerBox
		var cpBoxID = this.getId() + '-cpBox';
		var cpCurID = this.getId() + '-cpCur';
		this.oHtmlBox = new sap.ui.core.HTML({
			content : "<div id=" + cpBoxID + " class='sapUiColorPicker-ColorPickerBox' style='width: 105px; height: 105px;'><div id=" + cpCurID + " class='sapUiColorPicker-ColorPickerCircle' style='width: 5px; height: 5px;'></div></div>"
		});

		//	HTML-Control containing the Old Color Box
		var ocBoxID = this.getId() + '-ocBox';
		this.oHtmlOldCol = new sap.ui.core.HTML({
			content : "<div id=" + ocBoxID + " class=sapUiColorPicker-ColorPickerOldColor></div>"
		});

		//	HTML-Control containing the New Color Box
		var ncBoxID = this.getId() + '-ncBox';
		this.oHtmlNewCol = new sap.ui.core.HTML({
			content : "<div id=" + ncBoxID + " class=sapUiColorPicker-ColorPickerNewColor></div>"
		});

		this.oArrow = new sap.ui.core.Icon({
			color: "#333",
			backgroundColor: "transparent",
			src: "sap-icon://arrow-right",
			tooltip: oRb.getText("COLORPICKER_NEW_OLD_COLOR")
		}).addStyleClass("sapUiColorPicker-Arrow");

		//	label and input field for Hexadecimal value
		var inpID = this.getId() + '-hxF';
		var hexValue = this.Color.hex.substr(1);
		this.oHexField = new sap.ui.commons.TextField({id: inpID, value : hexValue});
		this.oHexLabel = new sap.ui.commons.Label();
		this._createValueLabelBox(this.oHexField, this.oHexLabel, "COLORPICKER_HEX", "#:", "sapUiColorPicker-ColorPickerHexField");

		//	label and input field for Red Value
		inpID = this.getId() + '-rF';
		this.oRedField = new sap.ui.commons.TextField({id: inpID, value : this.Color.r, width:"3em"});
		this.oRedLabel = new sap.ui.commons.Label();
		this._createValueLabelBox(this.oRedField, this.oRedLabel, "COLORPICKER_RED", "R:", "sapUiColorPicker-ColorPickerInputFieldsLeft");

		//	label and input field for Green Value
		inpID = this.getId() + '-gF';
		this.oGreenField = new sap.ui.commons.TextField({id: inpID, value : this.Color.g, width:"3em"});
		this.oGreenLabel = new sap.ui.commons.Label();
		this._createValueLabelBox(this.oGreenField, this.oGreenLabel, "COLORPICKER_GREEN", "G:", "sapUiColorPicker-ColorPickerInputFieldsLeft");

		//	label and input field for Blue Value
		inpID = this.getId() + '-bF';
		this.oBlueField = new sap.ui.commons.TextField({id: inpID, value : this.Color.b, width:"3em"});
		this.oBlueLabel = new sap.ui.commons.Label();
		this._createValueLabelBox(this.oBlueField, this.oBlueLabel, "COLORPICKER_BLUE", "B:", "sapUiColorPicker-ColorPickerInputFieldsLeft");

		//	label and input field for Hue Value
		inpID = this.getId() + '-hF';
		this.oHueField = new sap.ui.commons.TextField({id: inpID, value : this.Color.h, width:"3em"});
		this.oHueLabel = new sap.ui.commons.Label();
		this._createValueLabelBox(this.oHueField, this.oHueLabel, "COLORPICKER_HUE", "H:", "sapUiColorPicker-ColorPickerInputFieldsRight");

		//	label and input field for Saturation Value
		inpID = this.getId() + '-sF';
		this.oSatField = new sap.ui.commons.TextField({id: inpID, value : this.Color.s, width:"3em"});
		this.oSatLabel = new sap.ui.commons.Label();
		this.oSatUnits = new sap.ui.commons.Label({text:"%"});
		this._createValueLabelBox(this.oSatField, this.oSatLabel, "COLORPICKER_SAT", "S:", "sapUiColorPicker-ColorPickerInputFieldsRight",this.oSatUnits);

		// label and input field for Lightness
		inpID = this.getId() + '-lF';
		this.oLitField = new sap.ui.commons.TextField({id: inpID, value : this.Color.l, width:"3em"});
		this.oLitLabel = new sap.ui.commons.Label();
		this.oLitUnits = new sap.ui.commons.Label({text:"%"});
		this._createValueLabelBox(this.oLitField, this.oLitLabel, "COLORPICKER_LIGHTNESS", "L:", "sapUiColorPicker-ColorPickerInputFieldsRight",this.oLitUnits);

		// label and input field for Alpha
		inpID = this.getId() + '-aF';
		this.oAlphaField = new sap.ui.commons.TextField({id: inpID, value : this.Color.a, width:"3em"});
		this.oAlphaLabel = new sap.ui.commons.Label();
		this._createValueLabelBox(this.oAlphaField, this.oAlphaLabel, "COLORPICKER_ALPHA", "A:", "sapUiColorPicker-ColorPickerInputFieldsRight");

		// label and input field for Value
		inpID = this.getId() + '-vF';
		this.oValField = new sap.ui.commons.TextField({id: inpID, value : this.Color.v, width:"3em"});
		this.oValLabel = new sap.ui.commons.Label();
		this._createValueLabelBox(this.oValField, this.oValLabel, "COLORPICKER_VALUE", "V:", "sapUiColorPicker-ColorPickerInputFieldsRight");

		// slider
		inpID = this.getId() + '-hSLD';
		this.oSlider = new sap.ui.commons.Slider({
			id: inpID,
			max: 360,
			value: (parseInt(this.oHueField.getValue(), 10),10),
			smallStepWidth: 1,
			tooltip: oRb.getText("COLORPICKER_HUE")
		});
		this.oSlider.addStyleClass("sapUiColorPicker-ColorPickerSlider");

		// alpha slider
		inpID = this.getId() + '-aSLD';
		this.oAlphaSlider = new sap.ui.commons.Slider({
			id: inpID,
			max: 1,
			value: 1,
			smallStepWidth: 0.01,
			tooltip: oRb.getText("COLORPICKER_ALPHA")
		});
		this.oAlphaSlider.addStyleClass("sapUiColorPicker-ColorPickerAlphaSlider");

		// RGB/HSL output
		this.oRGBorHSLRBGroup = new sap.ui.commons.RadioButtonGroup({
			columns: 2,
			items: [
				new sap.ui.core.Item({
					text: "RGB"
				}),
				new sap.ui.core.Item({
					text: "HSL"
				})
			],
			selectedIndex: (this.Color.formatHSL ? 1 : 0 )
		});
		this.oRGBorHSLRBGroup.addStyleClass("sapUiColorPickerHSL-RB");

		this.oRGBorHSLLabel = new sap.ui.commons.Label({ text: "Output:", labelFor: this.oRGBorHSLRBGroup});

		// 1.Horizontal Layout containing Red field
		this.oHLayout1 = new sap.ui.layout.HorizontalLayout({
			content: [this.oRedLabel, this.oRedField]
		});

		// 2.Horizontal Layout containing Green field
		this.oHLayout2 = new sap.ui.layout.HorizontalLayout({
			content: [this.oGreenLabel, this.oGreenField]
		});

		// 3.Horizontal Layout containing Blue field
		this.oHLayout3 = new sap.ui.layout.HorizontalLayout({
			content: [this.oBlueLabel, this.oBlueField]
		});

		// 4.Horizontal Layout containing Hex field
		this.oHLayout4 = new sap.ui.layout.HorizontalLayout({
			content: [this.oHexLabel, this.oHexField]
		});

		// 5.Horizontal Layout containing Hue field
		this.oHLayout5 = new sap.ui.layout.HorizontalLayout({
			content: [this.oHueLabel, this.oHueField]
		});

		// 6.Horizontal Layout containing Saturation field
		this.oHLayout6 = new sap.ui.layout.HorizontalLayout({
			content: [this.oSatLabel, this.oSatField]
		});

		// 7.Horizontal Layout containing Light field
		this.oHLayout7a = new sap.ui.layout.HorizontalLayout({
			content: [this.oLitLabel, this.oLitField, this.oLitUnits]
		});

		// 7a Horizontal Layout containing Alpha field
		this.oHLayout7b = new sap.ui.layout.HorizontalLayout({
			content: [this.oAlphaLabel, this.oAlphaField]
		});

		// 7.Horizontal Layout containing Value field
		this.oHLayout7 = new sap.ui.layout.HorizontalLayout({
			content: [this.oValLabel, this.oValField]
		});

		// 8.Horizontal Layout
		this.oHLayout8 = new sap.ui.layout.HorizontalLayout();

		// Vertical Layout1 containing first four horizontal layouts
		this.oVLayout1 = new sap.ui.layout.VerticalLayout({
			content:[ this.oHLayout1, this.oHLayout2, this.oHLayout3, this.oHLayout4]
		});

		this.oVLayout2 = new sap.ui.layout.VerticalLayout();

		this.oVLayout2.addStyleClass("sapUiColorPicker-ColorPickerLastColumn");

		// add first Row to the Matrix Layout
		this.oMatrix.createRow(this.oHtmlBox, this.oVLayout1, this.oVLayout2);

		this.oHLayout9 = new sap.ui.layout.HorizontalLayout();

		//	create second Row containing slider
		this.oRow2 = new sap.ui.commons.layout.MatrixLayoutRow();
		this.oCell2 = new sap.ui.commons.layout.MatrixLayoutCell({ colSpan : 3 });

		//	add second Row to the Matrix Layout for the slider or the radio buttons depending of the mode
		this.oMatrix.addRow(this.oRow2);

		// add another row for the alpha slider or slider depending of the mode
		this.oRow3 = new sap.ui.commons.layout.MatrixLayoutRow();
		this.oCell3 = new sap.ui.commons.layout.MatrixLayoutCell({ colSpan : 3 });

		//	add third Row to the Matrix Layout
		this.oMatrix.addRow(this.oRow3);

		// attach Eventhandler
		this.oHexField.attachChange(jQuery.proxy(this._handleHexValueChange,this));
		this.oRedField.attachChange(jQuery.proxy(this._handleRedValueChange,this));
		this.oGreenField.attachChange(jQuery.proxy(this._handleGreenValueChange,this));
		this.oBlueField.attachChange(jQuery.proxy(this._handleBlueValueChange,this));
		this.oHueField.attachChange(jQuery.proxy(this._handleHueValueChange,this));
		this.oSatField.attachChange(jQuery.proxy(this._handleSatValueChange,this));
		this.oValField.attachChange(jQuery.proxy(this._handleValValueChange,this));

		this.oSlider.attachLiveChange(jQuery.proxy(this._handleSliderLiveChange,this));
		this.oSlider.attachChange(jQuery.proxy(this._handleSliderChange,this));
		this.oAlphaSlider.attachLiveChange(jQuery.proxy(this._handleAlphaSliderLiveChange,this));
		this.oAlphaSlider.attachChange(jQuery.proxy(this._handleAlphaSliderChange,this));

		this.oLitField.attachChange(jQuery.proxy(this._handleLitValueChange,this));
		this.oAlphaField.attachChange(jQuery.proxy(this._handleAlphaValueChange,this));
		this.oRGBorHSLRBGroup.attachSelect(jQuery.proxy(this._handleRGBorHSLValueChange,this));

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};


	/**
	 * Clean-up hook... destroying composite parts.
	 */
	ColorPicker.prototype.exit = function(){

		//	unbind Mouse-Event-Handler
		if (this.$cpBox) {
			this.$cpBox.unbind("mousedown", this.handleMouseDown);
		}

		jQuery(document)
		.unbind("mousemove", this.handleMousePos)
		.unbind("mouseup", this.handleMouseUp);

		//	destroy Objects
		this.oMatrix.destroy();
	};


	/**
	 * Event before rendering the page
	 */
	ColorPicker.prototype.onBeforeRendering = function() {
		if (this.getMode() == "HSL") {
			this.oHLayout8.addContent(this.oHtmlOldCol);
			this.oHLayout8.addContent(this.oArrow);
			this.oHLayout8.addContent(this.oHtmlNewCol);
			this.oHLayout8.addStyleClass("sapUiColorPicker-swatches");

			this.oHLayout6.addContent(this.oSatUnits);
			// Vertical Layout2 containing 2.nd four horizontal layouts
			this.oVLayout2.addContent(this.oHLayout5);
			this.oVLayout2.addContent(this.oHLayout6);
			this.oVLayout2.addContent(this.oHLayout7a);
			this.oVLayout2.addContent(this.oHLayout7b);

			// add Row for swatches and radio Buttons
			this.oHLayout9.addContent(this.oHLayout8);
			this.oHLayout9.addContent(this.oRGBorHSLLabel);
			this.oHLayout9.addContent(this.oRGBorHSLRBGroup);
			this.oCell2.addContent(this.oHLayout9);
			this.oCell2.addStyleClass("sapUiColorPicker-RBRow");
			this.oRow2.addCell(this.oCell2);

			// add slider
			this.oCell3.addContent(this.oSlider);
			this.oRow3.addCell(this.oCell3);

			// add alpha slider
			this.oRow4 = new sap.ui.commons.layout.MatrixLayoutRow();
			this.oCell4 = new sap.ui.commons.layout.MatrixLayoutCell({ colSpan : 3 });
			this.oCell4.addContent(this.oAlphaSlider);
			this.oRow4.addCell(this.oCell4);
			this.oMatrix.addRow(this.oRow4);

			this.addStyleClass("sapUiColorPickerHSL");
		} else {
			this.oHLayout8.addContent(this.oHtmlOldCol);
			this.oHLayout8.addContent(this.oHtmlNewCol);

			// Vertical Layout2 containing 2.nd four horizontal layouts
			this.oVLayout2.addContent(this.oHLayout5);
			this.oVLayout2.addContent(this.oHLayout6);
			this.oVLayout2.addContent(this.oHLayout7);
			this.oVLayout2.addContent(this.oHLayout8);

			// add slider
			this.oCell2.addContent(this.oSlider);
			this.oRow2.addCell(this.oCell2);

			// add alpha slider
			this.oCell3.addContent(this.oAlphaSlider);
			this.oRow3.addCell(this.oCell3);
		}

		//	unbind Mousehandler for ColorPickerBox
		this.$("cpBox").unbind("mousedown", this.handleMouseDown);
	};


	/**
	 * Style input and label for the colors fields
	 */
	ColorPicker.prototype._createValueLabelBox = function(oField, oLabel, sTooltip, sLabelText, sStyle, oUnits) {
		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.commons");

		oField.addStyleClass(sStyle);
		oField.setTooltip(oRb.getText(sTooltip));
		oLabel.addStyleClass("sapUiColorPicker-ColorPickerLabels");
		oLabel.setText(sLabelText);
		oLabel.setTooltip(oRb.getText(sTooltip));
		oLabel.setLabelFor(oField);

		if (oUnits) {
			oUnits.setLabelFor(oField);
			oUnits.addStyleClass("sapUiColorPicker-ColorPickerLabels");
		}
	};

	/*
	 * Evaluate parameter values
	 */
	ColorPicker.prototype.setColorString = function(iColorString) {

		//	parse string; get the color object
		this._parseColorString(iColorString);

		//	update UI
		this.oHexField.setValue(this.Color.hex.substr(1));
		this.oRedField.setValue(this.Color.r);
		this.oGreenField.setValue(this.Color.g);
		this.oBlueField.setValue(this.Color.b);
		this.oHueField.setValue(this.Color.h);
		this.oSatField.setValue(this.Color.s);

		if (this.getMode() == "HSL") {
			this.oLitField.setValue(this.Color.l);
			this.oAlphaField.setValue(this.Color.a);
			this.oSlider.setValue(this.Color.h);
			this.oAlphaSlider.setValue(this.Color.a);
			this.oRGBorHSLRBGroup.setSelectedIndex(this.Color.formatHSL ? 1 : 0 );

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
			this.oValField.setValue(this.Color.v);
			this.oSlider.setValue(this.Color.h);
			this.oAlphaSlider.setValue(this.Color.a);

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}

		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};

	/*
	 * Evaluate parameter values
	 */
	ColorPicker.prototype.isColor = function(iColorString) {

		//	parse string; only check
		return this._parseColorString(iColorString, true);
	};

	/**
	 * Event handler of the mouse down event
	 */
	ColorPicker.prototype.handleMouseDown = function(e) {

		//	exit if the HEXfield is errorneous
		if (this.oHexField.getValueState() == sap.ui.core.ValueState.Error) {
			return;
		}

		//	call mouse position handler
		this.handleMousePos(e);
		jQuery(document)
		.bind("mousemove", jQuery.proxy(this.handleMousePos, this))
		.bind("mouseup", jQuery.proxy(this.handleMouseUp, this));
	};



	/**
	 * Event handler of the mouse up event
	 */
	ColorPicker.prototype.handleMouseUp = function(e) {

		//	exit if the HEXfield is errorneous
		if (this.oHexField.getValueState() == sap.ui.core.ValueState.Error) {
			return;
		}

		//	call mouse position handler
		this.handleMousePos(e);
		jQuery(document)
		.unbind("mousemove", this.handleMousePos)
		.unbind("mouseup", this.handleMouseUp);

		if (this.getMode() == "HSL") {
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};



	/**
	 * Event handler for the mouse position
	 */
	ColorPicker.prototype.handleMousePos = function(e) {

		//	get offset of the colorpicker box
		var cpBoxOffset = this.$cpBox.offset();

		//	get width & height if the colorpicker box
		var cpBoxWidth  = this.$cpBox.width();
		var cpBoxHeight = this.$cpBox.height();

		//	calculate the hue and saturation values from the mouse position
		var x = e.pageX - cpBoxOffset.left;
		var y = e.pageY - cpBoxOffset.top;
		x = Math.min(Math.max(x, 0), cpBoxWidth);
		//	handle RTL - mode
		if (this.bRtl) {
			var rX = cpBoxWidth - x;
			x = rX;
		}
		y = Math.min(Math.max(y, 0), cpBoxHeight);
		var valValue = parseInt(x / cpBoxWidth * 100,10);
		var satValue = parseInt((1 - y / cpBoxHeight) * 100,10);

		//	set the new values
		this.oSatField.setValue(satValue);

		if (this.getMode() == "HSL") {
			this.oLitField.setValue(valValue);
			//	process changes
			this._processHSLchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
			this.oValField.setValue(valValue);
			//	process changes
			this._processHSVchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}

		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for Slider LIVE changes
	 */
	ColorPicker.prototype._handleSliderLiveChange = function() {

		//	get the new value
		var sliderValue = parseInt(this.oSlider.getValue(),10);

		//	set the new hue value in the hue inut field
		this.oHueField.setValue(sliderValue);

		if (this.getMode() == "HSL") {
			//	process changes
			this._processHSLchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
			//	process changes
			this._processHSVchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};



	/**
	 * Event handler for Slider changes
	 */
	ColorPicker.prototype._handleSliderChange = function() {

		//	get the new value
		var sliderValue = parseInt(this.oSlider.getValue(),10);

		//	set the new hue value in the hue inut field
		this.oHueField.setValue(sliderValue);

		if (this.getMode() == "HSL") {
			//	process changes
			this._processHSLchanges();

			//	fire events & update property
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
			//	process changes
			this._processHSVchanges();

			//	fire Change event
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};



	/**
	* Event handler for Alpha-Slider LIVE changes
	*/
	ColorPicker.prototype._handleAlphaSliderLiveChange = function() {

		// get the new value
		this.Color.a = this.oAlphaSlider.getValue();

		if (this.getMode() == "HSL") {
			//	set the new hue value in the hue input field
			this.oAlphaField.setValue(this.Color.a);

			//	process changes
			this._processHSLchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
			//	process changes
			this._processHSVchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for Alpha-Slider changes
	 */
	ColorPicker.prototype._handleAlphaSliderChange = function() {

		//	get the new value
		this.Color.a = this.oAlphaSlider.getValue();

		if (this.getMode() == "HSL") {
			//	set the new hue value in the hue input field
			this.oAlphaField.setValue(this.Color.a);

			//	process changes
			this._processHSLchanges();

			//	fire Change event
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
			//	process changes
			this._processHSVchanges();

			//	fire Change event
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for changes of alpha input field
	 */
	ColorPicker.prototype._handleAlphaValueChange = function() {

		//	get the new value
		var alphaValue = parseFloat(this.oAlphaField.getValue(),10);

		//	check for correct value (0-1.0)
		if (alphaValue < 0 || isNaN(alphaValue)) {
			alphaValue = 0;
		}
		if (alphaValue > 1.0) {
			alphaValue = 1;
		}

		//	set the new value
		this.Color.a = alphaValue;

		//	set the new value (maybe the value has been changed in the above lines)
		this.oAlphaField.setValue(alphaValue);
		this.oAlphaSlider.setValue(alphaValue);

		//	process Changes
		this._processHSLchanges();

		//	fire events & update property
		this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for changes of RGB or HSL radio buttonfield
	 */
	ColorPicker.prototype._handleRGBorHSLValueChange = function() {

		// store new value
		this.Color.formatHSL = (this.oRGBorHSLRBGroup.getSelectedIndex() === 1);

		// fire events & update property
		this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
	};


	/**
	 * Event handler for changes of hue input field
	 */
	ColorPicker.prototype._handleHueValueChange = function() {

		//	get the new value
		var hueValue = parseInt(this.oHueField.getValue(),10);

		//	check for correct value (0 - 360)
		if (hueValue < 0 || isNaN(hueValue)) {
			hueValue = 0;
		}
		if (hueValue > 360) {
			hueValue = 359.9;
		}

		//	set the new value (maybe the value has been changed in the above lines)
		this.oHueField.setValue(hueValue);

		//	update slider value
		this.oSlider.setValue(hueValue);

		if (this.getMode() == "HSL") {
			//	process Changes
			this._processHSLchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
			//	process Changes
			this._processHSVchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for changes of saturation input field
	 */
	ColorPicker.prototype._handleSatValueChange = function() {

		//	get the new value
		var satValue = parseInt(this.oSatField.getValue(),10);

		//	check for correct value (0-100)
		if (satValue < 0 || isNaN(satValue)) {
			satValue = 0;
		}
		if (satValue > 100) {
			satValue = 100;
		}

		//	set the new value (maybe the value has been changed in the above lines)
		this.oSatField.setValue(satValue);

		if (this.getMode() == "HSL") {
			//	process Changes
			this._processHSLchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});

		} else {
			//	process Changes
			this._processHSVchanges();

			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for changes of value input field
	 */
	ColorPicker.prototype._handleValValueChange = function() {

		//	get the new value
		var valValue = parseInt(this.oValField.getValue(),10);

		//	check for correct value (0-100)
		if (valValue < 0 || isNaN(valValue)) {
			valValue = 0;
		}
		if (valValue > 100) {
			valValue = 100;
		}

		//	set the new value (maybe the value has been changed in the above lines)
		this.oValField.setValue(valValue);

		//	process Changes
		this._processHSVchanges();

		//	fire events & update property
		this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for changes of lightness input field
	 */
	ColorPicker.prototype._handleLitValueChange = function() {

		//	get the new value
		var litValue = parseInt(this.oLitField.getValue(), 10);

		//	check for correct value (0-100)
		if (litValue < 0 || isNaN(litValue)) {
			litValue = 0;
		}
		if (litValue > 100) {
			litValue = 100;
		}

		//	set the new value (maybe the value has been changed in the above lines)
		this.oLitField.setValue(litValue);

		//	process Changes
		this._processHSLchanges();

		//	fire events & update property
		this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for changes of RED input field
	 */
	ColorPicker.prototype._handleRedValueChange = function() {

		//	get the new value
		var redValue = parseInt(this.oRedField.getValue(),10);

		//	check for correct value (0-255)
		if (redValue < 0 || isNaN(redValue)) {
			redValue = 0;
		}
		if (redValue > 255) {
			redValue = 255;
		}

		//	set the new value (maybe the value has been changed in the above lines)
		this.oRedField.setValue(redValue);

		//	process changes
		this._processRGBchanges();

		if (this.getMode() == "HSL") {
			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}

		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for changes of GREEN input field
	 */
	ColorPicker.prototype._handleGreenValueChange = function() {

		//	get the new value
		var greenValue = parseInt(this.oGreenField.getValue(),10);

		//	check for correct value
		if (greenValue < 0 || isNaN(greenValue)) {
			greenValue = 0;
		}
		if (greenValue > 255) {
			greenValue = 255;
		}

		//	set the new value (maybe the value has been changed in the above lines)
		this.oGreenField.setValue(greenValue);

		//	process changes
		this._processRGBchanges();

		if (this.getMode() == "HSL") {
			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
		//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Event handler for changes of BLUE input field
	 */
	ColorPicker.prototype._handleBlueValueChange = function() {

		//	get the new value
		var blueValue = parseInt(this.oBlueField.getValue(),10);

		//	check for correct value
		if (blueValue < 0 || isNaN(blueValue)) {
			blueValue = 0;
		}
		if (blueValue > 255) {
			blueValue = 255;
		}

		//	set the new value (maybe the value has been changed in the above lines)
		this.oBlueField.setValue(blueValue);

		//	process changes
		this._processRGBchanges();

		if (this.getMode() == "HSL") {
			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
		//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Process changes of Hue, Value and Saturation
	 */
	ColorPicker.prototype._processHSVchanges = function() {

		//	get HSV-values
		var hueValue   = parseInt(this.oHueField.getValue(),10);
		var satValue   = parseInt(this.oSatField.getValue(),10);
		var valValue   = parseInt(this.oValField.getValue(),10);

		//	calculate and set new RGB-values
		this._calculateRGB(hueValue, satValue, valValue);
		this.Color.r = this.RGB.r;
		this.Color.g = this.RGB.g;
		this.Color.b = this.RGB.b;
		this.oRedField.setValue(this.Color.r);
		this.oGreenField.setValue(this.Color.g);
		this.oBlueField.setValue(this.Color.b);

		//	calculate and set HEX-values from the RGB-values
		this._calculateHEX(this.Color.r,this.Color.g,this.Color.b);
		this.oHexField.setValue(this.HexString);
		this.Color.hex =  "#" + this.oHexField.getValue();

		//	set HSV-values
		this.Color.h = hueValue;
		this.Color.s = satValue;
		this.Color.v = valValue;
		this.oHueField.setValue(this.Color.h);
		this.oSatField.setValue(this.Color.s);
		this.oValField.setValue(this.Color.v);

		//	update gradient box background
		this._updateGradientBoxBackground(this.Color.h);

		//	update cursor position
		this._updateCursorPosition();

		//	update selected color background
		this._updateSelColorBackground();
	};


	/**
	 * Process changes of Hue, Lightness and Saturation
	 */
	ColorPicker.prototype._processHSLchanges = function() {

		//	get HSL-values
		var hueValue   = parseInt(this.oHueField.getValue(),10) % 360;
		var satValue   = parseInt(this.oSatField.getValue(),10);
		var litValue   = parseInt(this.oLitField.getValue(),10);

		//	calculate and set new RGB-values
		this._calculateRGB(hueValue, satValue, litValue);
		this.Color.r = this.RGB.r;
		this.Color.g = this.RGB.g;
		this.Color.b = this.RGB.b;
		this.oRedField.setValue(this.Color.r);
		this.oGreenField.setValue(this.Color.g);
		this.oBlueField.setValue(this.Color.b);

		//	calculate and set HEX-values from the RGB-values
		this._calculateHEX(this.Color.r,this.Color.g,this.Color.b);
		this.oHexField.setValue(this.HexString);
		this.Color.hex =  "#" + this.oHexField.getValue();

		//	set HSL-values
		this.Color.h = hueValue;
		this.Color.s = satValue;
		this.Color.l = litValue;
		this.oHueField.setValue(this.Color.h);
		this.oSatField.setValue(this.Color.s);
		this.oLitField.setValue(this.Color.l);

		//	update gradient box background
		this._updateGradientBoxBackground(this.Color.h);

		//	update cursor position
		this._updateCursorPosition();

		// update alpha slider background
		this._updateAlphaBackground();

		//	update selected color background
		this._updateSelColorBackground();
	};


	/**
	 * Process changes of Red, Green and Blue values
	 */
	ColorPicker.prototype._processRGBchanges = function() {

		//	calculate and set HEX-value from the RGB-values
		var redValue   = Math.round(parseInt(this.oRedField.getValue(),10));
		var greenValue = Math.round(parseInt(this.oGreenField.getValue(),10));
		var blueValue  = Math.round(parseInt(this.oBlueField.getValue(),10));
		this._calculateHEX(redValue, greenValue, blueValue);
		this.oHexField.setValue(this.HexString);

		//	calculate and set HSV-values from the RGB-values
		this._calculateHSV(redValue, greenValue, blueValue);
		this.oHueField.setValue(this.Color.h);
		this.oSatField.setValue(this.Color.s);

		if (this.getMode() == "HSL") {
			this.oLitField.setValue(this.Color.l);
		} else {
			this.oValField.setValue(this.Color.v);
		}

		//	update slider value
		this.oSlider.setValue(parseInt(this.oHueField.getValue(),10));

		//	store the values in variable
		this.Color.r   = redValue;
		this.Color.g   = greenValue;
		this.Color.b   = blueValue;
		this.Color.hex =  "#" + this.oHexField.getValue();

		//	update gradient box background
		this._updateGradientBoxBackground(this.Color.h);

		//	update cursor position
		this._updateCursorPosition();

		//	update selected color background
		this._updateSelColorBackground();
	};


	/**
	 * Event handler for changes of HEX input field
	 */
	ColorPicker.prototype._handleHexValueChange = function() {

		//	get the new value
		var hexValue = this.oHexField.getValue().toLowerCase();

		//	check for correct value
		if (hexValue.substr(0, 1) == '#') {
			hexValue = hexValue.substr(1);
		}
		var re = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
		if (re.test(hexValue) == false) {
			this.oHexField.setValueState(sap.ui.core.ValueState.Error);
			this.oSlider.setEnabled(false);
			this.oAlphaSlider.setEnabled(false);
			this.oHueField.setEnabled(false);
			this.oRedField.setEnabled(false);
			this.oGreenField.setEnabled(false);
			this.oBlueField.setEnabled(false);
			this.oSatField.setEnabled(false);

			if (this.getMode() == "HSL") {
				this.oLitField.setEnabled(false);
				this.oAlphaField.setEnabled(false);
			} else {
				this.oValField.setEnabled(false);
			}
			return false;
		} else if (this.oHexField.getValueState() == sap.ui.core.ValueState.Error) {
			this.oHexField.setValueState(sap.ui.core.ValueState.None);
			this.oSlider.setEnabled(true);
			this.oAlphaSlider.setEnabled(true);
			this.oHueField.setEnabled(true);
			this.oRedField.setEnabled(true);
			this.oGreenField.setEnabled(true);
			this.oBlueField.setEnabled(true);
			this.oSatField.setEnabled(true);

			if (this.getMode() == "HSL") {
				this.oLitField.setEnabled(true);
				this.oAlphaField.setEnabled(true);
			} else {
				this.oValField.setEnabled(true);
			}
		}

		//	convert from short to long hex (if needed)
		if (hexValue.length == 3) {
			var tempValue = hexValue.charAt(0) + hexValue.charAt(0) + hexValue.charAt(1) + hexValue.charAt(1) + hexValue.charAt(2) + hexValue.charAt(2);
			hexValue = tempValue;
		}

		//	process Changes
		this._processHexChanges(hexValue);

		//	update UI
		this.oHexField.setValue(hexValue);
		this.oRedField.setValue(this.Color.r);
		this.oGreenField.setValue(this.Color.g);
		this.oBlueField.setValue(this.Color.b);
		this.oHueField.setValue(this.Color.h);
		this.oSatField.setValue(this.Color.s);

		if (this.getMode() == "HSL") {
			this.oLitField.setValue(this.Color.l);
		} else {
			this.oValField.setValue(this.Color.v);
		}
		this.oSlider.setValue(parseInt(this.oHueField.getValue(),10));
		this.oAlphaSlider.setValue(1);

		if (this.getMode() == "HSL") {
			this.oAlphaField.setValue(1);
		}

		//	update gradient box background
		this._updateGradientBoxBackground(this.Color.h);

		//	update cursor position
		this._updateCursorPosition();

		//	update selected color background
		this._updateSelColorBackground();

		if (this.getMode() == "HSL") {
			//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, l:this.Color.l, alpha:this.Color.a, hex:this.Color.hex, formatHSL:this.Color.formatHSL});
		} else {
		//	fire events & update property
			this.fireLiveChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
			this.fireChange({r:this.Color.r, g:this.Color.g, b:this.Color.b, h:this.Color.h, s:this.Color.s, v:this.Color.v, alpha:this.Color.a, hex:this.Color.hex});
		}
		this.setProperty('colorString', this._getRGBString(), true); // No re-rendering!
	};


	/**
	 * Hex-Values have changed ==> process changes
	 */
	ColorPicker.prototype._processHexChanges = function (ihexValue) {

		//	convert RGB-values
		this._convertRGB(ihexValue);

		if (this.getMode() == "HSL") {
			//	calculate and set HSL-values from the RGB-values
			this._calculateHSL(this.Color.r, this.Color.g, this.Color.b);
		} else {
			//	calculate and set HSV-values from the RGB-values
			this._calculateHSV(this.Color.r, this.Color.g, this.Color.b);
		}

		//	all values except hex set; set the hex value
		this.Color.hex = "#" + ihexValue.toLowerCase();
	};


	/**
	 * Update background of alpha slider
	 */
	ColorPicker.prototype._updateAlphaBackground = function(e) {

		var newBG = sBrowserPrefix + "(left,rgba(" + this.Color.r + "," + this.Color.g + "," + this.Color.b + ",0),rgba(" + this.Color.r + "," + this.Color.g + "," + this.Color.b + ",1)),url(" + sBgSrc + ")";

		if (this.lastAlphaSliderGradient != newBG) { // check against cached value to prevent flicker
			jQuery(this.oAlphaSlider.getDomRef()).find(".sapUiSliBar").css("background-image", newBG); // stop flicker
		}
		// cache last value to prevent flicker
		this.lastOpacitySliderGradient = newBG;

	};


	/**
	 * Update Cursor position in the ColorPicker Box
	 */
	ColorPicker.prototype._updateCursorPosition = function() {
		var x;
		//	get the width & height
		var cpCurWidth  = this.$cpCur.width();
		var cpCurHeight = this.$cpCur.height();
		var cpBoxWidth  = this.$cpBox.width();
		var cpBoxHeight = this.$cpBox.height();

		//	get the saturation and value
		var satValue = this.oSatField.getValue();

		if (this.getMode() == "HSL") {
			var litValue = this.oLitField.getValue();
			// calculate the x and y values
			x = parseInt(litValue * cpBoxWidth / 100, 10);
		} else {
			var valValue = this.oValField.getValue();
			// calculate the x and y values
			x = parseInt(valValue * cpBoxWidth / 100, 10);
		}

		//	calculate x if we are in RTL mode
		if (this.bRtl) {
			var rX = cpBoxWidth - x;
			x = rX;
		}
		var y = parseInt((1 - satValue / 100) * cpBoxHeight, 10);
		x = Math.min(Math.max(x, 0), cpBoxWidth - cpCurWidth / 2) - cpCurWidth / 2;
		y = Math.min(Math.max(y, 0), cpBoxHeight - cpCurHeight / 2) - cpCurHeight / 2;

		//	set the new cursor position
		this.$cpCur.css("left", x).css("top", y);
	};


	/**
	 * Calculate RGB-Values from Hue/Saturation/Value
	 */
	ColorPicker.prototype._calculateRGB = function(hue, sat, val) {

		if (this.getMode() == "HSL") {
			this._calculateRGB_Advanced(hue, sat, val);
			return;
		}
		//hue value is cyclic, so 360 = 0
		if (hue == 360) {
			hue = 0;
		}
		hue /= 60;
		sat /= 100;
		val /= 100;

		//Formula taken from http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
		var c = val * sat;
		var x = c * (1 - Math.abs(hue % 2 - 1));
		var m = val - c;

		// calculate values
		var redValue = 0, greenValue = 0, blueValue = 0;
		var i = Math.floor(hue);

		switch (i) {
			case 0:
				redValue   = c;
				greenValue = x;
				break;
			case 1:
				redValue   = x;
				greenValue = c;
				break;
			case 2:
				greenValue = c;
				blueValue  = x;
				break;
			case 3:
				greenValue = x;
				blueValue  = c;
				break;
			case 4:
				redValue   = x;
				blueValue  = c;
				break;
			case 5:
				redValue   = c;
				blueValue  = x;
				break;
		}

		this.RGB.r = Math.floor((redValue + m) * 255);
		this.RGB.g = Math.floor((greenValue + m) * 255);
		this.RGB.b = Math.floor((blueValue + m) * 255);
	};


	/**
	 * Calculate RGB-Values from Hue/Saturation/Lightness
	 */
	ColorPicker.prototype._calculateRGB_Advanced = function( hue, sat, lit) {
		var redValue, greenValue, blueValue;

		if (hue < 0) {
			hue = 0;
		} else if (hue > 360) { hue = 360; }
		if (sat > 100) {
			sat = 1;
		} else if (sat < 0) { sat = 0; } else { sat = sat / 100; }
		if (lit > 100) {
			lit = 1;
		} else if (lit < 0) { lit = 0; } else { lit = lit / 100; }

		var d = sat * (1 - Math.abs(2 * lit - 1));
		var m = 255 * (lit - 0.5 * d);
		var x = d * (1 - Math.abs((hue / 60) % 2 - 1));

		var i = Math.floor(hue / 60);

		var m255x = m + 255 * x;
		var m255d = m + 255 * d;

		switch (i) {
		case 0:
			redValue   = m255d;
			greenValue = m255x;
			blueValue  = m;
			break;
		case 1:
			redValue   = m255x;
			greenValue = m255d;
			blueValue  = m;
			break;
		case 2:
			redValue   = m;
			greenValue = m255d;
			blueValue  = m255x;
			break;
		case 3:
			redValue   = m;
			greenValue = m255x;
			blueValue  = m255d;
			break;
		case 4:
			redValue   = m255x;
			greenValue = m;
			blueValue  = m255d;
			break;
		case 5:
			redValue   = m255d;
			greenValue = m;
			blueValue  = m255x;
			break;
		default:
			redValue   = 0;
			greenValue = 0;
			blueValue  = 0;
		break;
		}
		this.RGB.r = Math.round(redValue);
		this.RGB.g = Math.round(greenValue);
		this.RGB.b = Math.round(blueValue);
	};


	/**
	 * Get RGB-String from the current RGB-Values
	 */
	ColorPicker.prototype._getRGBString = function() {
		if (this.Color.formatHSL) {
			if (this.Color.a < 1) {
				return "hsla(" + this.Color.h + "," + this.Color.s + "%," + this.Color.l + "%, " + this.Color.a + ")";
			} else {
				return "hsl(" + this.Color.h + "," + this.Color.s + "%," + this.Color.l + "%)";
			}
		}

		if (this.Color.a < 1) {
			return "rgba(" + this.Color.r + "," + this.Color.g + "," + this.Color.b + ", " + this.Color.a + ")";
		} else {
			return "rgb(" + this.Color.r + "," + this.Color.g + "," + this.Color.b + ")";
		}
	};


	/**
	 * Calculate HEX-Values when RGB-values change
	 */
	ColorPicker.prototype._calculateHEX = function(red,green,blue) {

		//	convert values
		var redStr     = red.toString(16);
		var greenStr   = green.toString(16);
		var blueStr    = blue.toString(16);
		if (redStr.length == 1)   {
			redStr   = '0' + redStr;
		}
		if (greenStr.length == 1) {
			greenStr = '0' + greenStr;
		}
		if (blueStr.length == 1)  {
			blueStr  = '0' + blueStr;
		}

		//	return the HexValue
		this.HexString = (redStr + greenStr + blueStr).toLowerCase();
	};


	/**
	 * Calculate HSV-Values from RGB-values
	 */
	ColorPicker.prototype._calculateHSV = function(red, green, blue) {

		//	calculate values
		var max			= Math.max(Math.max(red, green), blue);
		var min			= Math.min(Math.min(red, green), blue);
		var delta		= (max - min);
		var valValue	= Math.round(max * 100 / 255);
		var satValue = (max == 0.0) ? 0 : (100 * delta / max);
		var hueValue = 0;
		if (satValue == 0) {
			hueValue = 0;
		} else if (red == max)   {
			hueValue = 60.0 * (green - blue) / delta;
		} else if (green == max) {
			hueValue = 120.0 + 60.0 * (blue - red) / delta;
		} else if (blue == max)  {
			hueValue = 240.0 + 60.0 * (red - green) / delta;
		}
		if (hueValue < 0.0) {
			hueValue += 359.9;
		}
		hueValue = Math.round(hueValue);
		satValue = Math.round(satValue);

		//	store the new values
		this.Color.h = hueValue;
		this.Color.s = satValue;
		this.Color.v = valValue;
	};


	/**
	 * Calculate HSL-Values from RGB-values
	 */
	ColorPicker.prototype._calculateHSL = function(red, green, blue) {

		//	calculate values
		var max			= Math.max(red, green, blue);
		var min			= Math.min(red, green, blue);
		var d			= (max - min) / 255;

		var litValue = (max + min) / 510;
		var denominator = 1 - Math.abs(2 * litValue - 1);
		var lVal = (litValue == 0.0) ? 0 : d / denominator;
		var satValue = (denominator != 0) ? lVal : 0;
		var hueValue = 0;

		litValue = Math.round(litValue * 100);
		satValue = Math.round(satValue * 100);

		if (litValue == 0 || satValue == 0 || (red + green + blue == 765)) {
			hueValue = 0;
		} else {

			// The hexagon method does the best numeric conversion on our standard colors as best as I can tell - darin

			// method hexagon begin
			var C = max - min;
			if (max == red) {
				hueValue = ((green - blue) / C) % 6;
			}
			if (max == green) {
				hueValue = (blue - red) / C + 2;
			}
			if (max == blue) {
				hueValue = (red - green) / C + 4;
			}
			if (C == 0) {
				hueValue = 0;
			}

			hueValue *= 60;
			if (hueValue < 0) {
				hueValue += 360;
			}
			// method hexagon end
		}

		//	store the new values
		this.Color.h = Math.round(hueValue);
		this.Color.s = satValue;
		this.Color.l = litValue;
	};


	/**
	 * Convert HEX-Value to RGB-Values
	 */
	ColorPicker.prototype._convertRGB = function(hex) {

		//	calculate the new values
		var red   = parseInt(hex.substr(0, 2), 16);
		var green = parseInt(hex.substr(2, 2), 16);
		var blue  = parseInt(hex.substr(4, 2), 16);

		//	return the new values
		this.Color.r = red;
		this.Color.g = green;
		this.Color.b = blue;
	};


	/**
	 * Update GradientBox Background
	 */
	ColorPicker.prototype._updateGradientBoxBackground = function(hue) {

		// calculate RGB-values
		if (this.getMode() == "HSL") {
			this._calculateRGB_Advanced(hue, 100, 50);
		} else {
			this._calculateRGB(hue, 100, 100);
		}

		//	calculate Hex-value
		this._calculateHEX(this.RGB.r,this.RGB.g,this.RGB.b);

		//	set backgroundColor
		this.$cpBox.css('background-color','rgb(' + this.RGB.r + ', '  + this.RGB.g + ', ' + this.RGB.b + ')');
	};


	/**
	 * Update background of "new color box"
	 */
	ColorPicker.prototype._updateSelColorBackground = function() {

		//	set the new color
		this.$("ncBox").css('background-color',this._getRGBString());

	};


	/**
	 * Parse Input Parameter; evaluate color
	 */
	ColorPicker.prototype._parseColorString = function(iColorString, bCheckOnly) {
		var hexValue = "";

		//	delete #, trim
		if (iColorString.substr(0, 1) == '#') {
			iColorString = iColorString.substr(1);
		}
		iColorString = iColorString.replace(/ /g,'');
		iColorString = iColorString.toLowerCase();

		//	parse Names
		hexValue = this._parseColorName(iColorString);

		if (this.getMode() == "HSL") {
			if (hexValue != "" && !bCheckOnly) {
				//Found a name; get RGB and HSL values
				this._processHexChanges(hexValue);
				this.Color.old = this.Color.hex;
				this.Color.formatHSL = false;
				return true;
			}
		} else {
			if (hexValue != "") {
				//Found a name; get RGB and HSV values
				this._processHexChanges(hexValue);
				this.Color.old = this.Color.hex;
			}
		}

		//	parse HEX
		//	allowed input: #aabbcc, aabbcc, #abc, abc
		//	'#' has already been deleted, search only for values
		//  check for correct value using regular expression
		var re = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
		if (re.test(iColorString) == true) {
			//it's a hex value; check if its aabbcc or abc
			if (iColorString.length == 3) {
				var hexValue = iColorString.charAt(0) + iColorString.charAt(0) + iColorString.charAt(1) + iColorString.charAt(1) + iColorString.charAt(2) + iColorString.charAt(2);
			} else {
				hexValue = iColorString;
			}
			//get RGB and HSV values
			this._processHexChanges(hexValue);
			this.Color.old = this.Color.hex;

			if (this.getMode() == "HSL") {
				this.Color.formatHSL = false;
				return true;
			}
		}


		//	check if the string begins with "rgba" and parse it
		if (iColorString.substr(0, 4) == 'rgba') {
			this._parseRGBA(iColorString);
		}

		//	check if the string begins with "rgb"
		if (iColorString.substr(0, 3) == 'rgb') {
			this._parseRGB(iColorString);
		}

		if (this.getMode() == "HSL") {
			//	check if the string begins with "hsla" and parse it
			if (iColorString.substr(0, 4) == 'hsla') {
				this._parseHSLA(iColorString);
			}

			//	check if the string begins with "hsl" and parse it
			if (iColorString.substr(0, 3) == 'hsl') {
				this._parseHSL(iColorString);
			}
		} else {
			//	check if the string begins with "rgb"
			if (iColorString.substr(0, 3) == 'hsv') {
				this._parseHSV(iColorString);
			} else {
				return false;
			}
		}
	};

	/**
	 * Parses HSV string
	 */
	ColorPicker.prototype._parseHSV = function(iColorString) {
		//	parse HSV
		//	allowed input: hsv(360,100,100); hsv360,100,100; [hsv(360,0.5,0.5); hsv360,0.5,0.5 later]
		// remove hsv, "(", ")" and blanks
		iColorString = iColorString.substr(3);
		iColorString = iColorString.replace("(",'');
		iColorString = iColorString.replace(")",'');
		iColorString = iColorString.split(' ').join('');
		var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),){1}(((\d{1,2})|(100)),){1}((\d{1,2})|(100)){1}$/;
		if (re.test(iColorString) == true) {
			//it's a hsv string, get the values
			var HSVColor = iColorString.split(",");
			//get RGB values
			this._calculateRGB(parseInt(HSVColor[0], 10), parseInt(HSVColor[1], 10), parseInt(HSVColor[2], 10));
			//get Hex values
			this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
			//store the values
			this.Color.r   = this.RGB.r;
			this.Color.g   = this.RGB.g;
			this.Color.b   = this.RGB.b;
			this.Color.h   = parseInt(HSVColor[0], 10);
			this.Color.s   = parseInt(HSVColor[1], 10);
			this.Color.v   = parseInt(HSVColor[2], 10);
			this.Color.hex = "#" + this.HexString;
			this.Color.old = this.Color.hex;
		}
	};

	/**
	 * Parses HSL string
	 */
	ColorPicker.prototype._parseHSL = function(iColorString, bCheckOnly) {
		//	parse HSL
		//	allowed input: hsl(360,100,100); hsl360,100,100; [hsl(360,0.5,0.5); hsl360,0.5,0.5 later]
		// remove hsl, "(", ")" and blanks
		iColorString = iColorString.substr(3);
		iColorString = iColorString.replace("(",'');
		iColorString = iColorString.replace(")",'');
		iColorString = iColorString.split(' ').join('');
		var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),){1}(((\d{1,2})|(100))%,){1}(((\d{1,2})|(100))%){1}$/;

		if (re.test(iColorString) == true) {
			if (bCheckOnly) {
				return true;
			}
			//it's a hsl string, get the values
			var HSLColor = iColorString.split(",");
			//get RGB values
			this._calculateRGB(parseInt(HSLColor[0], 10), parseInt(HSLColor[1], 10), parseInt(HSLColor[2], 10));
			//get Hex values
			this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
			//store the values
			this.Color.r   = this.RGB.r;
			this.Color.g   = this.RGB.g;
			this.Color.b   = this.RGB.b;
			this.Color.h   = parseInt(HSLColor[0], 10);
			this.Color.s   = parseInt(HSLColor[1], 10);
			this.Color.l   = parseInt(HSLColor[2], 10);
			this.Color.hex = "#" + this.HexString;
			this.Color.old = this.Color.hex;
			this.Color.a = this.Color.a_old = 1;
			this.Color.formatHSL = true;
			return true;
		} else {
			var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),){1}(((\d{1,2})|(100))%,){1}([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1}$/;
			if (re.test(iColorString) == true) {
				if (bCheckOnly) {
					return true;
				}
				//it's a hsl string, get the values
				var HSLColor = iColorString.split(",");
				//get RGB values
				this._calculateRGB(parseInt(HSLColor[0], 10), parseInt(HSLColor[1], 10), parseFloat(HSLColor[2]) * 100);
				//get Hex values
				this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
				//store the values
				this.Color.r   = this.RGB.r;
				this.Color.g   = this.RGB.g;
				this.Color.b   = this.RGB.b;
				this.Color.h   = parseInt(HSLColor[0], 10);
				this.Color.s   = parseInt(HSLColor[1], 10);
				this.Color.l   = parseFloat(HSLColor[2]) * 100;
				this.Color.hex = "#" + this.HexString;
				this.Color.old = this.Color.hex;
				this.Color.a = this.Color.a_old = 1;
				this.Color.formatHSL = true;
				return true;
			} else {
			var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),){1}(([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]),){1}([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1}$/;

				if (re.test(iColorString) == true) {
					if (bCheckOnly) {
						return true;
					}
					//it's a hsl string, get the values
					var HSLColor = iColorString.split(",");
					//get RGB values
					this._calculateRGB(parseInt(HSLColor[0], 10), parseFloat(HSLColor[1]) * 100, parseFloat(HSLColor[2]) * 100);
					//get Hex values
					this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
					//store the values
					this.Color.r   = this.RGB.r;
					this.Color.g   = this.RGB.g;
					this.Color.b   = this.RGB.b;
					this.Color.h   = parseInt(HSLColor[0], 10);
					this.Color.s   = parseFloat(HSLColor[1]) * 100;
					this.Color.l   = parseFloat(HSLColor[2]) * 100;
					this.Color.hex = "#" + this.HexString;
					this.Color.old = this.Color.hex;
					this.Color.a = this.Color.a_old = 1;
					this.Color.formatHSL = true;
					return true;
				} else {
					var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),){1}(([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]),){1}(((\d{1,2})|(100))%){1}$/;
					if (re.test(iColorString) == true) {
						if (bCheckOnly) {
							return true;
						}
						//it's a hsl string, get the values
						var HSLColor = iColorString.split(",");
						//get RGB values
						this._calculateRGB(parseInt(HSLColor[0], 10), parseFloat(HSLColor[1]) * 100, parseInt(HSLColor[2], 10));
						//get Hex values
						this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
						//store the values
						this.Color.r   = this.RGB.r;
						this.Color.g   = this.RGB.g;
						this.Color.b   = this.RGB.b;
						this.Color.h   = parseInt(HSLColor[0], 10);
						this.Color.s   = parseFloat(HSLColor[1]) * 100;
						this.Color.l   = parseInt(HSLColor[2], 10);
						this.Color.hex = "#" + this.HexString;
						this.Color.old = this.Color.hex;
						this.Color.a = this.Color.a_old = 1;
						this.Color.formatHSL = true;
						return true;
					} else {
						return false;
					}
				}
			}
		}
	};

	/**
	 * Parses HSLA string
	 */
	ColorPicker.prototype._parseHSLA = function(iColorString, bCheckOnly) {
		//	parse HSLA
		//	allowed input: hsla(360,100%,100%,0.5) etc.
		//	check if the string begins with "rgb"
		// remove hsla, "(", ")" and blanks
		iColorString = iColorString.substr(4);
		iColorString = iColorString.replace("(",'');
		iColorString = iColorString.replace(")",'');
		iColorString = iColorString.split(' ').join('');
		var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),){1}(((\d{1,2})|(100))%,){1}(((\d{1,2})|(100))%){1},([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1}$/;
		if (re.test(iColorString) == true) {
			if (bCheckOnly) {
				return true;
			}
			//it's a hsl string, get the values
			var HSLColor = iColorString.split(",");
			//get RGB values
			this._calculateRGB(parseInt(HSLColor[0], 10), parseInt(HSLColor[1], 10), parseInt(HSLColor[2], 10));
			//get Hex values
			this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
			//store the values
			this.Color.r   = this.RGB.r;
			this.Color.g   = this.RGB.g;
			this.Color.b   = this.RGB.b;
			this.Color.h   = parseInt(HSLColor[0],10);
			this.Color.s   = parseInt(HSLColor[1],10);
			this.Color.l   = parseInt(HSLColor[2],10);
			this.Color.hex = "#" + this.HexString;
			this.Color.old = this.Color.hex;
			this.Color.a = this.Color.a_old = parseFloat(HSLColor[3]);
			this.Color.formatHSL = true;
			return true;
		} else {
			var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),){1}(((\d{1,2})|(100))%,){1}([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1},([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1}$/;
			if (re.test(iColorString) == true) {
				if (bCheckOnly) {
					return true;
				}
				//it's a hsl string, get the values
				var HSLColor = iColorString.split(",");
				//get RGB values
				this._calculateRGB(parseInt(HSLColor[0], 10), parseInt(HSLColor[1], 10), parseFloat(HSLColor[2]) * 100);
				//get Hex values
				this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
				//store the values
				this.Color.r   = this.RGB.r;
				this.Color.g   = this.RGB.g;
				this.Color.b   = this.RGB.b;
				this.Color.h   = parseInt(HSLColor[0], 10);
				this.Color.s   = parseInt(HSLColor[1], 10);
				this.Color.l   = parseFloat(HSLColor[2]) * 100;
				this.Color.hex = "#" + this.HexString;
				this.Color.old = this.Color.hex;
				this.Color.a = this.Color.a_old = parseFloat(HSLColor[3]);
				this.Color.formatHSL = true;
				return true;
			} else {
				var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),){1}([0]|(([0]\.[0-9]+)|(\.[0-9]+)|[1]),){1}([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1},([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1}$/;
				if (re.test(iColorString) == true) {
					if (bCheckOnly) {
						return true;
					}
					//it's a hsl string, get the values
					var HSLColor = iColorString.split(",");
					//get RGB values
					this._calculateRGB(parseInt(HSLColor[0], 10), parseFloat(HSLColor[1]) * 100, parseFloat(HSLColor[2]) * 100);
					//get Hex values
					this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
					//store the values
					this.Color.r   = this.RGB.r;
					this.Color.g   = this.RGB.g;
					this.Color.b   = this.RGB.b;
					this.Color.h   = parseInt(HSLColor[0], 10);
					this.Color.s   = parseFloat(HSLColor[1]) * 100;
					this.Color.l   = parseFloat(HSLColor[2]) * 100;
					this.Color.hex = "#" + this.HexString;
					this.Color.old = this.Color.hex;
					this.Color.a = this.Color.a_old = parseFloat(HSLColor[3]);
					this.Color.formatHSL = true;
					return true;
				} else {
					var re = /^(((\d{1,2})|([1,2]\d{2})|(3[0-5]\d)|(360)),){1}([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1}(((\d{1,2})|(100))%){1},([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1}$/;
					if (re.test(iColorString) == true) {
						if (bCheckOnly) {
							return true;
						}
						//it's a hsl string, get the values
						var HSLColor = iColorString.split(",");
						//get RGB values
						this._calculateRGB(parseInt(HSLColor[0], 10), parseFloat(HSLColor[1]) * 100, parseInt(HSLColor[2], 10));
						//get Hex values
						this._calculateHEX(this.RGB.r, this.RGB.g, this.RGB.b);
						//store the values
						this.Color.r   = this.RGB.r;
						this.Color.g   = this.RGB.g;
						this.Color.b   = this.RGB.b;
						this.Color.h   = parseInt(HSLColor[0], 10);
						this.Color.s   = parseFloat(HSLColor[1]) * 100;
						this.Color.l   = parseInt(HSLColor[2], 10);
						this.Color.hex = "#" + this.HexString;
						this.Color.old = this.Color.hex;
						this.Color.a = this.Color.a_old = parseFloat(HSLColor[3]);
						this.Color.formatHSL = true;
						return true;
					} else {
						return false;
					}
				}
			}
		}
	};

	/**
	 * Parses RGB string
	 */
	ColorPicker.prototype._parseRGB = function(iColorString, bCheckOnly) {
		// remove rgb, "(", ")" and blanks
		iColorString = iColorString.substr(3);
		iColorString = iColorString.replace("(",'');
		iColorString = iColorString.replace(")",'');
		iColorString = iColorString.split(' ').join('');
		var re = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5])),){2}(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))){1}$/;

		if (re.test(iColorString) == true) {

			if (this.getMode() == "HSL" && bCheckOnly) {
				return true;
			}
			//it's a rgb string, get the values and convert to Hex
			var RGBColor = iColorString.split(",");
			this._calculateHEX(parseInt(RGBColor[0],10), parseInt(RGBColor[1],10), parseInt(RGBColor[2],10));
			//get HSV values
			this._processHexChanges(this.HexString);
			this.Color.old = this.Color.hex;
		}
		if (this.getMode() == "HSL") {
			this.Color.formatHSL = false;
			return true;
		}
	};

	/**
	 * Parses RGBA string
	 */
	ColorPicker.prototype._parseRGBA = function(iColorString, bCheckOnly) {
		// remove rgba, "(", ")" and blanks
		iColorString = iColorString.substr(4);
		iColorString = iColorString.replace("(",'');
		iColorString = iColorString.replace(")",'');
		iColorString = iColorString.split(' ').join('');

		var re = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5])),){2}(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5])),){1}([0]|([0]\.[0-9]+)|(\.[0-9]+)|[1]){1}$/;

		if (re.test(iColorString) == true) {

			if (this.getMode() == "HSL" && bCheckOnly) {
				return true;
			}
			//it's a rgba string, get the values and convert to Hex
			var RGBColor = iColorString.split(",");
			var sAlpha = iColorString.substr(iColorString.lastIndexOf(",") + 1, (iColorString.length - iColorString.lastIndexOf(",")));
			this._calculateHEX(parseInt(RGBColor[0],10), parseInt(RGBColor[1],10), parseInt(RGBColor[2],10));
			//get HSV values
			this._processHexChanges(this.HexString);
			this.Color.old = this.Color.hex;
			this.Color.a = this.Color.a_old = parseFloat(sAlpha);
		}
		if (this.getMode() == "HSL") {
			this.Color.formatHSL = false;
			return true;
		}
	};

	/**
	 * Check if the given string is predefined color
	 */
	ColorPicker.prototype._parseColorName = function(iColorString) {
		var searchKey = "";
		var hexValue = "";

		var colorNames = {
				aliceblue: 				'f0f8ff',
				antiquewhite: 			'faebd7',
				aqua: 					'00ffff',
				aquamarine: 			'7fffd4',
				azure: 					'f0ffff',
				beige: 					'f5f5dc',
				bisque: 				'ffe4c4',
				black: 					'000000',
				blanchedalmond:			'ffebcd',
				blue: 					'0000ff',
				blueviolet:				'8a2be2',
				brown:					'a52a2a',
				burlywood: 				'deb887',
				cadetblue: 				'5f9ea0',
				chartreuse: 			'7fff00',
				chocolate: 				'd2691e',
				coral: 					'ff7f50',
				cornflowerblue: 		'6495ed',
				cornsilk: 				'fff8dc',
				crimson: 				'dc143c',
				cyan: 					'00ffff',
				darkblue: 				'00008b',
				darkcyan: 				'008b8b',
				darkgoldenrod: 			'b8860b',
				darkgray: 				'a9a9a9',
				darkgrey: 				'a9a9a9',
				darkgreen: 				'006400',
				darkkhaki: 				'bdb76b',
				darkmagenta: 			'8b008b',
				darkolivegreen: 		'556b2f',
				darkorange: 			'ff8c00',
				darkorchid: 			'9932cc',
				darkred: 				'8b0000',
				darksalmon: 			'e9967a',
				darkseagreen: 			'8fbc8f',
				darkslateblue: 			'483d8b',
				darkslategray: 			'2f4f4f',
				darkturquoise: 			'00ced1',
				darkviolet: 			'9400d3',
				deeppink: 				'ff1493',
				deepskyblue: 			'00bfff',
				dimgray: 				'696969',
				dodgerblue: 			'1e90ff',
				feldspar: 				'd19275',
				firebrick: 				'b22222',
				floralwhite: 			'fffaf0',
				forestgreen: 			'228b22',
				fuchsia: 				'ff00ff',
				gainsboro: 				'dcdcdc',
				ghostwhite: 			'f8f8ff',
				gold: 					'ffd700',
				goldenrod: 				'daa520',
				gray: 					'808080',
				green: 					'008000',
				greenyellow: 			'adff2f',
				honeydew: 				'f0fff0',
				hotpink: 				'ff69b4',
				indianred : 			'cd5c5c',
				indigo : 				'4b0082',
				ivory: 					'fffff0',
				khaki: 					'f0e68c',
				lavender: 				'e6e6fa',
				lavenderblush: 			'fff0f5',
				lawngreen: 				'7cfc00',
				lemonchiffon: 			'fffacd',
				lightblue: 				'add8e6',
				lightcoral: 			'f08080',
				lightcyan: 				'e0ffff',
				lightgoldenrodyellow:	'fafad2',
				lightgray: 				'd3d3d3',
				lightgrey: 				'd3d3d3',
				lightgreen: 			'90ee90',
				lightpink: 				'ffb6c1',
				lightsalmon: 			'ffa07a',
				lightseagreen: 			'20b2aa',
				lightskyblue: 			'87cefa',
				lightslateblue: 		'8470ff',
				lightslategray: 		'778899',
				lightslategrey: 		'778899',
				lightsteelblue: 		'b0c4de',
				lightyellow: 			'ffffe0',
				lime: 					'00ff00',
				limegreen: 				'32cd32',
				linen: 					'faf0e6',
				magenta: 				'ff00ff',
				maroon: 				'800000',
				mediumaquamarine: 		'66cdaa',
				mediumblue: 			'0000cd',
				mediumorchid: 			'ba55d3',
				mediumpurple: 			'9370db',
				mediumseagreen: 		'3cb371',
				mediumslateblue: 		'7b68ee',
				mediumspringgreen: 		'00fa9a',
				mediumturquoise: 		'48d1cc',
				mediumvioletred:		'c71585',
				midnightblue: 			'191970',
				mintcream: 				'f5fffa',
				mistyrose: 				'ffe4e1',
				moccasin: 				'ffe4b5',
				navajowhite: 			'ffdead',
				navy: 					'000080',
				oldlace: 				'fdf5e6',
				olive: 					'808000',
				olivedrab: 				'6b8e23',
				orange: 				'ffa500',
				orangered: 				'ff4500',
				orchid: 				'da70d6',
				palegoldenrod: 			'eee8aa',
				palegreen: 				'98fb98',
				paleturquoise: 			'afeeee',
				palevioletred: 			'db7093',
				papayawhip: 			'ffefd5',
				peachpuff: 				'ffdab9',
				peru: 					'cd853f',
				pink: 					'ffc0cb',
				plum: 					'dda0dd',
				powderblue: 			'b0e0e6',
				purple: 				'800080',
				red: 					'ff0000',
				rosybrown: 				'bc8f8f',
				royalblue: 				'4169e1',
				saddlebrown: 			'8b4513',
				salmon: 				'fa8072',
				sandybrown: 			'f4a460',
				seagreen: 				'2e8b57',
				seashell: 				'fff5ee',
				sienna: 				'a0522d',
				silver: 				'c0c0c0',
				skyblue: 				'87ceeb',
				slateblue: 				'6a5acd',
				slategray: 				'708090',
				slategrey: 				'708090',
				snow: 					'fffafa',
				springgreen: 			'00ff7f',
				steelblue: 				'4682b4',
				tan: 					'd2b48c',
				teal: 					'008080',
				thistle: 				'd8bfd8',
				tomato: 				'ff6347',
				turquoise: 				'40e0d0',
				violet: 				'ee82ee',
				violetred: 				'd02090',
				wheat: 					'f5deb3',
				white: 					'ffffff',
				whitesmoke: 			'f5f5f5',
				yellow: 				'ffff00',
				yellowgreen: 			'9acd32'
		};

		for (searchKey in colorNames) {
			if (iColorString == searchKey) {
				hexValue = colorNames[searchKey].toLowerCase();
				return hexValue;
			}
		}

		return hexValue;
	};


	/**
	 * Event after rendering the page
	 */
	ColorPicker.prototype.onAfterRendering = function() {

		// get the jQuery-Object for cpBox and cpCur
		this.$cpBox = this.$("cpBox");
		this.$cpCur = this.$("cpCur");

		//	add Mousehandler for ColorPickerBox
		this.$cpBox.bind("mousedown", jQuery.proxy(this.handleMouseDown, this));

		//	set the background color of the Color Boxes
		this.$("ncBox").css('background-color', this._getRGBString());
		this.$("ocBox").css('background-color', this._getRGBString());

		//	update the background color of the 'new color box'
		this._updateGradientBoxBackground(this.Color.h);

		//	update cursor position
		this._updateCursorPosition();

		if (this.getMode() == "HSL") {
			// update alpha slider background
			this._updateAlphaBackground();
		}
	};


	/**
	 * Deliver current RGB-values.
	 *
	 * @name sap.ui.commons.ColorPicker#getRGB
	 * @function
	 * @type object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ColorPicker.prototype.getRGB = function() {

		return {r:this.Color.r, g:this.Color.g, b:this.Color.b};

	};

	return ColorPicker;

}, /* bExport= */ true);
