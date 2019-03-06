# kinesis-and-errors

What to expect when an error occurs when processing a batch from a Kinesis stream: the whole batch will be retried

This example illustrates why it's important to think about how to handle the processing of the same event multiple times. Can the consumer be idempotent (updating a local copy of data (data events) could be an example of this) or do the events need to be tracked so that each event is only processed once (send a notification could be an example of this)?

## Steps
1. Execute `npm install`
2. Execute `sls deploy -v`
3. Execute `sls invoke -f createErrors`
4. View the CloudWatch log for the subscriber lambda
  - Notice that even though the second event in the batch is causing the error, upon each retry, the first event is still be re-processed
5. View the DynamoDB table and verify that only a single entry has been inserteda 