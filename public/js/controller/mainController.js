//define(['marker-model', 'marker-group-model'], function(Marker, MarkerGroup){

(function($){

    var MainController, MarkerClass, MarkerGroupClass;


    MainController = function(){

//        this.downloadGroups();
        this.groups = [];
        this.markers = [];
        this.googleMarkers = [];
        this.ungroupedMarkersParent = $('.ungrouped-markers').eq(0);
        this.ungroupedMarkerTemplate = this.ungroupedMarkersParent.find('.marker').eq(0);
        this.ungroupedMarkerTemplate.remove();
        this.groupTemplate = $('.panel-default').eq(0).detach().removeClass('hidden');
        this.templateParent = $('#accordion');
        this.groupItemParent = $('#marker-group-items');
        this.groupItemTemplate = $('.group-item').eq(0).detach();


        this.constructCroupIconSelect();
        this.downloadGroups();
        this.initializeMap();
        this.initializeEventsAndActions();
        this.downloadUngroupedMarkers();

    };

    MainController.prototype.constructCroupIconSelect = function(){
        var iconParent = $('.dropdown-menu').eq(0),
            iconTemplate = iconParent.find('li'),
            src = "http://maps.google.com/mapfiles/kml/pal2/icon",
            iconInsert;

        iconTemplate.remove();

        for(var i = 0; i <= 50; i++){

            iconInsert = iconTemplate.clone();
            iconInsert.find('a')[0].href = src + i + '.png';
            iconInsert.find('img')[0].src = src + i + '.png';
            iconParent.append(iconInsert);

        }

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
            .done(function(data) {
                that.groups = data;
                console.dir(that);

                that.renderGroups();
                that.renderMarkersInGroups();
            })
            .fail(function(err){
                console.dir(err);
            });

    };


    MainController.prototype.createReceivedGroups = function(groups){



    };


    MainController.prototype.downloadUngroupedMarkers = function(){
        var self = this;
        $.ajax({
            type: "GET",
            url: "/markers"
        })
            .done(function(data) {
                self.markers = data;
                for(var i = 0; i < self.markers.length; i++){
                    var myLatitudeLongitude = new google.maps.LatLng( self.markers[i].location.latitude, self.markers[i].location.longitude),
                        marker = new google.maps.Marker({
                            position: myLatitudeLongitude,
                            map: self.map,
                            title:self.markers[i].description
                        });
                    marker.groupId = self.markers[i].groupId;
                    marker.id = self.markers[i].id;
                    self.googleMarkers.push(marker);
                }
                console.dir(self);
                self.renderMarkers();
            })
            .fail(function(err){
                console.dir(err);
            });

    };

    MainController.prototype.updateGroup = function(id){
        var self = this;
        for(var i = 0; i < this.groups.length; i++){

            if(this.groups[i].id == id){
                var dataSend = {};
                dataSend.markers = this.groups[i].markers;
                dataSend.id = this.groups[i].id;
                dataSend.name = this.groups[i].name;

                $.ajax({
                    type: "PUT",
                    url: "/group/" + id,
                    data: dataSend
                })
                    .done(function(data) {
//                that.markers = data;
                        var groupElement;
                        console.dir(data);
//                        dataSend = data;
                        self.renderGroups();
//                        self.groups.push(newGroup);
//                        groupElement = self.groupTemplate.eq(0).clone();
//                        groupElement.find('.panel-title>a').attr({href :'#collapse' + (self.groups.length-1)}).html(newGroup.name);
//                        groupElement.find('.panel-collapse').attr({id: 'collapse' + (self.groups.length-1)});
//                        self.templateParent.append(groupElement);
                    })
                    .fail(function(err){
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
//        newGroup.markers = [];
        for(var i = 0; i < self.groups.length; i++){
            if(newGroup.name == self.groups[i].name){
                alert('Such group already exists! Change the name please' );
                return;
            }
        }
        newGroup.iconUrl = $('.marker-icon-image')[0].src;

        $.ajax({
            type: "POST",
            url: "/group",
            data: newGroup
        })
            .done(function(data) {
//                that.markers = data;
                var groupElement;
                console.dir(data);
                newGroup.id = data.id;
                newGroup.markers = data.markers;
                self.groups.push(newGroup);
                groupElement = self.groupTemplate.eq(0).clone();
                groupElement.find('.panel-title>a').attr({href :'#collapse' + (self.groups.length-1)}).html(newGroup.name);
                groupElement.find('.panel-title>img')[0].src = newGroup.iconUrl;
                groupElement.find('.panel-collapse').attr({id: 'collapse' + (self.groups.length-1)});
                groupElement[0].group = newGroup;
                self.templateParent.append(groupElement);
                self.renderGroups();
            })
            .fail(function(err){
                console.dir(err);
            });

    };

    MainController.prototype.removeGroup = function(id){
        var self = this;
        $.ajax({
            type: "DELETE",
            url: "/group/" + id
//            data: newGroup
        })
            .done(function(data) {
//                that.markers = data;
//                var groupElement;
                console.dir("Group " + id + "deleted");
                for(var i = 0; i < self.groups.length; i++){

                    if(self.groups[i].id == id){
                        var j = 0;
                        while(j < self.groups[i].googleMarkers.length){
                            self.groups[i].googleMarkers[j].setMap(null);
                            j++;
                        }
                        self.groups.splice(i, 1);
                        break;
                    }

                }
                self.renderGroups();

            })
            .fail(function(err){
                console.dir(err);
            });


    };

    MainController.prototype.removeGroupMarker = function(groupId, markerId){
        for(var i = 0; i < this.groups.length; i++){
            if(this.groups[i].id == groupId){

                for(var j = 0; j < this.groups[i].markers.length; j++){
                    if(this.groups[i].markers[j].id == markerId){
                        this.groups[i].markers.splice(j, 1);
                        this.groups[i].googleMarkers[j].setMap(null);
                        this.groups[i].googleMarkers.splice(j, 1);
                        this.renderGroups();
                        return;
                    }
                }

            }
        }
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

        $.ajax({
            type: "POST",
            url: "/marker",
            data: newMarker
        })
            .done(function(data) {
                newMarker = data;
                var myLatitudeLongitude,
                    marker;
                if(newMarker.groupId != 'none'){

                    for(var i = 0; i < self.groups.length; i++){
                        if(newMarker.groupId == self.groups[i].id){
                            if(!self.groups[i].markers){self.groups[i].markers = []}
                            if(!self.groups[i].googleMarkers){self.groups[i].googleMarkers = []}

                            self.groups[i].markers.push(newMarker);
//                            var pinColor = "00AA00";
//                            var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
//                                new google.maps.Size(21, 34),
//                                new google.maps.Point(0,0),
//                                new google.maps.Point(10, 34));
//                            var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
//                                new google.maps.Size(40, 37),
//                                new google.maps.Point(0, 0),
//                                new google.maps.Point(12, 35));

                            myLatitudeLongitude = new google.maps.LatLng( newMarker.location.latitude, newMarker.location.longitude);
                            marker = new google.maps.Marker({
                                    position: myLatitudeLongitude,
                                    map: self.map,
                                    title:newMarker.description,
                                    icon: self.groups[i].iconUrl
                                });
                            marker.groupId = newMarker.groupId;
                            marker.id = newMarker.id;
                            self.groups[i].googleMarkers.push(marker);

                            self.updateGroup(self.groups[i].id);
                            break;
                        }
                    }

                }
                else{
                    self.markers.push(newMarker);
                    self.renderMarkers();
                    myLatitudeLongitude = new google.maps.LatLng( newMarker.location.latitude, newMarker.location.longitude);
                    marker = new google.maps.Marker({
                            position: myLatitudeLongitude,
                            map: self.map,
                            title:newMarker.description
                        });
                    marker.groupId = newMarker.groupId;
                    marker.id = newMarker.id;
                    self.googleMarkers.push(marker);
                }
                console.dir(newMarker);
                console.dir(self.googleMarkers);

            })
            .fail(function(err){
                console.dir(err);
            });

    };

    MainController.prototype.renderGroups = function(){
        var groupElement,
            groupItemElement,
            markerTemplate,
            markerTemplateInsert,
            markerTemplateParent;

        this.templateParent.empty();
        this.groupItemParent.find('.group-item').remove();

        for(var i = 0; i < this.groups.length; i++){
//            console.dir(this.groups[i].markers);
            groupElement = this.groupTemplate.eq(0).clone();
            groupElement.find('.panel-title>a').attr({href :'#collapse' + i}).html(this.groups[i].name);
            groupElement.find('.group-name-icon')[0].src = this.groups[i].iconUrl;
            groupElement.find('.panel-collapse').attr({id: 'collapse' + i});
            groupElement[0].group = this.groups[i];

            markerTemplate = groupElement.find('.marker').eq(0);
            markerTemplate.remove();
            markerTemplateParent = groupElement.find('.panel-body').eq(0);

            for(var j = 0; j < this.groups[i].markers.length; j++){

                markerTemplateInsert = markerTemplate.clone();
                markerTemplateInsert.find('.description').html(this.groups[i].markers[j].description);
                markerTemplateInsert[0].marker = this.groups[i].markers[j];
                markerTemplateParent.append(markerTemplateInsert);
            }

            this.templateParent.append(groupElement);


            groupItemElement = this.groupItemTemplate.clone();
            groupItemElement[0].value = this.groups[i].id;
            groupItemElement.html(this.groups[i].name) ;
            this.groupItemParent.append(groupItemElement);

        }
        console.dir(this.groups);
        $('.collapse').collapse();
    };
    MainController.prototype.renderMarkersInGroups = function(){
        var myLatitudeLongitude,
            marker,
            self = this;
        for(var i = 0; i < self.groups.length; i++){

            if(!self.groups[i].googleMarkers){
                self.groups[i].googleMarkers = []
            }

            for(var j = 0; j < self.groups[i].markers.length; j++){

                myLatitudeLongitude = new google.maps.LatLng( self.groups[i].markers[j].location.latitude, self.groups[i].markers[j].location.longitude);
                marker = new google.maps.Marker({
                    position: myLatitudeLongitude,
                    map: self.map,
                    title:self.groups[i].markers[j].description,
                    icon: self.groups[i].iconUrl

                });
                marker.groupId = self.groups[i].markers[j].groupId;
                marker.id = self.groups[i].markers[j].id;
                self.groups[i].googleMarkers.push(marker);

            }

        }

    };


    MainController.prototype.renderMarkers = function(){

        this.ungroupedMarkersParent.empty();

        var insertionTemplate;

        for(var i = 0; i < this.markers.length; i++){

            insertionTemplate = this.ungroupedMarkerTemplate.clone();
            insertionTemplate.find('.description').html(this.markers[i].description);
            insertionTemplate[0].marker = this.markers[i];
            this.ungroupedMarkersParent.append(insertionTemplate);

        }



    };

    MainController.prototype.initializeEventsAndActions = function(){

        var self = this,
            markerGroups = $('#marker-groups'),
            ungroupedMarkers = $('.ungrouped-markers');

        $('#save-group').on('click', function(){
            $(this).closest('.slide').addClass('hidden');
            self.saveGroup();
        });

        $('#save-marker').on('click', function(){
            $(this).closest('.slide').addClass('hidden');
            self.saveMarker();
        });

        markerGroups.on('click', '.remove-group', function(){
            self.removeGroup($(this).closest('.panel-default')[0].group.id);

        });
        markerGroups.on('click', '.remove-group-marker', function(){
            self.removeGroupMarker($(this).closest('.marker')[0].marker.groupId,$(this).closest('.marker')[0].marker.id);
        });
        markerGroups.on('click', '.panel-heading', function(){
            $(this.parentNode).find('.panel-collapse').removeClass('hidden');

        });
        markerGroups.on('click', '.animate-group-marker', function(){

            console.dir($(this).closest('.panel-body').find('.animate-group-marker').index($(this)));
            var group = $(this).closest('.panel')[0].group,
                markerIndex = $(this).closest('.panel-body').find('.animate-group-marker').index($(this));
//            var markerId = group.markers[markerIndex].id;
            toggleBounce(group.googleMarkers[markerIndex]);
            console.dir(group);

        });
        ungroupedMarkers.on('click', '.animate-group-marker', function(){

            console.dir($(this).closest('.ungrouped-markers').find('.animate-group-marker').index($(this)));
            var markerIndex = $(this).closest('.ungrouped-markers').find('.animate-group-marker').index($(this));
            console.dir(self);
            toggleBounce(self.googleMarkers[markerIndex]);

        });

        $('.manage-markers-menu').on('click', function(){
            if(this.shown){

                $(this).css({
                    left:'5px'
                });

                $('.options').css({
                    left : '-350px'
                });
                $('.map-container').css({
                        left: '0px'
                    }

                );
                this.shown = false;
            }
            else{

                $(this).css({
                    left:'355px'
                });
                $('.options').css({
                    left : 0
                });
                $('.map-container').css({
                        left: '350px'
                    }

                );

                this.shown = true
            }
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

        $('form').on('submit', function(event){
            event.preventDefault();
        });

        $('.dropdown-menu').on('click', 'a', function(event){
            event.preventDefault();

//            $('.marker-icon-text').html($(this).html());
            $('img.marker-icon-image')[0].src = this.href;
        });
        function toggleBounce(marker) {

            if (marker.getAnimation() != null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }
    };
    var mainController = new MainController();

})(jQuery);













//TODO


function doNothingasdgfertgfdger(){}