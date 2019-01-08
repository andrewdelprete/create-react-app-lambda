import { flatten } from "lodash";
require("dotenv").config();
var Airtable = require("airtable");

var base = new Airtable({ apiKey: "keyO8ujECCZ8EPykr" }).base("appenjpG5GSATPlz0");

export async function handler(event, context) {
  try {
    let events = await getTable({
      fields: ["date", "status", "event_type_id", "sessions"],
      filterByFormula: `IS_AFTER(DATETIME_PARSE(date), DATETIME_PARSE('01-01-${new Date().getFullYear()}'))`,
      table: "events"
    });
    const sessionIds = flatten(events.map(e => e.fields.sessions));

    const sessions = await getTable({
      fields: ["event_id", "time", "status", "reservations_count"],
      filterByFormula: `OR(${buildFieldIdstring(sessionIds)})`,
      table: "sessions"
    });

    // Replace sessions ref IDs with actual expanded session objects
    events = events.map(e => {
      e.fields.sessions = sessions.filter(s => s.fields.event_id[0] === e.id);
      return e;
    });

    return { statusCode: 200, body: JSON.stringify(events) };
  } catch (err) {
    console.error(err);
  }
}

function buildFieldIdstring(recordArr) {
  return `${recordArr
    .map(record => `RECORD_ID() = '${record}',`)
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

  return results;
}
