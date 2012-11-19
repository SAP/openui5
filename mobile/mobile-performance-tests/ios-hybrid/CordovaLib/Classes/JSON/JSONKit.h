//
//  JSONKit.h
//  http://github.com/johnezang/JSONKit
//  Dual licensed under either the terms of the BSD License, or alternatively
//  under the terms of the Apache License, Version 2.0, as specified below.
//

/*
 Copyright (c) 2011, John Engelhart
 
 All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 
 * Neither the name of the Zang Industries nor the names of its
 contributors may be used to endorse or promote products derived from
 this software without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
 Copyright 2011 John Engelhart
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

#include <stddef.h>
#include <stdint.h>
#include <limits.h>
#include <TargetConditionals.h>
#include <AvailabilityMacros.h>

#ifdef    __OBJC__
#import <Foundation/NSArray.h>
#import <Foundation/NSData.h>
#import <Foundation/NSDictionary.h>
#import <Foundation/NSError.h>
#import <Foundation/NSObjCRuntime.h>
#import <Foundation/NSString.h>
#endif // __OBJC__
 
#ifdef __cplusplus
extern "C" {
#endif
  

// For Mac OS X < 10.5.
#ifndef   NSINTEGER_DEFINED
#define   NSINTEGER_DEFINED
#if       defined(__LP64__) || defined(NS_BUILD_32_LIKE_64)
typedef long           NSInteger;
typedef unsigned long  NSUInteger;
#define NSIntegerMin   LONG_MIN
#define NSIntegerMax   LONG_MAX
#define NSUIntegerMax  ULONG_MAX
#else  // defined(__LP64__) || defined(NS_BUILD_32_LIKE_64)
typedef int            NSInteger;
typedef unsigned int   NSUInteger;
#define NSIntegerMin   INT_MIN
#define NSIntegerMax   INT_MAX
#define NSUIntegerMax  UINT_MAX
#endif // defined(__LP64__) || defined(NS_BUILD_32_LIKE_64)
#endif // NSINTEGER_DEFINED


#ifndef _CDVJSONKIT_H_
#define _CDVJSONKIT_H_

#if defined(__GNUC__) && (__GNUC__ >= 4) && defined(__APPLE_CC__) && (__APPLE_CC__ >= 5465)
#define CDVJK_DEPRECATED_ATTRIBUTE __attribute__((deprecated))
#else
#define CDVJK_DEPRECATED_ATTRIBUTE
#endif
  
#define CDVJSONKIT_VERSION_MAJOR 1
#define CDVJSONKIT_VERSION_MINOR 4

typedef NSUInteger CDVJKFlags;

/*
  CDVJKParseOptionComments        : Allow C style // and /_* ... *_/ (without a _, obviously) comments in JSON.
  CDVJKParseOptionUnicodeNewlines : Allow Unicode recommended (?:\r\n|[\n\v\f\r\x85\p{Zl}\p{Zp}]) newlines.
  CDVJKParseOptionLooseUnicode    : Normally the decoder will stop with an error at any malformed Unicode.
                                 This option allows JSON with malformed Unicode to be parsed without reporting an error.
                                 Any malformed Unicode is replaced with \uFFFD, or "REPLACEMENT CHARACTER".
 */

enum {
  CDVJKParseOptionNone                     = 0,
  CDVJKParseOptionStrict                   = 0,
  CDVJKParseOptionComments                 = (1 << 0),
  CDVJKParseOptionUnicodeNewlines          = (1 << 1),
  CDVJKParseOptionLooseUnicode             = (1 << 2),
  CDVJKParseOptionPermitTextAfterValidJSON = (1 << 3),
  CDVJKParseOptionValidFlags               = (CDVJKParseOptionComments | CDVJKParseOptionUnicodeNewlines | CDVJKParseOptionLooseUnicode | CDVJKParseOptionPermitTextAfterValidJSON),
};
typedef CDVJKFlags CDVJKParseOptionFlags;

