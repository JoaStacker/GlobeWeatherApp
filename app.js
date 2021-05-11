//variables
const mapSection = document.querySelector(".map-search-section");
const infoSection = document.querySelector(".information-section");
const hideButton = document.querySelector(".fa-arrow-left");
const globeButton = document.querySelector(".fa-globe");
const buttonSearch = document.querySelector(".button-search");
const locationNameHTML = document.querySelector(".location-timezone");
const weatherIconHTML = document.querySelector(".weather-icon");
const temperatureValueHTML = document.querySelector(".temperature-value");
const temperatureDegreeHTML = document.querySelector(".temperature-degree");
const temperatureSection = document.querySelector(".temperature-section");
const temperatureDescription = document.querySelector(".temperature-description");
const mapContainer = document.querySelector("#map");
mapboxgl.accessToken = 'pk.eyJ1Ijoiam9hcXVpbnNhZ2UiLCJhIjoiY2traWk4Y3NpMGhjdDJucDdscjFoczFpNCJ9.zJX6nVVvdbQ3IY1mcS0Fow';


//LOCATION OBJECT
const Location = {
    coords: {
        latitude: null,
        longitude: null
    },
    place: null,
    weather: {
        celsius: null,
        farenheit: null,
        description: '',
        icon: ''
    },
    getCurrentLocation(){
        return new Promise((resolve, reject) =>{
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(position => {
                    console.log(position)
                    resolve(position);
                });
            }else{
                reject("We can not access your location. Please enable it");
            }
        })
        
    },
    setLocationCoords(coords){
        this.coords.latitude = coords.latitude;
        this.coords.longitude = coords.longitude;
    },
    loadWeatherInfo(){
        locationNameHTML.textContent = this.place;
        weatherIconHTML.src = `http://openweathermap.org/img/wn/${this.weather.icon}@2x.png`;
        temperatureValueHTML.textContent = this.weather.celsius;
        temperatureDegreeHTML.textContent = "°C";
        temperatureDescription.textContent = this.weather.description;
    }
}

//WEATHER OBJECT
const Weather = {
    async searchWeather() {
        try{
            //let proxy = "https://cors-anywhere.herokuapp.com/";
            let api = `http://api.openweathermap.org/data/2.5/weather?lat=${Location.coords.latitude}&lon=${Location.coords.longitude}&appid=cc3dec0ffce7f143755220d397407580`;
            console.log("api: " + api);
            let result = await fetch(api);
            let data = await result.json();
            console.log("Weather found: " + data);

            //Pass values to in-RAM object "Location"
            if(data.name == ''){
                Location.place == 'Remote place'
            }else{
                Location.place = data.name;
            }
            Location.weather.celsius = parseInt(data.main.temp / 10);
            Location.weather.farenheit = (9/5 * Location.weather.celsius) + 32;
            Location.weather.icon = data.weather[0].icon;
            Location.weather.description = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
            Location.loadWeatherInfo();
        }catch(err){
            console.log(err);
        }
    },
    
}


//USER INTERFACE CLASS
class UI {
    setupApp(){        
        globeButton.addEventListener("click", ()=>{
            this.openMap()
        })

        hideButton.addEventListener("click", ()=>{
            this.closeMap()
        })

        buttonSearch.addEventListener("click", ()=>{
            const values = document.querySelectorAll("input");        
            const coords = Array.from(values).reduce((acc, input) => ({...acc, [input.id]: input.value}), {})
            if(coords.latitude === '' || coords.longitude === ''){
                this.loadCoordValues();
            }else{
                Location.setLocationCoords(coords);
                console.log(Location.coords); 
                Weather.searchWeather();
                Location.loadWeatherInfo(); 
                this.createMap();
            }
        })

        temperatureSection.addEventListener("click", () =>{
            switch(temperatureDegreeHTML.textContent){
                case "°C": 
                    temperatureDegreeHTML.textContent = "°F"; 
                    temperatureValueHTML.textContent = Location.weather.farenheit;
                    break;
                case "°F": 
                    temperatureDegreeHTML.textContent = "°C";
                    temperatureValueHTML.textContent = Location.weather.celsius;
                    break;
            }
        })

    }
    openMap(){
        mapSection.classList.add("show-map")
        mapSection.classList.add("shadow")
        infoSection.classList.add("shrink-info")
        console.log("Map opened");
    }
    closeMap(){
        mapSection.classList.remove("show-map")
        mapSection.classList.remove("shadow")
        infoSection.classList.remove("shrink-info")  
         
        console.log("Map closed");
    }
    createMap(){
        if(mapContainer.hasChildNodes()){
            mapContainer.innerHTML = '';
        }
        const lng = Location.coords.longitude;
        const lat = Location.coords.latitude;
        const v1 = new mapboxgl.LngLat(lng,lat);
        var map = new mapboxgl.Map({
            container: 'map',
            center : v1,
            zoom : 11,
            style: 'mapbox://styles/mapbox/streets-v11', 
        });

        console.log([Location.coords.longitude, Location.coords.latitude]);

        map.on('click', el => {
            console.log(el.lngLat);
            Location.setLocationCoords({latitude: el.lngLat.lat, longitude: el.lngLat.lng});
            this.loadCoordValues({latitude: el.lngLat.lat, longitude: el.lngLat.lng});
            console.log(Location.coords);
            Weather.searchWeather();
            Location.loadWeatherInfo();
        })
    }
    refreshMap(){
        map.center = [Location.coords.longitude, Location.coords.latitude];
    }
    loadCoordValues(coords = {latitude: Location.coords.latitude, longitude: Location.coords.longitude}){
        const latInput = document.querySelector("#latitude");
        const lngInput = document.querySelector("#longitude");
        latInput.value = coords.latitude;
        lngInput.value = coords.longitude;
    }
}


window.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    ui.setupApp();

    Location.getCurrentLocation()
            .then(position => { 
                console.log("Current position: " + position);
                const coords = {latitude: position.coords.latitude, longitude: position.coords.longitude}
                console.log(coords)
                Location.setLocationCoords(coords)
                Weather.searchWeather()
                ui.loadCoordValues()
                ui.createMap()
            })
            .catch(error => console.log(error))
})



