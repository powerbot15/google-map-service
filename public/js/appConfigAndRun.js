requirejs.config({



    "paths" : {
        "jquery": "lib/jquery/dist/jquery",
        "underscore": "lib/underscore/underscore",
        "backbone": "lib/backbone/backbone",
        "controller" : "controller/mainController",
        "marker-model" : "models/marker",
        "marker-group-model" : "models/markerGroup"
    },

    "shim": {
        'jquery': {
            exports: '$'
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        }

    }

});

requirejs(['controller']);