// == NOTE ==
// This code uses ES6 promises. If you want to use this code in a browser
// that doesn't supporting promises natively, you'll have to include a polyfill.

gapi.analytics.ready(function() {

  /**
   * Authorize the user immediately if the user has already granted access.
   * If no access has been created, render an authorize button inside the
   * element with the ID "embed-api-auth-container".
   */
  gapi.analytics.auth.authorize({
    container: 'embed-api-auth-container',
    clientid: 'REPLACE WITH YOUR CLIENT ID'
  });


  /**
   * Create a new ActiveUsers instance to be rendered inside of an
   * element with the id "active-users-container" and poll for changes every
   * five seconds.
   */
  var activeUsers = new gapi.analytics.ext.ActiveUsers({
    container: 'active-users-container',
    pollingInterval: 5
  });

  /**
   * Add CSS animation to visually show the when users come and go.
   */
  activeUsers.once('success', function() {
    var element = this.container.firstChild;
    var timeout;

    this.on('change', function(data) {
      var element = this.container.firstChild;
      var animationClass = data.delta > 0 ? 'is-increasing' : 'is-decreasing';
      element.className += (' ' + animationClass);

      clearTimeout(timeout);
      timeout = setTimeout(function() {
        element.className =
            element.className.replace(/ is-(increasing|decreasing)/g, '');
      }, 3000);
    });
  });


  /**
   * Create a new ViewSelector2 instance to be rendered inside of an
   * element with the id "view-selector-container".
   */
  var viewSelector = new gapi.analytics.ext.ViewSelector2({
    container: 'view-selector-container',
  })
  .execute();


  /**
   * Update the activeUsers component, the Chartjs charts, and the dashboard
   * title whenever the user changes the view.
   */
  viewSelector.on('viewChange', function(data) {
    var title = document.getElementById('view-name');
    title.innerHTML = data.property.name + ' (' + data.view.name + ')';

    // Start tracking active users for this view.
    activeUsers.set(data).execute();

    // Render all the of charts for this view.
    countryChart.set({query: {ids: data.ids}}).execute();
    deviceDataChart.set({query: {ids:data.ids}}).execute();
    sessionsByBrowsersDataChart.set({query: {ids:data.ids}}).execute();
    topLandingDataChart.set({query: {ids:data.ids}}).execute();
    allPagesDataChart.set({query: {ids:data.ids}}).execute();
    renderYearOverYearOverYearChart(data.ids);
  });


  var countryChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      metrics: 'ga:sessions',
      dimensions: 'ga:country',
      'start-date': '31daysAgo',
      'end-date': 'yesterday',
      'sort': '-ga:sessions',
      'max-results': '41'
    },
    chart: {
      container: 'country-container',
      type: 'GEO',
      options: {
        width: '100%'
      }
    }
  });


  /**
   * Create a new DataChart for Users
   */
  var deviceDataChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      metrics: 'ga:sessions,ga:bounceRate',
      dimensions: 'ga:deviceCategory',
      'start-date': '31daysAgo',
      'end-date': 'yesterday'
    },
    chart: {
      container: 'device-chart-container',
      type: 'TABLE',
      options: {
        width: '100%'
      }
    }
  });

  /**
   * Create a new DataChart for Sessions by Browsers
   */
  var sessionsByBrowsersDataChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      metrics: 'ga:sessions',
      dimensions: 'ga:browser',
      'start-date': '31daysAgo',
      'end-date': 'yesterday',
      'sort': '-ga:sessions',
      'max-results': '6'
    },
    chart: {
      container: 'sessions-browsers-chart-container',
      type: 'TABLE',
      options: {
        width: '100%'
      }
    }
  });

    /**
   * Create a new DataChart for Top Landing Pages
   */
  var topLandingDataChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      metrics: 'ga:users',
      dimensions: 'ga:landingPagePath',
      'start-date': '31daysAgo',
      'end-date': 'yesterday',
      'sort': '-ga:users',
      'max-results': '10'
    },
    chart: {
      container: 'top-landing-chart-container',
      type: 'TABLE',
      options: {
        width: '100%'
      }
    }
  });

    /**
   * Create a new DataChart for All Pages (Top Content)
   */
  var allPagesDataChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      metrics: 'ga:users',
      dimensions: 'ga:pagePath',
      'start-date': '31daysAgo',
      'end-date': 'yesterday',
      'sort': '-ga:users',
      'max-results': '10'
    },
    chart: {
      container: 'all-pages-chart-container',
      type: 'TABLE',
      options: {
        width: '100%'
      }
    }
  });

