"use strict";

;(function (deps, factory) {
  "use strict";

  if (typeof define === "function" && define.amd) define(deps, factory);else if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = factory.apply(undefined, deps.map(function (e) {
    return require(e);
  }));else window["testbook"] = factory.apply(undefined, deps.map(function (e) {
    return window[e];
  }));
})(["chai", "utils", "Chapter"], function (chai, utils, Chapter) {

  var assert = chai.assert;
  var equal = assert.equal;

  return {
    equalBook: function equalBook(bsid, book, b) {
      assert.isObject(b);
      assert.isNotNull(b);
      equal(true, !!b);

      var exclude = ['chapters', 'introduce', 'lastestChapter', 'cover', 'catalogLink'];
      for (var key in book) {
        if (exclude.indexOf(key) >= 0) continue;
        if (key in b) equal(book[key], b[key], book.name + "." + key);else if ('sources' in b && key in b.sources[bsid]) equal(book[key], b.sources[bsid][key], book.name + "." + key);
      }

      if ("introduce" in book && "introduce" in b) equal(true, b.introduce.length > 0 && b.introduce.indexOf(book.introduce) >= 0, book.name + ".introduce");

      if ("lastestChapter" in book && "sources" in b && "lastestChapter" in b.sources[bsid]) equal(true, b.sources[bsid].lastestChapter.length > 0, book.name + ".lastestChapter");
      if ("cover" in book && "cover" in b) equal(true, !!b.cover.match(/^http/), book.name + ".cover");
    },
    testSearchCaller: function testSearchCaller(bsid, bsm, books) {
      var _this = this;

      return Promise.all(books.map(function (book) {
        return bsm.searchBook(bsid, book.name).then(function (bs) {
          var b = bs[0];
          _this.equalBook(bsid, book, b);
        });
      }));
    },
    testGetBookCaller: function testGetBookCaller(bsid, bsm, books) {
      var _this2 = this;

      return Promise.all(books.map(function (book) {
        return bsm.getBook(bsid, book.name, book.author).then(function (b) {
          _this2.equalBook(bsid, book, b);
        });
      }));
    },
    testGetBookInfoCaller: function testGetBookInfoCaller(bsid, bsm, books) {
      var _this3 = this;

      return Promise.all(books.map(function (book) {
        return bsm.getBookInfo(bsid, book).then(function (b) {
          _this3.equalBook(bsid, book, b);
        });
      }));
    },
    testGetLastestChapterCaller: function testGetLastestChapterCaller(bsid, bsm, books) {
      return Promise.all(books.map(function (book) {
        return bsm.getLastestChapter(bsid, book).then(function (lc) {
          equal(true, !!lc, book.name + ": LastestChapter is null");
        });
      }));
    },
    testGetBookCatalogCaller: function testGetBookCatalogCaller(bsid, bsm, books) {
      return Promise.all(books.map(function (book) {
        return bsm.getBookCatalog(bsid, book).then(function (catalog) {
          assert.isArray(catalog, book.name + ": catalog is not array");
          equal(true, catalog.length > 0, book.name + ": catalog is empty");
          book.chapters.forEach(function (chapter) {
            var c = catalog.find(function (e) {
              return Chapter.equalTitle(e, chapter);
            });
            if (!c) throw new Error(book.name + ": can't find the chapter " + chapter.title + " in catalog");
            equal(chapter.link, c.link, book.name + ": " + chapter.title + " link should be " + c.link);
            equal(chapter.cid, c.cid, book.name + ": " + chapter.title);
          });
        });
      }));
    },
    testGetChapterContentCaller: function testGetChapterContentCaller(bsid, bsm, books) {
      var _this4 = this;

      return Promise.all(books.map(function (book) {
        return Promise.all(book.chapters.map(function (chapter) {
          return bsm.getChapterContent(bsid, Object.assign({}, book, chapter)).then(function (c) {
            equal(true, !!c, book.name + ": the content of " + chapter.title + " is empty");
            equal(true, c.indexOf(chapter.content) >= 0, book.name + ": " + chapter.title + " doesn't contains " + chapter.content);
            assert.notInclude(c, "<br");

            if (c.indexOf("<img") >= 0) {
              var imgMatch = c.match(/<img\b(?: *data-skip="(\d+)")?.*\bsrc="(.*?)"/i);
              return _this4.testImage(imgMatch[2], imgMatch[1] && Number.parseInt(imgMatch[1]), book.name + ": the image of " + chapter.title + " is error");
            }
          });
        }));
      }));
    },
    testImage: function testImage(imgUrl, skipHeadByteCount, errorInfo) {
      return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () {
          equal(true, true);resolve(true);
        };
        image.onerror = function () {
          equal(true, false, errorInfo);reject(false);
        };
        if (skipHeadByteCount != undefined) {
          utils.get(imgUrl, {}, "blob").then(function (blob) {
            var url = URL.createObjectURL(blob.slice(skipHeadByteCount));
            image.src = url;
          }).catch(image.onerror);
        } else image.src = imgUrl;
      });
    },
    testBook: function testBook(bsid, bsm, books, item) {
      var _this5 = this;

      var items = {
        search: {
          title: '测试搜索',
          caller: function caller() {
            return _this5.testSearchCaller(bsid, bsm, books);
          }
        },
        getbook: {
          title: '测试获取书籍',
          caller: function caller() {
            return _this5.testGetBookCaller(bsid, bsm, books);
          }
        },
        bookinfo: {
          title: '测试获取书籍信息',
          caller: function caller() {
            return _this5.testGetBookInfoCaller(bsid, bsm, books);
          }
        },
        lastestchapter: {
          title: '测试最新章节',
          caller: function caller() {
            return _this5.testGetLastestChapterCaller(bsid, bsm, books);
          }
        },
        catalog: {
          title: '测试书籍目录',
          caller: function caller() {
            return _this5.testGetBookCatalogCaller(bsid, bsm, books);
          }
        },
        chapter: {
          title: '测试获取章节',
          caller: function caller() {
            return _this5.testGetChapterContentCaller(bsid, bsm, books);
          }
        }
      };

      describe("BookSource Test: " + bsid, function () {
        if (!item) for (var k in items) {
          var i = items[k];
          it(i.title, i.caller);
        } else {
          var _i = items[item];
          it(_i.title, _i.caller);
        }
      });
    }
  };
});