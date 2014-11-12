Annotations in Translation Files
================================

All translation texts need to be annotated, so translators have more context. An annotation consists of an "X/Y" text type classification, an optional length restriction, and some freetext comment for translators explaining how the string is used in the UI.

Comment Types
-------------

``` wiki
#<SAP-Text-Type>
#<SAP-Text-Type>:<Note for translator>
#<SAP-Text-Type>,<Length-Restriction>
#<SAP-Text-Type>,<Length-Restriction>:<Note for translator>
```

Text classification
-------------------

### X Texts

Used for all texts with less than 120 characters.


| Text type | According S2X-type | Description           |
|-----------|--------------------|-----------------------|
| XACT      | accessibility      | Accessibility         |
| XALT      | alternativetext    | Alternative text      |
| XBCB      | breadcrumbstep     | Breadcrumb step       |
| XBLI      | listitem           | Bullet list item text |
| XBUT      | button             | Button text           |
| XCAP      | caption            | Caption               |
| XCEL      | cell               | Cell                  |
| XCKL      | checkbox           | Checkbox              |
| XCOL      | tableColumnHeading | Column header         |
| XCRD      | tabStrip           | Tabstrip              |
| XDAT      | datanavigationtext | Data navigation text  |
| XFLD      | label              | Label                 |
| XFRM      | frame              | Frame                 |
| XGLS      | term               | Term                  |
| XGRP      | grouptitle         | Group title           |
| XHED      | heading            | Heading               |
| XLGD      | legendtext         | Legend text           |
| XLNK      | hyperlink          | Hyperlink text        |
| XLOG      | logentry           | Log entry             |
| XLST      | listbox            | List box item         |
| XMEN      | menu               | Menu header           |
| XMIT      | menuitem           | Menu item             |
| XMSG      | messagetext        | Message text          |
| XRBL      | radio              | Radiobutton           |
| XRMP      | roadMapStep        | Roadmap step          |
| XROW      | tableRowHeading    | Table Row Heading     |
| XSEL      | selectiontext      | Selection text        |
| XTBS      | tab                | Tab strip text        |
| XTIT      | tableTitle         | Table Title           |
| XTND      | treeNode           | Tree node text        |
| XTOL      | quickInfo          | Quick info text       |
| XTXT      | generaltext        | General text          |

### Y Texts

All texts over 120 characters. Use only the types specified here. There are other Y types, but do not use them.


| Text type | According S2X-type  | Description              |
|-----------|---------------------|--------------------------|
| YACT      | accessibilitylong   | Accessibility (long)     |
| YBLI      | list                | Bullet list item text    |
| YDEF      | definition          | Definition               |
| YDES      | description         | Description              |
| YEXP      | explanation         | Explanation              |
| YFAA      | faqa                | FAQ answer               |
| YFAQ      | faq                 | FAQ                      |
| YGLS      | glossarydefinition  | Glossary definition      |
| YINF      | informationtextlong | Information              |
| YINS      | instruction         | Instruction              |
| YLOG      | logEntrylong        | Log entry                |
| YMSE      | errorMessage        | Error message            |
| YMSG      | messagetextlong     | Message text (long)      |
| YMSI      | informationMessage  | Information message long |
| YMSW      | warningMessage      | Warning message          |
| YTEC      | technicaltextlong   | Technical text           |
| YTIC      | ticker              | Ticker / Marquee         |
| YTXT      | generaltextlong     | General text long        |

### No Translation

| Type | Description    |
|------|----------------|
| NOTR | No Translation |

Sample Properties File
----------------------

``` wiki
#XMSG: a random text used for demonstration purposes, the meaning is not related to any other content in the UI
HelloWorld=Hello world!

#XBUT,10
OK=OK

#XBUT,15
Cancel=Cancel

#XMSG: The user has just triggered an action which cannot be executed
Unauthorized=User {0} is not authorized to execute command {1}

#XMSG
Multiline=Line 1\nLine 2

#XFLD: The money you get back at shop's checkout-counter
Change=Change
```
