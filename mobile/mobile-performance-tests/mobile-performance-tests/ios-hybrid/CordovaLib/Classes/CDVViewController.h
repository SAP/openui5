/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

#import "CDVCordovaView.h"

#import "JSONKit.h"
#import "CDVAvailability.h"
#import "CDVInvokedUrlCommand.h"
#import "CDVCommandDelegate.h"
#import "CDVWhitelist.h"

@class CDVCommandQueue;
@class CDVCommandDelegateImpl;

@interface CDVViewController : UIViewController <UIWebViewDelegate>{
    @private
    CDVCommandDelegateImpl* _commandDelegate;
}

@property (nonatomic, strong) IBOutlet CDVCordovaView* webView;

@property (nonatomic, readonly, strong) NSMutableDictionary* pluginObjects;
@property (nonatomic, readonly, strong) NSDictionary* pluginsMap;
@property (nonatomic, readonly, strong) NSDictionary* settings;
@property (nonatomic, readonly, strong) CDVWhitelist* whitelist; // readonly for public
@property (nonatomic, readonly, assign) BOOL loadFromString;
@property (nonatomic, readwrite, copy)NSString * invokeString CDV_DEPRECATED(2.0, "Use window.handleOpenURL(url instead. It is called when the app is launched through a custom scheme url.");

@property (nonatomic, readwrite, assign) BOOL useSplashScreen;
@property (nonatomic, readonly, strong) IBOutlet UIActivityIndicatorView* activityView;
@property (nonatomic, readonly, strong) UIImageView* imageView;

@property (nonatomic, readwrite, copy) NSString* wwwFolderName;
@property (nonatomic, readwrite, copy) NSString* startPage;
@property (nonatomic, readonly, strong) CDVCommandQueue* commandQueue;
@property (nonatomic, readonly, strong) CDVCommandDelegateImpl* commandDelegate;

+ (NSDictionary*)getBundlePlist:(NSString*)plistName;
+ (NSString*)applicationDocumentsDirectory;

- (void)printMultitaskingInfo;
- (void)createGapView;
- (CDVCordovaView*)newCordovaViewWithFrame:(CGRect)bounds;

- (void)javascriptAlert:(NSString*)text;
- (NSString*)appURLScheme;

- (NSArray*)parseInterfaceOrientations:(NSArray*)orientations;
- (BOOL)supportsOrientation:(UIInterfaceOrientation)orientation;

- (id)getCommandInstance:(NSString*)pluginName;
- (void)registerPlugin:(CDVPlugin*)plugin withClassName:(NSString*)className;

@end
