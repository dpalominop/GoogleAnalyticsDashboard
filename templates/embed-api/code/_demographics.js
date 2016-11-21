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
   * Create a new ViewSelector instance to be rendered inside of an
   * element with the id "view-selector-container".
   */
  var viewSelector = new gapi.analytics.ViewSelector({
    container: 'view-selector-container'
  });

  // Render the view selector to the page.
  viewSelector.execute();

  /**
   * Create a table chart showing top browsers for users to interact with.
   * Clicking on a row in the table will update a second timeline chart with
   * data from the selected browser.
   */
  var mainChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      'dimensions': 'ga:country',
      'metrics': 'ga:sessions',
      'start-date': '31daysAgo',
      'end-date': 'yesterday',
      'sort': '-ga:sessions',
      'max-results': '41'
    },
    chart: {
      type: 'GEO',
      container: 'main-chart-container',
      options: {
        width: '100%'
      }
    }
  });

    /**
   * Create a table chart showing demographics over time for the country the
   * user selected in the main chart.
   */
  var demographicsBreakdownChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      'dimensions': 'ga:userGender, ga:userAgeBracket, ga:interestAffinityCategory',
      'metrics': 'ga:users',
      'start-date': '31daysAgo',
      'end-date': 'yesterday',
      'sort': '-ga:users'
    },
    chart: {
      type: 'TABLE',
      container: 'demographics-breakdown-chart-container',
      options: {
        width: '100%'
      }
    }
  });


  /**
   * Store a refernce to the row click listener variable so it can be
   * removed later to prevent leaking memory when the chart instance is
   * replaced.
   */
  var mainChartRowClickListener;

  /**
   * Update both charts whenever the selected view changes.
   */
  viewSelector.on('change', function(ids) {
    var options = {query: {ids: ids}};

    // Clean up any event listeners registered on the main chart before
    // rendering a new one.
    if (mainChartRowClickListener) {
      google.visualization.events.removeListener(mainChartRowClickListener);
    }

    mainChart.set(options).execute();
    demographicsBreakdownChart.set(options);

    // Only render the breakdown chart if a browser filter has been set.
    if (demographicsBreakdownChart.get().query.filters) demographicsBreakdownChart.execute();
  });


  /**
   * Each time the main chart is rendered, add an event listener to it so
   * that when the user clicks on a row, the line chart is updated with
   * the data from the browser in the clicked row.
   */
  mainChart.on('success', function(response) {
    var chart = response.chart;
    var dataTable = response.dataTable;

    // Store a reference to this listener so it can be cleaned up later.
    mainChartRowClickListener = google.visualization.events
        .addListener(chart, 'select', function(event) {

      // When you unselect a row, the "select" event still fires
      // but the selection is empty. Ignore that case.
      if (!chart.getSelection().length) return;

      var row =  chart.getSelection()[0].row;
      var country =  dataTable.getValue(row, 0);
      var options = {
        query: {
          filters: 'ga:country==' + country
        },
        chart: {
          options: {
            title: country
          }
        }
      };
      
      demographicsBreakdownChart.set(options).execute();
    });
  });

});