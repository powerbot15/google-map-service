//define(['marker-model', 'marker-group-model'], function(Marker, MarkerGroup){

(function($){

    var MainController = function(){

//        this.downloadGroups();
        this.groups = [];
        this.markers = [];
        this.googleMarkers = [];
        this.markerTemplate = {};
        this.groupTemplate = $('.panel-default').eq(0).detach().removeClass('hidden');
        this.templateParent = $('#accordion');
        this.groupItemParent = $('#marker-group-items');
        this.groupItemTemplate = $('.group-item').eq(0).detach();
        this.downloadGroups();
        this.initializeMap();

        this.initializeEventsAndActions();

//        this.downloadUngroupedMarkers();

    };


    MainController.prototype.initializeMap = function(){

        var mapOptions = {
            center: new google.maps.LatLng(49.4333300, 32.0666700),
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        this.map = new google.maps.Map($('.map-container')[0], mapOptions);

        google.maps.event.addListener(this.map, 'click', function(event) {
            $('#marker-latitude')[0].value = event.latLng.k;
            $('#marker-longitude')[0].value = event.latLng.A;
        });

    };


    MainController.prototype.downloadGroups = function(){
        var that = this;
        $.ajax({
            type: "GET",
            url: "/groups"
        })
            .success(function(data) {
                that.groups = data;
                console.dir(that);

                that.renderGroups();
            })
            .error(function(err){
                console.dir(err);
            });

    };


    MainController.prototype.createReceivedGroups = function(groups){



    };


    MainController.prototype.downloadUngroupedMarkers = function(){
        var that = this;
        $.ajax({
            type: "GET",
            url: "/markers"
        })
            .success(function(data) {
                that.markers = data;
                console.dir(that);
            })
            .error(function(err){
                console.dir(err);
            });

    };

    MainController.prototype.updateGroup = function(id){
        var self = this;
        for(var i = 0; i < this.groups.length; i++){
            var dataSend;
            if(this.groups[i].id == id){
                dataSend = this.groups[i];
                $.ajax({
                    type: "PUT",
                    url: "/group/" + id,
                    data: dataSend
                })
                    .success(function(data) {
//                that.markers = data;
                        var groupElement;
                        console.dir(data);
                        dataSend = data;
//                        self.groups.push(newGroup);
//                        groupElement = self.groupTemplate.eq(0).clone();
//                        groupElement.find('.panel-title>a').attr({href :'#collapse' + (self.groups.length-1)}).html(newGroup.name);
//                        groupElement.find('.panel-collapse').attr({id: 'collapse' + (self.groups.length-1)});
//                        self.templateParent.append(groupElement);
                    })
                    .error(function(err){
                        console.dir(err);
                    });


            }

        }

    };
    MainController.prototype.saveGroup = function(){
        var newGroup = {},
            self = this;
        newGroup.name = $('#group-name')[0].value;
        newGroup.id = 0;
        newGroup.markers = [];
        for(var i = 0; i < self.groups.length; i++){

        }
        $.ajax({
            type: "POST",
            url: "/group",
            data: newGroup
        })
            .success(function(data) {
//                that.markers = data;
                var groupElement;
                console.dir(data);
                newGroup.id = data.id;
                self.groups.push(newGroup);
                groupElement = self.groupTemplate.eq(0).clone();
                groupElement.find('.panel-title>a').attr({href :'#collapse' + (self.groups.length-1)}).html(newGroup.name);
                groupElement.find('.panel-collapse').attr({id: 'collapse' + (self.groups.length-1)});
                self.templateParent.append(groupElement);
            })
            .error(function(err){
                console.dir(err);
            });

    };

    MainController.prototype.saveMarker = function(){

        var newMarker = {
                location:{
                    latitude:0,
                    longitude:0
                }
            },
            self = this,
            groupItemsSelect = $('#marker-group-items')[0];

        newMarker.description = $('#marker-description')[0].value;
        newMarker.location.latitude = $('#marker-latitude')[0].value;
        newMarker.location.longitude = $('#marker-longitude')[0].value;
        newMarker.groupId = groupItemsSelect.options[groupItemsSelect.selectedIndex].value;


        if(newMarker.groupId != 'cloneable'){

            for(var i = 0; i < self.groups.length; i++){
                if(newMarker.groupId == self.groups[i].id){
                    if(!self.groups[i].markers){self.groups[i].markers = []}
                    self.groups[i].markers.push(newMarker);
                    self.updateGroup(self.groups[i].id);
                    break;
                }
            }

        }
        console.dir(newMarker);
        var myLatitudeLongitude = new google.maps.LatLng( newMarker.location.latitude, newMarker.location.longitude),
            marker = new google.maps.Marker({
                position: myLatitudeLongitude,
                map: self.map,
                title:newMarker.description
            });
        marker.groupId = newMarker.groupId;
        self.googleMarkers.push(marker);
        console.dir(self.googleMarkers);

    };

    MainController.prototype.renderGroups = function(){
        var groupElement,
            groupItemElement;
        for(var i = 0; i < this.groups.length; i++){
            groupElement = this.groupTemplate.eq(0).clone();
            groupElement.find('.panel-title>a').attr({href :'#collapse' + i}).html(this.groups[i].name);
            groupElement.find('.panel-collapse').attr({id: 'collapse' + i});
            groupElement[0].group = this.groups[i];
            this.templateParent.append(groupElement);

            groupItemElement = this.groupItemTemplate.clone();
            groupItemElement[0].value = this.groups[i].id;
            groupItemElement.html(this.groups[i].name) ;
            this.groupItemParent.append(groupItemElement);

        }
        console.dir(this.groups);
        $('.collapse').collapse();
    };

    MainController.prototype.initializeEventsAndActions = function(){
        var self = this;

        $('#save-group').on('click', function(){
            self.saveGroup();
        });

        $('#save-marker').on('click', function(){
            self.saveMarker();
        });

        $('.btn-slide').on('click', function(event){
            var slideContent = $(this).parent().find('.slide');
            if(slideContent.hasClass('hidden')){
                slideContent.removeClass('hidden')
            }
            else{
                slideContent.addClass('hidden')
            }
        });


//        $('.collapse').collapse();

    };
    var mainController = new MainController();

//    var marker = new Marker;
//    marker.set({description : 'sdds'});
//    marker.set(
//        {
//            location: {
//                longitude : 122,
//                latitude : 22
//            }
//        });
//
//    console.dir(marker);
//    marker.save();
//    console.dir(marker);
//    $('.active-edit').css('active-edit');


//});


})(jQuery);

