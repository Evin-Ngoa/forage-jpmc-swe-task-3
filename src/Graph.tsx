import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  /**
   * componentDidMount: runs after the component output has been rendered to the DOM.
   * Here, graph's initial state is se up, 
   * defining how it should process and display the incoming data, 
   * ensuring the ratio and bounds are clearly visualized.
   */
  componentDidMount() {
    // This gets the 'perspective-viewer' element from the DOM, which is where our graph will be displayed.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    // Here, we define the structure of the data that our graph will use, specifying the type of each piece of data.
    const schema = {
      price_abc: 'float', // This is the price for stock ABC
      price_def: 'float', // This is the price for stock DEF
      upper_bound: 'float', // This is the pre-calculated upper bound value
      lower_bound: 'float', // This is the pre-calculated lower bound value
      trigger_alert: 'float', // This will indicate when our ratio crosses the bounds
      ratio: 'float', // The ratio of the prices of stock ABC to stock DEF using `price_abc` & `price_def` respectively
      timestamp: 'date', // The time at which these values were recorded
    };

    // Check if the 'perspective' library is available and create a table with our schema.
    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }

    // If the table was created successfully, we configure the 'perspective-viewer' element.
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line'); // Sets the graph to display data as a line graph
      elem.setAttribute('row-pivots', '["timestamp"]'); // Sets 'timestamp' as the x-axis.
      
      /**
       * The 'columns' attribute specifies which data fields should be plotted along the y-axis of our graph.
       * This helps to eliminate any irrelevant data that would otherwise clutter the visualization.
       * By setting this attribute to include only 'ratio', 'lower_bound', 'upper_bound', and 'trigger_alert',
       * we ensure that the graph displays only the most pertinent information that traders need to monitor.
       */
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'); // Chooses which columns to display in the graph.


      /**
       * Configures how the data should be aggregated or summarized.
       * The 'aggregates' attribute helps us manage duplicate data points by merging them into a single entry.
       * This is particularly useful for consolidating data that appears similar but may have been logged multiple times.
       * By configuring the attribute, we treat a data point as unique only by its timestamp,
       * while averaging the values of other shared fields like 'price_abc' and 'upper_bound'.
       * This approach ensures our graph reflects a clean and accurate representation of the data over time.
       */
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
      }));
    }
  }

  /**
   * The 'componentDidUpdate' method is a lifecycle hook that runs after the component has been updated.
   */
  componentDidUpdate() {
    /**
     * This typically happens when new data is received and needs to be reflected in the graph.
     * Here, we make an essential update to the way we handle this new data.
     * By updating the argument passed to this.table.update, we ensure that the graph processes and displays
     * the most recent data points accurately, keeping the visualization current and meaningful for the user.
     */
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData
      );
    }
  }
}

export default Graph;
