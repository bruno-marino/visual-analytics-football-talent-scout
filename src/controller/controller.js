import views from '../views';
import model from '../model';
import rolesettings from './rolesettings';
import countryStrengthPerRole from './util/country-strength-per-role';
import barplotSetOfSkills from './util/barplot-set-of-skill';
import radarSetOfSkills from './util/radar-set-of-skills';
import matrixBubbleChart from './util/matrix-bubble-chart';

export default class Controller {
  constructor() {
    this.model = model;
    this.mapchart = new views.mapchart();
    this.barplot = new views.barplot();
    this.radarchart = new views.radarchart();
    this.scatterplot = new views.scatterplot();
    this.rolesettings = rolesettings;
    this.radar_type = 'principal';
    this._role_id = '0';

    // register callback function for model upddate events
    this.model.bindPlayersListChanged(this.onPlayersListChanged.bind(this));
    this.model.bindCountriesListChanged(this.onCountriesListChanged.bind(this));
    this.mapchart.bindElemSelection(this.onCountriesSelection.bind(this));
    this.scatterplot.bindElemSelection(this.onBubbleSelection.bind(this));
  }
  
  handleAddPlayer(player) {
    this.model.addPlayer(player);
  }

  handleAddCountry(Country) {
    this.model.addCountry(Country);
  }

  onPlayersListChanged() {

  }

  onCountriesListChanged() {
    this.mapchart.data = this.model.countries;
  }

  onRoleChange(role_id) {
    this.role_id = role_id;
    let role_scale = this.rolesettings[role_id].role_scale;
    this.mapchart.values = this.countryStrengthPerRole(this.rolesettings[role_id]);
    this.mapchart.changeRamp(role_scale);
    if(this.mapchart.selected_elems.length > 0)
      this.onCountriesSelection(this.mapchart.selected_elems);
  }

  onCountriesSelection(countries) {
    this.scatterplot.resetSelection();
    countries = countries.map(country => country.id);
    let players = this.model.playersByCountries(countries);
    this.updateBarPlot([]);
    this.updateRadar(players);
    this.updateScatter(players);
  }

  onBubbleSelection(bubbles) {
    console.log(bubbles);
    let players = [];
    bubbles.forEach(bubble => {
      bubble.players_list.forEach(id => {
        players.push(this.model.players[this.model.playersById[id]]);
      });
    });

    this.updateBarPlot(players); 
        
    if (bubbles.length == 0) {
      this.onCountriesSelection(this.mapchart.selected_elems);
    } else {
      this.updateRadar(players);
    }
  }

  onRadarTypeChange(radar_type) {
    this.radar_type = radar_type;
    let countries = this.mapchart.selected_elems.map(country => country.id);
    let players = this.model.playersByCountries(countries)
    this.updateRadar(players);
  }

  updateRadar(players) {
    console.log(players);
    this.radarSetOfSkills(this.radar_type, players).then(data => {
      this.radarchart.data = data;
    });
  }

  updateBarPlot(players) {
    this.countriesAvgSetOfSkills(players).then(data => {
      this.barplot.data = data;
    });
  }

  updateScatter(players) {
    this.matrixBubbleChart('crossing','kicking', players).then(data => {
      this.scatterplot.data = data;
    })
  }

  get radar_type() {
    return this._radar_type;
  }

  set radar_type(type) {
    this._radar_type = type;
  }

  get role_id() {
    return this._role_id;
  }

  set role_id(id) {
    this._role_id = id;
  }

  get actualRole() {
    return this.rolesettings[this.role_id];
  }
}

Controller.prototype.countriesAvgSetOfSkills = barplotSetOfSkills;
Controller.prototype.countryStrengthPerRole = countryStrengthPerRole;
Controller.prototype.radarSetOfSkills = radarSetOfSkills;
Controller.prototype.matrixBubbleChart = matrixBubbleChart;