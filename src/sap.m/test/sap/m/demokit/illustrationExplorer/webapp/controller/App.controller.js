sap.ui.define([
    "sap/ui/demo/illustrationExplorer/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/documentation/sdk/controller/util/ThemePicker",
    "sap/m/IllustrationPool",
    "sap/m/IllustratedMessage",
    "sap/m/IllustratedMessageType",
    "sap/ui/core/Fragment"
], (BaseController,
    JSONModel,
    ThemePicker,
    IllustrationPool,
    IllustratedMessage,
    IllustratedMessageType,
    Fragment) => {
    "use strict";

    return BaseController.extend("sap.ui.demo.illustrationExplorer.controller.App", {
        /**
         * Lifecycle method called when the controller is initialized.
         * @override
         */
        onInit() {
            BaseController.prototype.onInit.apply(this, arguments);

            this._defineIllustrationSizes();
            this._defineViewModel();
            this._initThemePicker();
            this._setAppTheme();
            this._registerTntIllustrationSet();
            this._setIllustrations();
            this._showWelcomeMessage();
        },

        _defineIllustrationSizes() {
            this._aIllustrationSizes = [
                "Dot",
                "Spot",
                "Dialog",
                "Scene"
            ];
        },

        _defineViewModel() {
            const oModel = new JSONModel({
                searchQuery: "",
                filteredIllustrations: this._aAllIllustrations,
                illustrationSizes: this._aIllustrationSizes.map((size) => ({ size })),
                illustrationSets: [
                    { set: "sapIllus", text: "Default" },
                    { set: "tnt", text: "TNT" }
                ],
                selectedIllustrationSet: "sapIllus",
                selectedIllustrationSize: "Dialog",
                selectedCategory: "All",
                currentYear: new Date().getFullYear()
            });
            this.setModel(oModel, "app");
        },

        _initThemePicker() {
            ThemePicker.init(this);
        },

        _setAppTheme() {
            const oModel = this.getModel("app");
            const oResourceBundle = this.getResourceBundle();
            const themeTextMap = {
                "light": oResourceBundle.getText("themeLight"),
                "dark": oResourceBundle.getText("themeDark"),
                "hcw": oResourceBundle.getText("themeHCW"),
                "hcb": oResourceBundle.getText("themeHCB"),
                "auto": oResourceBundle.getText("themeAuto"),
                "sap_fiori_3": oResourceBundle.getText("themeQuartz"),
                "sap_fiori_3_dark": oResourceBundle.getText("themeQuartzDark"),
                "sap_fiori_3_hcw": oResourceBundle.getText("themeQuartzHCW"),
                "sap_fiori_3_hcb": oResourceBundle.getText("themeQuartzHCB")
            };

            const aThemes = Object.keys(ThemePicker._getTheme()).map((theme) => {
                return { theme, text: themeTextMap[theme] || theme };
            });

            oModel.setProperty("/themes", aThemes);
            oModel.setProperty("/selectedTheme", this._getSelectedTheme());
        },

        _setIllustrations() {
            const oModel = this.getModel("app");
            const sSelectedSet = oModel.getProperty("/selectedIllustrationSet");
            const sSelectedSize = oModel.getProperty("/selectedIllustrationSize");
            const oSetMetadata = IllustrationPool.getIllustrationSetMetadata(sSelectedSet);

            const oCategoriesModel = this.getOwnerComponent().getModel("categories");
            const aCategories = oCategoriesModel.getProperty("/categories") || [];
            const illustrationToCategoryMap = {};

            aCategories.forEach((oCategory) => {
                const sCategoryName = oCategory.category;
                if (oCategory.illustrations && Array.isArray(oCategory.illustrations)) {
                    oCategory.illustrations.forEach((sType) => {
                        illustrationToCategoryMap[sType] = sCategoryName;
                    });
                }
            });

            this._aAllIllustrations = oSetMetadata.aSymbols.map((sType) => {
                const convertedType = this._convertIllustrationType(sType);
                return {
                    set: sSelectedSet,
                    size: sSelectedSize,
                    type: convertedType,
                    category: illustrationToCategoryMap[convertedType] || "Unknown"
                };
            }).sort((a, b) => a.type.localeCompare(b.type)); // Sort illustrations alphabetically

            this._applyMediaChange();
        },

        _registerTntIllustrationSet() {
            const oTntSet = {
                setFamily: "tnt",
                setURI: sap.ui.require.toUrl("sap/tnt/themes/base/illustrations")
            };
            IllustrationPool.registerIllustrationSet(oTntSet, false);
        },

        _convertIllustrationType(type) {
            return type.replace(/V(\d+)$/, "_v$1");
        },

        _getSelectedTheme() {
            return ThemePicker._oConfigUtil.getCookieValue("appearance") || "auto";
        },

        onSearch(oEvent) {
            const sQuery = oEvent.getParameter("newValue").toLowerCase();
            this.getModel("app").setProperty("/searchQuery", sQuery);
            this._applySearch();
        },

        onIllustrationSizeChange(oEvent) {
            const sSelectedSize = oEvent.getParameter("selectedItem").getKey();
            this.getModel("app").setProperty("/selectedIllustrationSize", sSelectedSize);
            this._applyMediaChange();
        },

        onIllustrationSetChange(oEvent) {
            const sSelectedSet = oEvent.getParameter("selectedItem").getKey();
            const oModel = this.getModel("app");
            oModel.setProperty("/selectedIllustrationSet", sSelectedSet);

            if (sSelectedSet === "tnt") {
                oModel.setProperty("/selectedCategory", "All");
                this.byId("categorySelect").setEnabled(false);
            } else {
                this.byId("categorySelect").setEnabled(true);
            }

            this._setIllustrations();
        },

        onCategoryChange(oEvent) {
            const sSelectedCategory = oEvent.getParameter("selectedItem").getKey();
            this.getModel("app").setProperty("/selectedCategory", sSelectedCategory);
            this._applySearch();
        },

        onThemeChange(oEvent) {
            const sSelectedTheme = oEvent.getParameter("selectedItem").getKey();
            ThemePicker._updateAppearance(sSelectedTheme);
            this.getModel("app").setProperty("/selectedTheme", sSelectedTheme);
        },

        _applyMediaChange() {
            const sSelectedSize = this.getModel("app").getProperty("/selectedIllustrationSize");
            this._aAllIllustrations = this._aAllIllustrations.map((oItem) => {
                return {
                    ...oItem,
                    size: sSelectedSize
                };
            });
            this._applySearch();
        },

        _applySearch() {
            const oModel = this.getModel("app");
            const sSearchQuery = oModel.getProperty("/searchQuery").toLowerCase();
            const sSelectedCategory = oModel.getProperty("/selectedCategory");
            const aFiltered = this._aAllIllustrations.filter(({ type, category }) => {
                const matchesQuery = !sSearchQuery || type.toLowerCase().includes(sSearchQuery);
                const matchesCategory = sSelectedCategory === "All" || category === sSelectedCategory;
                return matchesQuery && matchesCategory;
            });
            oModel.setProperty("/filteredIllustrations", aFiltered);
        },

        _showWelcomeMessage() {
            const oResourceBundle = this.getResourceBundle();
            const oSideContentContainer = this.byId("sideContentContainer");
            const oWelcomeMessage = new IllustratedMessage({
                illustrationType: IllustratedMessageType.SearchFolder,
                title: oResourceBundle.getText("welcomeMessageTitle"),
                description: oResourceBundle.getText("welcomeMessageDescription")
            });
            oSideContentContainer.addItem(oWelcomeMessage);
        },

        onIllustrationPress(oEvent) {
            const oIllustrationModel = this.getOwnerComponent().getModel("illustration");
            const oDynamicSideContent = this.byId("dynamicSideContent");
            const oSideContentContainer = this.byId("sideContentContainer");
            const oContext = oEvent.getSource().getBindingContext("app");
            const oSelectedIllustration = oContext.getObject();

            if (!oDynamicSideContent.isSideContentVisible()) {
                this.getRouter().navTo("illustrationDetails", {
                    category: oSelectedIllustration.category,
                    set: oSelectedIllustration.set,
                    type: oSelectedIllustration.type
                });
                return;
            }

            // Update the illustration model properties
            oIllustrationModel.setProperty("/category", oSelectedIllustration.category);
            oIllustrationModel.setProperty("/set", oSelectedIllustration.set);
            oIllustrationModel.setProperty("/type", `${oSelectedIllustration.set}-${oSelectedIllustration.type}`);

            // Load the fragment if not already loaded
            if (!this._pIllustrationDetailsFragment) {
                this._pIllustrationDetailsFragment = Fragment.load({
                    name: "sap.ui.demo.illustrationExplorer.view.fragments.IllustrationDetailsContent",
                    controller: this
                });
            }

            // Once the fragment is loaded, add it to the side content
            this._pIllustrationDetailsFragment.then((oFragment) => {
                oSideContentContainer.removeAllItems();
                oSideContentContainer.addItem(oFragment);
            });
        }
    });
});