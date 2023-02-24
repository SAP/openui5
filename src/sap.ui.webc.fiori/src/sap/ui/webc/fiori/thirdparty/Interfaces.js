sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.IWizardStep = _exports.IUploadCollectionItem = _exports.ITimelineItem = _exports.ISortItem = _exports.ISideNavigationSubItem = _exports.ISideNavigationItem = _exports.IShellBarItem = _exports.IProductSwitchItem = _exports.INotificationListItem = _exports.INotificationAction = _exports.IMediaGalleryItem = _exports.IFilterItemOption = _exports.IFilterItem = _exports.IBar = void 0;
  /**
   * Interface for components that may be slotted inside <code>ui5-page</code> as header and footer.
   *
   * @name sap.ui.webcomponents.fiori.IBar
   * @interface
   * @public
   */
  const IBar = "sap.ui.webcomponents.fiori.IBar";

  /**
   * Interface for components that may be slotted inside <code>ui5-view-settings-dialog</code> as filter items
   *
   * @name sap.ui.webcomponents.fiori.IFilterItem
   * @interface
   * @public
   */
  _exports.IBar = IBar;
  const IFilterItem = "sap.ui.webcomponents.fiori.IFilterItem";

  /**
   * Interface for components that may be slotted inside <code>ui5-filter-item</code> as values
   *
   * @name sap.ui.webcomponents.fiori.IFilterItemOption
   * @interface
   * @public
   */
  _exports.IFilterItem = IFilterItem;
  const IFilterItemOption = "sap.ui.webcomponents.fiori.IFilterItemOption";

  /**
   * Interface for components that can be slotted inside <code>ui5-media-gallery</code> as items.
   *
   * @name sap.ui.webcomponents.fiori.IMediaGalleryItem
   * @interface
   * @public
   */
  _exports.IFilterItemOption = IFilterItemOption;
  const IMediaGalleryItem = "sap.ui.webcomponents.fiori.IMediaGalleryItem";

  /**
   * Interface for components that may be slotted as an action inside <code>ui5-li-notification</code> and <code>ui5-li-notification-group</code>
   *
   * @name sap.ui.webcomponents.fiori.INotificationAction
   * @interface
   * @public
   */
  _exports.IMediaGalleryItem = IMediaGalleryItem;
  const INotificationAction = "sap.ui.webcomponents.fiori.INotificationAction";

  /**
   * Interface for components that may be slotted inside a notification list
   *
   * @name sap.ui.webcomponents.fiori.INotificationListItem
   * @interface
   * @public
   */
  _exports.INotificationAction = INotificationAction;
  const INotificationListItem = "sap.ui.webcomponents.fiori.INotificationListItem";

  /**
   * Interface for components that may be slotted inside <code>ui5-product-switch</code> as items
   *
   * @name sap.ui.webcomponents.fiori.IProductSwitchItem
   * @interface
   * @public
   */
  _exports.INotificationListItem = INotificationListItem;
  const IProductSwitchItem = "sap.ui.webcomponents.fiori.IProductSwitchItem";

  /**
   * Interface for components that may be slotted inside <code>ui5-shellbar</code> as items
   *
   * @name sap.ui.webcomponents.fiori.IShellBarItem
   * @interface
   * @public
   */
  _exports.IProductSwitchItem = IProductSwitchItem;
  const IShellBarItem = "sap.ui.webcomponents.fiori.IShellBarItem";

  /**
   * Interface for components that may be slotted inside <code>ui5-side-navigation</code> as items
   *
   * @name sap.ui.webcomponents.fiori.ISideNavigationItem
   * @interface
   * @public
   */
  _exports.IShellBarItem = IShellBarItem;
  const ISideNavigationItem = "sap.ui.webcomponents.fiori.ISideNavigationItem";

  /**
   * Interface for components that may be slotted inside <code>ui5-side-navigation-item</code> as sub-items
   *
   * @name sap.ui.webcomponents.fiori.ISideNavigationSubItem
   * @interface
   * @public
   */
  _exports.ISideNavigationItem = ISideNavigationItem;
  const ISideNavigationSubItem = "sap.ui.webcomponents.fiori.ISideNavigationSubItem";

  /**
   * Interface for components that may be slotted inside <code>ui5-view-settings-dialog</code> as sort items
   *
   * @name sap.ui.webcomponents.fiori.ISortItem
   * @interface
   * @public
   */
  _exports.ISideNavigationSubItem = ISideNavigationSubItem;
  const ISortItem = "sap.ui.webcomponents.fiori.ISortItem";

  /**
   * Interface for components that may be slotted inside <code>ui5-timeline</code> as items
   *
   * @name sap.ui.webcomponents.fiori.ITimelineItem
   * @interface
   * @public
   */
  _exports.ISortItem = ISortItem;
  const ITimelineItem = "sap.ui.webcomponents.fiori.ITimelineItem";

  /**
   * Interface for components that may be slotted inside <code>ui5-upload-collection</code> as items
   *
   * @name sap.ui.webcomponents.fiori.IUploadCollectionItem
   * @interface
   * @public
   */
  _exports.ITimelineItem = ITimelineItem;
  const IUploadCollectionItem = "sap.ui.webcomponents.fiori.IUploadCollectionItem";

  /**
   * Interface for components that may be slotted inside <code>ui5-wizard</code> as wizard steps
   *
   * @name sap.ui.webcomponents.fiori.IWizardStep
   * @interface
   * @public
   */
  _exports.IUploadCollectionItem = IUploadCollectionItem;
  const IWizardStep = "sap.ui.webcomponents.fiori.IWizardStep";
  _exports.IWizardStep = IWizardStep;
});