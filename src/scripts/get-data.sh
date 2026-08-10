set -a
source .env
set +a
rm -rf src/data/program
mkdir -p src/data/program

fetch_table() {
  # $1 = supabase table, $2 = output file, $3 = optional extra filter
  curl --location --silent --get "https://data.tech.ieeevis.org/rest/v1/$1" \
    --data-urlencode "select=*" \
    ${3:+--data-urlencode "$3"} \
    --header "apikey: $SUPABASE_CLIENT_ANON_KEY" > "src/data/program/$2"
}

fetch_table sessions2 session_list.json
fetch_table events event_list.json
fetch_table rooms room_list.json
fetch_table timeblocks timeblock_list.json
fetch_table slots slot_list.json
# Posters live in the papers table under the v-poster prefix; the `posters`
# table is a separate (sparser) list that the program does not point at.
fetch_table papers paper_list.json "event_prefix=neq.v-poster"
fetch_table papers poster_list.json "event_prefix=eq.v-poster"
