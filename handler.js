const AWS = require('aws-sdk')
const uuid = require('uuid')
const _ = require('highland')

const kinesis = new AWS.Kinesis();
const db = new AWS.DynamoDB.DocumentClient();

module.exports.createErrors = async (event, context) => {
  const params = {
    StreamName: process.env.STREAM_NAME,
    Records: [
      {
        PartitionKey: uuid.v4(),
        Data: Buffer.from(JSON.stringify({
          id: uuid.v1(),
          type: 'user-created',
          timestamp: Date.now(),
          error: false,
          message: '1: no error'
        }))
      },
      {
        PartitionKey: uuid.v4(),
        Data: Buffer.from(JSON.stringify({
          id: uuid.v1(),
          type: 'user-created',
          timestamp: Date.now(),
          error: true,
          message: '2: ERROR'
        }))
      },
      {
        PartitionKey: uuid.v4(),
        Data: Buffer.from(JSON.stringify({
          id: uuid.v1(),
          type: 'user-created',
          timestamp: Date.now(),
          error: false,
          message: '3: no error'
        }))
      },
      {
        PartitionKey: uuid.v4(),
        Data: Buffer.from(JSON.stringify({
          id: uuid.v1(),
          type: 'user-created',
          timestamp: Date.now(),
          error: true,
          message: '4: ERROR'
        }))
      },
      {
        PartitionKey: uuid.v4(),
        Data: Buffer.from(JSON.stringify({
          id: uuid.v1(),
          type: 'user-created',
          timestamp: Date.now(),
          error: false,
          message: '1: no error'
        }))
      }
    ]
  };

  console.log('params: %j', params);

  try {
    return await kinesis.putRecords(params).promise()
  } catch (err) {
    console.log('Kinese PutRecords error: %j', err)

    throw err
  }
}

module.exports.subscriber = (event, context, callback) => {
  _(event.Records)
    .map(decodeToEvent)
    .tap(e => console.log('Data: %j', e))
    .map(saveEvent)
    .collect()
    .toCallback(callback)
}

const decodeToEvent = (record) => JSON.parse(Buffer.from(record.kinesis.data, 'base64'))

const saveEvent = (event) => {
  if (event.error) 
    throw Error(event.message)

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      id: event.id,
      event
    }
  };

  console.log('params: %j', params);

  return _(db.put(params).promise()
    .then(() => event)
  )
}