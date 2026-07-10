const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "src/data/program_test");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
}

const paperList = readJson("paper_list.json");
const posterList = readJson("poster_list.json");
const sessionList = readJson("session_list.json");

const issues = [];

const isString = (v) => typeof v === "string";
const isBool = (v) => typeof v === "boolean";
const isNull = (v) => v === null;
const isNullableString = (v) => isString(v) || isNull(v);
const isStringArrayOrNull = (v) =>
  isNull(v) || (Array.isArray(v) && v.every(isString));

function validatePerson(p, ctx) {
  if (typeof p !== "object" || p === null || Array.isArray(p)) {
    issues.push(`${ctx}: expected object`);
    return;
  }
  if (!("name" in p) || !isString(p.name))
    issues.push(`${ctx}.name: expected string`);
  if ("email" in p && !isNullableString(p.email))
    issues.push(`${ctx}.email: expected string|null`);
  if ("affiliation" in p && !isString(p.affiliation))
    issues.push(`${ctx}.affiliation: expected string`);
}

function validateSubmission(s, ctx) {
  if (typeof s !== "object" || s === null || Array.isArray(s)) {
    issues.push(`${ctx}: expected object`);
    return;
  }

  const requiredString = [
    "id",
    "event_prefix",
    "title",
    "created_at",
    "updated_at",
    "program_paper_id",
  ];
  for (const k of requiredString) {
    if (!isString(s[k])) issues.push(`${ctx}.${k}: expected string`);
  }

  const requiredBoolean = ["has_pdf", "has_image", "has_ff"];
  for (const k of requiredBoolean) {
    if (!isBool(s[k])) issues.push(`${ctx}.${k}: expected boolean`);
  }

  const requiredNullableString = [
    "abstract",
    "doi",
    "fno",
    "pmu_upload_link",
    "pmu_retrieve_link",
    "open_access_supplemental_question",
    "open_access_supplemental_link",
    "preprint_link",
    "accessible_pdf",
    "practitioners_statement",
    "award",
    "pdf_url",
    "discord_url",
  ];
  for (const k of requiredNullableString) {
    if (!isNullableString(s[k]))
      issues.push(`${ctx}.${k}: expected string|null`);
  }

  if (!isStringArrayOrNull(s.keywords))
    issues.push(`${ctx}.keywords: expected string[]|null`);

  if (!Array.isArray(s.contributors)) {
    issues.push(`${ctx}.contributors: expected ProgramPerson[]`);
  } else {
    s.contributors.forEach((p, i) =>
      validatePerson(p, `${ctx}.contributors[${i}]`),
    );
  }

  if (!Array.isArray(s.authors)) {
    issues.push(`${ctx}.authors: expected ProgramPerson[]`);
  } else {
    s.authors.forEach((p, i) => validatePerson(p, `${ctx}.authors[${i}]`));
  }

  if (!(s.authors_bak === null || Array.isArray(s.authors_bak))) {
    issues.push(`${ctx}.authors_bak: expected ProgramPerson[]|null`);
  } else if (Array.isArray(s.authors_bak)) {
    s.authors_bak.forEach((p, i) =>
      validatePerson(p, `${ctx}.authors_bak[${i}]`),
    );
  }

  if (!(s.contributors_bak === null || Array.isArray(s.contributors_bak))) {
    issues.push(`${ctx}.contributors_bak: expected ProgramPerson[]|null`);
  } else if (Array.isArray(s.contributors_bak)) {
    s.contributors_bak.forEach((p, i) =>
      validatePerson(p, `${ctx}.contributors_bak[${i}]`),
    );
  }
}