enum {
  CDVJKSerializeOptionNone                 = 0,
  CDVJKSerializeOptionPretty               = (1 << 0),
  CDVJKSerializeOptionEscapeUnicode        = (1 << 1),
  CDVJKSerializeOptionEscapeForwardSlashes = (1 << 4),
  CDVJKSerializeOptionValidFlags           = (CDVJKSerializeOptionPretty | CDVJKSerializeOptionEscapeUnicode | CDVJKSerializeOptionEscapeForwardSlashes),
};
typedef CDVJKFlags CDVJKSerializeOptionFlags;

#ifdef    __OBJC__

typedef struct CDVJKParseState CDVJKParseState; // Opaque internal, private type.

// As a general rule of thumb, if you use a method that doesn't accept a CDVJKParseOptionFlags argument, it defaults to CDVJKParseOptionStrict

@interface CDVJSONDecoder : NSObject {
  CDVJKParseState *parseState;
}
+ (id)decoder;
+ (id)decoderWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags;
- (id)initWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags;
- (void)clearCache;

// The parse... methods were deprecated in v1.4 in favor of the v1.4 objectWith... methods.
- (id)parseUTF8String:(const unsigned char *)string length:(size_t)length                         CDVJK_DEPRECATED_ATTRIBUTE; // Deprecated in JSONKit v1.4.  Use objectWithUTF8String:length:        instead.
- (id)parseUTF8String:(const unsigned char *)string length:(size_t)length error:(NSError **)error CDVJK_DEPRECATED_ATTRIBUTE; // Deprecated in JSONKit v1.4.  Use objectWithUTF8String:length:error:  instead.
// The NSData MUST be UTF8 encoded JSON.
- (id)parseJSONData:(NSData *)jsonData                                                            CDVJK_DEPRECATED_ATTRIBUTE; // Deprecated in JSONKit v1.4.  Use objectWithData:                     instead.
- (id)parseJSONData:(NSData *)jsonData error:(NSError **)error                                    CDVJK_DEPRECATED_ATTRIBUTE; // Deprecated in JSONKit v1.4.  Use objectWithData:error:               instead.

// Methods that return immutable collection objects.
- (id)objectWithUTF8String:(const unsigned char *)string length:(NSUInteger)length;
- (id)objectWithUTF8String:(const unsigned char *)string length:(NSUInteger)length error:(NSError **)error;
// The NSData MUST be UTF8 encoded JSON.
- (id)objectWithData:(NSData *)jsonData;
- (id)objectWithData:(NSData *)jsonData error:(NSError **)error;

// Methods that return mutable collection objects.
- (id)mutableObjectWithUTF8String:(const unsigned char *)string length:(NSUInteger)length;
- (id)mutableObjectWithUTF8String:(const unsigned char *)string length:(NSUInteger)length error:(NSError **)error;
// The NSData MUST be UTF8 encoded JSON.
- (id)mutableObjectWithData:(NSData *)jsonData;
- (id)mutableObjectWithData:(NSData *)jsonData error:(NSError **)error;

@end

////////////
#pragma mark Deserializing methods
////////////

@interface NSString (CDVJSONKitDeserializing)
- (id)cdvjk_objectFromJSONString;
- (id)cdvjk_objectFromJSONStringWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags;
- (id)cdvjk_objectFromJSONStringWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags error:(NSError **)error;
- (id)cdvjk_mutableObjectFromJSONString;
- (id)cdvjk_mutableObjectFromJSONStringWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags;
- (id)cdvjk_mutableObjectFromJSONStringWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags error:(NSError **)error;
@end

@interface NSData (CDVJSONKitDeserializing)
// The NSData MUST be UTF8 encoded JSON.
- (id)cdvjk_objectFromJSONData;
- (id)cdvjk_objectFromJSONDataWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags;
- (id)cdvjk_objectFromJSONDataWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags error:(NSError **)error;
- (id)cdvjk_mutableObjectFromJSONData;
- (id)cdvjk_mutableObjectFromJSONDataWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags;
- (id)cdvjk_mutableObjectFromJSONDataWithParseOptions:(CDVJKParseOptionFlags)parseOptionFlags error:(NSError **)error;
@end

////////////
#pragma mark Serializing methods
////////////
  
