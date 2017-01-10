"use strict"
define(["jquery", "main", "page", "util"], function($, app, page, util){

    function fail(error){
        util.showError(error.message);
    }

    // 加载书籍详情
    function loadBookDetail(id, book, bookSourceId){
        var nb = $(id);
        if(book.cover)
            nb.find(".book-cover").attr("src", book.cover);
        nb.find(".book-name").text(book.name);
        // nb.find(".book-lastestchapter").text("最新章节：" + (book.getLastestChapter()? book.getLastestChapter() : "无"));
        nb.find(".book-author").text(book.author);
        nb.find(".book-catagory").text(book.catagory);
        nb.find(".book-complete").text(book.complete);
        nb.find(".book-introduce").text(book.introduce);

        nb.find(".btnRead").click(function(){
            debugger;
            var params = {
                bookSourceId: bookSourceId,
                book: book
            };
            page.showPage("readbook", params);
        });

        if(app.bookShelf.hasBook(book)){
            nb.find(".btnAddToBookshelf").hide();
        }
        else{
            nb.find(".btnAddToBookshelf").click(function(){
                app.bookShelf.addBook(book, function(){
                    util.showMessage("添加成功！");
                });
            });
        }
    };

    // 加载章节列表
    function loadBookChapters(id, book, bookSourceId){

        var bookChapter = $(id);
        var c = $(".template .book-chapter");
        bookChapter.empty();
        book.getCatalog(loadBookChaptersToView, fail, {
                                                    bookSourceManager: app.bookSourceManager,
                                                    bookSourceId: bookSourceId
                                                });
        function loadBookChaptersToView(catalog){
            $(catalog).each(function(){
                var nc = c.clone();
                nc.text(this.title);
                var self = this;
                nc.click(function(){
                    // TODO: 打开阅读页面
                });
                bookChapter.append(nc);
            });
        }
    };

    function loadView(){

        loadBookDetail(".book", params.book, params.bookSourceId);
        loadBookChapters(".book-chapters", params.book, params.bookSourceId);
    }

    return {
        onload: function(params, p){
            loadView();
        },
        onresume: function(){

        },
        onpause: function(){

        },
        onclose: function(params){

        }
    };
});