function validateSlot(slot, ctx) {
  if (typeof slot !== "object" || slot === null || Array.isArray(slot)) {
    issues.push(`${ctx}: expected object`);
    return;
  }

  const requiredString = [
    "slot_id",
    "session_id",
    "title",
    "paper_type",
    "presentation_mode",
    "time_stamp",
    "time_start",
    "time_end",
    "uid",
  ];
  for (const k of requiredString) {
    if (!isString(slot[k])) issues.push(`${ctx}.${k}: expected string`);
  }

  if (
    !(
      slot.contributors === null ||
      (Array.isArray(slot.contributors) && slot.contributors.every(isString))
    )
  ) {
    issues.push(`${ctx}.contributors: expected string[]|null`);
  }

  if (!Array.isArray(slot.authors)) {
    issues.push(`${ctx}.authors: expected ProgramPerson[]`);
  } else {
    slot.authors.forEach((p, i) => validatePerson(p, `${ctx}.authors[${i}]`));
  }

  if (!isNullableString(slot.abstract))
    issues.push(`${ctx}.abstract: expected string|null`);
  if (!isStringArrayOrNull(slot.keywords))
    issues.push(`${ctx}.keywords: expected string[]|null`);
  if (!isNullableString(slot.preprint_link))
    issues.push(`${ctx}.preprint_link: expected string|null`);
  if (!isBool(slot.has_pdf)) issues.push(`${ctx}.has_pdf: expected boolean`);
  if (!isNullableString(slot.paper_award))
    issues.push(`${ctx}.paper_award: expected string|null`);
  if (!isNullableString(slot.doi))
    issues.push(`${ctx}.doi: expected string|null`);
  if (!isNullableString(slot.fno))
    issues.push(`${ctx}.fno: expected string|null`);
  if (!isNullableString(slot.open_access_supplemental_question)) {
    issues.push(
      `${ctx}.open_access_supplemental_question: expected string|null`,
    );
  }
  if (!isNullableString(slot.open_access_supplemental_link)) {
    issues.push(`${ctx}.open_access_supplemental_link: expected string|null`);
  }
}

function validateSession(session, ctx) {
  if (
    typeof session !== "object" ||
    session === null ||
    Array.isArray(session)
  ) {
    issues.push(`${ctx}: expected object`);
    return;
  }

  const requiredString = [
    "title",
    "session_id",
    "event_prefix",
    "track",
    "room_name",
    "time_start",
    "time_end",
  ];
  for (const k of requiredString) {
    if (!isString(session[k])) issues.push(`${ctx}.${k}: expected string`);
  }

  if (!Array.isArray(session.chair) || !session.chair.every(isString)) {
    issues.push(`${ctx}.chair: expected string[]`);
  }

  if (!isNullableString(session.discord_link))
    issues.push(`${ctx}.discord_link: expected string|null`);
  if (!isNullableString(session.youtube_url))
    issues.push(`${ctx}.youtube_url: expected string|null`);

  if (!Array.isArray(session.time_slots)) {
    issues.push(`${ctx}.time_slots: expected ProgramTimeSlot[]`);
  } else {
    session.time_slots.forEach((slot, i) =>
      validateSlot(slot, `${ctx}.time_slots[${i}]`),
    );
  }
}

function validateEvent(event, ctx) {
  if (typeof event !== "object" || event === null || Array.isArray(event)) {
    issues.push(`${ctx}: expected object`);
    return;
  }

  const requiredString = [
    "event",
    "long_name",
    "event_type",
    "event_prefix",
    "event_description",
    "event_url",
  ];
  for (const k of requiredString) {
    if (!isString(event[k])) issues.push(`${ctx}.${k}: expected string`);
  }

  if (!Array.isArray(event.organizers) || !event.organizers.every(isString)) {
    issues.push(`${ctx}.organizers: expected string[]`);
  }

  if (!Array.isArray(event.sessions)) {
    issues.push(`${ctx}.sessions: expected ProgramSession[]`);
  } else {
    event.sessions.forEach((s, i) =>
      validateSession(s, `${ctx}.sessions[${i}]`),
    );
  }
}

if (!Array.isArray(paperList)) {
  issues.push("paper_list.json: expected array");
} else {
  paperList.forEach((p, i) => validateSubmission(p, `paper_list[${i}]`));
}

if (!Array.isArray(posterList)) {
  issues.push("poster_list.json: expected array");
} else {
  posterList.forEach((p, i) => validateSubmission(p, `poster_list[${i}]`));
}

if (
  typeof sessionList !== "object" ||
  sessionList === null ||
  Array.isArray(sessionList)
) {
  issues.push("session_list.json: expected record object");
} else {
  for (const [key, event] of Object.entries(sessionList)) {
    validateEvent(event, `session_list.${key}`);
  }
}

if (issues.length === 0) {
  console.log("VALIDATION_OK");
  console.log("paper_list entries:", paperList.length);
  console.log("poster_list entries:", posterList.length);
  console.log("session groups:", Object.keys(sessionList).length);
} else {
  console.log("VALIDATION_FAILED");
  console.log("issue_count:", issues.length);
  for (const issue of issues) console.log(issue);
  process.exitCode = 1;
}
