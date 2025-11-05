#include <jsi/jsi.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTBridge.h>
#import <React/RCTLog.h>
#import <ReactCommon/RuntimeExecutor.h>

using namespace facebook;

namespace filecore {
  void installFileCoreHostObject(jsi::Runtime& runtime);
}

using facebook::react::RuntimeExecutor;

// Provided by React Native macOS; converts a bridge into a RuntimeExecutor we can use.
extern RuntimeExecutor RCTRuntimeExecutorFromBridge(RCTBridge *bridge);

@interface RCTFileCoreInstaller : NSObject <RCTBridgeModule>
@property (nonatomic, weak) RCTBridge *bridgeRef;
@end

@implementation RCTFileCoreInstaller

RCT_EXPORT_MODULE(FileCoreInstaller);

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

RCT_EXPORT_METHOD(install)
{
  RCTBridge *bridge = self.bridgeRef;
  if (bridge == nil) {
    RCTLogError(@"FileCoreInstaller: Bridge is nil, cannot install JSI host object");
    return;
  }

  RuntimeExecutor executor = RCTRuntimeExecutorFromBridge(bridge);
  executor([](jsi::Runtime &runtime) {
    filecore::installFileCoreHostObject(runtime);
  });
  RCTLogInfo(@"FileCoreInstaller: Installation scheduled on RuntimeExecutor");
}

- (void)setBridge:(RCTBridge *)bridge
{
  _bridgeRef = bridge;
}

// Legacy runtime accessor removed; using RuntimeExecutor instead

@end