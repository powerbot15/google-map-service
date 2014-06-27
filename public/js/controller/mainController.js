//define(['marker-model', 'marker-group-model'], function(Marker, MarkerGroup){

(function($){

    var MainController = function(){

//        this.downloadGroups();
        this.groups = [];
        this.markers = [];
        this.googleMarkers = [];
        this.activeMarker = {
            groupIndex : 0,
            index : 0,
            onFlight : false
        };
        this.activeGroup = {
            groupIndex : 0,
            onFlight : false
        };
        this.infoWindow = {};
        this.infoWindowContent = $('.info-window-template').eq(0).detach();
        this.infoWindowContent.find('img').removeClass('hidden');
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
//        this.commonHull = {};
//        console.dir(this.activeHulls);


        this.initializeMap();
        this.constructGroupIconSelect();
        this.downloadGroups();

        this.initializeEventsAndActions();
    };


    //===================================================================

// isLeft(): tests if a point is Left|On|Right of an infinite line.
//    Input:  three points P0, P1, and P2
//    Return: >0 for P2 left of the line through P0 and P1
//            =0 for P2 on the line
//            <0 for P2 right of the line

    function sortPointX(a, b) {
        return a.lng() - b.lng();
    }
    function sortPointY(a, b) {
        return a.lat() - b.lat();
    }

    function isLeft(P0, P1, P2) {
        return (P1.lng() - P0.lng()) * (P2.lat() - P0.lat()) - (P2.lng() - P0.lng()) * (P1.lat() - P0.lat());
    }


    MainController.prototype.calculateConvexHull = function(P, n, H){
        // Copyright 2001, softSurfer (www.softsurfer.com)
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// SoftSurfer makes no warranty for this code, and cannot be held
// liable for any real or imagined damage resulting from its use.
// Users of this code must verify correctness for their application.
// http://softsurfer.com/Archive/algorithm_0203/algorithm_0203.htm
// Assume that a class is already given for the object:
//    Point with coordinates {float x, y;}
//===================================================================

// chainHull_2D(): A.M. Andrew's monotone chain 2D convex hull algorithm
// http://softsurfer.com/Archive/algorithm_0109/algorithm_0109.htm
//
//     Input:  P[] = an array of 2D points
//                   presorted by increasing x- and y-coordinates
//             n = the number of points in P[]
//     Output: H[] = an array of the convex hull vertices (max is n)
//     Return: the number of points in H[]



            // the output array H[] will be used as the stack
            var bot = 0,
                top = (-1); // indices for bottom and top of the stack
            var i; // array scan index
            // Get the indices of points with min x-coord and min|max y-coord
            var minmin = 0,
                minmax;

            var xmin = P[0].lng();
            for (i = 1; i < n; i++) {
                if (P[i].lng() != xmin) {
                    break;
                }
            }

            minmax = i - 1;
            if (minmax == n - 1) { // degenerate case: all x-coords == xmin
                H[++top] = P[minmin];
                if (P[minmax].lat() != P[minmin].lat()) // a nontrivial segment
                    H[++top] = P[minmax];
                H[++top] = P[minmin]; // add polygon endpoint
                return top + 1;
            }

            // Get the indices of points with max x-coord and min|max y-coord
            var maxmin, maxmax = n - 1;
            var xmax = P[n - 1].lng();
            for (i = n - 2; i >= 0; i--) {
                if (P[i].lng() != xmax) {
                    break;
                }
            }
            maxmin = i + 1;

            // Compute the lower hull on the stack H
            H[++top] = P[minmin]; // push minmin point onto stack
            i = minmax;
            while (++i <= maxmin) {
                // the lower line joins P[minmin] with P[maxmin]
                if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin) {
                    continue; // ignore P[i] above or on the lower line
                }

                while (top > 0) { // there are at least 2 points on the stack
                    // test if P[i] is left of the line at the stack top
                    if (isLeft(H[top - 1], H[top], P[i]) > 0) {
                        break; // P[i] is a new hull vertex
                    }
                    else {
                        top--; // pop top point off stack
                    }
                }

                H[++top] = P[i]; // push P[i] onto stack
            }

            // Next, compute the upper hull on the stack H above the bottom hull
            if (maxmax != maxmin) { // if distinct xmax points
                H[++top] = P[maxmax]; // push maxmax point onto stack
            }

            bot = top; // the bottom point of the upper hull stack
            i = maxmin;
            while (--i >= minmax) {
                // the upper line joins P[maxmax] with P[minmax]
                if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax) {
                    continue; // ignore P[i] below or on the upper line
                }

                while (top > bot) { // at least 2 points on the upper stack
                    // test if P[i] is left of the line at the stack top
                    if (isLeft(H[top - 1], H[top], P[i]) > 0) {
                        break;  // P[i] is a new hull vertex
                    }
                    else {
                        top--; // pop top point off stack
                    }
                }

                if (P[i].lng() == H[0].lng() && P[i].lat() == H[0].lat()) {
                    return top + 1; // special case (mgomes)
                }

                H[++top] = P[i]; // push P[i] onto stack
            }

            if (minmax != minmin) {
                H[++top] = P[minmin]; // push joining endpoint onto stack
            }

            return top + 1;

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
        },
            self = this;

        self.map = new google.maps.Map($('.map-container')[0], mapOptions);
        google.maps.event.addListener(this.map, 'click', function(event) {

            if(self.activeMarker.onFlight){
                $('.active-marker-form').find('input').val('');
                $('.active-marker-form').find('input').addClass('error');
                $('.manage-markers-menu').addClass('error-menu');
                setTimeout(function(){
                    $('.manage-markers-menu').removeClass('error-menu');
                    $('.active-marker-form').find('input').removeClass('error');
                }, 500);
                self.activeMarker.onFlight = false;
            }

            if(!self.activeMarker.onFlight && $('.active-marker-form').length > 0){
                $('.active-marker-form .marker-latitude').val(event.latLng.k);
                $('.active-marker-form .marker-longitude').val(event.latLng.A);
            }
            self.infoWindow.close();
        });

        this.infoWindow = new google.maps.InfoWindow({
            content: '',
            maxWidth: 250,
            maxHeight:300
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
                        receivedMarkers[i].index = that.markers.length;
                        that.markers.push(receivedMarkers[i]);
                        continue;
                    }
                    for(var j = 0; j < that.groups.length; j++){
                        if(that.groups[j].id == receivedMarkers[i].groupId){
                            receivedMarkers[i].index = that.groups[j].markers.length;
                            that.groups[j].markers.push(receivedMarkers[i]);
                            break;
                        }
                    }
                }
                for( j = 0; j < that.groups.length; j++){
                    that.createPolygon(that.groups[j]);
                    that.activeHulls[j] = false;
                }
                console.dir(receivedMarkers);
                that.renderGroups();
                that.renderGoogleMarkersInGroups();
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
            marker.index = i;
            self.googleMarkers.push(marker);
            google.maps.event.addListener(marker, 'click', function() {

                self.infoWindowContent.find('.info-group-name').eq(0).html('Ungrouped marker');
                self.infoWindowContent.find('.info-marker-description').html(self.markers[this.index].description);
                self.infoWindowContent.find('img').get(0).src = self.markers[this.index].imageUrl ? self.markers[this.index].imageUrl : 'img/no-image.jpg';
                self.infoWindow.setContent(self.infoWindowContent.html());
                self.infoWindow.open(self.map, this);
                self.map.panTo(this.position);

            });

        }
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
//                        console.dir(data);
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

        if(self.activeGroup.onFlight){
            newGroup.id = self.groups[self.activeGroup.groupIndex].id;
        }
        else{
            newGroup.id = 0;
            for(var i = 0; i < self.groups.length; i++){
                if(newGroup.name == self.groups[i].name){
                    alert('Such group already exists! Change the name please' );
                    return;
                }
            }

        }
