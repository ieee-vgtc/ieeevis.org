set -a

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

: "${SUPABASE_CLIENT_ANON_KEY:?SUPABASE_CLIENT_ANON_KEY is required}"
# The program holds chair and author emails, which the Bluesky handle matching
# needs, so it is not readable with the public anon key. The build reads it with
# its own key (role site_build). Ask the tech chairs for it.
: "${SUPABASE_SITE_BUILD_KEY:?SUPABASE_SITE_BUILD_KEY is required}"

set +a
rm -rf src/data/program
mkdir -p src/data/program

fetch_table() {
  # $1 = supabase table, $2 = output file, $3 = optional extra filter, $4 = optional column list
  status=$(curl --location --silent --get "https://data.tech.ieeevis.org/rest/v1/$1" \
    --data-urlencode "select=${4:-*}" \
    ${3:+--data-urlencode "$3"} \
    --header "apikey: $SUPABASE_CLIENT_ANON_KEY" \
    --header "Authorization: Bearer $SUPABASE_SITE_BUILD_KEY" \
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
# rooms also holds stream keys, so anon may read only these columns.
fetch_table rooms room_list.json "" "room_id,room_name,capacity,discord_channel,discord_channel_id,discord_url,slido_url,zoom_host_id,created_at,updated_at"
fetch_table timeblocks timeblock_list.json
fetch_table slots slot_list.json
# Posters live in the papers table under the v-poster prefix; the `posters`
# table is a separate (sparser) list that the program does not point at.
fetch_table papers paper_list.json "event_prefix=neq.v-poster"
fetch_table papers poster_list.json "event_prefix=eq.v-poster"

# for author bluesky handles
fetch_table bsky_handles bsky_handle_list.json "" "email,handle,did"
