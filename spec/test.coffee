proxyquire = (require 'proxyquire').noPreserveCache()
stubs = {}
stubs['@global'] = true

proxyquire './test-Period', stubs
proxyquire './test-Instant', stubs
proxyquire './test-countdown', stubs