$(document).ready(function () {
    $(document).on("click", ".scrape", scrapeArticle);

    $(".clear").on("click", clearArticle);

    $(".pt-6").one("click", ".addComment", function () {
        var element = $(this).closest("div").find(".text")
        element.prepend('<textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea> <button type="submit" id="submit" class="btn btn-primary">Submit Comment</button>')
        var artclId = $(this).data("id")
        console.log(artclId)
        $(document).on("click", "#submit", function () {
            var text = $('#exampleFormControlTextarea1').val();
            empty(text)
            var topost = {
                articleID: artclId,
                note: text
            };
            console.log(topost)
            $('#exampleFormControlTextarea1').val("")
            $.ajax("/newcomment", {
                type: "POST",
                data: topost
            }).then(function () {
                location.reload()
            })
        })
    });

    $(".wiewComment").one("click", function() {
        var artclId = $(this).data("id")
        var thisComment = $(this)
        console.log(artclId)
        $.ajax({
            method: "GET",
            url: "/comment/" + artclId
          })
            // With that done, add the note information to the page
            .then(function(data) {
                console.log(data)
                var element = thisComment.closest("div").find(".text")
                $.each(data, function(i ,v){
                    // console.log("index is " + (i+1))
                    // console.log("value is "+ v.note) 
                    element.append('<div class="alert alert-warning alert-dismissible fade show" role="alert"><strong>'+(i+1)+'. </strong>'+v.note+'<button class="close" data-commentId="'+v._id+'">DELETE</button></div>')
                })
                $(document).on("click", ".close", function(){
                    var commentId = $(this).attr("data-commentId");
                    var b = $(this)
                    console.log(commentId)
                    $.ajax({
                    method: "POST",
                    url: "/deleteComment/"+commentId
                }).then(function(){
                    b.parent(".alert-dismissible ").remove()
                    // location.reload()
                })
                })
                
               
            })
        // $.get("/comment/" + artclId, function (req, res) {
        //     location.reload()
        // })
    })

    function empty(text) {
        if (text == "") {
            alert("Enter text");
            return false
        }
    }
    // $(this).append('<textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>').append('<button type="submit" class="btn btn-primary">Submit</button>')

    function scrapeArticle() {
        $.get('/scrape', function (data) {
            console.log(data.addedArticles)
            location.reload();
        })
    }

    function clearArticle() {
        $.get('/clear', function () {
            location.reload();
        })
    }
    $(".save").on("click", function () {
        var idArticle = $(this).data("id")
        var id = {
            id: idArticle
        }
        $.ajax("/saved", {
            type: "POST",
            data: id
        }).then(function () {
            alert("You saved article id: " + idArticle)
            // location.replace("/saved")
            location.reload()
        })

    })
    $(".delete").on("click", function () {
        var idArticle = $(this).data("id")
        var id = {
            id: idArticle
        }
        $.ajax("/delete", {
            type: "POST",
            data: id
        }).then(function () {
            alert("You deleted article id: " + idArticle)
            location.reload()
        })
    })
})