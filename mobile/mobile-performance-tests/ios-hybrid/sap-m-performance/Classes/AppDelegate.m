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

//
//  AppDelegate.m
//  sap-m-performance
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//

#import "AppDelegate.h"
#import "MainViewController.h"

#import <Cordova/CDVPlugin.h>

@implementation AppDelegate

@synthesize window, viewController;

- (id)init
{
    /** If you need to do any extra app-specific initialization, you can do it here
     *  -jm
     **/
    NSHTTPCookieStorage* cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];

    [cookieStorage setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];

    self = [super init];
    return self;
}

#pragma UIApplicationDelegate implementation

/**
 * This is main kick off after the app inits, the views and Settings are setup here. (preferred - iOS4 and up)
 */
- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    NSURL* url = [launchOptions objectForKey:UIApplicationLaunchOptionsURLKey];
    NSString* invokeString = nil;

    if (url && [url isKindOfClass:[NSURL class]]) {
        invokeString = [url absoluteString];
        NSLog(@"sap-m-performance launchOptions = %@", url);
    }

    CGRect screenBounds = [[UIScreen mainScreen] bounds];
    self.window = [[[UIWindow alloc] initWithFrame:screenBounds] autorelease];
    self.window.autoresizesSubviews = YES;

    self.viewController = [[[MainViewController alloc] init] autorelease];
    self.viewController.useSplashScreen = YES;
    self.viewController.wwwFolderName = @"www";
    self.viewController.startPage = @"index.html";
    self.viewController.invokeString = invokeString;

    // NOTE: To control the view's frame size, override [self.viewController viewWillAppear:] in your view controller.

    // check whether the current orientation is supported: if it is, keep it, rather than forcing a rotation
    BOOL forceStartupRotation = YES;
    UIDeviceOrientation curDevOrientation = [[UIDevice currentDevice] orientation];

    if (UIDeviceOrientationUnknown == curDevOrientation) {
        // UIDevice isn't firing orientation notifications yet… go look at the status bar
        curDevOrientation = (UIDeviceOrientation)[[UIApplication sharedApplication] statusBarOrientation];
    }

    if (UIDeviceOrientationIsValidInterfaceOrientation(curDevOrientation)) {
        if ([self.viewController supportsOrientation:curDevOrientation]) {
            forceStartupRotation = NO;
        }
    }

    if (forceStartupRotation) {
        UIInterfaceOrientation newOrient;
        if ([self.viewController supportsOrientation:UIInterfaceOrientationPortrait]) {
            newOrient = UIInterfaceOrientationPortrait;
        } else if ([self.viewController supportsOrientation:UIInterfaceOrientationLandscapeLeft]) {
            newOrient = UIInterfaceOrientationLandscapeLeft;
        } else if ([self.viewController supportsOrientation:UIInterfaceOrientationLandscapeRight]) {
            newOrient = UIInterfaceOrientationLandscapeRight;
        } else {
            newOrient = UIInterfaceOrientationPortraitUpsideDown;
        }

        NSLog(@"AppDelegate forcing status bar to: %d from: %d", newOrient, curDevOrientation);
        [[UIApplication sharedApplication] setStatusBarOrientation:newOrient];
    }

    self.window.rootViewController = self.viewController;
    [self.window makeKeyAndVisible];

    return YES;
}

// this happens while we are running ( in the background, or from within our own app )
// only valid if sap-m-performance-Info.plist specifies a protocol to handle
- (BOOL)application:(UIApplication*)application handleOpenURL:(NSURL*)url
{
    if (!url) {
        return NO;
    }

    // calls into javascript global function 'handleOpenURL'
    NSString* jsString = [NSString stringWithFormat:@"handleOpenURL(\"%@\");", url];
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:jsString];

    // all plugins will get the notification, and their handlers will be called
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];

    return YES;
}

- (NSUInteger)application:(UIApplication*)application supportedInterfaceOrientationsForWindow:(UIWindow*)window
{
    // iPhone doesn't support upside down by default, while the iPad does.  Override to allow all orientations always, and let the root view controller decide what's allowed (the supported orientations mask gets intersected).
    NSUInteger supportedInterfaceOrientations = (1 << UIInterfaceOrientationPortrait) | (1 << UIInterfaceOrientationLandscapeLeft) | (1 << UIInterfaceOrientationLandscapeRight) | (1 << UIInterfaceOrientationPortraitUpsideDown);

    return supportedInterfaceOrientations;
}

@end
