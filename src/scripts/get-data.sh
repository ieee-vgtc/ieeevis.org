set -a

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

: "${SUPABASE_CLIENT_ANON_KEY:?SUPABASE_CLIENT_ANON_KEY is required}"

# The program tables (papers, sessions2, slots, ...) carry chair and author
# emails, so anon cannot read them; the build authenticates as the read-only
# `site_build` role with its own key (conferentech docs/dashboard/README.md,
# "The website build key"). Kong accepts only the anon key as `apikey`, so the
# build key goes in `Authorization`. Without it the program tables answer 401
# ("permission denied"), so it is required in CI (GitHub Actions, Netlify),
# where it fails fast with a clear message; a local run without it only warns.
if [ -z "${SUPABASE_SITE_BUILD_KEY:-}" ]; then
  if [ -n "${CI:-}" ] || [ -n "${NETLIFY:-}" ]; then
    echo "SUPABASE_SITE_BUILD_KEY is required in CI" >&2
    exit 1
  fi
  echo "Warning: SUPABASE_SITE_BUILD_KEY is not set; the program tables will refuse the anon key." >&2
fi

set +a
rm -rf src/data/program
mkdir -p src/data/program

fetch_table() {
  # $1 = supabase table, $2 = output file, $3 = optional extra filter, $4 = optional column list
  status=$(curl --location --silent --get "https://data.tech.ieeevis.org/rest/v1/$1" \
    --data-urlencode "select=${4:-*}" \
    ${3:+--data-urlencode "$3"} \
    --header "apikey: $SUPABASE_CLIENT_ANON_KEY"     ${SUPABASE_SITE_BUILD_KEY:+--header "Authorization: Bearer $SUPABASE_SITE_BUILD_KEY"} \
    --output "src/data/program/$2" --write-out "%{http_code}") || {
    echo "Fetching $1 failed with curl exit code $?" >&2
    exit 1
  }
  if [ "$status" != "200" ]; then
    echo "Fetching $1 failed with HTTP $status: $(cat "src/data/program/$2")" >&2
    exit 1
  fi
}

fetch_table sessions2 session_list.json
fetch_table events event_list.json
# rooms also holds stream keys, so the build may read only these columns.
fetch_table rooms room_list.json "" "room_id,room_name,capacity,discord_channel,discord_channel_id,discord_url,slido_url,zoom_host_id,created_at,updated_at"
fetch_table timeblocks timeblock_list.json
fetch_table slots slot_list.json
# Posters live in the papers table under the v-poster prefix; the `posters`
# table is a separate (sparser) list that the program does not point at.
fetch_table papers paper_list.json "event_prefix=neq.v-poster"
fetch_table papers poster_list.json "event_prefix=eq.v-poster"

# for author bluesky handles
fetch_table bsky_handles bsky_handle_list.json "" "email,handle,did"
