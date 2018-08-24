/* eslint-env mocha */
/* eslint prefer-arrow-callback: "off" */

'use strict';

const assert = require('./util/assert');
const layout = require('../lib/blockchain/layout');

describe('layout', function () {
  it('should try to encode enormous height and throw an error', (done) => {
    let exception;
    try {
      layout.H.encode(100000000000000000000);
    } catch (e) {
      exception = e;
    }

    assert.typeOf(exception, 'error', 'Expected error to be thrown');
    done();
  });

  it('should try to encode tiny height and do not fail', (done) => {
    let exception;
    try {
      layout.H.encode(100);
    } catch (e) {
      exception = e;
    }

    assert.typeOf(exception, 'undefined', 'Expected error not to be thrown');
    done();
  });
});
