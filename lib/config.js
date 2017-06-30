
// TODO move to modules to decide what datastore they should use.
module.exports= {
  module: 'raincatcher-mongo-connector',
  datasetIDs: {
    WORKORDERS: 'workorders',
    WORKFLOW: 'workflows',
    FILE: 'file',
    GPS: 'gps',
    MESSAGES: 'messages',
    RESULT: 'result',
    GROUP: 'group',
    MEMBERSHIP: 'membership'
  },
};