
/*DATATABLE*/


		$(document).ready( function () {
    		$('#table_id').DataTable({
    			"lengthChange": false,
		    	"pageLength": 50,
		        "oLanguage": {
		           "sSearch": "Rechercher",
		            "sInfo": "",
		            "sInfoEmpty": "",
		            "sInfoFiltered": "",
		            "sZeroRecords": "Aucune espèce trouvée",
			        "oPaginate": {
			           "sPrevious": "Précedent",
			           "sNext" : "Suivant"
					}
				}
			})
    	});



  /*LEAFLET*/

 var selectLayer;

 function generateLayerFromGeojson(observations){
 	currentGeojsonLayer = L.geoJson(observations, {
          pointToLayer: function (feature, latlng) {
                           return L.circleMarker(latlng);
                           },
          onEachFeature: bindMarkers,
	   });
 	return currentGeojsonLayer;
 }


function bindMarkers(features, layer){
	layer.on({
		click: function(e){
			console.log(e)
			if (selectLayer != undefined){
				selectLayer.setStyle({
					color: '#3388ff',
	            	fillColor: '#3388ff'
				})
			}
				e.target.setStyle({
					color: '#ff0000',
		            fillColor: '#ff0000'
				})

				// surligner la ligne

				id_synthese = e.target.feature.properties.id_synthese;
				row = $("[idSynthese="+id_synthese+"]")
				$(row).siblings().removeClass('currentRow');
         		$(row).addClass('currentRow');

			selectLayer = e.target;
		}
	})
}


var currentGeoJson;
var map = L.map('map').setView([16.2412500, -61.5361400],11 );
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGhlb2xlY2hlbWlhIiwiYSI6ImNpa29lODhvejAwYTl3MGxzZGY0aHc0NXIifQ.fEujW2fUlRuUk9PHfPdKIg').addTo(map);

$.ajax({
  url: 'http://localhost:5000/mapList/geojson', 
  dataType: "json",
  }).done(function(observations) {
  	// display geojson
  	  currentGeoJson = observations;
  	  currentGeoJsonLayer = generateLayerFromGeojson(currentGeoJson);
  	  console.log(currentGeojsonLayer);
  	  currentGeoJsonLayer.addTo(map);
	})
  .fail(function(){
  	console.log("error");
  });


     // interaction list - map 
      $('.search').click(function(){
      	// back to origin style
      	if (selectLayer != undefined){
	      	 selectLayer.setStyle({
	            color: '#3388ff',
	            fillColor: '#3388ff'
	        });
      	}

      	row = this.parentElement;
      	id_synthese = $(row).attr("idSynthese");
         $(row).siblings().removeClass('currentRow');
         $(row).addClass('currentRow');
        var id_observation = $(this).attr('idSynthese');
        p = (currentGeoJsonLayer._layers);
        
        for (var key in p) {
          if (p[key].feature.properties.id_synthese == id_synthese){
            selectLayer = p[key];
			}
          }
         //selectLayer.openPopup();

        if (selectLayer != undefined) {
	        selectLayer.setStyle({
	            color: '#ff0000',
	            fillColor: '#ff0000'
	        });
	        if(map.getZoom() > 12){
				map.setView(selectLayer._latlng);
			} else {
				map.setView(selectLayer._latlng, 12);
			}
  		}

  	});


function evaluationEvent(){
		$(row).removeClass('currentRow');
      	id = $(row).attr("idSynthese");
      	$(row).hide( "slow" );
	    currentGeoJson.features = currentGeoJson.features.filter(function(point){
	    	return point.properties.id_synthese != id;
	    })
	    map.removeLayer(currentGeoJsonLayer);
	    currentGeoJsonLayer = generateLayerFromGeojson(currentGeoJson)
  	    currentGeoJsonLayer.addTo(map);
  	    return id;

}


$('.validate').click(function(){
	row = this.parentElement;
	$(row).addClass("validate_ok")
	id = evaluationEvent();
	console.log(id)
	$.ajax({
	  type: "GET",
	  url: 'http://localhost:5000/validate/'+id
	}).done(function(json){
		console.log(json);	
	})
});

$('.delete').click(function(){
	row = this.parentElement;
	$(row).addClass("delete_ok")
	id = evaluationEvent();
	$.ajax({
	  type: "GET",
	  url: 'http://localhost:5000/delete/'+id
	}).done(function(json){
		console.log(json);	
	})

})



