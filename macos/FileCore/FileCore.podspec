Pod::Spec.new do |s|
  s.name         = 'FileCore'
  s.version      = '0.1.0'
  s.summary      = 'FileCore JSI host object for macOS'
  s.homepage     = 'https://example.local/FileCore'
  s.license      = { :type => 'MIT' }
  s.author       = { 'you' => 'you@example.local' }
  s.source       = { :git => 'https://example.local/FileCore.git', :tag => s.version.to_s }

  s.platform     = :osx, '11.0'
  s.requires_arc = true

  s.source_files = 'FileCore/*.{mm,m,cpp,h,hpp}'

  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
    'CLANG_CXX_LIBRARY' => 'libc++',
  }

  s.dependency 'React-Core'
  s.dependency 'React-jsi'
end
