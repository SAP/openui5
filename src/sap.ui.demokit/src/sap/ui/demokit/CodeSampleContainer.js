/*!
 * ${copyright}
 */

// Provides control sap.ui.demokit.CodeSampleContainer.
sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/Control',
    'sap/ui/commons/Link',
    './library',
    './CodeViewer',
    './UIAreaSubstitute',
    "./CodeSampleContainerRenderer"
],
	function(
	    jQuery,
		Control,
		Link,
		library,
		CodeViewer,
		UIAreaSubstitute,
		CodeSampleContainerRenderer
	) {
	"use strict";



	/**
	 * Constructor for a new CodeSampleContainer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A container for both the source and the runtime results of a CodeSample. By default, only the runtime results are shown. There are additional controls that allow the user to display the source, modify and run it.
	 *
	 * The container provides a sub container that can be used in calls to sap.ui.setRoot() as if it would be a normal UIArea. So the sample code doesn't have to know that it runs in a CodeSample container.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @sap-restricted sdk
	 * @alias sap.ui.demokit.CodeSampleContainer
	 */
	var CodeSampleContainer = Control.extend("sap.ui.demokit.CodeSampleContainer", /** @lends sap.ui.demokit.CodeSampleContainer.prototype */ { metadata : {

		library : "sap.ui.demokit",
		properties : {

			/**
			 * Id of the script element that contains the initial sample code for this code sample.
			 */
			scriptElementId : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Id of the container for the running code. This Id can be used in calls to sap.ui.setRoot as if it would be a normal UIArea. Internally, a container UIElement is created with that Id.
			 */
			uiAreaId : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * A title to be displayed above the code.
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Whether the source code is visible or not.
			 */
			sourceVisible : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Width of the CodeSample container.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : '90%'}
		},
		aggregations : {

			/**
			 * The UIAreaSubstitute used by this code sample container
			 */
			_uiarea : {type : "sap.ui.demokit.UIAreaSubstitute", multiple : false, visibility : "hidden"}
		},
		events : {

			/**
			 * Fired when the user decides to apply his/her changes to the sample code
			 */
			apply : {
				parameters : {

					/**
					 * the current code that will be applied
					 */
					code : {type : "string"}
				}
			}
		}
	}});


	CodeSampleContainer.prototype.init = function(){

		this._oUIArea = new UIAreaSubstitute(this.getUiAreaId());
		this.setAggregation("_uiarea", this._oUIArea);
		this._oCodeViewer = new CodeViewer({
			visible : false,
			source : "",
			press : [this._setCodeEditable, this],
			save : [this._saveAndApplyCode, this]
		});
		this._oCodeViewer.setParent(this); //TODO provide sAggregationName?
		this._oShowCodeLink = new Link({	text : "Show Source", press : [this._toggleCodeDisplay, this]});
		this._oShowCodeLink.setParent(this); //TODO provide sAggregationName?
		this._oApplyCodeLink = new Link({ visible: false, text : 'Apply', press : [this._saveAndApplyCode, this]});
		this._oApplyCodeLink.setParent(this); //TODO provide sAggregationName?

	};

	CodeSampleContainer.prototype.setSourceVisible = function(bSourceVisible) {
		this.setProperty("sourceVisible", bSourceVisible);
		this._oCodeViewer && this._oCodeViewer.setVisible(this.getSourceVisible());
		this._oShowCodeLink && this._oShowCodeLink.setText(this.getSourceVisible() ? "Hide Source" : "Show Source");
		this._oApplyCodeLink && this._oApplyCodeLink.setVisible(this.getSourceVisible());
	};

	CodeSampleContainer.prototype.setUiAreaId = function(sId) {
		this.setProperty("uiAreaId", sId);
		var aContent;
		if ( this._oUIArea ) {
			aContent = this._oUIArea.removeAllContent();
			this._oUIArea.destroy();
		}
		this._oUIArea = new UIAreaSubstitute(this.getUiAreaId());
		this.setAggregation("_uiarea", this._oUIArea);
		if ( aContent ) {
			for (var i = 0; i < aContent.length; i++) {
				this._oUIArea.addContent(aContent[i]);
			}
		}
	};

	CodeSampleContainer.prototype.setScriptElementId = function(sId) {
		this.setProperty("scriptElementId", sId);
		this._oCodeViewer.setSource(this._getSource());
		if ( sId && !this._oScriptRef ) {
			var that = this;
			sap.ui.getCore().attachInitEvent(function() { that._oCodeViewer.setSource(that._getSource()); });
		}
	};

	CodeSampleContainer.prototype._getSource = function() {
		var sSource = "!source not found! (" + this.getScriptElementId() + ")";
		if ( this.getScriptElementId() ) {
			this._oScriptRef = jQuery.sap.domById(this.getScriptElementId());
			if ( this._oScriptRef ) {
				sSource = this._oScriptRef.innerHTML;
			}
		}
		return sSource;
	};

	CodeSampleContainer.prototype._setCodeEditable = function() {
		this._oCodeViewer.setEditable(true);
		var that = this;
		setTimeout(function() { that._oCodeViewer.focus(); }, 50);
	};

	CodeSampleContainer.prototype._toggleCodeDisplay = function() {
		this.setSourceVisible(!this.getSourceVisible());
	};

	CodeSampleContainer.prototype._saveAndApplyCode = function() {
		var sCode = this._oCodeViewer.getSource();
		if ( this._oCodeViewer.getEditable() ) {
			sCode = this._oCodeViewer.getCurrentSource();
			this._oCodeViewer.setSource(sCode);
			this._oCodeViewer.setEditable(false);
		}

		// before executing the new code, we discard the old UIArea content
		// Otherwise, invalidation might fail (due to the bPrerendered logic in Control)
		this._oUIArea.destroyContent();

		// now execute the code
		if ( !this.hasListeners("apply") ) {
			jQuery.sap.globalEval(sCode);
		} else {
			this.fireApply({ code : sCode });
		}

	};


	return CodeSampleContainer;

});
