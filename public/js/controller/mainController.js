//define(['marker-model', 'marker-group-model'], function(Marker, MarkerGroup){

(function($){

    var MainController = function(){

//        this.downloadGroups();
        this.groups = [];
        this.markers = [];
        this.googleMarkers = [];
        this.ungroupedMarkersParent = $('.ungrouped-markers').eq(0);
        this.ungroupedMarkerTemplate = this.ungroupedMarkersParent.find('.marker').eq(0);

        this.ungroupedMarkerTemplate.remove();
        this.groupTemplate = $('.panel-default').eq(0).detach().removeClass('hidden');
        this.groupedMarkerTemplate = this.groupTemplate.find('.marker').eq(0).clone();
        this.templateParent = $('#accordion');
        this.groupItemParent = $('#marker-group-items');
        this.groupItemTemplate = $('.group-item').eq(0).detach();
        this.activeHulls = [];
        this.hullPalette = ['#c925ff', '#4267e9', '#01c9e2','#8c0000', '#777873', '#fec619', '#ff7f00', '#222222', '#ff4d4d', '#59b200', '#c925ff', '#4267e9', '#01c9e2','#8c0000', '#777873', '#fec619', '#ff7f00', '#222222', '#ff4d4d', '#59b200'];
        console.dir(this.activeHulls);


        this.initializeMap();
        this.constructGroupIconSelect();
        this.downloadGroups();

        this.initializeEventsAndActions();
//        this.renderUngroupedMarkers();

    };

    MainController.prototype.constructGroupIconSelect = function(){
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
            if($('.active-marker-form').length > 0){
                $('.active-marker-form .marker-latitude')[0].value = event.latLng.k;
                $('.active-marker-form .marker-longitude')[0].value = event.latLng.A;
            }
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
                that.getMarkers();
            })
            .fail(function(err){
                console.dir(err);
            });

    };

    MainController.prototype.getMarkers = function(){

        var that = this;
        $.ajax({
            type: "GET",
            url: "/markers"
        })
            .done(function(data) {
                var receivedMarkers = data;
                //initialize markers
                for(var k = 0; k < that.groups.length; k++){
                    that.groups[k].markers = [];
                    that.groups[k].googleMarkers = [];
                    that.groups[k].hull = [];
                }
                //
                for(var i = 0; i < receivedMarkers.length; i++){
                    if(receivedMarkers[i].groupId == 'none'){
                        that.markers.push(receivedMarkers[i]);
                        continue;
                    }
                    for(var j = 0; j < that.groups.length; j++){
                        if(that.groups[j].id == receivedMarkers[i].groupId){
                            that.groups[j].markers.push(receivedMarkers[i]);
                            break;
                        }
                    }
                }
                for( j = 0; j < that.groups.length; j++){
                    that.createPolygon(that.groups[j]);
                    that.activeHulls[j] = false;
                }
                that.renderGroups();
                that.renderMarkersInGroups();
                that.renderUngroupedMarkers();

            })
            .fail(function(err){
                console.dir(err);
            });



    };

    MainController.prototype.renderUngroupedMarkers = function(){
        var self = this;
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
                        console.dir(data);
                        self.renderGroups();
                    })
                    .fail(function(err){
                        console.dir(err);
                    });


            }

        }

    };

    MainController.prototype.saveGroup = function(){
        var newGroup = {},
            self = this,
            groupNameInput = $('#group-name');
        groupNameInput.parent().removeClass('has-error');
        newGroup.name = groupNameInput.get(0).value;
        if(!newGroup.name){
            groupNameInput.parent().addClass('has-error');
            alert('Input group name!');
            return;
        }
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
                newGroup.markers = [];
                self.groups.push(newGroup);
                groupElement = self.groupTemplate.eq(0).clone();
                groupElement.find('.panel-title>span').eq(0).html(newGroup.name);
                groupElement.find('.panel-title>a').attr({href :'#collapse' + (self.groups.length-1)});
                groupElement.find('.panel-title>img')[0].src = newGroup.iconUrl;
                groupElement.find('.panel-collapse').attr({id: 'collapse' + (self.groups.length-1)});
                groupElement[0].group = newGroup;
                groupElement[0].groupIndex = self.groups.length - 1;
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
                        if(self.groups[i].googleMarkers){
                            while(j < self.groups[i].googleMarkers.length){
                                self.groups[i].googleMarkers[j].setMap(null);
                                j++;
                            }
                        }
                        if(self.groups[i].groupMapHull){
                            self.groups[i].groupMapHull.setMap(null);
                        }

                        self.groups.splice(i, 1);
                        delete self.activeHulls[i];
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
        this.removeMarker(markerId);
        for(var i = 0; i < this.groups.length; i++){
            if(this.groups[i].id == groupId){

                for(var j = 0; j < this.groups[i].markers.length; j++){
                    if(this.groups[i].markers[j].id == markerId){
                        this.groups[i].markers.splice(j, 1);
                        this.groups[i].googleMarkers[j].setMap(null);
                        this.groups[i].googleMarkers.splice(j, 1);
//                        this.renderGroups();
                        this.createPolygon(this.groups[i]);
                        return;
                    }
                }

            }
        }

    };

    MainController.prototype.removeMarker = function(markerId){
        $.ajax({
            type:'DELETE',
            url:'/marker/' + markerId
        }).done(function(data){});
    };

    MainController.prototype.saveMarker = function(marker, markerContainer){

        var newMarker = marker,
            self = this;


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

//                            self.updateGroup(self.groups[i].id);
                            self.createPolygon(self.groups[i]);
                            self.renderMarkersInGroup(markerContainer, i);
//                            self.renderGroups();

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
            groupElement.find('.panel-title>span').eq(0).html(this.groups[i].name);
            groupElement.find('.panel-title>a').attr({href :'#collapse' + i});

//            groupElement.find('.panel-title>a').attr({href :'#collapse' + i}).html(this.groups[i].name);
            groupElement.find('.group-name-icon')[0].src = this.groups[i].iconUrl;
            groupElement.find('.panel-collapse').attr({id: 'collapse' + i});
            groupElement[0].group = this.groups[i];
            groupElement[0].groupIndex = i;

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

    MainController.prototype.renderMarkersInGroup = function(container, groupIndex){
        var markerTemplate, markerTemplateParent, markerTemplateInsert;
        markerTemplate = this.groupedMarkerTemplate;
//        markerTemplate.remove();
        markerTemplateParent = container;
        markerTemplateParent.empty();

        for(var j = 0; j < this.groups[groupIndex].markers.length; j++){

            markerTemplateInsert = markerTemplate.clone();
            markerTemplateInsert.find('.description').html(this.groups[groupIndex].markers[j].description);
            markerTemplateInsert[0].marker = this.groups[groupIndex].markers[j];
            markerTemplateParent.append(markerTemplateInsert);
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

    MainController.prototype.createPolygon = function(group){

        if(group.markers.length <= 2){
            console.log('Not enough markers to create polygon. At least three required');
            return;
        }


        var coords = [],
            hull = [],
            countPoints = 0;
        for(var i = 0; i < group.markers.length; i++){

            coords.push(new google.maps.LatLng(group.markers[i].location.latitude, group.markers[i].location.longitude))

        }

        coords.sort(sortPointY);
        coords.sort(sortPointX);

        countPoints = chainHull_2D(coords, coords.length, hull);
        group.hull = [];
        for(var i = 0; i < hull.length; i++){
            group.hull.push(hull[i]);
        }

    };

    MainController.prototype.showCommonMarkers = function(){
        var gatheredMarkers = [],

            googleMarkers = [],
            activeHulls = [];

        for(var groupIndex = 0; groupIndex < this.activeHulls.length; groupIndex++){
            if(this.activeHulls[groupIndex]){
                for( var i = 0; i < this.groups[groupIndex].googleMarkers.length; i++){
                    gatheredMarkers.push(this.groups[groupIndex].markers[i]);
                    googleMarkers.push(this.groups[groupIndex].googleMarkers[i]);
//                    gatheredMarkers.push(this.groups[groupIndex].googleMarkers[i]);
                }
                activeHulls.push(this.groups[groupIndex].groupMapHull);
            }
        }
        for(var i = 0; i < googleMarkers.length; i++){
            googleMarkers[i].setVisible(false);
        }

        for(var i = 0; i < gatheredMarkers.length; i++){
            var show = true;
            for(var j = 0; j < activeHulls.length; j++){
                if(!google.maps.geometry.poly.containsLocation(new google.maps.LatLng(gatheredMarkers[i].location.latitude, gatheredMarkers[i].location.longitude), activeHulls[j])){
                    show = false;
                    break;
                }
            }
            if(show){
                googleMarkers[i].setVisible(true);
            }

        }


    };

    MainController.prototype.initializeEventsAndActions = function(){

        var self = this,
            markerGroups = $('#marker-groups'),
            optionsBlock = $('.options'),
            ungroupedMarkers = $('.ungrouped-markers');

        $('#save-group').on('click', function(){
//            $(this).closest('.slide').addClass('hidden');
            self.saveGroup();
        });



//        $('#save-marker').on('click', function(){
//            var newMarker = {
//                description:'',
//                location: {},
//                groupId : 0
//            },
//                groupItemsSelect = $('#marker-group-items')[0];
//            newMarker.description = $('#marker-description')[0].value;
//            newMarker.location.latitude = $('#marker-latitude')[0].value;
//            newMarker.location.longitude = $('#marker-longitude')[0].value;
//            newMarker.groupId = groupItemsSelect.options[groupItemsSelect.selectedIndex].value;
//            $(this).closest('.slide').addClass('hidden');
//            self.saveMarker(newMarker);
//        });

        optionsBlock.on('click', '.save-marker', function(){
            var newMarker = {
                description:'',
                location: {},
                groupId : 0
            },
                eventTarget = $(this),
                markerForm = $('.active-marker-form'),
                idContainer = eventTarget.closest('.panel-default'),
                groupItemsSelect = markerForm.find('#marker-group-items'),
                markerContainer = idContainer.find('.panel-body').eq(0);


            markerForm.find('.marker-description').parent().removeClass('has-error');
            markerForm.find('.marker-latitude').parent().removeClass('has-error');
            markerForm.find('.marker-longitude').parent().removeClass('has-error');



            newMarker.description = markerForm.find('.marker-description')[0].value;

            if(!newMarker.description){
                markerForm.find('.marker-description').parent().addClass('has-error');
                alert('Input marker description!');
                return;
            }

            newMarker.location.latitude = markerForm.find('.marker-latitude')[0].value;
            newMarker.location.longitude = markerForm.find('.marker-longitude')[0].value;

            if(!newMarker.location.latitude || !newMarker.location.longitude){
                markerForm.find('.marker-latitude').parent().addClass('has-error');
                markerForm.find('.marker-longitude').parent().addClass('has-error');
                alert('Click on map to accept coordinates!');
                return;
            }

            newMarker.groupId = groupItemsSelect.length > 0 ? groupItemsSelect[0].options[groupItemsSelect[0].selectedIndex].value : idContainer[0].group.id;
            $(this).closest('.panel')[0].polyCreated = false;
            self.saveMarker(newMarker, markerContainer);
            markerForm.find('.marker-description')[0].value = '';
            markerForm.find('.marker-latitude')[0].value = '';
            markerForm.find('.marker-longitude')[0].value = '';

//            $(this).closest('.slide');//.removeClass('active-marker-form');//.addClass('hidden');
        });


        optionsBlock.on('click', '.remove-marker', function(event){

            var markerId = $(this).closest('.marker')[0].marker.id;
            self.removeMarker(markerId);
            for(var i = 0; i < self.googleMarkers.length; i++){
                if(markerId == self.googleMarkers[i].id){
                    self.googleMarkers[i].setMap(null);
                    break;
                }
            }
            $(this).closest('.marker').remove();

        });


        markerGroups.on('click', '.remove-group', function(){
            self.removeGroup($(this).closest('.panel-default')[0].group.id);

        });


        markerGroups.on('click', '.remove-group-marker', function(){

            self.removeGroupMarker($(this).closest('.marker')[0].marker.groupId,$(this).closest('.marker')[0].marker.id);
            $(this).closest('.panel')[0].polyCreated = false;
            $(this).closest('.marker').remove();
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
            setTimeout(function(){
                toggleBounce(group.googleMarkers[markerIndex]);
            }, 2500);

            console.dir(group);

        });


        markerGroups.on('click', '.show-hide-group', function(event){
            var buttonUpDown = $(this);

            if(buttonUpDown.hasClass('glyphicon-chevron-down')){
                buttonUpDown.removeClass('glyphicon-chevron-down');
                buttonUpDown.addClass('glyphicon-chevron-up');
            }
            else{
                buttonUpDown.addClass('glyphicon-chevron-down');
                buttonUpDown.removeClass('glyphicon-chevron-up');
            }

        });


        markerGroups.on('click','.show-hull', function(){
            var groupIndex = $(this).closest('.panel')[0].groupIndex,
                hullColor;
            if(self.groups[groupIndex].markers.length < 3){
                alert('For the hull of this group needed at least three markers!');
                return;
            }
            if(!$(this).closest('.panel')[0].polyCreated){
                if(self.groups[groupIndex].groupMapHull){
                    self.groups[groupIndex].groupMapHull.setMap(null);
                }

                hullColor = groupIndex > 20 ? self.hullPalette[groupIndex % 20] : self.hullPalette[groupIndex];

                self.groups[groupIndex].groupMapHull = new google.maps.Polygon({
                    paths: self.groups[groupIndex].hull,
                    strokeColor: hullColor,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: hullColor,
                    fillOpacity: 0.35
                });
                self.groups[groupIndex].groupMapHull.setMap(self.map);

//                alert(google.maps.geometry.poly.containsLocation(new google.maps.LatLng(self.groups[groupIndex].markers[0].location.latitude, self.groups[groupIndex].markers[0].location.longitude), self.groups[groupIndex].groupMapHull));
//
//                toggleBounce(self.groups[groupIndex].googleMarkers[0]);
                $(this).closest('.panel')[0].polyCreated = true;
                google.maps.event.addListener(self.groups[groupIndex].groupMapHull, 'click', function(){
                    alert('Hide hull before creating new marker in this place!');
                });
            }

            if($(this).closest('.panel')[0].polyShowed){
                $(this).closest('.panel')[0].polyShowed = false;
                self.activeHulls[groupIndex] = false;
                self.groups[groupIndex].groupMapHull.setVisible(false);
                for(var i = 0; i < self.groups[groupIndex].googleMarkers.length; i++){
                    self.groups[groupIndex].googleMarkers[i].setVisible(true);
                }
                this.style.backgroundColor = 'inherit';
            }
            else{
                $(this).closest('.panel')[0].polyShowed = true;
                self.activeHulls[groupIndex] = true;
                self.groups[groupIndex].groupMapHull.setVisible(true);
                this.style.backgroundColor = 'red';
            }
            self.showCommonMarkers();

//            self.createPolygon(self.groups[groupIndex]);
        });



        ungroupedMarkers.on('click', '.animate-group-marker', function(){

            console.dir($(this).closest('.ungrouped-markers').find('.animate-group-marker').index($(this)));
            var markerIndex = $(this).closest('.ungrouped-markers').find('.animate-group-marker').index($(this));
            console.dir(self);
            toggleBounce(self.googleMarkers[markerIndex]);
            setTimeout(function(){
                toggleBounce(self.googleMarkers[markerIndex]);
            }, 2500);

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
        $('body').on('click', '.btn-slide', function(event){
            var slideContent = $(this).parent().find('.slide');
            if(slideContent.hasClass('hidden')){
                slideContent.removeClass('hidden').addClass('active-marker-form');
                $(this).find('.glyphicon').removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');

            }
            else{
                slideContent.addClass('hidden').removeClass('active-marker-form');
                $(this).find('.glyphicon').removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
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


