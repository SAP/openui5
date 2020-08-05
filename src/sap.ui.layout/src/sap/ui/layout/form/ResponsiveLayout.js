/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.ResponsiveLayout.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/layout/library',
	'sap/ui/layout/ResponsiveFlowLayout',
	'sap/ui/layout/ResponsiveFlowLayoutData',
	'./Form',
	'./FormContainer',
	'./FormElement',
	'./FormLayout',
	'./ResponsiveLayoutRenderer'
],
	function(
		Control,
		library,
		ResponsiveFlowLayout,
		ResponsiveFlowLayoutData,
		Form,
		FormContainer,
		FormElement,
		FormLayout,
		ResponsiveLayoutRenderer
	) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.layout.form.ResponsiveLayout.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>ResponsiveLayout</code> renders a <code>Form</code> with a responsive layout. Internally the <code>ResponsiveFlowLayout</code> is used.
	 * The responsiveness of this layout tries to best use the available space. This means that the order of the <code>FormContainers</code>, labels and fields depends on the available space.
	 *
	 * On the <code>FormContainers</code>, <code>FormElements</code>, labels and content fields, <code>ResponsiveFlowLayoutData</code> can be used to change the default rendering.
	 *
	 * We suggest using the <code>ResponsiveGridLayout</code> instead of this layout because this is easier to consume and brings more stable responsive output.
	 *
	 * <b>Note:</b> If <code>ResponsiveFlowLayoutData</code> are used this may result in a much more complex layout than the default one. This means that in some cases, the calculation for the other content may not bring the expected result.
	 * In such cases, <code>ResponsiveFlowLayoutData</code> should be used for all content controls to disable the default behavior.
	 *
	 * This control cannot be used stand-alone, it just renders a <code>Form</code>, so it must be assigned to a <code>Form</code> using the <code>layout</code> aggregation.
	 * @extends sap.ui.layout.form.FormLayout
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.form.ResponsiveLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ResponsiveLayout = FormLayout.extend("sap.ui.layout.form.ResponsiveLayout", /** @lends sap.ui.layout.form.ResponsiveLayout.prototype */ { metadata : {

		library : "sap.ui.layout"
	}});

	/*
	 * The ResponsiveLayout for forms inside is using ResponsiveFlowLayouts to render the form.
	 * There is no own rendering for FormContainers or FormElements.
	 * The whole Layout has a Responsive FlowLayout inside to make the FormContainers responsive.
	 * Only if there is only one FormContainer inside the Form there is no ResponsiveFlowLayout
	 * for the whole layout.
	 * A FormContainer is rendered as a Panel if it has a title or an expander. Inside the panel there
	 * is a ResponsiveFlowLayout for the single FormElements. If the FormContainer has no title or
	 * expander, just the ResponsiveFlowLayout is rendered.
	 * A FormElement is rendered as ResponsiveFlowLayout to make the label and the fields responsive.
	 * If the Element has a label and more than 1 Field a ResponsiveFlowLayout including the fields is rendered.
	 * The Panels and ResponsiveFlowLayouts are stored in object this.mContainers. This has the following
	 * structure:
	 * - For each FormContainer there is an entry inside the object. (this.mContainers[FormContainerId])
	 * - For each FormContainer there is an array with 3 entries:
	 *   - [0]: The Panel that renders the Container (undefined if no panel is used)
	 *          - It's not the standard Panel, is a special panel defined for the ResponsiveLayout
	 *   - [1]: The ResponsiveFlowLayout that holds the Containers content
	 *          - the getLayoutData function of this ResponsiveFlowLayouts is overwritten to get the LayoutData of the FormContainer
	 *            (If no panel is used)
	 *   - [2]: An object that holds the ResponsiveFlowLayouts for the FormElements:
	 *          - For each FormElement there is an entry inside the object. (this.mContainers[FormElementId])
	 *          - Each object includes an array with 2 entries:
	 *            - [0]: The ResponsiveFlowLayout for the FormElement
	 *            - [1]: If more than 1 Field and a label, here the ResponsiveFlowLayout for the fields is stored
	 *          - the getContent function of this ResponsiveFlowLayouts is overwritten to get the content of the FormElement
	 *          - the getLayoutData function of this ResponsiveFlowLayouts is overwritten to get the LayoutData of the FormElement
	 *
	 * It must be made sure to hold this object up to date. So it is filled onBeforeRendering. Entries no longer used are deleted
	 *
	 * In this._mainRFLayout the ResponsiveFlowLayout of the whole layout is stored. (If more than one Container.)
	 */

	/*
	 * as the panel can not be used in mobile environment an own internal control is needed to render the containers
	 * use FormContainer as association to have access to it's content directly. So no mapping of properties and aggregations needed
	 */
	var Panel = Control.extend("sap.ui.layout.form.ResponsiveLayoutPanel", {

		metadata : {
			library: "sap.ui.layout",
			aggregations: {
				"content"   : {type: "sap.ui.layout.ResponsiveFlowLayout", multiple: false}
			},
			associations: {
				"container" : {type: "sap.ui.layout.form.FormContainer", multiple: false},
				"layout"    : {type: "sap.ui.layout.form.ResponsiveLayout", multiple: false}
			}
		},

		getLayoutData :  function(){

			// only ResponsiveFlowLayoutData are interesting
			var oContainer = sap.ui.getCore().byId(this.getContainer());
			var oLayout    = sap.ui.getCore().byId(this.getLayout());
			var oLD;
			if (oLayout && oContainer) {
				oLD = oLayout.getLayoutDataForElement(oContainer, "sap.ui.layout.ResponsiveFlowLayoutData");
			}
			return oLD;

		},

		getCustomData :  function(){

			var oContainer = sap.ui.getCore().byId(this.getContainer());
			if (oContainer) {
				return oContainer.getCustomData();
			}

		},

		refreshExpanded :  function(){

			var oContainer = sap.ui.getCore().byId(this.getContainer());
			if (oContainer) {
				if (oContainer.getExpanded()) {
					this.$().removeClass("sapUiRLContainerColl");
				} else {
					this.$().addClass("sapUiRLContainerColl");
				}
			}
		},

		renderer : function(oRm, oPanel) {

			var oContainer = sap.ui.getCore().byId(oPanel.getContainer());
			var oLayout    = sap.ui.getCore().byId(oPanel.getLayout());
			var oContent   = oPanel.getContent();

			if (!oContainer || !oLayout) {
				// Container might be removed, but ResponsiveFlowLayout still calls a rerendering with old content
				return;
			}

			var bExpandable = oContainer.getExpandable();
			var sTooltip = oContainer.getTooltip_AsString();
			var oToolbar = oContainer.getToolbar();
			var oTitle = oContainer.getTitle();

			oRm.write("<div");
			oRm.writeControlData(oPanel);
			oRm.addClass("sapUiRLContainer");
			if (bExpandable && !oContainer.getExpanded()) {
				oRm.addClass("sapUiRLContainerColl");
			}
			if (oToolbar) {
				oRm.addClass("sapUiFormContainerToolbar");
			} else if (oTitle) {
				oRm.addClass("sapUiFormContainerTitle");
			}

			if (sTooltip) {
				oRm.writeAttributeEscaped('title', sTooltip);
			}
			oRm.writeClasses();

			oLayout.getRenderer().writeAccessibilityStateContainer(oRm, oContainer);

			oRm.write(">");

			// container header
			oLayout.getRenderer().renderHeader(oRm, oToolbar, oTitle, oContainer._oExpandButton, bExpandable, false, oContainer.getId());

			if (oContent) {
				oRm.write("<div");
				oRm.addClass("sapUiRLContainerCont");
				oRm.writeClasses();
				oRm.write(">");
				// container is not expandable or is expanded -> render elements
				oRm.renderControl(oContent);
				oRm.write("</div>");
			}

			oRm.write("</div>");
		}

	});

	/* eslint-disable no-lonely-if */

	ResponsiveLayout.prototype.init = function(){

		this.mContainers = {}; //association of container to panel and ResponsiveFlowLayout
		this._defaultLayoutData = new ResponsiveFlowLayoutData({margin: false});

	};

	ResponsiveLayout.prototype.exit = function(){

		// clear panels
		for ( var sContainerId in this.mContainers) {
			_cleanContainer.call(this, sContainerId);
		}

		// clear ResponsiveFlowLayouts
		if (this._mainRFLayout) {
			this._mainRFLayout.destroy();
			delete this._mainRFLayout;
		}

		this._defaultLayoutData.destroy();
		delete this._defaultLayoutData;

	};

	ResponsiveLayout.prototype.onBeforeRendering = function( oEvent ){

		var oForm = this.getParent();
		if (!oForm || !(oForm instanceof Form)) {
			// layout not assigned to form - nothing to do
			return;
		}

		oForm._bNoInvalidate = true; // don't invalidate Form if only the Grids, Panels and LayoutData are created or changed)
		_createPanels.call(this, oForm);
		_createMainResponsiveFlowLayout.call(this, oForm);
		oForm._bNoInvalidate = false;

	};

	ResponsiveLayout.prototype.toggleContainerExpanded = function(oContainer){

		//adapt the corresponding panel
		var sContainerId = oContainer.getId();
		if (this.mContainers[sContainerId] && this.mContainers[sContainerId][0]) {
			var oPanel = this.mContainers[sContainerId][0];
			oPanel.refreshExpanded();
		}

	};

	ResponsiveLayout.prototype.onLayoutDataChange = function(oEvent){

		var oSource = oEvent.srcControl;
		var oContainer;
		var sContainerId;
		var sElementId;

		// if layoutData changed for a Container, Element, or Field call the
		// onLayoutDataChange function of the parent ResponsiveFlowLayout

		if (oSource instanceof FormContainer) {
			if (this._mainRFLayout) {
				this._mainRFLayout.onLayoutDataChange(oEvent);
			}
		} else if (oSource instanceof FormElement) {
			sContainerId = oSource.getParent().getId();
			if (this.mContainers[sContainerId] && this.mContainers[sContainerId][1]) {
				this.mContainers[sContainerId][1].onLayoutDataChange(oEvent);
			}
		} else {
			var oParent = oSource.getParent();
			if (oParent instanceof FormElement) {
				oContainer = oParent.getParent();
				sContainerId = oContainer.getId();
				sElementId = oParent.getId();
				if (this.mContainers[sContainerId] && this.mContainers[sContainerId][2] &&
					this.mContainers[sContainerId][2][sElementId]) {
					if (this.mContainers[sContainerId][2][sElementId][1]) {
						// update fields RF-Layout
						var aFields = oParent.getFieldsForRendering();
						_updateLayoutDataOfContentResponsiveFlowLayout.call(this, this.mContainers[sContainerId][2][sElementId][1], aFields);
					}
					this.mContainers[sContainerId][2][sElementId][0].onLayoutDataChange(oEvent);
				}
			}
		}

	};

	ResponsiveLayout.prototype.onsapup = function(oEvent){
		this.onsapleft(oEvent);
	};

	ResponsiveLayout.prototype.onsapdown = function(oEvent){
		this.onsapright(oEvent);
	};

	/**
	 * As Elements must not have a DOM reference it is not sure if one exists
	 * If the <code>FormContainer</code> has a title or is expandable an internal panel is rendered.
	 * In this case, the panel's DOM reference is returned, otherwise the DOM reference
	 * of the <code>ResponsiveFlowLayout</code> rendering the container's content.
	 * @param {sap.ui.layout.form.FormContainer} oContainer <code>FormContainer</code>
	 * @return {Element} The Element's DOM representation or null
	 * @private
	 */
	ResponsiveLayout.prototype.getContainerRenderedDomRef = function(oContainer) {

		if (this.getDomRef()) {
			var sContainerId = oContainer.getId();
			if (this.mContainers[sContainerId]) {
				if (this.mContainers[sContainerId][0]) {
					var oPanel = this.mContainers[sContainerId][0];
					return oPanel.getDomRef();
				}else if (this.mContainers[sContainerId][1]){
					// no panel used -> return RFLayout
					var oRFLayout = this.mContainers[sContainerId][1];
					return oRFLayout.getDomRef();
				}
			}
		}

		return null;

	};

	/**
	 * As Elements must not have a DOM reference it is not sure if one exists.
	 * In this Layout each <code>FormElement</code> is represented by an own ResponsiveFlowLayout.
	 * So the DOM of this <code>ResponsiveFlowLayout</code> is returned
	 * @param {sap.ui.layout.form.FormElement} oElement <code>FormElement</code>
	 * @return {Element} The Element's DOM representation or null
	 * @private
	 */
	ResponsiveLayout.prototype.getElementRenderedDomRef = function(oElement) {

		if (this.getDomRef()) {
			var oContainer = oElement.getParent();
			var sElementId = oElement.getId();
			var sContainerId = oContainer.getId();
			if (this.mContainers[sContainerId]) {
				if (this.mContainers[sContainerId][2]){
					var mRFLayouts = this.mContainers[sContainerId][2];
					if (mRFLayouts[sElementId]) {
						var oRFLayout = mRFLayouts[sElementId][0];
						return oRFLayout.getDomRef();
					}
				}
			}
		}

		return null;

	};

	function _createPanels( oForm ) {

		var aVisibleContainers = oForm.getVisibleFormContainers();
		var iVisibleContainers = aVisibleContainers.length;
		var oContainer;
		var sContainerId;
		var oPanel;
		var oRFLayout;
		var i = 0;
		for ( i = 0; i < iVisibleContainers; i++) {
			oContainer = aVisibleContainers[i];
			oContainer._checkProperties();
			sContainerId = oContainer.getId();
			oPanel = undefined;
			oRFLayout = undefined;
			if (this.mContainers[sContainerId] && this.mContainers[sContainerId][1]) {
				// ResponsiveFlowLayout already created
				oRFLayout = this.mContainers[sContainerId][1];
			} else {
				oRFLayout = _createResponsiveFlowLayout.call(this, oContainer, undefined);
			}

			var oTitle = oContainer.getTitle();
			var oToolbar = oContainer.getToolbar();
			if (oToolbar || oTitle || oContainer.getExpandable()) {
				// only if container has a title a panel is used
				if (this.mContainers[sContainerId] && this.mContainers[sContainerId][0]) {
					// Panel already created
					oPanel = this.mContainers[sContainerId][0];
				} else {
					oPanel = _createPanel.call(this, oContainer, oRFLayout);
					_changeGetLayoutDataOfResponsiveFlowLayout(oRFLayout, true);
				}
				oRFLayout.removeStyleClass("sapUiRLContainer");
			} else {
				// panel not longer needed
				if (this.mContainers[sContainerId] && this.mContainers[sContainerId][0]) {
					_deletePanel(this.mContainers[sContainerId][0]);
					_changeGetLayoutDataOfResponsiveFlowLayout(oRFLayout, false);
				}
				oRFLayout.addStyleClass("sapUiRLContainer");
			}

			var mContent = _createContent.call(this, oContainer, oRFLayout);

			this.mContainers[sContainerId] = [oPanel, oRFLayout, mContent];
		}

		var iObjectLength = Object.keys(this.mContainers).length;
		if (iVisibleContainers < iObjectLength) {
			// delete old containers panels
			for ( sContainerId in this.mContainers) {
				var bFound = false;
				for ( i = 0; i < iVisibleContainers; i++) {
					oContainer = aVisibleContainers[i];
					if (sContainerId == oContainer.getId()) {
						bFound = true;
						break;
					}
				}
				if (!bFound) {
					_cleanContainer.call(this, sContainerId);
				}
			}
		}

	}

	function _createPanel( oContainer, oRFLayout ) {

		var sContainerId = oContainer.getId();
		var oPanel = new Panel(sContainerId + "--Panel", {
			container: oContainer,
			layout   : this,
			content : oRFLayout
		});

		return oPanel;

	}

	/*
	 * clear variables before delete it
	 */
	function _deletePanel( oPanel ) {

		oPanel.setContent(null);
		oPanel.setLayout(null);
		oPanel.setContainer(null);
		oPanel.destroy();

	}

	function _createContent( oContainer, oContainerLayout ) {

		var sContainerId = oContainer.getId();
		var aElements = oContainer.getVisibleFormElements();
		var iVisibleElements = aElements.length;
		var mRFLayouts = {};
		if (this.mContainers[sContainerId] && this.mContainers[sContainerId][2]) {
			mRFLayouts = this.mContainers[sContainerId][2];
		}

		var oRFLayout;
		var oFieldsRFLayout;
		var iLastIndex = -1;
		var oElement;
		var sElementId;
		var i = 0;
		for (i = 0; i < iVisibleElements; i++) {
			oElement = aElements[i];
			sElementId = oElement.getId();
			_checkElementMoved.call(this, oContainer, oElement, mRFLayouts, oContainerLayout, i);
			if (mRFLayouts[sElementId]) {
				// ResponsiveFlowLayout already created
				oRFLayout = mRFLayouts[sElementId][0];
				iLastIndex = oContainerLayout.indexOfContent(oRFLayout);
				if (iLastIndex != iVisibleElements) {
					// order has changed -> move it
					oContainerLayout.removeContent(oRFLayout);
					oContainerLayout.insertContent(oRFLayout, iVisibleElements);
					iLastIndex = iVisibleElements;
				}
			} else {
				oRFLayout = _createResponsiveFlowLayout.call(this, oContainer, oElement);
				oRFLayout.addStyleClass("sapUiRLElement");
				if (oElement.getLabel()) {
					oRFLayout.addStyleClass("sapUiRLElementWithLabel");
				}
				mRFLayouts[sElementId] = [oRFLayout, undefined];
				iLastIndex++;
				oContainerLayout.insertContent(oRFLayout, iLastIndex);
			}

			// if more fields after a label put the fields in an additional ResponsiveFlowLayout
			var aFields = oElement.getFieldsForRendering();
			if (oElement.getLabel() && aFields.length > 1) {
				if (mRFLayouts[sElementId][1]) {
					oFieldsRFLayout = mRFLayouts[sElementId][1];
				} else {
					oFieldsRFLayout = _createResponsiveFlowLayout.call(this, oContainer, oElement, true);
					oFieldsRFLayout.addStyleClass("sapUiRLElementFields");
					mRFLayouts[sElementId][1] = oFieldsRFLayout;
				}
				_updateLayoutDataOfContentResponsiveFlowLayout.call(this, oFieldsRFLayout, aFields);
			} else {
				if (mRFLayouts[sElementId][1]) {
					// ResponsiveFlowLayout for fields not longer needed
					oFieldsRFLayout = mRFLayouts[sElementId][1];
					_deleteResponsiveFlowLayout(oFieldsRFLayout);
					mRFLayouts[sElementId][1] = undefined;
				}
			}
		}

		var iObjectLength = Object.keys(mRFLayouts).length;
		if (iVisibleElements < iObjectLength) {
			// delete old elements RFLayouts
			for ( sElementId in mRFLayouts) {
				var bFound = false;
				for ( i = 0; i < iVisibleElements; i++) {
					oElement = aElements[i];
					if (sElementId == oElement.getId()) {
						bFound = true;
						break;
					}
				}
				if (!bFound) {
					if (mRFLayouts[sElementId][1]) {
						// ResponsiveFlowLayout for fields not longer needed
						oFieldsRFLayout = mRFLayouts[sElementId][1];
						_deleteResponsiveFlowLayout(oFieldsRFLayout);
					}
					oRFLayout = mRFLayouts[sElementId][0];
					oContainerLayout.removeContent(oRFLayout);
					_deleteResponsiveFlowLayout(oRFLayout);
					delete mRFLayouts[sElementId];
				}
			}
		}

		return mRFLayouts;

	}

	function _createResponsiveFlowLayout( oContainer, oElement, bElementContent ) {

		var sId;
		if (oElement && !bElementContent) {
			sId = oElement.getId() + "--RFLayout";
		} else if (oElement && bElementContent) {
			sId = oElement.getId() + "--content--RFLayout";
		} else if (oContainer) {
			sId = oContainer.getId() + "--RFLayout";
		} else {
			return false;
		}

		var oRFLayout = new ResponsiveFlowLayout(sId);
		oRFLayout.__myParentLayout = this;
		oRFLayout.__myParentContainerId = oContainer.getId();

		if (oElement) {
			oRFLayout.__myParentElementId = oElement.getId();
			// assign Elements content -> overwrite getContent function of responsiveFlowLayout
			// to not change parent assignment of controls
			if (!bElementContent) {
				oRFLayout.getContent = function(){
					var oElement = sap.ui.getCore().byId(this.__myParentElementId);
					if (oElement) {
						var aContent = [];
						var oLabel = oElement.getLabelControl();
						var aFields = oElement.getFieldsForRendering();
						if (!oLabel || aFields.length <= 1) {
							aContent = aFields;
							if (oLabel) {
								aContent.unshift(oLabel);
							}
						} else {
							// more than one field -> put in the content RFLayout
							var oLayout = this.__myParentLayout;
							var sContainerId = this.__myParentContainerId;
							var sElementId = oElement.getId();
							if (oLabel) {
								aContent.push(oLabel);
							}
							if (oLayout.mContainers[sContainerId] && oLayout.mContainers[sContainerId][2] &&
									oLayout.mContainers[sContainerId][2][sElementId] &&
									oLayout.mContainers[sContainerId][2][sElementId][1]) {
								aContent.push(oLayout.mContainers[sContainerId][2][sElementId][1]);
							}
						}

						return aContent;
					} else {
						return false;
					}
				};

				oRFLayout._addContentClass = function(oControl, iIndex) {

					if (iIndex == 0) {
						// check if it's the label of the FormElement
						var oElement = sap.ui.getCore().byId(this.__myParentElementId);
						if (oElement) {
							var oLabel = oElement.getLabelControl();
							if (oControl == oLabel) {
								return "sapUiFormElementLbl";
							}
						}
					}

					return null;

				};
			} else {
				oRFLayout.getContent = function(){
					var oElement = sap.ui.getCore().byId(this.__myParentElementId);
					if (oElement) {
						return oElement.getFieldsForRendering();
					} else {
						return false;
					}
				};
			}
		}else if (oContainer) {
			oRFLayout._getAccessibleRole = function() {

				var oContainer = sap.ui.getCore().byId(this.__myParentContainerId);
				var oLayout = this.__myParentLayout;
				if (oLayout._mainRFLayout && !oContainer.getToolbar() && !oContainer.getTitle() &&
						!oContainer.getExpandable() && oContainer.getAriaLabelledBy().length > 0) {
					// set role only if Title or ariaLabelledBy is set as JAWS 18 has some issues without.
					return "form";
				}

			};

			oRFLayout.getAriaLabelledBy = function(){
				var oContainer = sap.ui.getCore().byId(this.__myParentContainerId);
				if (oContainer && !oContainer.getToolbar() && !oContainer.getTitle() && !oContainer.getExpandable()) {
					return oContainer.getAriaLabelledBy();
				}

				return [];
			};
		}

		if ((oElement && !bElementContent) || (!oElement && !oContainer.getToolbar() && !oContainer.getTitle() && !oContainer.getExpandable())) {
			// use LayoutData of container only if no panel is used
			_changeGetLayoutDataOfResponsiveFlowLayout(oRFLayout, false);
		} else {
			// create LayoutData to disable margins
			oRFLayout.setLayoutData(new ResponsiveFlowLayoutData({margin: false}));
		}

		return oRFLayout;

	}

	function _changeGetLayoutDataOfResponsiveFlowLayout( oRFLayout, bOriginal ) {
		// only ResponsiveFlowLayoutData are from interest
		// if none maintained use default one to disable margins

		if (bOriginal) {
			if (oRFLayout.__originalGetLayoutData) {
				oRFLayout.getLayoutData = oRFLayout.__originalGetLayoutData;
				delete oRFLayout.__originalGetLayoutData;
			}
		} else if (!oRFLayout.__originalGetLayoutData) {
			oRFLayout.__originalGetLayoutData = oRFLayout.getLayoutData;
			oRFLayout.getLayoutData = function(){
				var oLayout = this.__myParentLayout;
				var oContainer = sap.ui.getCore().byId(this.__myParentContainerId);
				var oElement = sap.ui.getCore().byId(this.__myParentElementId);

				var oLD;
				if (oElement) {
					oLD = oLayout.getLayoutDataForElement(oElement, "sap.ui.layout.ResponsiveFlowLayoutData");
				} else if (oContainer) {
					oLD = oLayout.getLayoutDataForElement(oContainer, "sap.ui.layout.ResponsiveFlowLayoutData");
				}

				if (oLD) {
					return oLD;
				} else if (oElement) {
					// for containers without panel the margins are needed.
					return oLayout._defaultLayoutData;
				}
			};
		}

	}

	/*
	 * If a ResponsiveFlowLayout for the fields of a FormElement is used it must get the weight
	 * of all fields to have the right weight relative to the label.
	 */
	function _updateLayoutDataOfContentResponsiveFlowLayout( oRFLayout, aFields ) {

		var oLD;
		var iWeight = 0;
		for ( var i = 0; i < aFields.length; i++) {
			var oField = aFields[i];
			oLD = this.getLayoutDataForElement(oField, "sap.ui.layout.ResponsiveFlowLayoutData");
			if (oLD) {
				iWeight = iWeight + oLD.getWeight();
			} else {
				iWeight++;
			}
		}

		oLD = oRFLayout.getLayoutData();
		if (oLD) {
			oLD.setWeight(iWeight);
		} else {
			oRFLayout.setLayoutData(
					new ResponsiveFlowLayoutData({weight: iWeight})
			);
		}

	}

	/*
	 * clear variables before delete it
	 */
	function _deleteResponsiveFlowLayout( oRFLayout ) {

		if (oRFLayout.__myParentContainerId) {
			oRFLayout.__myParentContainerId = undefined;
		}
		if (oRFLayout.__myParentElementId) {
			oRFLayout.__myParentElementId = undefined;
		}
		oRFLayout.__myParentLayout = undefined;

		oRFLayout.destroy();

	}

	function _cleanContainer( sContainerId ) {

		var aContainerContent = this.mContainers[sContainerId];
		var oRFLayout;

		//delete Elements Content
		var oElementRFLayouts = aContainerContent[2];
		if (oElementRFLayouts) {
			for ( var sElementId in oElementRFLayouts) {
				if (oElementRFLayouts[sElementId][1]) {
					// ResponsiveFlowLayout for fields not longer needed
					_deleteResponsiveFlowLayout(oElementRFLayouts[sElementId][1]);
				}
				oRFLayout = oElementRFLayouts[sElementId][0];
				_deleteResponsiveFlowLayout(oRFLayout);
				delete oElementRFLayouts[sElementId];
			}
		}

		//delete ResponsiveFlowLayout
		oRFLayout = aContainerContent[1];
		if (oRFLayout) {
			oRFLayout.removeAllContent();
			_deleteResponsiveFlowLayout(oRFLayout);
		}

		//delete panel
		var oPanel = aContainerContent[0];
		if (oPanel) {
			_deletePanel(oPanel);
		}

		delete this.mContainers[sContainerId];

	}

	function _checkElementMoved(oContainer, oElement, mRFLayouts, oContainerLayout, iIndex){

		// if an Element is just moved from one Container to another this is not recognized
		// so the ResponsiveFlowLayouts must be updated and the control object must be adjusted
		var sElementId = oElement.getId();
		var sId = sElementId + "--RFLayout";
		var oRFLayout = sap.ui.getCore().byId(sId);

		if (!mRFLayouts[sElementId] && oRFLayout) {
			// Element not maintained in control object of container but already has a RFLayout
			// find old container id
			var sOldContainerId = oRFLayout.__myParentContainerId;

			// move to new containers control object
			mRFLayouts[sElementId] = this.mContainers[sOldContainerId][2][sElementId];
			oContainerLayout.insertContent(oRFLayout, iIndex);
			oRFLayout.__myParentContainerId = oContainer.getId();
			if (mRFLayouts[sElementId][1]) {
				mRFLayouts[sElementId][1].__myParentContainerId = oContainer.getId();
			}

			// delete from old container in control object
			delete this.mContainers[sOldContainerId][2][sElementId];
		}

	}

	function _createMainResponsiveFlowLayout( oForm ) {

		var aVisibleContainers = oForm.getVisibleFormContainers();
		var oContainer;
		var iLength = aVisibleContainers.length;
		var iContentLenght = 0;
		var i = 0;
		var j = 0;

		// special case: only one container -> do not render an outer ResponsiveFlowLayout
		if (iLength > 1) {
			if (!this._mainRFLayout) {
				this._mainRFLayout = new ResponsiveFlowLayout(oForm.getId() + "--RFLayout").setParent(this);
			} else {
				// update containers
				var aLayoutContent = this._mainRFLayout.getContent();
				iContentLenght = aLayoutContent.length;
				var bExchangeContent = false;
				// check if content has changed
				for ( i = 0; i < iContentLenght; i++) {
					var oContentElement = aLayoutContent[i];
					oContainer = undefined;
					if (oContentElement.getContainer) {
						// it's a panel
						oContainer = sap.ui.getCore().byId(oContentElement.getContainer());
					} else {
						// it's a RFLayout
						oContainer = sap.ui.getCore().byId(oContentElement.__myParentContainerId);
					}
					if (oContainer && oContainer.isVisible()) {
						var oVisibleContainer = aVisibleContainers[j];
						if (oContainer != oVisibleContainer) {
							// order of containers has changed
							bExchangeContent = true;
							break;
						}

						var aContainerContent = this.mContainers[oContainer.getId()];
						if (aContainerContent[0] && aContainerContent[0] != oContentElement) {
							// container uses panel but panel not the same element in content
							bExchangeContent = true;
							break;
						}
						if (!aContainerContent[0] && aContainerContent[1] && aContainerContent[1] != oContentElement) {
							// container uses no panel but RFLayout not the same element in content
							bExchangeContent = true;
							break;
						}
						j++;
					} else {
						// no container exits for content -> just remove this content
						this._mainRFLayout.removeContent(oContentElement);
					}
				}
				if (bExchangeContent) {
					// remove all content and add it new.
					this._mainRFLayout.removeAllContent();
					iContentLenght = 0;
				}
			}
			if (iContentLenght < iLength) {
				// new containers added
				var iStartIndex = 0;
				if (iContentLenght > 0) {
					iStartIndex = iContentLenght--;
				}
				for ( i = iStartIndex; i < iLength; i++) {
					oContainer = aVisibleContainers[i];
					var sContainerId = oContainer.getId();
					if (this.mContainers[sContainerId]) {
						if (this.mContainers[sContainerId][0]) {
							// panel used
							this._mainRFLayout.addContent(this.mContainers[sContainerId][0]);
						} else if (this.mContainers[sContainerId][1]) {
							// no panel - used ResponsiveFlowLayot directly
							this._mainRFLayout.addContent(this.mContainers[sContainerId][1]);
						}
					}
				}
			}
		}

	}

	return ResponsiveLayout;

});