@interface NSString (CDVJSONKitSerializing)
// Convenience methods for those that need to serialize the receiving NSString (i.e., instead of having to serialize a NSArray with a single NSString, you can "serialize to JSON" just the NSString).
// Normally, a string that is serialized to JSON has quotation marks surrounding it, which you may or may not want when serializing a single string, and can be controlled with includeQuotes:
// includeQuotes:YES `a "test"...` -> `"a \"test\"..."`
// includeQuotes:NO  `a "test"...` -> `a \"test\"...`
- (NSData *)cdvjk_JSONData;     // Invokes JSONDataWithOptions:CDVJKSerializeOptionNone   includeQuotes:YES
- (NSData *)cdvjk_JSONDataWithOptions:(CDVJKSerializeOptionFlags)serializeOptions includeQuotes:(BOOL)includeQuotes error:(NSError **)error;
- (NSString *)cdvjk_JSONString; // Invokes JSONStringWithOptions:CDVJKSerializeOptionNone includeQuotes:YES
- (NSString *)cdvjk_JSONStringWithOptions:(CDVJKSerializeOptionFlags)serializeOptions includeQuotes:(BOOL)includeQuotes error:(NSError **)error;
@end

@interface NSArray (CDVJSONKitSerializing)
- (NSData *)cdvjk_JSONData;
- (NSData *)cdvjk_JSONDataWithOptions:(CDVJKSerializeOptionFlags)serializeOptions error:(NSError **)error;
- (NSData *)cdvjk_JSONDataWithOptions:(CDVJKSerializeOptionFlags)serializeOptions serializeUnsupportedClassesUsingDelegate:(id)delegate selector:(SEL)selector error:(NSError **)error;
- (NSString *)cdvjk_JSONString;
- (NSString *)cdvjk_JSONStringWithOptions:(CDVJKSerializeOptionFlags)serializeOptions error:(NSError **)error;
- (NSString *)cdvjk_JSONStringWithOptions:(CDVJKSerializeOptionFlags)serializeOptions serializeUnsupportedClassesUsingDelegate:(id)delegate selector:(SEL)selector error:(NSError **)error;
@end

@interface NSDictionary (CDVJSONKitSerializing)
- (NSData *)cdvjk_JSONData;
- (NSData *)cdvjk_JSONDataWithOptions:(CDVJKSerializeOptionFlags)serializeOptions error:(NSError **)error;
- (NSData *)cdvjk_JSONDataWithOptions:(CDVJKSerializeOptionFlags)serializeOptions serializeUnsupportedClassesUsingDelegate:(id)delegate selector:(SEL)selector error:(NSError **)error;
- (NSString *)cdvjk_JSONString;
- (NSString *)cdvjk_JSONStringWithOptions:(CDVJKSerializeOptionFlags)serializeOptions error:(NSError **)error;
- (NSString *)cdvjk_JSONStringWithOptions:(CDVJKSerializeOptionFlags)serializeOptions serializeUnsupportedClassesUsingDelegate:(id)delegate selector:(SEL)selector error:(NSError **)error;
@end

#ifdef __BLOCKS__

@interface NSArray (CDVJSONKitSerializingBlockAdditions)
- (NSData *)cdvjk_JSONDataWithOptions:(CDVJKSerializeOptionFlags)serializeOptions serializeUnsupportedClassesUsingBlock:(id(^)(id object))block error:(NSError **)error;
- (NSString *)cdvjk_JSONStringWithOptions:(CDVJKSerializeOptionFlags)serializeOptions serializeUnsupportedClassesUsingBlock:(id(^)(id object))block error:(NSError **)error;
@end

@interface NSDictionary (CDVJSONKitSerializingBlockAdditions)
- (NSData *)cdvjk_JSONDataWithOptions:(CDVJKSerializeOptionFlags)serializeOptions serializeUnsupportedClassesUsingBlock:(id(^)(id object))block error:(NSError **)error;
- (NSString *)cdvjk_JSONStringWithOptions:(CDVJKSerializeOptionFlags)serializeOptions serializeUnsupportedClassesUsingBlock:(id(^)(id object))block error:(NSError **)error;
@end
  
#endif


#endif // __OBJC__

#endif // _CDVJSONKIT_H_

#ifdef __cplusplus
}  // extern "C"
#endif
