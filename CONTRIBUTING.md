# Contributing to OpenUI5

You want to contribute to OpenUI5? Welcome! Please read this document to understand what you can do.

## Help Others

You can help OpenUI5 by helping others who use UI5 and need support. You will find them e.g. on [StackOverflow](http://stackoverflow.com/questions/tagged/sapui5) or in the [SAP Community Network forum](http://scn.sap.com/community/developer-center/front-end/content).

## Analyze Issues

Analyzing issue reports can be a lot of effort. Any help is welcome!
Go to [the Github issue tracker](https://github.com/SAP/openui5/issues?state=open) and find an open issue which needs additional work or a bugfix.

Additional work may be further information, or a minimized jsbin example or gist, or it might be a hint that helps understanding the issue.

We cannot accept pull requests yet, so in case you find a fix and want to propose it, describe it in the bug report - we will happily pick it up.


## Report an Issue

If you find a bug - behavior of UI5 code contradicting its specification - you are welcome to report it.
We can only handle well-reported, actual bugs, so please follow the guidelines below and use forums like [StackOverflow](http://stackoverflow.com/questions/tagged/sapui5) for support questions or when in doubt whether the issue is an actual bug. 

Once you have familiarized with the guidelines, you can go to the [Github issue tracker for OpenUI5](https://github.com/SAP/openui5/issues/new) to report the issue.

### Quick Checklist for Bug Reports

 * Issue report checklist:
 * Real, current bug
 * No duplicate
 * Reproducible
 * Good summary
 * Well-documented
 * Minimal example
 * Use the [template](http://sap.github.io/openui5/bugreport_template.txt)


### Requirements for a bug report

These eight requirements are the mandatory base of a good bug report:
1. **Only real bugs**: please do your best to make sure to only report real bugs in OpenUI5! Do not report:
   * issues caused by application code or any code outside UI5.
   * issues caused by the usage of non-public UI5 methods. Only the public methods listed in the API documentation may be used.
   * something that behaves just different from what you expected. A bug is when something behaves different than specified. When in doubt, ask in a forum.
   * something you do not get to work properly. Use a support forum like stackoverflow to request help.
   * feature requests. Well, this is arguable: critical or easy-to-do enhancement suggestions are welcome, but we do not want to use the issue tracker as wishlist.
2. No duplicate: you have searched the issue tracker to make sure the bug has not yet been reported
3. Good summary: the summary should be specific to the issue
4. Current bug: the bug can be reproduced in the most current version (state the tested version!)
5. Reproducible bug: there are clear steps to reproduce given. This includes:
   * a URL to access the example
   * any required user/password information (do not reveal any credentials that could be mis-used!)
   * detailed and complete step-by-step instructions to reproduce the bug
6. Precise description:
   * precisely state the expected and the actual behavior
   * give information about the used browser/device and its version, if possible also the behavior in other browsers/devices
   * if the bug is about wrong UI appearance, attach a screenshot and mark what is wrong
   * generally give as much additional information as possible. (But find the right balance: don not invest hours for a very obvious and easy to solve issue. When in doubt, give more information.)
7. Minimal example: it is highly encouraged to provide a minimal example to reproduce in e.g. jsbin: isolate the application code which triggers the issue and strip it down as much as possible as long as the issue still occurs. If several files are required, you can create a gist. This may not always be possible and sometimes be overkill, but it always helps analyzing a bug.
8. Only one bug per report: open different tickets for different issues

You are encouraged use [this template](http://sap.github.io/openui5/bugreport_template.txt).

Please report bugs in English, so all users can understand them.

If the bug appears to be a regression introduced in a new version of UI5, try to find the closest versions between which it was introduced and take special care to make sure the issue is not caused by your application's usage of any internal method which changed its behavior.

Be aware that issues cannot be deleted once they are created, so be careful when creating them and do not use the issue tracker for testing.


### Reporting Security Issues

If you find a security issue, please act responsibly and report it not in the public issue tracker, but directly to us, so we can fix it before it can be exploited:
 * SAP Customers: if the found security issue is not covered by a published security note, please report it by creating a customer message at https://service.sap.com/message.
 * Researchers/non-Customers: please send the related information to secure@sap.com using [PGP for e-mail encryption](http://global.sap.com/pc/security/keyblock.txt).
Also refer to the general [SAP security information page](http://www54.sap.com/pc/tech/application-foundation-security/software/security-at-sap/report.html).


### Usage of Labels

Github offers labels to categorize issues. We defined the following labels so far:

Labels for issue categories:
 * bug: this issue is a bug in the code
 * documentation: this issue is about wrong documentation
 * enhancement: this is not a bug report, but an enhancement request
 
Status of open issues:
 * unconfirmed: this report needs confirmation whether it is really a bug (no label; this is the default status)
 * approved: this issue is confirmed to be a bug
 * author action: the author is required to provide information
 
Status/resolution of closed issues:
 * fixed: a fix for the issue was provided
 * duplicate: the issue is also reported in a different ticket and is handled there
 * invalid: for some reason or another this issue report will not be handled further (maybe lack of information or issue does not apply anymore)
 * works: not reproducible or working as expected
 * wontfix: while acknowledged to be an issue, a fix cannot or will not be provided

The category labels should be set by the issue reporter (but can be corrected later).

The status labels should only be modified by the person who analyzed the issue report. Exception: when the issue was on "author action" and the issue author has provided the requested action, the author needs to remove the "author action" label.


### Issue Reporting Disclaimer

We want to improve quality of UI5 and good bug reports are welcome! But our capacity is limited, so we cannot handle questions or consultation requests and we cannot afford to ask for required details. So we reserve the right to close or to not process insufficient bug reports in favor of those which are very cleanly documented and easy to reproduce. Even though we would like to solve each well-documented issue, there is always the possibility that it won't happen - remember: OpenUI5 is Open Source and comes without warranty.

Bug report analysis support is very welcome! (e.g. pre-analysis or proposing solutions) Forking and pull-requests are not possible yet, but it's all JavaScript, so it's easy to override things with modified/fixed code in the browser and test the fix.

This issue handling offer is also an experiment for us. We don't know how many issues will be reported and how well they will be reported. We will learn as we go and try to adjust. Bear with us.


## Contribute Code

Unfortunately we cannot accept pull requests yet. There are legal requirements (contributor's agreement) as well as technical requirements (UI5 code in Github repository) which need to be fulfilled first. The code is not yet in the Github repository because the current source structure requires a complicated Maven build which we don't want to enforce upon you. We are currently simplifying the build.

