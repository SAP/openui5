/*!
 * ${copyright}
 */
sap.ui.define([
	'./Core',
	'sap/ui/thirdparty/URI',
	"sap/base/i18n/ResourceBundle",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
	function(core, URI, ResourceBundle, Log, jQuery) {
		"use strict";

		/**
		 * CSS font family used for the icons provided by SAP.
		 */
		var SAP_ICON_FONT_FAMILY = 'SAP-icons';

		/**
		 * Protocol that is used to identify icon URIs.
		 */
		var ICON_PROTOCOL = 'sap-icon';

		/*
		 * A map of registered fonts
		 * key: collection name
		 * value: configuration object containing
		 *   key: config,
		 *   value: object, the configuration passed to registerFont
		 *   key: metadataLoaded
		 *   value: Promise while loading font metadata, true after resolved, false when failed
		 *   key: inserted
		 *   value: boolean
		 */
		var mFontRegistry = {
			undefined: {
				config: {
					fontFamily: SAP_ICON_FONT_FAMILY
				},
				metadataLoaded: true,
				inserted: false
			}
		};

		var mRegistry = {
			/*
			 * Raw data for built-in icons.
			 *
			 * Maps the name of each icon to a numeric value. The lower 16 bit of the value (0xFFFF) represent the char code
			 * of the icon in the 'SAP-icons' font (multiple char codes are currently not needed).
			 * If the 17th bit is set (0x10000), then the icon doesn't need mirroring in right-to-left (RTL) mode.
			 *
			 * On first access to an icon, the raw data will be converted to an icon info object, see getIconInfo.
			 */
			'undefined' : {
				'accidental-leave': 0xe000,
				'account': 0xe001,
				'wrench': 0xe002,
				'windows-doors': 0xe003,
				'washing-machine': 0xe004,
				'visits': 0xe005,
				'video': 0xe006,
				'travel-expense': 0x1e007,
				'temperature': 0xe008,
				'task': 0x1e009,
				'synchronize': 0xe00a,
				'survey': 0x1e00b,
				'settings': 0xe00c,
				'search': 0x1e00d,
				'sales-document': 0x1e00e,
				'retail-store': 0xe00f,
				'refresh': 0xe010,
				'product': 0xe011,
				'present': 0xe012,
				'ppt-attachment': 0xe013,
				'pool': 0xe014,
				'pie-chart': 0xe015,
				'picture': 0xe016,
				'photo-voltaic': 0xe017,
				'phone': 0xe018,
				'pending': 0xe019,
				'pdf-attachment': 0xe01a,
				'past': 0x1e01b,
				'outgoing-call': 0xe01c,
				'opportunity': 0xe01d,
				'opportunities': 0x1e01e,
				'notes': 0xe01f,
				'money-bills': 0x1e020,
				'map': 0xe021,
				'log': 0xe022,
				'line-charts': 0xe023,
				'lightbulb': 0xe024,
				'leads': 0xe025,
				'lead': 0x1e026,
				'laptop': 0xe027,
				'kpi-managing-my-area': 0x1e028,
				'kpi-corporate-performance': 0x1e029,
				'incoming-call': 0xe02a,
				'inbox': 0xe02b,
				'horizontal-bar-chart': 0xe02c,
				'history': 0xe02d,
				'heating-cooling': 0xe02e,
				'gantt-bars': 0xe02f,
				'future': 0x1e030,
				'fridge': 0xe031,
				'fallback': 0xe032,
				'expense-report': 0x1e033,
				'excel-attachment': 0xe034,
				'energy-saving-lightbulb': 0xe035,
				'employee': 0xe036,
				'email': 0xe037,
				'edit': 0xe038,
				'duplicate': 0xe039,
				'download': 0xe03a,
				'doc-attachment': 0xe03b,
				'dishwasher': 0xe03c,
				'delete': 0xe03d,
				'decline': 0xe03e,
				'complete': 0x1e03f,
				'competitor': 0xe040,
				'collections-management': 0xe041,
				'chalkboard': 0x1e042,
				'cart': 0xe043,
				'card': 0xe044,
				'camera': 0xe045,
				'calendar': 0x1e046,
				'begin': 0xe047,
				'basket': 0xe048,
				'bar-chart': 0xe049,
				'attachment': 0xe04a,
				'arrow-top': 0xe04b,
				'arrow-right': 0xe04c,
				'arrow-left': 0xe04d,
				'arrow-bottom': 0xe04e,
				'approvals': 0x1e04f,
				'appointment': 0xe050,
				'alphabetical-order': 0x1e051,
				'along-stacked-chart': 0xe052,
				'alert': 0xe053,
				'addresses': 0xe054,
				'address-book': 0x1e055,
				'add-filter': 0xe056,
				'add-favorite': 0xe057,
				'add': 0xe058,
				'activities': 0x1e059,
				'action': 0xe05a,
				'accept': 0x1e05b,
				'hint': 0x1e05c,
				'group': 0xe05d,
				'check-availability': 0x1e05e,
				'weather-proofing': 0xe05f,
				'payment-approval': 0x1e060,
				'batch-payments': 0x1e061,
				'bed': 0xe062,
				'arobase': 0x1e063,
				'family-care': 0xe064,
				'favorite': 0xe065,
				'navigation-right-arrow': 0xe066,
				'navigation-left-arrow': 0xe067,
				'e-care': 0xe068,
				'less': 0xe069,
				'lateness': 0xe06a,
				'lab': 0xe06b,
				'internet-browser': 0xe06c,
				'instance': 0xe06d,
				'inspection': 0xe06e,
				'image-viewer': 0xe06f,
				'home': 0xe070,
				'grid': 0xe071,
				'goalseek': 0xe072,
				'general-leave-request': 0xe073,
				'create-leave-request': 0xe074,
				'flight': 0xe075,
				'filter': 0xe076,
				'favorite-list': 0xe077,
				'factory': 0xe078,
				'endoscopy': 0xe079,
				'employee-pane': 0xe07a,
				'employee-approvals': 0x1e07b,
				'email-read': 0xe07c,
				'electrocardiogram': 0xe07d,
				'documents': 0xe07e,
				'decision': 0xe07f,
				'database': 0xe080,
				'customer-history': 0xe081,
				'customer': 0xe082,
				'credit-card': 0xe083,
				'create-entry-time': 0xe084,
				'contacts': 0xe085,
				'compare': 0xe086,
				'clinical-order': 0xe087,
				'chain-link': 0xe088,
				'pull-down': 0xe089,
				'cargo-train': 0xe08a,
				'car-rental': 0xe08b,
				'business-card': 0xe08c,
				'bar-code': 0xe08d,
				'folder-blank': 0xe08e,
				'passenger-train': 0xe08f,
				'question-mark': 0x1e090,
				'world': 0xe091,
				'iphone': 0xe092,
				'ipad': 0xe093,
				'warning': 0xe094,
				'sort': 0xe095,
				'course-book': 0xe096,
				'course-program': 0xe097,
				'add-coursebook': 0xe098,
				'print': 0xe099,
				'save': 0xe09a,
				'play': 0x1e09b,
				'pause': 0xe09c,
				'record': 0xe09d,
				'response': 0xe09e,
				'pushpin-on': 0xe09f,
				'pushpin-off': 0xe0a0,
				'unfavorite': 0xe0a1,
				'learning-assistant': 0xe0a2,
				'timesheet': 0xe0a3,
				'time-entry-request': 0xe0a4,
				'list': 0xe0a5,
				'action-settings': 0xe0a6,
				'share': 0xe0a7,
				'feed': 0xe0a8,
				'role': 0xe0a9,
				'flag': 0x1e0aa,
				'post': 0xe0ab,
				'inspect': 0xe0ac,
				'inspect-down': 0xe0ad,
				'appointment-2': 0xe0ae,
				'target-group': 0xe0af,
				'marketing-campaign': 0xe0b0,
				'notification': 0xe0b1,
				'message-error': 0xe0b1,
				'comment': 0xe0b2,
				'shipping-status': 0xe0b3,
				'collaborate': 0xe0b4,
				'shortcut': 0xe0b5,
				'lead-outdated': 0x1e0b6,
				'tools-opportunity': 0xe0b7,
				'permission': 0xe0b8,
				'supplier': 0xe0b9,
				'table-view': 0xe0ba,
				'table-chart': 0xe0bb,
				'switch-views': 0xe0bc,
				'e-learning': 0xe0bd,
				'manager': 0xe0be,
				'switch-classes': 0xe0bf,
				'simple-payment': 0x1e0c0,
				'signature': 0xe0c1,
				'sales-order-item': 0x1e0c2,
				'sales-order': 0x1e0c3,
				'request': 0xe0c4,
				'receipt': 0xe0c5,
				'puzzle': 0xe0c6,
				'process': 0xe0c7,
				'private': 0xe0c8,
				'popup-window': 0xe0c9,
				'person-placeholder': 0xe0ca,
				'per-diem': 0x1e0cb,
				'paper-plane': 0xe0cc,
				'paid-leave': 0x1e0cd,
				'pdf-reader': 0x1e0ce,
				'overview-chart': 0xe0cf,
				'overlay': 0xe0d0,
				'org-chart': 0xe0d1,
				'number-sign': 0xe0d2,
				'notification-2': 0xe0d3,
				'my-sales-order': 0x1e0d4,
				'meal': 0xe0d5,
				'loan': 0x1e0d6,
				'order-status': 0x1e0d7,
				'customer-order-entry': 0x1e0d8,
				'performance': 0xe0d9,
				'menu': 0xe0da,
				'employee-lookup': 0xe0db,
				'education': 0xe0dc,
				'customer-briefing': 0xe0dd,
				'customer-and-contacts': 0xe0de,
				'my-view': 0xe0df,
				'accelerated': 0xe0e0,
				'to-be-reviewed': 0xe0e1,
				'warning2': 0xe0e2,
				'feeder-arrow': 0xe0e3,
				'quality-issue': 0xe0e4,
				'workflow-tasks': 0xe0e5,
				'create': 0xe0e6,
				'home-share': 0xe0e7,
				'globe': 0x1e0e8,
				'tags': 0xe0e9,
				'work-history': 0xe0ea,
				'x-ray': 0xe0eb,
				'wounds-doc': 0xe0ec,
				'web-cam': 0xe0ed,
				'waiver': 0x1e0ee,
				'vertical-bar-chart': 0xe0ef,
				'upstacked-chart': 0xe0f0,
				'trip-report': 0xe0f1,
				'microphone': 0xe0f2,
				'unpaid-leave': 0x1e0f3,
				'tree': 0xe0f4,
				'toaster-up': 0xe0f5,
				'toaster-top': 0xe0f6,
				'toaster-down': 0xe0f7,
				'time-account': 0xe0f8,
				'theater': 0xe0f9,
				'taxi': 0xe0fa,
				'subway-train': 0xe0fb,
				'study-leave': 0xe0fc,
				'stethoscope': 0xe0fd,
				'step': 0xe0fe,
				'sonography': 0xe0ff,
				'soccor': 0xe100,
				'soccer': 0xe100,
				'physical-activity': 0xe101,
				'pharmacy': 0xe102,
				'official-service': 0xe103,
				'offsite-work': 0xe104,
				'nutrition-activity': 0xe105,
				'newspaper': 0xe106,
				'monitor-payments': 0x1e107,
				'map-2': 0xe108,
				'machine': 0xe109,
				'mri-scan': 0xe10a,
				'end-user-experience-monitoring': 0xe10b,
				'unwired': 0xe10c,
				'customer-financial-fact-sheet': 0x1e10d,
				'retail-store-manager': 0xe10e,
				'Netweaver-business-client': 0xe10f,
				'electronic-medical-record': 0xe110,
				'eam-work-order': 0x1e111,
				'customer-view': 0xe112,
				'crm-service-manager': 0xe113,
				'crm-sales': 0x1e114,
				'widgets': 0x1e115,
				'commission-check': 0x1e116,
				'collections-insight': 0x1e117,
				'clinical-tast-tracker': 0xe118,
				'citizen-connect': 0xe119,
				'cart-approval': 0x1e11a,
				'capital-projects': 0x1e11b,
				'bo-strategy-management': 0xe11c,
				'business-objects-mobile': 0xe11d,
				'business-objects-explorer': 0xe11e,
				'business-objects-experience': 0xe11f,
				'bbyd-dashboard': 0xe120,
				'bbyd-active-sales': 0x1e121,
				'business-by-design': 0x1e122,
				'business-one': 0x1e123,
				'sap-box': 0xe124,
				'manager-insight': 0xe125,
				'accounting-document-verification': 0x1e126,
				'hr-approval': 0x1e127,
				'idea-wall': 0xe128,
				'Chart-Tree-Map': 0xe129,
				'cart-5': 0xe12a,
				'cart-4': 0xe12b,
				'wallet': 0xe12c,
				'vehicle-repair': 0xe12d,
				'upload': 0xe12e,
				'unlocked': 0xe12f,
				'umbrella': 0xe130,
				'travel-request': 0x1e131,
				'travel-expense-report': 0x1e132,
				'travel-itinerary': 0xe133,
				'time-overtime': 0x1e134,
				'thing-type': 0xe135,
				'technical-object': 0xe136,
				'tag': 0xe137,
				'syringe': 0xe138,
				'syntax': 0xe139,
				'suitcase': 0xe13a,
				'simulate': 0xe13b,
				'shield': 0xe13c,
				'share-2': 0xe13d,
				'sales-quote': 0x1e13e,
				'repost': 0xe13f,
				'provision': 0xe140,
				'projector': 0xe141,
				'add-product': 0xe142,
				'pipeline-analysis': 0xe143,
				'add-photo': 0xe144,
				'palette': 0xe145,
				'nurse': 0xe146,
				'sales-notification': 0x1e147,
				'mileage': 0xe148,
				'meeting-room': 0xe149,
				'media-forward': 0x1e14a,
				'media-play': 0x1e14b,
				'media-pause': 0xe14c,
				'media-reverse': 0x1e14d,
				'media-rewind': 0x1e14e,
				'measurement-document': 0xe14f,
				'measuring-point': 0xe150,
				'measure': 0xe151,
				'map-3': 0xe152,
				'locked': 0xe153,
				'letter': 0xe154,
				'journey-arrive': 0xe155,
				'journey-change': 0xe156,
				'journey-depart': 0xe157,
				'it-system': 0xe158,
				'it-instance': 0xe159,
				'it-host': 0xe15a,
				'iphone-2': 0xe15b,
				'ipad-2': 0xe15c,
				'inventory': 0xe15d,
				'insurance-house': 0xe15e,
				'insurance-life': 0xe15f,
				'insurance-car': 0xe160,
				'initiative': 0xe161,
				'incident': 0x1e162,
				'group-2': 0xe163,
				'goal': 0xe164,
				'functional-location': 0xe165,
				'full-screen': 0xe166,
				'form': 0xe167,
				'fob-watch': 0xe168,
				'blank-tag': 0xe169,
				'family-protection': 0xe16a,
				'folder': 0xe16b,
				'fax-machine': 0xe16c,
				'example': 0xe16d,
				'eraser': 0xe16e,
				'employee-rejections': 0xe16f,
				'drop-down-list': 0xe170,
				'draw-rectangle': 0xe171,
				'document': 0xe172,
				'doctor': 0xe173,
				'discussion-2': 0xe174,
				'discussion': 0xe175,
				'dimension': 0xe176,
				'customer-and-supplier': 0xe177,
				'crop': 0xe178,
				'add-contact': 0xe179,
				'compare-2': 0xe17a,
				'color-fill': 0xe17b,
				'collision': 0xe17c,
				'curriculum': 0xe17d,
				'chart-axis': 0xe17e,
				'full-stacked-chart': 0xe17f,
				'full-stacked-column-chart': 0xe180,
				'vertical-bar-chart-2': 0xe181,
				'horizontal-bar-chart-2': 0xe182,
				'horizontal-stacked-chart': 0xe183,
				'vertical-stacked-chart': 0xe184,
				'choropleth-chart': 0x1e185,
				'geographic-bubble-chart': 0x1e186,
				'multiple-radar-chart': 0xe187,
				'radar-chart': 0xe188,
				'crossed-line-chart': 0xe189,
				'multiple-line-chart': 0xe18a,
				'multiple-bar-chart': 0xe18b,
				'line-chart': 0xe18c,
				'line-chart-dual-axis': 0xe18d,
				'bubble-chart': 0xe18e,
				'scatter-chart': 0xe18f,
				'multiple-pie-chart': 0xe190,
				'column-chart-dual-axis': 0xe191,
				'tag-cloud-chart': 0xe192,
				'area-chart': 0xe193,
				'cause': 0xe194,
				'cart-3': 0xe195,
				'cart-2': 0xe196,
				'bus-public-transport': 0xe197,
				'burglary': 0xe198,
				'building': 0xe199,
				'border': 0xe19a,
				'bookmark': 0xe19b,
				'badge': 0xe19c,
				'attachment-audio': 0xe19d,
				'attachment-video': 0xe19e,
				'attachment-html': 0xe19f,
				'attachment-photo': 0xe1a0,
				'attachment-e-pub': 0xe1a1,
				'attachment-zip-file': 0xe1a2,
				'attachment-text-file': 0xe1a3,
				'add-equipment': 0xe1a4,
				'add-activity': 0x1e1a5,
				'activity-individual': 0xe1a6,
				'activity-2': 0x1e1a7,
				'add-activity-2': 0x1e1a8,
				'activity-items': 0xe1a9,
				'activity-assigned-to-goal': 0xe1aa,
				'status-completed': 0xe1ab,
				'status-positive': 0xe1ab,
				'status-error': 0xe1ac,
				'status-negative': 0xe1ac,
				'status-inactive': 0xe1ad,
				'status-in-process': 0xe1ae,
				'status-critical': 0xe1ae,
				'blank-tag-2': 0xe1af,
				'cart-full': 0xe1b0,
				'locate-me': 0xe1b1,
				'paging': 0xe1b2,
				'company-view': 0xe1b3,
				'document-text': 0xe1b4,
				'explorer': 0xe1b5,
				'personnel-view': 0xe1b6,
				'sorting-ranking': 0xe1b7,
				'drill-down': 0xe1b8,
				'drill-up': 0xe1b9,
				'vds-file': 0xe1ba,
				'sap-logo-shape': 0x1e1bb,
				'folder-full': 0xe1bc,
				'system-exit': 0xe1bd,
				'system-exit-2': 0xe1be,
				'close-command-field': 0xe1bf,
				'open-command-field': 0xe1c0,
				'sys-enter-2': 0x1e1c1,
				'sys-enter': 0x1e1c2,
				'sys-help-2': 0x1e1c3,
				'sys-help': 0x1e1c4,
				'sys-back': 0xe1c5,
				'sys-back-2': 0xe1c6,
				'sys-cancel': 0xe1c7,
				'sys-cancel-2': 0xe1c8,
				'open-folder': 0xe1c9,
				'sys-find-next': 0xe1ca,
				'sys-find': 0xe1cb,
				'sys-monitor': 0xe1cc,
				'sys-prev-page': 0xe1cd,
				'sys-first-page': 0xe1ce,
				'sys-next-page': 0xe1cf,
				'sys-last-page': 0xe1d0,
				'generate-shortcut': 0xe1d1,
				'create-session': 0xe1d2,
				'display-more': 0xe1d3,
				'enter-more': 0xe1d4,
				'zoom-in': 0xe1d5,
				'zoom-out': 0xe1d6,
				'header': 0xe1d7,
				'detail-view': 0xe1d8,
				'show-edit': 0xe1d8,
				'collapse': 0xe1d9,
				'expand': 0xe1da,
				'positive': 0xe1db,
				'negative': 0xe1dc,
				'display': 0xe1dd,
				'menu2': 0xe1de,
				'redo': 0xe1df,
				'undo': 0xe1e0,
				'navigation-up-arrow': 0xe1e1,
				'navigation-down-arrow': 0xe1e2,
				'down': 0xe1e3,
				'up': 0xe1e4,
				'shelf': 0xe1e5,
				'background': 0xe1e6,
				'resize': 0xe1e7,
				'move': 0xe1e8,
				'show': 0xe1e9,
				'hide': 0xe1ea,
				'nav-back': 0xe1eb,
				'error': 0xe1ec,
				'slim-arrow-right': 0xe1ed,
				'slim-arrow-left': 0xe1ee,
				'slim-arrow-down': 0xe1ef,
				'slim-arrow-up': 0xe1f0,
				'forward': 0xe1f1,
				'overflow': 0xe1f2,
				'value-help': 0xe1f3,
				'multi-select': 0x1e1f4,
				'exit-full-screen': 0xe1f5,
				'sys-add': 0xe1f6,
				'sys-minus': 0xe1f7,
				'dropdown': 0xe1f8,
				'expand-group': 0xe1f9,
				'collapse-group': 0xe200,
				'vertical-grip': 0xe1fa,
				'horizontal-grip': 0xe1fb,
				'sort-descending': 0xe1fc,
				'sort-ascending': 0xe1fd,
				'arrow-down': 0xe1fe,
				'legend': 0xe1ff,
				'message-warning': 0xe201,
				'message-information': 0x1e202,
				'message-success': 0x1e203,
				'restart': 0xe204,
				'stop': 0xe205,
				'add-process': 0xe206,
				'cancel-maintenance': 0xe207,
				'activate': 0xe208,
				'resize-horizontal': 0xe209,
				'resize-vertical': 0xe20a,
				'connected': 0xe20b,
				'disconnected': 0xe20c,
				'edit-outside': 0xe20d,
				'key': 0xe20e,
				'minimize': 0xe20f,
				'back-to-top': 0xe210,
				'hello-world': 0xe211,
				'outbox': 0xe212,
				'donut-chart': 0xe213,
				'heatmap-chart': 0xe214,
				'horizontal-bullet-chart': 0xe215,
				'vertical-bullet-chart': 0xe216,
				'call': 0xe217,
				'download-from-cloud': 0xe218,
				'upload-to-cloud': 0xe219,
				'jam': 0xe21a,
				'sap-ui5': 0xe21b,
				'message-popup': 0xe21c,
				'cloud': 0xe21d,
				'horizontal-waterfall-chart': 0x1e21e,
				'vertical-waterfall-chart': 0x1e21f,
				'broken-link': 0xe220,
				'headset': 0xe221,
				'thumb-up': 0x1e222,
				'thumb-down': 0x1e223,
				'multiselect-all': 0x1e224,
				'multiselect-none': 0x1e225,
				'scissors': 0xe226,
				'sound': 0x1e227,
				'sound-loud': 0x1e228,
				'sound-off': 0x1e229,
				'date-time': 0x1e22a,
				'user-settings': 0xe22b,
				'key-user-settings': 0xe22c,
				'developer-settings': 0xe22d,
				'text-formatting': 0x1e22e,
				'bold-text': 0x1e22f,
				'italic-text': 0x1e230,
				'underline-text': 0x1e231,
				'text-align-justified': 0x1e232,
				'text-align-left': 0x1e233,
				'text-align-center': 0x1e234,
				'text-align-right': 0x1e235,
				'bullet-text': 0x1e236,
				'numbered-text': 0x1e237,
				'co': 0xe238,
				'ui-notifications': 0xe239,
				'bell': 0xe23a,
				'cancel-share': 0xe23b,
				'write-new-document': 0xe23c,
				'write-new': 0xe23d,
				'cancel': 0x1e23e,
				'screen-split-one': 0xe23f,
				'screen-split-two': 0xe240,
				'screen-split-three': 0xe241,
				'customize': 0xe242,
				'user-edit': 0xe243,
				'source-code': 0xe244,
				'copy': 0xe245,
				'paste': 0xe246,
				'line-chart-time-axis': 0x1e247,
				'clear-filter': 0xe248,
				'reset': 0xe249,
				'trend-up': 0xe24a,
				'trend-down': 0xe24b,
				'cursor-arrow': 0xe24c,
				'add-document': 0xe24d,
				'create-form': 0xe24e,
				'resize-corner': 0xe24f,
				'chevron-phase': 0xe250,
				'chevron-phase-2': 0xe251,
				'rhombus-milestone': 0xe252,
				'rhombus-milestone-2': 0xe253,
				'circle-task': 0xe254,
				'circle-task-2': 0xe255,
				'project-definition-triangle': 0xe256,
				'project-definition-triangle-2': 0xe257,
				'master-task-triangle': 0xe258,
				'master-task-triangle-2': 0xe259,
				'program-triangles': 0xe25a,
				'program-triangles-2': 0xe25b,
				'mirrored-task-circle': 0xe25c,
				'mirrored-task-circle-2': 0xe25d,
				'checklist-item': 0xe25e,
				'checklist-item-2': 0xe25f,
				'checklist': 0xe260,
				'checklist-2': 0xe261,
				'chart-table-view': 0xe262,
				'filter-analytics': 0xe263,
				'filter-facets': 0xe264,
				'filter-fields': 0xe265,
				'indent': 0xe266,
				'outdent': 0xe267,
				'heading1': 0x1e268,
				'heading2': 0x1e269,
				'heading3': 0x1e26a,
				'decrease-line-height': 0xe26b,
				'increase-line-height': 0xe26c,
				'fx': 0x1e26d,
				'add-folder': 0xe26e,
				'away': 0xe26f,
				'busy': 0xe270,
				'appear-offline': 0xe271,
				'blur': 0xe272,
				'pixelate': 0xe273,
				'horizontal-combination-chart': 0xe274,
				'add-employee': 0xe275,
				'text-color': 0x1e276,
				'browse-folder': 0xe277,
				'primary-key': 0xe278,
				'two-keys': 0xe279,
				'strikethrough': 0xe27a,
				'text': 0xe27b,
				'responsive': 0xe27c,
				'desktop-mobile': 0xe27d,
				'table-row': 0xe27e,
				'table-column': 0xe27f,
				'validate': 0x1e280,
				'keyboard-and-mouse': 0xe281,
				'touch': 0xe282,
				'expand-all': 0xe283,
				'collapse-all': 0xe284,
				'combine': 0xe285,
				'split': 0xe286,
				'megamenu': 0xe287
			}
		};

		var oCoreResourceBundle;

		// Lazy load core resource bundle
		function getCoreResourceBundle() {
			if (!oCoreResourceBundle) {
				oCoreResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");
			}
			return oCoreResourceBundle;
		}

		// lazy dependency, to avoid cycle
		var Icon;

		/**
		 * The IconPool is a static class for retrieving or registering icons.
		 * It also provides helping methods for easier consumption of icons.
		 * There are already icons registered in IconPool, please use the Demo App named
		 * "Icon Explorer" to find the name of the icon.
		 *
		 * In order to use the icon inside an existing control, please call
		 * {@link sap.ui.core.IconPool.getIconURI} and assign the URI to the control's property
		 * which supports icons.
		 * If you want to support both, icons and standard images in your own control, please use
		 * the static method {@link sap.ui.core.IconPool.createControlByURI} to either create an Icon in
		 * case the first argument is an icon-URL or another control which you define by
		 * providing it as the second argument.
		 *
		 * @namespace
		 * @public
		 * @alias sap.ui.core.IconPool
		 */
		var IconPool = {};

		/**
		 * Creates an instance of {@link sap.ui.core.Icon} if the given URI is an icon URI, otherwise the given constructor is called.
		 * The given URI is set to the src property of the control.
		 *
		 * @param {string|object} setting contains the properties which will be used to instantiate the returned control. It should contain at least a property named src. If it's given with a string type, it will be taken as the value of src property.
		 * @param {function} constructor the constructor function which is called when the given URI isn't an icon URI
		 * @return {sap.ui.core.Control} either an instance of sap.ui.core.Icon or instance created by calling the given constructor
		 * @static
		 * @public
		 */
		IconPool.createControlByURI = function (setting, constructor) {
			if (typeof setting === "string") {
				setting = {src: setting};
			}

			if (setting && setting.src) {
				var sSrc = setting.src,
					fnConstructor = constructor;
				if (IconPool.isIconURI(sSrc)) {
					Icon = Icon || sap.ui.requireSync("sap/ui/core/Icon");
					fnConstructor = Icon;
					//converting to press event in case tap is specified
					if (setting.tap) {
						setting.press = setting.tap;
						delete setting.tap;
					}
				}
				if (typeof fnConstructor === "function") {
					// remove unsupported settings (e.g. some for Image/Icon)
					setting = fnConstructor.getMetadata().removeUnknownSettings(setting);
					return new fnConstructor(setting);
				}
			}
		};

		/**
		 * Register an additional icon to the sap.ui.core.IconPool.
		 *
		 * @param {string} iconName the name of the icon.
		 * @param {string} collectionName the name of icon collection. The built in icons are with empty collectionName, so if additional icons need to be registered in IconPool, the collectionName can't be empty.
		 * @param {object} iconInfo the icon info which contains the following properties:
		 * @param {string} iconInfo.fontFamily is the name of the font when importing the font using @font-face in CSS
		 * @param {string|string[]} iconInfo.content is the special hexadecimal code without the prefix, for example "e000" or several of them
		 * @param {boolean} [iconInfo.overWrite=false] indicates if already registered icons should be overwritten when the same name and collection are given. The built in icons can never be overwritten.
		 * @param {boolean} [iconInfo.suppressMirroring=false] indicates whether this icon should NOT be mirrored in RTL (right to left) mode.
		 * @param {jQuery.sap.util.ResourceBundle} [iconInfo.resourceBundle] ResourceBundle to be used for translation. Key format: "Icon.<iconName>".
		 *
		 * @return {object} the info object of the registered icon which has the name, collection, uri, fontFamily, content and suppressMirroring properties.
		 * @static
		 * @public
		 */
		IconPool.addIcon = function(iconName, collectionName, iconInfo) {
			// OLD API Compatibility fontFamily, content, overWrite, suppressMirroring
			if (typeof iconInfo === "string") {
				iconInfo = {
					fontFamily: arguments[2],
					content: arguments[3],
					overWrite: !!arguments[4],
					suppressMirroring: !!arguments[5]
				};
			}

			// if collectionName isn't a string, convert it to string
			if (typeof collectionName !== "string") {
				collectionName = String(collectionName);
			}

			// normalize "undefined" back to undefined because the default
			// icon collection should have name undefined
			collectionName = collectionName === 'undefined' ? undefined : collectionName;

			if (!mRegistry[collectionName]) {
				mRegistry[collectionName] = {};
			}

			var collection = mRegistry[collectionName],
				icon = collection[iconName],
				parts, sContent, sText, sKey;

			if (icon) {
				if (collectionName === undefined) {
					Log.warning("Icon with name '" + iconName + "' in built-in collection already exists and can not be overwritten.", "sap.ui.core.IconPool");
					return;
				} else if (!iconInfo.overWrite) {
					Log.warning("Icon with name '" + iconName + "' in collection '" + collectionName + "' already exists. Specify 'iconInfo.overWrite' in order to overwrite.", "sap.ui.core.IconPool");
					return;
				}
			}

			parts = {
				protocol: ICON_PROTOCOL,
				hostname: collectionName || iconName,
				path: collectionName ? iconName : undefined
			};

			if (Array.isArray(iconInfo.content)) {
				sContent = iconInfo.content.map(makeChar).join('');
			} else {
				sContent = makeChar(iconInfo.content);
			}

			if (iconInfo.resourceBundle instanceof ResourceBundle) {
				sKey = "Icon." + iconName;
				if (iconInfo.resourceBundle.hasText(sKey)) {
					sText = iconInfo.resourceBundle.getText(sKey);
				}
			}

			icon = collection[iconName] = {
				name: iconName,
				collection: collectionName,
				uri: URI.build(parts),
				fontFamily: iconInfo.fontFamily,
				content: sContent,
				text: sText || '',
				suppressMirroring: iconInfo.suppressMirroring,
				//keep compatibility with old name
				skipMirroring: iconInfo.suppressMirroring
			};

			return icon;
		};

		/**
		 * Returns the URI of the icon in the pool which has the given <code>iconName</code> and <code>collectionName</code>.
		 *
		 * @param {string} iconName Name of the icon, must not be empty
		 * @param {string} [collectionName] Name of the icon collection; to access built-in icons, omit the collection name
		 * @return {string} URI of the icon or <code>undefined</code> if the icon can't be found in the IconPool
		 * @static
		 * @public
		 */
		IconPool.getIconURI = function (iconName, collectionName) {
			var icon = this.getIconInfo(iconName, collectionName);
			return icon && icon.uri;
		};

		/**
		 * Returns an info object for the icon with the given <code>iconName</code> and <code>collectionName</code>.
		 *
		 * Instead of giving name and collection, a complete icon-URI can be provided as <code>iconName</code>.
		 * The method will determine name and collection from the URI, see {@link #.isIconURI IconPool.isIconURI}
		 * for details.
		 *
		 * The returned info object has the following properties:
		 * <ul>
		 * <li><code>string: name</code> Name of the icon</li>
		 * <li><code>string: collection</code> Name of the collection that contains the icon or <code>undefined</code> in case of the default collection</li>
		 * <li><code>string: uri</code> Icon URI that identifies the icon</li>
		 * <li><code>string: fontFamily</code> CSS font family to use for this icon</li>
		 * <li><code>string: content</code> Character sequence that represents the icon in the icon font</li>
		 * <li><code>string: text</code> Alternative text describing the icon (optional, might be empty)</li>
		 * <li><code>boolean: suppressMirroring</code> Whether the icon needs no mirroring in right-to-left mode</li>
		 * </ul>
		 *
		 * @param {string} iconName Name of the icon, or a complete icon-URI with icon collection and icon name;
		 *   must not be empty
		 * @param {string} [collectionName] Name of the icon collection; to access built-in icons,
		 *   omit the collection name
		 * @param {string} [loadingMode] The approach for loading the icon info, if it is not already available:
		 *   sync (default) - font metadata is loaded synchronously and the icon info is returned immediately
		 *   async - a promise is returned that returns the icon info when the font metadata is loaded
		 *   mixed - until the font metadata is loaded a promise is returned, afterwards the icon info
		 * @return {object|Promise|undefined} Info object or Promise for the icon depending on the loadingMode
		 *   or <code>undefined</code> when the icon can't be found or no icon name was given.
		 * @static
		 * @public
		 */
		IconPool.getIconInfo = function (iconName, collectionName, loadingMode) {
			var parts,
				info,
				async,
				nameIsURI = IconPool.isIconURI(iconName);

			if (!iconName) {
				return;
			}

			// handle optional parameters
			if (!loadingMode && nameIsURI) {
				loadingMode = collectionName;
			}
			loadingMode = loadingMode || "sync";
			async = (loadingMode === "async" || loadingMode === "mixed");

			// retrieves the icon info from the internal registry
			function getInfo() {
				var collection = mRegistry[collectionName];
				var info = collection && collection[iconName];

				// convert raw data lazily to the icon info
				if (typeof info === 'number') {
					mRegistry[collectionName][iconName] = undefined; // avoid duplicate icon warning
					info = IconPool.addIcon(iconName, collectionName, {
						fontFamily: mFontRegistry[collectionName].config.fontFamily,
						content: info & 0xFFFF,
						suppressMirroring: !!(info & 0x10000),
						resourceBundle: getCoreResourceBundle()
					});
				}

				return info;
			}

			// parse icon URI
			if (nameIsURI) {
				parts = URI.parse(iconName);

				if (parts.path.length === 1) {
					collectionName = undefined;
					iconName = parts.hostname;
				} else {
					collectionName = parts.hostname;
					iconName = parts.path.slice(1);
				}

				if (!iconName) {
					return;
				}
			}

			// if collectionName isn't a string, convert it to string
			if (typeof collectionName !== "string") {
				collectionName = String(collectionName);
			}

			// normalize "undefined" back to undefined because the default
			// icon collection should have name undefined
			collectionName = collectionName === 'undefined' ? undefined : collectionName;

			// insert default font face
			if (collectionName === undefined && !mFontRegistry[collectionName].inserted) {
				IconPool.insertFontFaceStyle();
			}

			// fetch the info from the registry
			info = getInfo();

			// load icon metadata if not available (except for default collection)
			if (info === undefined && collectionName !== undefined) {
				var oLoaded = IconPool._loadFontMetadata(collectionName, async);
			}
			if (async) {
				if (oLoaded) {
					// wait for the icon metadata to be loaded
					return oLoaded.then(function () {
						info = getInfo();
						if (!info) {
							Log.warning("Icon info for icon '" + iconName + "' in collection '" + collectionName + "' could not be fetched");
						}
						return info;
					});
				} else {
					if (loadingMode === "async") {
						return Promise.resolve(info);
					} else {
						info = getInfo();
					}
				}
			} else {
				// refresh info if needed and return it
				info = getInfo();
			}

			// show a warning when the icon could not be found
			if (!info) {
				Log.warning("Icon info for icon '" + iconName + "' in collection '" + collectionName + "' could not be fetched");
			}
			return info;
		};

		/**
		 * Checks if the icon font is loaded
		 * @param {string} sCollectionName icon collection name
		 * @returns {Promise|undefined} a Promise that resolves when the icon font is loaded;
		 *   or <code>undefined</code> if the icon font has not been registered yet
		 * @public
		 * @since 1.56.0
		 */
		IconPool.fontLoaded = function (sCollectionName){
			if (mFontRegistry[sCollectionName]) {
				if (mFontRegistry[sCollectionName].metadataLoaded instanceof Promise) {
					return mFontRegistry[sCollectionName].metadataLoaded;
				} else if (mFontRegistry[sCollectionName].metadataLoaded === true) {
					return Promise.resolve();
				}
			}
		};

		/**
		 * Returns whether the given <code>uri</code> is an icon URI.
		 *
		 * A string is an icon URI when it can be parsed as a URI and when it has one of the two forms
		 * <ul>
		 * <li>sap-icon://collectionName/iconName</li>
		 * <li>sap-icon://iconName</li>
		 * </ul>
		 * where collectionName and iconName must be non-empty.
		 *
		 * @param {string} uri The URI to check
		 * @return {boolean} Whether the URI matches the icon URI format
		 * @static
		 * @public
		 */
		IconPool.isIconURI = function (uri) {
			if (!uri) {
				return false;
			}
			var parts = URI.parse(uri);

			return parts.protocol === ICON_PROTOCOL && !!parts.hostname;
		};

		/**
		 * Returns all names of registered collections in IconPool
		 *
		 * @return {array} An array contains all of the registered collections' names.
		 * @static
		 * @public
		 */
		IconPool.getIconCollectionNames = function () {
			return Object.keys(mRegistry);
		};

		/**
		 * Returns all name of icons that are registered under the given collection.
		 *
		 * @param {string} collectionName the name of collection where icon names are retrieved.
		 * @return {array} An array contains all of the registered icon names under the given collection.
		 * @static
		 * @public
		 */
		IconPool.getIconNames = function (collectionName) {
			var collection = mRegistry[collectionName];
			return collection ? Object.keys(collection) : [];
		};

		/**
		 * Adds CSS code to load an icon font to the DOM
		 *
		 * @param {string} [sFontFace] the file name of the font face, if not specified SAP-icons will be inserted
		 * @param {string} [sPath] the path to the font, if not specified the base theme folder will be used
		 * @param {string} [sCollectionName] the collection name, if not specified the font face is used
		 */
		IconPool.insertFontFaceStyle = function (sFontFace, sPath, sCollectionName) {
			sFontFace = sFontFace || SAP_ICON_FONT_FAMILY;

			if (sCollectionName === undefined && sFontFace !== SAP_ICON_FONT_FAMILY) {
				// when the collection name isn't given
				// set the collection name with sFontFace only when the icon font
				// isn't the standard icon font. The collectionName of the standard icon font
				// should always be set with undefined
				sCollectionName = sFontFace;
			}

			// check if the font has not been registered yet
			if (!mFontRegistry[sCollectionName]) {
				Log.error("Icon font '" + sCollectionName + "' has not been registered yet.");
				return;
			}
			// check if font face has already been inserted
			if (mFontRegistry[sCollectionName].inserted) {
				if (sCollectionName === undefined) {
					Log.info("The font face style of standard icon font was already inserted.");
				} else {
					Log.info("The font face style of icon font '" + sCollectionName + "' was already inserted.");
				}
				return;
			}
			// do nothing if the default font is about to be overwritten
			if (sFontFace === SAP_ICON_FONT_FAMILY && sCollectionName !== undefined) {
				Log.error("Must not overwrite the standard icon set with '" + sCollectionName + "'.");
				return;
			}

			// use default font path or the one passed in by argument
			var sFontPath = sPath || sap.ui.require.toUrl("sap/ui/core/themes/base/fonts/");

			// load the font asynchronously via CSS
			var sFontFaceCSS = "@font-face {" +
					"font-family: '" + sFontFace + "';" +
					"src: url('" + sFontPath + sFontFace + ".woff2') format('woff2')," + /* Chrome 36+, Firefox 39+, Safari 10+, Edge 14+, Chrome 51+ for Android, PhantomJS 2.1.1+ */
					"url('" + sFontPath + sFontFace + ".woff') format('woff')," + /* IE9+, Safari 5.1+, iOS 5.1+, Android Browser 4.4+, IE Mobile 11+ */
					"url('" + sFontPath + sFontFace + ".ttf') format('truetype')," + /* Fallback for any older browser (except IE8 and below which are not supported anyway) */
					"local('" + sFontFace + "');" + /* fallback to local installed font in case it can't be loaded (e.g. font download is disabled due to browser security settings) */
					"font-weight: normal;" +
					"font-style: normal;" +
				"}";
			var style = document.createElement("style");
			style.type = "text/css";
			style.textContent = sFontFaceCSS;
			document.head.appendChild(style);

			mFontRegistry[sCollectionName].inserted = true;
			mFontRegistry[sCollectionName].fontFace = sFontFace;
		};

		/**
		 * Registers an additional icon font to the icon pool
		 *
		 * @param {object} oConfig configuration object for registering the font
		 * @param {string} oConfig.fontFamily the file name of the font face
		 * @param {string} [oConfig.collectionName] a collection name for the font, if not specified the font face will be used
		 * @param {sap.ui.core.URI} oConfig.fontURI the location where the font files are physically located
		 * @param {object} [oConfig.metadata] a configuration object mapping the icon name to the hexadecimal icon address in the font
		 * @param {object} [oConfig.metadataURI] an URI to a file containing the configuration object specified with oConfig.metadata
		 * @param {boolean} [oConfig.lazy] load the icon font metadata only when an icon is requested with {@link #.getIconInfo}
		 *   if not specified a JSON file with the name oConfig.fontFamily will be loaded from the location specified in oConfig.fontURI
		 * @public
		 * @since 1.56.0
		 */
		IconPool.registerFont = function (oConfig) {
			oConfig.collectionName = oConfig.collectionName || oConfig.fontFamily;

			// check for mandatory fontURI parameter
			if (!oConfig.fontURI) {
				Log.error("The configuration parameter fontURI is missing, cannot register the font '" + oConfig.collectionName + "'!");
				return;
			}

			// protect the default font family
			if (oConfig.fontFamily === SAP_ICON_FONT_FAMILY) {
				Log.error("The font family" + SAP_ICON_FONT_FAMILY + " is already registered");
				return;
			}

			// add trailing slash if necessary for more convenience
			if (oConfig.fontURI.substr(oConfig.fontURI.length - 1) !== "/") {
				oConfig.fontURI += "/";
			}

			// create an initial configuration for the font
			if (!mFontRegistry[oConfig.collectionName] || mFontRegistry[oConfig.collectionName].metadataLoaded === false) {
				mFontRegistry[oConfig.collectionName] = {
					config: oConfig,
					inserted: false
				};
			} else {
				Log.warning("The font '" + oConfig.collectionName + "' is already registered");
			}

			// load font metadata immediately
			if (!oConfig.lazy) {
				IconPool._loadFontMetadata(oConfig.collectionName, true);
			}
		};

		/**
		 * Loads the icon font metadata based on the configuration specified with {@link registerFont}
		 *
		 * @param {string} collectionName collection name for the font
		 * @param {boolean} [async] metadata is loaded asynchronously when true
		 * @private
		 * @returns {Promise|undefined} a Promise that is resolved after loading the metadata in async mode
		 *   or undefined when the font is loaded in sync mode or has already been loaded in either mode.
		 */
		IconPool._loadFontMetadata = function (collectionName, async) {
			var oConfig;

			if (mFontRegistry[collectionName]) {
				// early out for subsequent tries of loading a font that failed or is finished loading
				if (typeof mFontRegistry[collectionName].metadataLoaded === "boolean") {
					return;
				}

				if (async && mFontRegistry[collectionName].metadataLoaded instanceof Promise) {
					return mFontRegistry[collectionName].metadataLoaded;
				}
				// fetch font config
				oConfig = mFontRegistry[collectionName].config;
			} else {
				// only display an error when the collection has not been manually registered by calling addIcon
				if (!mRegistry[collectionName]) {
					Log.error("The font configuration for collection '" + collectionName + "' is not registered");
				}
				// register an entry indicating the font loading failed
				mFontRegistry[collectionName] = {
					metadataLoaded: false
				};
			}

			// add icons to registry and insert the font style
			function loadFont(oFontMetadata) {
				for (var sKey in oFontMetadata) {
					oFontMetadata[sKey] = parseInt(oFontMetadata[sKey], 16);
				}
				mRegistry[collectionName] = oFontMetadata;
				IconPool.insertFontFaceStyle(oConfig.fontFamily, oConfig.fontURI, collectionName);
				mFontRegistry[collectionName].metadataLoaded = true;
			}

			if (oConfig) {
				// search for a metadata file with the font family name in the same folder
				if (oConfig.metadataURI === undefined) {
					oConfig.metadataURI = oConfig.fontURI + oConfig.fontFamily + ".json";
				}
				if (async && !oConfig.metadata) {
					// while loading is pending return the promise
					if (mFontRegistry[collectionName].metadataLoaded instanceof Promise) {
						return mFontRegistry[collectionName].metadataLoaded;
					}
					// the first time create a metadataLoaded promise
					var oPromise = new Promise(function (fnResolve) {
						if (mRegistry[collectionName] === undefined) {
							// store fnResolve to call it from outside the Promise
							mFontRegistry[collectionName].metadataLoadedResolve = fnResolve;
							// load the metadata asynchronously and save the XHR object
							mFontRegistry[collectionName].metadataXhr = jQuery.ajax(oConfig.metadataURI, {
								dataType: "json",
								success: function (oJSON) {
									loadFont(oJSON);
									delete mFontRegistry[collectionName].metadataXhr;
									delete mFontRegistry[collectionName].metadataLoadedResolve;
									fnResolve();
								},
								error: function (jqXHR, sStatus) {
									if (sStatus !== "abort") { // log an error if it isn't aborted
										Log.error("An error occurred loading the font metadata for collection '" + collectionName + "'");
										mFontRegistry[collectionName].metadataLoaded = false;
										fnResolve();
									}
								}
							});
						}
					});

					mFontRegistry[collectionName].metadataLoaded = oPromise;
					return oPromise;
				} else {
					if (oConfig.metadataURI) {
						if (mFontRegistry[collectionName].metadataXhr) { // there is an async request ongoing
							// the async request is aborted before the sync request is sent
							mFontRegistry[collectionName].metadataXhr.abort("Replaced by sync request");
							mFontRegistry[collectionName].metadataXhr = null;
						}
						Log.warning("Synchronous loading of font meta data in IconPool, due to .getIconInfo() call" +
							" for '" + collectionName + "'. Use loading mode 'async' to avoid this call.", "SyncXHR", null, function() {
							return {
								type: "SyncXHR",
								name: "IconPool"
							};
						});
						// load the metadata synchronously
						jQuery.ajax(oConfig.metadataURI, {
							dataType: "json",
							async: false,
							success: function (oJSON) {
								loadFont(oJSON);
								if (mFontRegistry[collectionName].metadataLoadedResolve) {
									// resolve the Promise for the async request
									mFontRegistry[collectionName].metadataLoadedResolve();
									delete mFontRegistry[collectionName].metadataLoadedResolve;
								}
							},
							error: function () {
								if (mFontRegistry[collectionName].metadataLoadedResolve) {
									// resolve the Promise for the async request
									mFontRegistry[collectionName].metadataLoadedResolve();
									delete mFontRegistry[collectionName].metadataLoadedResolve;
								}
								Log.error("An error occurred loading the font metadata for collection '" + collectionName + "'");
								mFontRegistry[collectionName].metadataLoaded = false;
							}
						});
					} else {
						// pass on the configuration object
						loadFont(oConfig.metadata);
					}
				}
			}
		};

		var mIconForMimeType = {
			"application/msword": "sap-icon://doc-attachment",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "sap-icon://doc-attachment",
			"application/rtf": "sap-icon://doc-attachment",
			"application/pdf": "sap-icon://pdf-attachment",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "sap-icon://excel-attachment",
			"application/vnd.ms-excel": "sap-icon://excel-attachment",
			"application/msexcel": "sap-icon://excel-attachment",
			"application/vnd.ms-powerpoint": "sap-icon://ppt-attachment",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation": "sap-icon://ppt-attachment",
			"application/vnd.openxmlformats-officedocument.presentationml.slideshow": "sap-icon://ppt-attachment",
			"application/mspowerpoint": "sap-icon://ppt-attachment",
			"application/xml": "sap-icon://attachment-html",
			"application/xhtml+xml": "sap-icon://attachment-html",
			"application/x-httpd-php": "sap-icon://attachment-html",
			"application/x-javascript": "sap-icon://attachment-html",
			"application/gzip": "sap-icon://attachment-zip-file",
			"application/x-rar-compressed": "sap-icon://attachment-zip-file",
			"application/x-tar": "sap-icon://attachment-zip-file",
			"application/zip": "sap-icon://attachment-zip-file",
			"audio/voxware": "sap-icon://attachment-audio",
			"audio/x-aiff": "sap-icon://attachment-audio",
			"audio/x-midi": "sap-icon://attachment-audio",
			"audio/x-mpeg": "sap-icon://attachment-audio",
			"audio/x-pn-realaudio": "sap-icon://attachment-audio",
			"audio/x-pn-realaudio-plugin": "sap-icon://attachment-audio",
			"audio/x-qt-stream": "sap-icon://attachment-audio",
			"audio/x-wav": "sap-icon://attachment-audio",
			"image/png": "sap-icon://attachment-photo",
			"image/tiff": "sap-icon://attachment-photo",
			"image/bmp": "sap-icon://attachment-photo",
			"image/jpeg": "sap-icon://attachment-photo",
			"image/gif": "sap-icon://attachment-photo",
			"text/plain": "sap-icon://attachment-text-file",
			"text/comma-separated-values": "sap-icon://attachment-text-file",
			"text/css": "sap-icon://attachment-text-file",
			"text/html": "sap-icon://attachment-text-file",
			"text/javascript": "sap-icon://attachment-text-file",
			"text/richtext": "sap-icon://attachment-text-file",
			"text/rtf": "sap-icon://attachment-text-file",
			"text/tab-separated-values": "sap-icon://attachment-text-file",
			"text/xml": "sap-icon://attachment-text-file",
			"video/mpeg": "sap-icon://attachment-video",
			"video/quicktime": "sap-icon://attachment-video",
			"video/x-msvideo": "sap-icon://attachment-video",
			"application/x-shockwave-flash": "sap-icon://attachment-video"
		};

		/**
		 * Returns the icon url based on the given mime type
		 *
		 * @param {string} sMimeType the mime type of a file (e.g. "application/zip")
		 * @return {string} the icon url (e.g. "sap-icon://attachment-zip-file")
		 * @static
		 * @public
		 * @since 1.25.0
		 */
		IconPool.getIconForMimeType = function (sMimeType) {
			return mIconForMimeType[sMimeType] || "sap-icon://document";
		};

		// helper functions
		function makeChar(code) {
			return String.fromCharCode(typeof code === 'number' ? code : parseInt(code, 16));
		}

		return IconPool;

	}, /* bExport= */ true);