/**
 * 
 */

  function renderYearOverYearOverYearChart(ids) {

    // Adjust `now` to experiment with different days, for testing only...
    var now = moment(); // .subtract(3, 'day');

    var totalUsers = query({
      'ids': ids,
      'metrics': 'ga:users',
      'dimensions': 'ga:date,ga:nthDay',
      'start-date': '31daysAgo',
      'end-date': 'yesterday'
    });

    var newUsers = query({
      'ids': ids,
      'metrics': 'ga:newUsers',
      'dimensions': 'ga:date,ga:nthDay',
      'start-date': '31daysAgo',
      'end-date': 'yesterday'
    });

    var newUserss = query({
      'ids': ids,
      'metrics': 'ga:newUsers',
      'dimensions': 'ga:date,ga:nthDay',
      'start-date': '31daysAgo',
      'end-date': 'yesterday'
    });

    Promise.all([totalUsers, newUsers, newUserss]).then(function(results) {
      var data1 = results[0].rows.map(function(row) { return +row[2]; });
      var data2 = results[1].rows.map(function(row) { return +row[2]; });
      var data3 = results[2].rows.map(function(row) { return +row[2]; });
      var labels = results[2].rows.map(function(row) { return +row[0]; });

      labels = labels.map(function(label) {
        return moment(label, 'YYYYMMDD').format('DD-MMM');
      });

      var data = {
        labels : labels,
        datasets : [
          
          {
            label: 'Users',
            fillColor : 'rgba(151,187,205,0.5)',
            strokeColor : 'rgba(151,187,205,1)',
            pointColor : 'rgba(151,187,205,1)',
            pointStrokeColor : '#fff',
            data : data1
          },
          {
            label: 'New Users',
            fillColor : 'rgba(220,220,220,0.5)',
            strokeColor : 'rgba(220,220,220,1)',
            pointColor : 'rgba(220,220,220,1)',
            pointStrokeColor : '#fff',
            data : data2
          },
          {
            label: 'New Userss',
            fillColor : 'rgba(120,120,120,0.5)',
            strokeColor : 'rgba(120,120,120,1)',
            pointColor : 'rgba(120,120,120,1)',
            pointStrokeColor : '#fff',
            data : data3
          }
        ]
      };

      new Chart(makeCanvas('chart-6-container')).Line(data);
      generateLegend('legend-6-container', data.datasets);
    })
    .catch(function(err) {
      console.error(err.stack);
    });
  }


  /**
   * Extend the Embed APIs `gapi.analytics.report.Data` component to
   * return a promise the is fulfilled with the value returned by the API.
   * @param {Object} params The request parameters.
   * @return {Promise} A promise.
   */
  function query(params) {
    return new Promise(function(resolve, reject) {
      var data = new gapi.analytics.report.Data({query: params});
      data.once('success', function(response) { resolve(response); })
          .once('error', function(response) { reject(response); })
          .execute();
    });
  }


  /**
   * Create a new canvas inside the specified element. Set it to be the width
   * and height of its container.
   * @param {string} id The id attribute of the element to host the canvas.
   * @return {RenderingContext} The 2D canvas context.
   */
  function makeCanvas(id) {
    var container = document.getElementById(id);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    container.innerHTML = '';
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);

    return ctx;
  }

  /**
   * Create a visual legend inside the specified element based off of a
   * Chart.js dataset.
   * @param {string} id The id attribute of the element to host the legend.
   * @param {Array.<Object>} items A list of labels and colors for the legend.
   */
  function generateLegend(id, items) {
    var legend = document.getElementById(id);
    legend.innerHTML = items.map(function(item) {
      var color = item.color || item.fillColor;
      var label = item.label;
      return '<li><i style="background:' + color + '"></i>' + label + '</li>';
    }).join('');
  }

  // Set some global Chart.js defaults.
  Chart.defaults.global.animationSteps = 60;
  Chart.defaults.global.animationEasing = 'easeInOutQuart';
  Chart.defaults.global.responsive = true;
  Chart.defaults.global.maintainAspectRatio = false;

});
