/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function (jQuery) {
		"use strict";

		var FeedbackClient = function () {
			this._oFeedbackContextText;
			this._oIncludeFeedbackContextCB;
		};

		FeedbackClient.prototype.updateFeedbackContextText = function () {
			if (this._oIncludeFeedbackContextCB.getChecked()) {
			   updateFeedbackContextTextWithLink.call(this);
			} else {
				updateFeedbackContextTextNoLink.call(this);
			}

			function updateFeedbackContextTextWithLink() {
				this._oFeedbackContextText.setText("Location: " + this._getCurrentPageRelativeURL() + "\n" + getUI5Distribution() + " Version: " + sap.ui.getVersionInfo().version);
			}

			function updateFeedbackContextTextNoLink() {
				this._oFeedbackContextText.setText(getUI5Distribution() + " Version: " + sap.ui.getVersionInfo().version);
			}

			function getUI5Distribution() {
				var oVersionInfo = sap.ui.getVersionInfo();
				var sUI5Distribution = "SAPUI5";
				if (oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav)) {
					sUI5Distribution = "OpenUI5";
				}
				return sUI5Distribution;
			}
		};

		FeedbackClient.prototype._getCurrentPageRelativeURL = function () {
			var parser = window.location;
			return parser.pathname + parser.hash + parser.search;
		};

		FeedbackClient.prototype.createFeedbackPopup = function () {
			this._oFeedbackContextText = new sap.ui.commons.TextView("oFeedbackContextText");
			this._oIncludeFeedbackContextCB = new sap.ui.commons.CheckBox("includePageCB");

			var that = this;

			var oConfigResponse = jQuery.sap.loadResource('sap/ui/demokit/configuration/properties.json');
			var sFeedbackServiceURL = oConfigResponse["FeedbackServiceURL"];

			var FEEDBACK_INPUT_PLACEHOLDER = 'Describe what you like or what needs to be improved. You can share your feedback for the overall Demokit experience or for the specific page you are currently viewing.';

			var oFeedbackRatingLabel, iRatingValue, oFeedbackRatingButton, oFeedbackInput, oContextDataLink, oCloseFeedbackButton, oSendFeedbackButton;

			function setFeedbackPopupContent(oLayout){
				resetFeedbackPopupState();
				oLayout.addContent(oCloseFeedbackButton);
				oFeedbackPopup.removeAllContent();
				oFeedbackPopup.addContent(oLayout);
			}

			function setFeedbackPopupBusyState() {
				oFeedbackPopup.setBusyIndicatorDelay(0);
				oFeedbackPopup.setBusy(true);
				oFeedbackInput.setValueState(sap.ui.core.ValueState.None);
				oFeedbackInput.setPlaceholder(FEEDBACK_INPUT_PLACEHOLDER);
			}

			function resetFeedbackPopupState() {
				oFeedbackPopup.setBusy(false);
				oFeedbackRatingLabel.setText("");
				oFeedbackRatingButton.setSelectedButton();
				oFeedbackInput.setValue('');
				that._oIncludeFeedbackContextCB.setChecked(false);
				that._oIncludeFeedbackContextCB.fireChange();
				that._oFeedbackContextText.setVisible(false);
				oContextDataLink.setText("Show context data");
				oContextDataLink.setTooltip("Show context data");
				oSendFeedbackButton.setEnabled(false);
			}

			function registerFeedbackRatingIcons() {
				sap.ui.core.IconPool.addIcon("icon-face-very-bad", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E086",
					suppressMirroring: true
				});
				sap.ui.core.IconPool.addIcon("icon-face-bad", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E087",
					suppressMirroring: true
				});
				sap.ui.core.IconPool.addIcon("icon-face-neutral", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E089",
					suppressMirroring: true
				});
				sap.ui.core.IconPool.addIcon("icon-face-happy", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E08B",
					suppressMirroring: true
				});
				sap.ui.core.IconPool.addIcon("icon-face-very-happy", "FeedbackRatingFaces", {
					fontFamily: "FeedbackRatingFaces",
					content: "E08C",
					suppressMirroring: true
				});
			}

			function createFeedbackRatingHeader() {
				var oRateYourExperienceLabel = new sap.ui.commons.FormattedTextView("feedbackRateYourExperienceLabel");
				oRateYourExperienceLabel.setHtmlText("<span class='feedbackAsterisk'>*</span>Rate your experience:");
				oFeedbackRatingLabel = new sap.ui.commons.Label("feedbackRatingLabel", {});

				return new sap.ui.layout.HorizontalLayout('feedbackRatingHeader', { content:[
							  oRateYourExperienceLabel, oFeedbackRatingLabel]});
			}

			function createFeedbackRatingSegmentedButton() {
				registerFeedbackRatingIcons();

				oFeedbackRatingButton = new sap.ui.commons.SegmentedButton({id: "feedbackRatingButton", buttons:[
					createFeedbackRatingButton("icon-face-very-bad", "Very Poor", 1),
					createFeedbackRatingButton("icon-face-bad", "Poor", 2),
					createFeedbackRatingButton("icon-face-neutral", "Average", 3),
					createFeedbackRatingButton("icon-face-happy", "Good", 4),
					createFeedbackRatingButton("icon-face-very-happy", "Excellent", 5)
				]});

				function createFeedbackRatingButton(sIcon, sLabel, iValue) {
					var sIconFullName = "sap-icon://FeedbackRatingFaces/" + sIcon;
					return new sap.ui.commons.Button({icon: sIconFullName, width: "20%", press: feedbackRatingButtonAction.bind(this, sLabel, iValue)});
				}

				function feedbackRatingButtonAction(sLabel, iValue) {
					oFeedbackRatingLabel.setText(sLabel);
					iRatingValue = iValue;
					oSendFeedbackButton.setEnabled(true);
				}

				return oFeedbackRatingButton;
			}

			function createFeedbackInput() {
				oFeedbackInput = new sap.ui.commons.TextArea("demokitFeedbackInput", {rows: 13});
				oFeedbackInput.setPlaceholder(FEEDBACK_INPUT_PLACEHOLDER);
				return oFeedbackInput;
			}

			function createContextDataFunctionalRow() {
				that._oIncludeFeedbackContextCB.setText('Feedback is related to the current page');
				that._oIncludeFeedbackContextCB.attachChange(that.updateFeedbackContextText.bind(that));

				oContextDataLink = new sap.ui.commons.Link("feedbackContextDataLink",{
					wrapping: "false",
					text: "Show context data",
					tooltip: "Show context data",
					press: function() {
						if (that._oFeedbackContextText.getVisible() === false) {
							oContextDataLink.setText("Hide context data");
							oContextDataLink.setTooltip("Hide context data");
							that._oFeedbackContextText.setVisible(true);
						} else {
							oContextDataLink.setText("Show context data");
							oContextDataLink.setTooltip("Show context data");
							that._oFeedbackContextText.setVisible(false);
						}
					}
				});

				return new sap.ui.layout.HorizontalLayout("feedbackContextButtons", { content:[
					that._oIncludeFeedbackContextCB, oContextDataLink]});
			}

			function initializeFeedbackContextData() {
				that._oFeedbackContextText.addStyleClass("feedbackContextData");
				that._oFeedbackContextText.setVisible(false);
				that.updateFeedbackContextText();
				return that._oFeedbackContextText;
			}

			function createLicenseLinks() {
				var oLicenseLinkPrivacy = new sap.ui.commons.Link({
					text: "Privacy",
					tooltip: "Privacy",
					target: "_blank",
					href: "https://help.hana.ondemand.com/privacy.htm"
				});

				var oLicenseLinkTerms = new sap.ui.commons.Link({
					text: "Terms of Use",
					tooltip: "Terms of Use",
					target: "_blank",
					href: "https://help.hana.ondemand.com/terms_of_use.html"
				});

				var oLegalAgreement = new sap.ui.commons.Link({
					text: "Legal Agreement",
					tooltip: "Legal Agreement",
					target: "_blank",
					href: "./legal_agreement_with_privacy.html"
				});

				var oFeedbackLicenseLinks = new sap.ui.commons.FormattedTextView();
				var sFeedbackLicenseLinksText = 'Your feedback is anonymous, we do not collect any personal data. For more information see <embed data-index=\"0\">, <embed data-index=\"1\"> & <embed data-index=\"2\">.';
				oFeedbackLicenseLinks.addStyleClass("feedbackLicenseText");
				oFeedbackLicenseLinks.setHtmlText(sFeedbackLicenseLinksText);
				oFeedbackLicenseLinks.addControl(oLicenseLinkPrivacy);
				oFeedbackLicenseLinks.addControl(oLicenseLinkTerms);
				oFeedbackLicenseLinks.addControl(oLegalAgreement);

				return oFeedbackLicenseLinks;
			}

			function createFooterButtons() {
				var oCancelFeedbackButton = new sap.ui.commons.Button({
					text:"Cancel",
					tooltip:"Cancel",
					press: function() {
						resetFeedbackPopupState();
						oFeedbackPopup.close();
					}
				});

				oCloseFeedbackButton = new sap.ui.commons.Button('closeBtn', {
					text:"Close",
					tooltip:"Close",
					press: function() {
						oFeedbackPopup.close();
					}
				});

				oSendFeedbackButton = new sap.ui.commons.Button('sendBtn', {text:"Send", tooltip:"Send feedback", enabled: false,
					press : function() {
						var data = {};
						if (that._oIncludeFeedbackContextCB.getChecked()) {
							data = {
								"texts": {
									"t1": oFeedbackInput.getValue()
								},
								"ratings":{
									"r1": {"value":iRatingValue}
								},
							"context": {"page": that._getCurrentPageRelativeURL(), "attr1": sap.ui.version}
							};
						} else {
							data = {
								"texts": {
									"t1": oFeedbackInput.getValue()
								},
								"ratings":{
									"r1": {"value":iRatingValue}
								},
								"context": {"attr1": sap.ui.getVersionInfo().version}
							};
						}

						setFeedbackPopupBusyState();

						jQuery.ajax({
							url: sFeedbackServiceURL,
							type: "POST",
							contentType: "application/json",
							data: JSON.stringify(data)
						}).
						done(
							function () {
								setFeedbackPopupContent(feedbackSubmitSuccessLayout);
							}
						).
						fail(
							function () {
								setFeedbackPopupContent(feedbackSubmitErrorLayout);
							}
						);
					}
				});

				var feedbackSubmitSuccessLayout = new sap.ui.layout.VerticalLayout({
					content:[new sap.ui.commons.FormattedTextView('successMsg', {htmlText: '<h4>Your feedback was sent successfully.</h4>'})]
				});

				var feedbackSubmitErrorLayout = new sap.ui.layout.VerticalLayout({
					content:[new sap.ui.commons.FormattedTextView('errorMsg', {htmlText: '<h4>Your feedback was not sent.</h4>'})]
				});

				return new sap.ui.layout.HorizontalLayout('feedbackButtons', { content:[
								 oSendFeedbackButton, oCancelFeedbackButton]});
			}

			var oFeedbackForm = new sap.ui.layout.form.SimpleForm({
				maxContainerCols: 1,
				width: '400px',
				editable: true,
				layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
				content: [
					new sap.ui.commons.Label({text: 'Send us your feedback!'}),
					createFeedbackRatingHeader(),
					createFeedbackRatingSegmentedButton(),
					createFeedbackInput(),
					createContextDataFunctionalRow(),
					initializeFeedbackContextData(),
					createLicenseLinks(),
					createFooterButtons()
				]
			});

			var sIconPrefix = "theme/img/themeswitch_";
			var oFeedbackPopup = new sap.ui.ux3.ToolPopup('feedBackPopup', {
				icon: 'sap-icon://comment',
				iconHover: sIconPrefix + 'hover.png',
				iconSelected: sIconPrefix + 'selected.png',
				content: [oFeedbackForm],
				defaultButton: oSendFeedbackButton,
				closed: function (){
					this.removeAllContent();
					this.addContent(oFeedbackForm);
				}
			});
			oFeedbackPopup.setTooltip("Send us your feedback!");
			return oFeedbackPopup;
		};

		return FeedbackClient;
	}, /* bExport= */ true);
