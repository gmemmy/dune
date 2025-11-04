#include "FileCoreHostObject.h"
#include "jsi/jsi.h"
#include <cstddef>
#include <exception>
#include <filesystem>
#include <uuid/uuid.h>
#include <chrono>
#include <algorithm>
#include <optional>

using namespace facebook;
namespace fs = std::filesystem;

namespace filecore {
  static jsi::Object entryToJSI(jsi::Runtime& runtime, const DirectoryEntry& directoryEntry) {
    auto obj = jsi::Object(runtime);
    obj.setProperty(runtime, "name", jsi::String::createFromUtf8(runtime, directoryEntry.fileName));
    obj.setProperty(runtime, "path", jsi::String::createFromUtf8(runtime, directoryEntry.filePath));
    obj.setProperty(runtime, "kind", jsi::String::createFromUtf8(runtime, directoryEntry.isDirectory ? "dir" : "file"));
    obj.setProperty(runtime, "hidden", jsi::Value(directoryEntry.isHidden));
    if (directoryEntry.fileSize) obj.setProperty(runtime, "size", (double)directoryEntry.fileSize.value());
    if (directoryEntry.lastModifiedTimestamp) obj.setProperty(runtime, "lastModified", (double)directoryEntry.lastModifiedTimestamp.value());
    return obj;
  }

  static int64_t getTimestamp(const fs::file_time_type& time) {
    using namespace std::chrono;
    auto timestamp = time_point_cast<milliseconds>(time).time_since_epoch().count();
    return timestamp;
  }

  FileCoreHostObject::FileCoreHostObject() {}
  bool FileCoreHostObject::checkIfHidden(const fs::directory_entry& entry) {
    auto fileName = entry.path().filename().string();
    return !fileName.empty() && fileName[0] == '.';
  }

  DirectoryCursor FileCoreHostObject::createCursorForDirectory(const std::string& directoryPath) {
    DirectoryCursor cursor;
    fs::directory_options options = fs::directory_options::skip_permission_denied;
    try {
      for (auto& entry : fs::directory_iterator(directoryPath, options)) {
        DirectoryEntry dirEntry;
        dirEntry.fileName = entry.path().filename().string();
        dirEntry.filePath = entry.path().string();
        std::error_code error;
        dirEntry.isDirectory = entry.is_directory(error);
        dirEntry.isHidden = checkIfHidden(entry);
        if (!dirEntry.isDirectory) {
          auto fileSize = fs::file_size(entry.path(), error);
          if (!error) dirEntry.fileSize = (uint64_t)fileSize;
        }
        auto writeTime = fs::last_write_time(entry.path(), error);
        if (!error) dirEntry.lastModifiedTimestamp = getTimestamp(writeTime);
        cursor.directoryEntries.emplace_back(std::move(dirEntry));
      }
      std::sort(cursor.directoryEntries.begin(), cursor.directoryEntries.end(), [](const DirectoryEntry& a, const DirectoryEntry& b ) {
        return a.fileName < b.fileName;
      });
      cursor.currentIndex = 0;
    } catch (const std::exception& e) {
      // Silently handle directory access errors
      // The cursor will be empty, which is acceptable
    } catch (...) {}
    return cursor;
  }

  std::string FileCoreHostObject::generateCursorToken() {
    uuid_t id; uuid_generate(id);
    char out[37]; uuid_unparse_lower(id, out);
    return std::string(out);
  }

