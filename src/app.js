import Controller from './controller/controller';
import * as d3 from 'd3';

const controller = new Controller();

const app = function() {
  window.app = controller;

  loadData().then(() => {
    const mapchartContainer = d3.select('#map');

    controller.mapchart.init(mapchartContainer);
    controller.barplot.init(d3.select('#bar'));
    controller.radarchart.init(d3.select('#radar'));
    controller.scatterplot.init(d3.select('#scatter'));
    controller.bubblechart.init(d3.select('#bubble'));
    document.querySelector('.loader').style.display = 'none';
    document.querySelector('#main').style.visibility = 'visible';
    controller.mapchart.values = controller.countryStrengthPerRole();
    controller.mapchart.changeRamp(controller.actualRole.role_scale);
  });
}

const loadData = function() {
    return new Promise((resolve, reject) => {
      // temp
      let promises = [
        d3.json("./assets/world.geojson"),
        d3.csv("./assets/dataset.csv"),
      ];

      Promise.all(promises).then(loaded_data => {
        loaded_data[0].features.forEach(country => {
          country.id === 'ATA' || country.id === 'GRL'? null : controller.handleAddCountry(country);
        });

        loaded_data[1].forEach(player => {
          controller.handleAddPlayer(player);
        })
        resolve(true)
      })
      .catch(error => reject(error));
    })
}

export default app;