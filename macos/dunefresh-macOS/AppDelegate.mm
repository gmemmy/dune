#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import <Foundation/Foundation.h>

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
  self.moduleName = @"dune";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  self.dependencyProvider = [RCTAppDependencyProvider new];
  // Force-load FileCore installer class so the linker doesn't strip it
  (void)NSClassFromString(@"RCTFileCoreInstaller");
  
  // Register for bridge notifications to install JSI module
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(onJavaScriptDidLoad:)
                                               name:RCTJavaScriptDidLoadNotification
                                             object:nil];
  return [super applicationDidFinishLaunching:notification];
}

- (void)onJavaScriptDidLoad:(NSNotification *)notification
{
  RCTBridge *bridge = notification.userInfo[@"bridge"];
  if (bridge == nil) {
    return;
  }

  id<RCTBridgeModule> fileCoreInstaller = [bridge moduleForName:@"FileCoreInstaller"];
  if (fileCoreInstaller != nil && [fileCoreInstaller respondsToSelector:@selector(install)]) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"
    if ([fileCoreInstaller respondsToSelector:@selector(setBridge:)]) {
      [fileCoreInstaller performSelector:@selector(setBridge:) withObject:bridge];
    }
    RCTLogInfo(@"AppDelegate: Invoking FileCoreInstaller.install");
    [fileCoreInstaller performSelector:@selector(install)];
#pragma clang diagnostic pop
  } else {
    RCTLogWarn(@"AppDelegate: FileCoreInstaller module not found or install selector missing");
  }

  [[NSNotificationCenter defaultCenter] removeObserver:self name:RCTJavaScriptDidLoadNotification object:nil];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
#ifdef RN_FABRIC_ENABLED
  return true;
#else
  return false;
#endif
}

@end
