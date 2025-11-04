#include <jsi/jsi.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTBridge.h>
#import <React/RCTLog.h>

using namespace facebook;

namespace filecore {
  void installFileCoreHostObject(jsi::Runtime& runtime);
}

@interface RCTFileCoreInstaller : NSObject <RCTBridgeModule>
@end

@implementation RCTFileCoreInstaller

RCT_EXPORT_MODULE(FileCoreInstaller);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

RCT_EXPORT_METHOD(install)
{
  RCTBridge *bridge = self.bridge;
  if (bridge == nil) {
    RCTLogError(@"FileCoreInstaller: Bridge is nil, cannot install JSI host object");
    return;
  }
  
  jsi::Runtime *runtime = [self getJSRuntime:bridge];
  
  if (runtime != nullptr) {
    filecore::installFileCoreHostObject(*runtime);
    RCTLogInfo(@"FileCoreInstaller: Successfully installed FileCore JSI host object");
  } else {
    RCTLogWarn(@"FileCoreInstaller: Could not access JSI runtime, JSI host object not installed");
  }
}

- (jsi::Runtime *)getJSRuntime:(RCTBridge *)bridge
{
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wundeclared-selector"
  SEL runtimeSelector = @selector(runtime);
  if ([bridge respondsToSelector:runtimeSelector]) {
    return (__bridge jsi::Runtime *)[bridge performSelector:runtimeSelector];
  }
#pragma clang diagnostic pop
  return nullptr;
}

@end