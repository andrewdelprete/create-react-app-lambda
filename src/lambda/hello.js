import _ from "lodash";
require("dotenv").config();
var Airtable = require("airtable");

var base = new Airtable({ apiKey: "keyO8ujECCZ8EPykr" }).base("appenjpG5GSATPlz0");

export async function handler(event, context) {
  try {
    let events = await getTable({ maxRecords: 5, table: "events" });
    const eventsIds = Object.values(events).map(e => e.fields.id);

    const sessions = await getTable({
      filterByFormula: `OR(${buildFieldIdstring("event_id", eventsIds)})`,
      table: "sessions"
    });

    events = Object.values(events).map(e => ({
      ...e,
      sessions: sessions[e.fields.sessions[0]]
    }));

    return { statusCode: 200, body: JSON.stringify(events) };
  } catch (err) {
    console.error(err);
  }
}

function buildFieldIdstring(fieldId, recordArr) {
  return `${recordArr
    .map(record => `event_id = '${record}',`)
    .join("")
    .slice(0, -1)}`;
}

export async function getTable({ table, ...options }) {
  let results = [];
  await base(table)
    .select(options)
    .eachPage(function page(records, fetchNextPage) {
      records.forEach(record => {
        results = [...results, record._rawJson];
      });

      fetchNextPage();
    });

  return results.reduce((result, item, index, array) => {
    result[item.id] = item;
    delete result[item.id].id;
    return result;
  }, {});
}
