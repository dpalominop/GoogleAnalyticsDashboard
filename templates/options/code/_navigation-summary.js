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
   * Query params representing the first chart's date range.
   */
  var dateRange = {
    'start-date': '31daysAgo',
    'end-date': '1daysAgo'
  };

  /**
   * Create a new ViewSelector instance to be rendered inside of an
   * element with the id "view-selector-container".
   */
  var viewSelector = new gapi.analytics.ext.ViewSelector2({
    container: 'view-selector-container'
  });

  // Render the view selector to the page.
  viewSelector.execute();

  /**
   * Create a new DateRangeSelector instance to be rendered inside of an
   * element with the id "date-range-selector-container", set its date range
   * and then render it to the page.
   */
  var dateRangeSelector = new gapi.analytics.ext.DateRangeSelector({
    container: 'date-range-selector-container'
  })
  .set(dateRange)
  .execute();

  /**
   * Create a table chart showing top browsers for users to interact with.
   * Clicking on a row in the table will update a second timeline chart with
   * data from the selected browser.
   */
  var pageChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      'metrics': 'ga:pageviews',
      'dimensions': 'ga:pagePath',
      'start-date': '31daysAgo',
      'end-date': 'yesterday',
      'sort': '-ga:pageviews',
      'max-results': '20'
    },
    chart: {
      type: 'TABLE',
      container: 'page-container',
      options: {
        width: '100%',
        'height':'300px'
      }
    }
  });

  /**
   * Create a table chart showing users by device for the country the
   * user selected in the main chart.
   */
  var previousChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      'metrics': 'ga:pageviews',
      'dimensions': 'ga:previousPagePath',
      'start-date': '30daysAgo',
      'end-date': 'yesterday',
      'max-results': 6,
      'sort': '-ga:pageviews',
      'max-results': '20'
    },
    chart: {
      container: 'previous-container',
      type: 'TABLE',
      options: {
        width: '100%',
        pieHole: 4/9
      }
    }
  });

  /**
   * Create a table chart showing users by device for the country the
   * user selected in the main chart.
   */
  var nextChart = new gapi.analytics.googleCharts.DataChart({
    query: {
      'metrics': 'ga:pageviews',
      'dimensions': 'ga:pagePath',
      'start-date': '30daysAgo',
      'end-date': 'yesterday',
      'max-results': 6,
      'sort': '-ga:pageviews',
      'max-results': '20'
    },
    chart: {
      container: 'next-container',
      type: 'TABLE',
      options: {
        width: '100%',
        pieHole: 4/9
      }
    }
  });


  /**
   * Store a refernce to the row click listener variable so it can be
   * removed later to prevent leaking memory when the chart instance is
   * replaced.
   */
  var pageRowClickListener;

  /**
   * Update both charts whenever the selected view changes.
   */
  viewSelector.on('viewChange', function(data) {
    var ul = document.getElementById('prev-next-ul');
    ul.style.display = 'none';

    var options = {query: {
                      ids: data.ids,
                      filters: null  
                    }
                  };

    // Clean up any event listeners registered on the main chart before
    // rendering a new one.
    if (pageRowClickListener) {
      google.visualization.events.removeListener(pageRowClickListener);
    }

    pageChart.set(options).execute();
    previousChart.set(options);
    nextChart.set(options);
    
    var title = document.getElementById('view-name');
    title.innerHTML = data.property.name + ' (' + data.view.name + ')';
  });

  /**
   * Register a handler to run whenever the user changes the date range from
   * the first datepicker. The handler will update the first dataChart
   * instance as well as change the dashboard subtitle to reflect the range.
   */
  dateRangeSelector.on('change', function(data) {
    var ul = document.getElementById('prev-next-ul');
    ul.style.display = 'none';

    data['filters'] = null;
    var options = {query: data};

    // Clean up any event listeners registered on the main chart before
    // rendering a new one.
    if (pageRowClickListener) {
      google.visualization.events.removeListener(pageRowClickListener);
    }

    pageChart.set(options).execute();
    previousChart.set(options);
    nextChart.set(options);

    // Update the "period" dates text.
    var datefield = document.getElementById('period');
    datefield.innerHTML = data['start-date'] + '&mdash;' + data['end-date'];
  });


  /**
   * Each time the main chart is rendered, add an event listener to it so
   * that when the user clicks on a row, the line chart is updated with
   * the data from the browser in the clicked row.
   */
  pageChart.on('success', function(response) {
    var chart = response.chart;
    var dataTable = response.dataTable;

    // Store a reference to this listener so it can be cleaned up later.
    pageRowClickListener = google.visualization.events
        .addListener(chart, 'select', function(event) {

      // When you unselect a row, the "select" event still fires
      // but the selection is empty. Ignore that case.
      if (!chart.getSelection().length) return;

      var ul = document.getElementById('prev-next-ul');
      ul.style.display = null;

      var row =  chart.getSelection()[0].row;
      var page =  dataTable.getValue(row, 0);
      var options_1 = {
        query: {
          filters: 'ga:pagePath==' + page
        },
        chart: {
          options: {
            title: page
          }
        }
      };
      var datefield_1 = document.getElementById('previous');
      datefield_1.innerHTML = page;
      previousChart.set(options_1).execute();

      var options_2 = {
        query: {
          filters: 'ga:previousPagePath==' + page
        },
        chart: {
          options: {
            title: page
          }
        }
      };
      var datefield_2 = document.getElementById('next');
      datefield_2.innerHTML = page;
      nextChart.set(options_2).execute();
    });
  });

});