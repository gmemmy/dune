#pragma once
#include <cstddef>
#include <jsi/jsi.h>
#include <filesystem>
#include <unordered_map>
#include <mutex>
#include <vector>
#include <optional>
#include <string>

using namespace facebook::jsi;

namespace filecore {

  struct DirectoryEntry {
    std::string fileName;
    std::string filePath;
    bool isDirectory;
    bool isHidden;
    std::optional<uint64_t> fileSize;
    std::optional<int64_t> lastModifiedTimestamp;
  };

  struct DirectoryCursor {
    std::vector<DirectoryEntry> directoryEntries;
    size_t currentIndex = 0;
  };

  class FileCoreHostObject : public HostObject {
    public:
      FileCoreHostObject();
      ~FileCoreHostObject() override = default;
      Value get(Runtime& runtime, const PropNameID& propertyName) override;

    private:
      Value listAsJSArray(Runtime& runtime, const Value* arguments, size_t argumentCount);
      Value statMultipleAsJS(Runtime& runtime, const Value* arguments, size_t argumentCount);

      DirectoryCursor createCursorForDirectory(const std::string& directoryPath);
      static bool checkIfHidden(const std::filesystem::directory_entry& directoryEntry);
      std::string generateCursorToken();

      std::mutex directoryCursorMutex_;
      std::unordered_map<std::string, DirectoryCursor> activeDirectoryCursors_;
  };

  void installFileCoreHostObject(Runtime& runtime);
}