//        newGroup.markers = [];
        newGroup.iconUrl = $('.marker-icon-image')[0].src;

        $.ajax({
            type: "POST",
            url: "/group",
            data: newGroup
        })
            .done(function(data) {
//                that.markers = data;
                if(self.activeGroup.onFlight){

                    self.groups[self.activeGroup.groupIndex].name = data.name;
                    self.groups[self.activeGroup.groupIndex].iconUrl = data.iconUrl;
                    self.renderGroups();
                    self.renderGoogleMarkersInGroups();
                    return;
                }

                var groupElement;
//                console.dir(data);
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
                console.dir(err.responseText);
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

    MainController.prototype.removeGroupMarker = function(groupId, markerId, index){
        this.removeMarker(markerId);
        for(var i = 0; i < this.groups.length; i++){
            if(this.groups[i].id == groupId){

                this.groups[i].markers.splice(index, 1);
                this.groups[i].googleMarkers[index].setMap(null);
                this.groups[i].googleMarkers.splice(index, 1);

                for(var j = index; j < this.groups[i].markers.length; j++){
                    this.groups[i].markers[j].index = j;
                    this.groups[i].googleMarkers[j].index = j;
                }
                this.createPolygon(this.groups[i]);
                return;
//                for(var j = 0; j < this.groups[i].markers.length; j++){
//                    if(this.groups[i].markers[j].id == markerId){
//                        this.groups[i].markers.splice(j, 1);
//                        this.groups[i].googleMarkers[j].setMap(null);
//                        this.groups[i].googleMarkers.splice(j, 1);
//
////                        this.renderGroups();
//                        this.createPolygon(this.groups[i]);
//                        return;
//                    }
//                }

            }
        }

    };

    MainController.prototype.removeMarker = function(markerId){
        $.ajax({
            type:'DELETE',
            url:'/markers/' + markerId
        }).done(function(data){});
    };

    MainController.prototype.saveMarker = function(marker, markerContainer, formData){

        var newMarker = marker,
            self = this;


        $.ajax({
            type: "POST",
            url: "/marker",
//            data: newMarker
            data: formData,
            cache: false,
            contentType: false,
            processData: false

        })
            .done(function(data) {
//                return;
                if(self.activeMarker.onFlight){
//                    console.dir(data);
                    if(self.activeMarker.groupIndex != 'none'){
                        self.groups[self.activeMarker.groupIndex].markers[self.activeMarker.index].description = data.description;
                        self.groups[self.activeMarker.groupIndex].markers[self.activeMarker.index].imageUrl = data.imageUrl;
                        self.createPolygon(self.groups[self.activeMarker.groupIndex]);
                        self.renderMarkersInGroup(markerContainer, self.activeMarker.groupIndex);
                    }
                    else{
                        self.renderMarkers();
                    }
                    self.activeMarker.onFlight = false;

                }
                else{
                    newMarker = data;
                    var myLatitudeLongitude,
                        marker;
                    if(newMarker.groupId != 'none'){

                        for(var i = 0; i < self.groups.length; i++){
                            if(newMarker.groupId == self.groups[i].id){
                                if(!self.groups[i].markers){self.groups[i].markers = []}
                                if(!self.groups[i].googleMarkers){self.groups[i].googleMarkers = []}
                                newMarker.index = self.groups[i].markers.length;
                                self.groups[i].markers.push(newMarker);
                                myLatitudeLongitude = new google.maps.LatLng( newMarker.location.latitude, newMarker.location.longitude);
                                marker = new google.maps.Marker({
                                    position: myLatitudeLongitude,
                                    map: self.map,
                                    title:newMarker.description,
                                    icon: self.groups[i].iconUrl
                                });
                                marker.groupId = newMarker.groupId;
                                marker.groupIndex = i;
                                marker.index = self.groups[i].googleMarkers.length;
                                self.groups[i].googleMarkers.push(marker);
                                google.maps.event.addListener(marker, 'click', function() {

                                    self.infoWindowContent.find('.info-group-name').eq(0).html(self.groups[this.groupIndex].name);
                                    self.infoWindowContent.find('.info-marker-description').html(self.groups[this.groupIndex].markers[this.index].description);
                                    self.infoWindowContent.find('img').get(0).src = self.groups[this.groupIndex].markers[this.index].imageUrl ? self.groups[this.groupIndex].markers[this.index].imageUrl : 'img/no-image.jpg';
                                    self.infoWindow.setContent(self.infoWindowContent.html());
                                    self.infoWindow.open(self.map, this);
                                    self.map.panTo(this.position);

                                });

                                self.createPolygon(self.groups[i]);
                                self.renderMarkersInGroup(markerContainer, i);

                                break;
                            }
                        }



                    }
                    else{
                        newMarker.index = self.markers.length;
                        self.markers.push(newMarker);
                        self.renderMarkers();
                        myLatitudeLongitude = new google.maps.LatLng( newMarker.location.latitude, newMarker.location.longitude);
                        marker = new google.maps.Marker({
                            position: myLatitudeLongitude,
                            map: self.map,
                            title:newMarker.description
                        });
                        marker.groupId = newMarker.groupId;
                        marker.index = self.googleMarkers.length;
                        marker.id = newMarker.id;
                        self.googleMarkers.push(marker);

                        google.maps.event.addListener(marker, 'click', function() {

                            self.infoWindowContent.find('.info-group-name').eq(0).html('Ungrouped marker');
                            self.infoWindowContent.find('.info-marker-description').html(self.markers[this.index].description);
                            self.infoWindowContent.find('.info-marker-description').html(self.markers[this.index].description);
                            self.infoWindow.setContent(self.infoWindowContent.html());
                            self.infoWindow.open(self.map, this);
                            self.map.panTo(this.position);

                        });
                    }
//                    console.dir(newMarker);
//                    console.dir(self.googleMarkers);
                }
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
            groupElement.find('a').attr({href :'#collapse' + i});

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
                markerTemplateInsert[0].groupIndex = i;
                markerTemplateInsert[0].index = j;
                markerTemplateParent.append(markerTemplateInsert);
            }

            this.templateParent.append(groupElement);


            groupItemElement = this.groupItemTemplate.clone();
            groupItemElement[0].value = this.groups[i].id;
            groupItemElement.html(this.groups[i].name) ;
            this.groupItemParent.append(groupItemElement);

        }
//        console.dir(this.groups);
        $('.collapse').collapse();
    };

    MainController.prototype.renderGoogleMarkersInGroups = function(){
        var myLatitudeLongitude,

            self = this;
        if(self.activeGroup.onFlight){
            for(var i = 0; i < self.groups[self.activeGroup.groupIndex].googleMarkers.length; i++){
                self.groups[self.activeGroup.groupIndex].googleMarkers[i].setIcon(self.groups[self.activeGroup.groupIndex].iconUrl);
            }
            self.activeGroup.onFlight = false;
            return
        }
        for(var i = 0; i < self.groups.length; i++){

            if(!self.groups[i].googleMarkers){
                self.groups[i].googleMarkers = []
            }

            for(var j = 0; j < self.groups[i].markers.length; j++){

                var marker = {};
                myLatitudeLongitude = new google.maps.LatLng( self.groups[i].markers[j].location.latitude, self.groups[i].markers[j].location.longitude);
                marker = new google.maps.Marker({
                    position: myLatitudeLongitude,
                    map: self.map,
                    title:self.groups[i].markers[j].description,
                    icon: self.groups[i].iconUrl

                });
                marker.groupId = self.groups[i].markers[j].groupId;
                marker.groupIndex = i;
                marker.id = self.groups[i].markers[j].id;
                marker.index = self.groups[i].googleMarkers.length;
                self.groups[i].googleMarkers.push(marker);

                google.maps.event.addListener(marker, 'click', function() {

                    self.infoWindowContent.find('.info-group-name').eq(0).html(self.groups[this.groupIndex].name);
                    self.infoWindowContent.find('.info-marker-description').html(self.groups[this.groupIndex].markers[this.index].description);
                    self.infoWindowContent.find('img').get(0).src = self.groups[this.groupIndex].markers[this.index].imageUrl ? self.groups[this.groupIndex].markers[this.index].imageUrl : 'img/no-image.jpg';
                    self.infoWindow.setContent(self.infoWindowContent.html());
                    self.infoWindow.open(self.map, this);
                    self.map.panTo(this.position);

                });

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
            markerTemplateInsert[0].groupIndex = groupIndex;
            markerTemplateInsert[0].index = j;
//            console.dir(markerTemplateInsert);
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
            insertionTemplate[0].groupIndex = 'none';
            insertionTemplate[0].index = i;
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

        countPoints = this.calculateConvexHull(coords, coords.length, hull);
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
            self.saveGroup();
        });

        $('.reset-group-input').on('click', function(event){
            $('.active-marker-form').removeClass('active-marker-form').addClass('hidden').width();
            $('.glyphicon-minus-sign').removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign').width();

        });

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
                markerContainer = idContainer.find('.panel-body').eq(0),
                formData = new FormData(),
                file = idContainer.find('.marker-image').get(0).files[0];


            markerForm.find('.marker-description').parent().removeClass('has-error');
            markerForm.find('.marker-latitude').parent().removeClass('has-error');
            markerForm.find('.marker-longitude').parent().removeClass('has-error');

            if(self.activeMarker.onFlight){
                var groupIndex = self.activeMarker.groupIndex,
                    markerIndex = self.activeMarker.index,
                    myLatitudeLongitude,
                    marker;
                if(self.activeMarker.groupIndex == 'none'){
                    self.markers[markerIndex].description = markerForm.find('.marker-description').val();
                    self.markers[markerIndex].groupId = groupItemsSelect.length > 0 ? groupItemsSelect[0].value : idContainer[0].group.id;
                    if(self.markers[markerIndex].groupId !== 'none'){
                        if(eventTarget.parent().find('#marker-group-items').length > 0){

                            $('.ungrouped-markers').find('.marker').eq(self.activeMarker.index).remove();

                        }
                        for(var i = 0; i < self.groups.length; i++){
                            if(self.groups[i].id == self.markers[markerIndex].groupId){

                                self.groups[i].markers.push(self.markers[markerIndex]);

                                self.googleMarkers[markerIndex].setMap(null);

                                myLatitudeLongitude = new google.maps.LatLng( self.markers[markerIndex].location.latitude, self.markers[markerIndex].location.longitude);
                                marker = new google.maps.Marker({
                                    position: myLatitudeLongitude,
                                    map: self.map,
                                    title:newMarker.description,
                                    icon: self.groups[i].iconUrl
                                });

                                marker.index = self.groups[i].markers.length - 1;
                                marker.groupIndex = i;
                                self.activeMarker.groupIndex = i;
                                self.activeMarker.index = self.groups[i].markers.length - 1;

                                marker.groupId = self.groups[i].id;

                                google.maps.event.addListener(marker, 'click', function() {

                                    self.infoWindowContent.find('.info-group-name').eq(0).html(self.groups[this.groupIndex].name);
                                    self.infoWindowContent.find('.info-marker-description').html(self.groups[this.groupIndex].markers[this.index].description);
                                    self.infoWindow.setContent(self.infoWindowContent.html());
                                    self.infoWindow.open(self.map, this);
                                    self.map.panTo(this.position);

                                });

                                self.groups[i].googleMarkers.push(
                                    marker
                                );
                                self.markers.splice(markerIndex, 1);
                                self.googleMarkers.splice(markerIndex, 1);
                                self.renderGroups();
                                self.groups[i].polyCreated = false;
                                break;
                            }
                        }
                        appendMarkerToFormData(formData, self.groups[self.activeMarker.groupIndex].markers[self.activeMarker.index], file);
                        self.saveMarker(self.groups[self.activeMarker.groupIndex].markers[self.activeMarker.index], markerContainer, formData );
                    }
                    else{
                        appendMarkerToFormData(formData, self.markers[markerIndex], file);
                        self.saveMarker(self.markers[markerIndex], markerContainer);
                    }

                }
                else{
                    self.groups[groupIndex].markers[markerIndex].description = markerForm.find('.marker-description')[0].value;
                    appendMarkerToFormData(formData, self.groups[groupIndex].markers[markerIndex], file);
                    self.saveMarker(self.groups[groupIndex].markers[markerIndex], markerContainer, formData);
                }

            }
            else{


                newMarker.description = markerForm.find('.marker-description')[0].value;

                if(!newMarker.description){
                    markerForm.find('.marker-description').parent().addClass('has-error');
                    alert('Input marker description!');
                    return;
                }
//                formData.append('description', newMarker.description);

                newMarker.location.latitude = markerForm.find('.marker-latitude')[0].value;
                newMarker.location.longitude = markerForm.find('.marker-longitude')[0].value;


                if(!newMarker.location.latitude || !newMarker.location.longitude){
                    markerForm.find('.marker-latitude').parent().addClass('has-error');
                    markerForm.find('.marker-longitude').parent().addClass('has-error');
                    alert('Click on map to accept coordinates!');
                    return;
                }

//                formData.append('latitude', newMarker.location.latitude);
//                formData.append('longitude', newMarker.location.longitude);

                newMarker.groupId = groupItemsSelect.length > 0 ? groupItemsSelect[0].value : idContainer[0].group.id;

//                formData.append('groupId', newMarker.groupId);

                if(newMarker.groupId !== 'none'){
                    for(var i = 0; i < self.groups.length; i++){

                        if(self.groups[i].id == newMarker.groupId){
                            self.groups[i].polyCreated = false;
                            break;
                        }

                    }

                }
                appendMarkerToFormData(formData, newMarker, file);
                self.saveMarker(newMarker, $('.panel-default').eq(i).find('.panel-body'), formData);

            }

            markerForm.find('.marker-description')[0].value = '';
            markerForm.find('.marker-latitude')[0].value = '';
            markerForm.find('.marker-longitude')[0].value = '';
            markerForm.find('.marker-image')[0].value = '';

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
            var marker = $(this).closest('.marker')[0].marker;
            self.removeGroupMarker(marker.groupId, marker.id, marker.index);
//            $(this).closest('.panel')[0].polyCreated = false;
            for(var i = 0; i < self.groups.length; i++){

                if(self.groups[i].id == marker.groupId){
                    self.groups[i].polyCreated = false;
                    break;
                }

            }

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
            self.map.panTo(group.googleMarkers[markerIndex].position);
            setTimeout(function(){
                toggleBounce(group.googleMarkers[markerIndex]);
            }, 3500);

            console.dir(group);

        });

        optionsBlock.on('click', '.edit-group', function(event){

            var jqThis = $(this),
                panel = jqThis.closest('.panel'),
                buttonUpDown = panel.find('.btn-slide').find('.glyphicon'),
                groupIndex = panel[0].groupIndex,
                activeForm,
                newGroupContainer = $('.new-group-container').eq(0);

            self.activeGroup.groupIndex = groupIndex;
            self.activeGroup.onFlight = true;

            newGroupContainer.find('.slide').removeClass('hidden').removeClass('active-marker-form').addClass('active-marker-form');
            newGroupContainer.find('#group-name').val(self.groups[groupIndex].name);
            newGroupContainer.find('.marker-icon-image')[0].src = self.groups[groupIndex].iconUrl;

        });

        markerGroups.on('click', '.edit-marker', function(){

            var jqThis = $(this),
                panel = jqThis.closest('.panel'),
                buttonUpDown = panel.find('.btn-slide').find('.glyphicon'),
                groupIndex = jqThis.closest('.marker')[0].groupIndex,
                activeForm;

            panel.find('.slide').removeClass('hidden').removeClass('active-marker-form').addClass('active-marker-form');
            buttonUpDown.removeClass('glyphicon-plus-sign');
            buttonUpDown.addClass('glyphicon-minus-sign');
            self.activeMarker.groupIndex = groupIndex;
            self.activeMarker.index = jqThis.closest('.marker')[0].index;
            self.activeMarker.onFlight = true;
            activeForm = panel.find('.active-marker-form');

            if(self.activeMarker.groupIndex != 'none'){
                activeForm.find('.marker-description').get(0).value = self.groups[self.activeMarker.groupIndex].markers[self.activeMarker.index].description;
                activeForm.find('.marker-latitude').get(0).value = self.groups[self.activeMarker.groupIndex].markers[self.activeMarker.index].location.latitude;
                activeForm.find('.marker-longitude').get(0).value = self.groups[self.activeMarker.groupIndex].markers[self.activeMarker.index].location.longitude;
                activeForm.find('.marker-image').get(0).value = '';
            }



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
//            if(!$(this).closest('.panel')[0].polyCreated){
            if( ! self.groups[groupIndex].polyCreated){
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
                self.groups[groupIndex].polyCreated = true;
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
            self.map.panTo(self.googleMarkers[markerIndex].position);
            setTimeout(function(){
                toggleBounce(self.googleMarkers[markerIndex]);
            }, 3500);

        });
        ungroupedMarkers.on('click', '.edit-marker', function(){

            var jqThis = $(this),
                panel = jqThis.closest('.tab-pane'),
                buttonUpDown = panel.find('.btn-slide').find('.glyphicon'),
//                groupIndex = jqThis.closest('.marker')[0].groupIndex,
                activeForm;

            panel.find('.slide').removeClass('hidden').removeClass('active-marker-form').addClass('active-marker-form');
            buttonUpDown.removeClass('glyphicon-plus-sign');
            buttonUpDown.addClass('glyphicon-minus-sign');
            self.activeMarker.groupIndex = 'none';
            self.activeMarker.index = jqThis.closest('.marker')[0].index;
            self.activeMarker.onFlight = true;
            activeForm = panel.find('.active-marker-form');

                activeForm.find('.marker-description').get(0).value = self.markers[self.activeMarker.index].description;
                activeForm.find('.marker-latitude').get(0).value = self.markers[self.activeMarker.index].location.latitude;
                activeForm.find('.marker-longitude').get(0).value = self.markers[self.activeMarker.index].location.longitude;
                activeForm.find('.marker-image').get(0).value = '';


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
            setTimeout(function(){
                google.maps.event.trigger(self.map, 'resize');
            }, 600);

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

        function appendMarkerToFormData(formData, marker, file){
            formData.append('description', marker.description);
            formData.append('id', marker.id || 'none');
            formData.append('groupId', marker.groupId);
            formData.append('imageUrl', marker.imageUrl);
            formData.append('latitude', marker.location.latitude);
            formData.append('longitude', marker.location.longitude);
            formData.append('image', file ? file : 'none');
        }
    };

    var mainController = new MainController();

})(jQuery);


