(function($){


    $('#form').on('submit', function(event){
        event.preventDefault();

        var data = new FormData();

        var file = $('#file').get(0).files[0];
        data.append('file0', file);
        $.ajax({
            type: 'POST',
            url: '/file',
            data: data,
            cache: false,
            contentType: false,
            processData: false
        })
            .done(function(data){
                console.dir(data);
            $('#image').get(0).src = data.src;
        })
            .fail(function(err){
            console.dir(err.responseText);
        });

        console.dir(this);
        console.dir($(this));
    });



})(jQuery);