  jsi::Value FileCoreHostObject::listAsJSArray(jsi::Runtime& runtime, const jsi::Value* args, size_t argumentCount) {
    if (argumentCount < 2) return jsi::Value::undefined();
    auto directoryPath = args[0].asString(runtime).utf8(runtime);
    auto limit = (size_t)args[1].asNumber();
    std::string cursorArg = (argumentCount >=3 && args[2].isString()) ? args[2].asString(runtime).utf8(runtime) : "";

    DirectoryCursor* cursorPtr = nullptr;
    std::string cursorToken;
    {
      std::scoped_lock lock(directoryCursorMutex_);
      if (cursorArg.empty()) {
        auto freshCursor = createCursorForDirectory(directoryPath);
        cursorToken = generateCursorToken();
        cursorPtr = &activeDirectoryCursors_.emplace(cursorToken, std::move(freshCursor)).first->second;
      } else {
        auto it = activeDirectoryCursors_.find(cursorArg);
        if (it == activeDirectoryCursors_.end()) {
          auto freshCursor = createCursorForDirectory(directoryPath);
          cursorToken = generateCursorToken();
          cursorPtr = &activeDirectoryCursors_.emplace(cursorToken, std::move(freshCursor)).first->second;
        } else {
         cursorToken = cursorArg;
         cursorPtr = &it->second;
        }
      }
    }

    jsi::Array jsArrayItems(runtime, 0);
    std::optional<std::string> nextCursor;
    {
      std::scoped_lock lock(directoryCursorMutex_);
      auto& cursor = *cursorPtr;
      size_t remainingItems = cursor.directoryEntries.size() - cursor.currentIndex;
      size_t countToAdd = std::min(limit, remainingItems);
      jsArrayItems = jsi::Array(runtime, countToAdd);
      for (size_t i = 0; i < countToAdd; ++i) {
        jsArrayItems.setValueAtIndex(runtime, i, entryToJSI(runtime, cursor.directoryEntries[cursor.currentIndex + i]));
      }
      cursor.currentIndex += countToAdd;
      if (cursor.currentIndex < cursor.directoryEntries.size()) nextCursor = cursorToken;
      else activeDirectoryCursors_.erase(cursorToken);
    }

    jsi::Object result(runtime);
    result.setProperty(runtime, "items", std::move(jsArrayItems));
    if (nextCursor) result.setProperty(runtime, "cursor", jsi::String::createFromUtf8(runtime, *nextCursor));
    return result;
  }

  jsi::Value FileCoreHostObject::statMultipleAsJS(jsi::Runtime& runtime, const jsi::Value* args, size_t argumentCount) {
    if (argumentCount < 1 || !args[0].isObject() || !args[0].asObject(runtime).isArray(runtime)) return jsi::Value::undefined();
    auto pathsArray = args[0].asObject(runtime).asArray(runtime);
    size_t pathCount = pathsArray.length(runtime);
    jsi::Array out(runtime, pathCount);
    for (size_t i = 0; i < pathCount; ++i) {
      auto pathValue = pathsArray.getValueAtIndex(runtime, i).asString(runtime).utf8(runtime);
      std::error_code error;
      uint64_t size = 0; int64_t lastModified = 0;
      auto fsPath = fs::path(pathValue);
      auto status = fs::status(fsPath, error);
      if (!error) {
        if (fs::is_regular_file(status)) {
          auto fileSize = fs::file_size(fsPath, error);
          if (!error) size = (uint64_t)fileSize;
        }
        auto writeTime = fs::last_write_time(fsPath, error);
        if (!error) lastModified = getTimestamp(writeTime);
      }
      jsi::Object obj(runtime);
      obj.setProperty(runtime, "path", jsi::String::createFromUtf8(runtime, pathValue));
      obj.setProperty(runtime, "size", (double)size);
      obj.setProperty(runtime, "lastModified", (double)lastModified);
      out.setValueAtIndex(runtime, i, std::move(obj));
    }
    return out;
  }

  jsi::Value FileCoreHostObject::get(jsi::Runtime& runtime, const jsi::PropNameID& name){
    auto propertyName = name.utf8(runtime);
    if (propertyName == "listAsJSArray") {
      return jsi::Function::createFromHostFunction(
        runtime,
        name,
        3,
        [this](jsi::Runtime& runtime, const jsi::Value&, const jsi::Value* a, size_t count) {
          return listAsJSArray(runtime, a, count);
        }
      );
    }
    if (propertyName == "statMultipleAsJS") {
      return jsi::Function::createFromHostFunction(
        runtime,
        name,
        1,
        [this](jsi::Runtime& runtime, const jsi::Value&, const jsi::Value* a, size_t count) {
        return statMultipleAsJS(runtime, a, count);
      }
    );
    }
    return jsi::Value::undefined();
  }

  void installFileCoreHostObject(jsi::Runtime& runtime) {
    auto obj = std::make_shared<FileCoreHostObject>();
    auto host = jsi::Object::createFromHostObject(runtime, obj);
    runtime.global().setProperty(runtime, "__FileCoreHostObject", std::move(host));
  }
}