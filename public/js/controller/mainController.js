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
                that.renderMarkersInGroups();
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
                        self.renderGroups();
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
            if(newGroup.name == self.groups[i].name){
                alert('Such group already exists! Change the name please' );
                return;
            }
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
                groupElement[0].group = newGroup;
                self.templateParent.append(groupElement);
                self.renderGroups();
            })
            .error(function(err){
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
            .success(function(data) {
//                that.markers = data;
//                var groupElement;
                console.dir("Group " + id + "deleted");
                for(var i = 0; i < self.groups.length; i++){

                    if(self.groups[i].id == id){
                        var j = 0;
                        while(j < self.googleMarkers.length){
                            for(var k = 0; k < self.groups[i].markers.length; k++){
                                if(self.googleMarkers[j].groupId == self.groups[i].markers[k].groupId){
                                    self.googleMarkers[j].setMap(null);
                                    self.googleMarkers.splice(j, 1);
                                    j--;
                                    break;
                                }
                            }
                            j++;
                        }
                        self.groups.splice(i, 1);
                        break;
                    }

                }
                self.renderGroups();

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

        $.ajax({
            type: "POST",
            url: "/marker",
            data: newMarker
        })
            .success(function(data) {
                newMarker = data;
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
                marker.id = newMarker.id;
                self.googleMarkers.push(marker);
                console.dir(self.googleMarkers);

            })
            .error(function(err){
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
            groupElement.find('.panel-collapse').attr({id: 'collapse' + i});
            groupElement[0].group = this.groups[i];

            markerTemplate = groupElement.find('.marker').eq(0);
            markerTemplate.remove();
            markerTemplateParent = groupElement.find('.panel-body').eq(0);

            for(var j = 0; j < this.groups[i].markers.length; j++){

                markerTemplateInsert = markerTemplate.clone();
                markerTemplateInsert.find('.description').html(this.groups[i].markers[j].description).marker = this.groups[i].markers[j];
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

            for(var j = 0; j < self.groups[i].markers.length; j++){

                myLatitudeLongitude = new google.maps.LatLng( self.groups[i].markers[j].location.latitude, self.groups[i].markers[j].location.longitude);
                marker = new google.maps.Marker({
                    position: myLatitudeLongitude,
                    map: self.map,
                    title:self.groups[i].markers[j].description
                });
                marker.groupId = self.groups[i].markers[j].groupId;
                marker.id = self.groups[i].markers[j].id;
                self.googleMarkers.push(marker);

            }

        }

    };

    MainController.prototype.initializeEventsAndActions = function(){
        var self = this;

        $('#save-group').on('click', function(){
            self.saveGroup();
        });

        $('#save-marker').on('click', function(){
            self.saveMarker();
        });

        $('#marker-groups').on('click', '.remove-group', function(){
            self.removeGroup($(this).closest('.panel-default')[0].group.id);

        });
        $('#marker-groups').on('click', '.panel-heading', function(){
            $(this.parentNode).find('.panel-collapse').removeClass('hidden');

        });
        $('#marker-groups').on('click', '.animate-group-marker', function(){
//            $(this.parentNode).find('.panel-collapse').removeClass('hidden');
            console.dir($(this).closest('.panel-body').find('.animate-group-marker').index($(this)));
            var group = $(this).closest('.panel')[0].group,
                markerIndex = $(this).closest('.panel-body').find('.animate-group-marker').index($(this));
            var markerId = group.markers[markerIndex].id;
            for(var i = 0; i < self.googleMarkers.length; i++){
                if(self.googleMarkers[i].id == markerId){
                    toggleBounce(self.googleMarkers[i]);
                    break;
                }
            }
            console.dir(group);


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

