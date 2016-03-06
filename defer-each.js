(function (context) {
/*jscs:disable validateIndentation*//*jscs:enable validateIndentation*/
// -----------------------------------------------------------------------------

'use strict';

var id = 'defer-each';
var dependencies = ['defer', 'is', 'promise'];

function factory(defer, is, Promise) {
  /**
   * Visits at most one item in `list` per event loop, executes `callback()`,
   * and waits for any returned promise to settle before continuing to the next
   * item. Use this to wait for async code (for example, so that test setup,
   * verification, and teardown are determinate) or to process many items
   * without blocking the event loop (for example, so that display updates and
   * event dispatches remain responsive).
   *
   * `callback()` is invoked with three arguments:
   *
   *     * the item value
   *     * the item index
   *     * the array being traversed
   *
   * If `self` is specified, then `callback()` will be invoked with `self` as
   * its `this` value.
   *
   * If `callback()` returns a promise, the next item in `list` won’t be
   * processed until the promise fulfills. If `callback()` throws an error or if
   * a promise returned by `callback()` rejects, the `deferEach()` promise
   * immediately rejects with the thrown exception or rejection reason.
   *
   * @param {Array.<*>} list - The array to traverse.
   * @param {function(*, number, Array.<*>)} callback - The function to execute
   *     for each item in `list`.
   * @param {Object=} [self] - The object to use as the `this` value when
   *     invoking `callback()`.
   *
   * @return {Promise} A promise that resolves when all of the items in `list`
   *     have been traversed, or rejects with the first thrown exception or
   *     rejection reason.
   *
   * @see [Array.prototype.forEach()](https://goo.gl/COenfS)
   */
  return function deferEach(list, callback, self) {
    var index = -1;
    var limit = list.length;

    return new Promise(function (resolve, reject) {
      (function next() {
        if (++index === limit) {
          resolve();
        }

        if (index in list) {
          var item = list[index];
          var returned;

          try {
            returned = callback.call(self, item, index, list);
          } catch (e) {
            return reject(e);
          }

          if (is.thenable(returned)) {
            returned.then(function () {
              next();
            }, function (reason) {
              reject(reason);
            });
          } else {
            defer(function () {
              next();
            });
          }
        } else {
          // Skip sparse elements.
          next();
        }
      }());
    });
  };
}

// -----------------------------------------------------------------------------
var x = dependencies.length; var o = 'object';
context = typeof global === o ? global : typeof window === o ? window : context;
if (typeof define === 'function' && define.amd) {
  define(dependencies, function () {
    return factory.apply(context, [].slice.call(arguments));
  });
} else if (typeof module === o && module.exports) {
  for (; x--;) {dependencies[x] = require(dependencies[x]);}
  module.exports = factory.apply(context, dependencies);
} else {
  for (; x--;) {dependencies[x] = context[dependencies[x]];}
  var r = /([^-_\s])[-_\s]+([^-_\s])/g;
  function s(m, a, b) { return a + b.toUpperCase(); }
  context[id.replace(r, s)] = factory.apply(context, dependencies);
}
}(this));
