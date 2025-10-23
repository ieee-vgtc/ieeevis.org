const calcAllKeys = function (allPapers, allKeys) {
  const collectAuthors = new Set();
  const collectKeywords = new Set();
  const collectSessions = new Set();

  allPapers.forEach((d) => {
    d.authors.forEach((a) => collectAuthors.add(a));
    allKeys.titles.push(d.title);

    if (d.keywords)
      d.keywords.forEach((a) => collectKeywords.add(a));
    if (d.sessions)
      d.sessions.forEach((a) => collectSessions.add(a));
  });
  allKeys.authors = Array.from(collectAuthors);
  allKeys.keywords = Array.from(collectKeywords);
  allKeys.sessions = Array.from(collectSessions);
  allKeys.sessions.sort();
};
