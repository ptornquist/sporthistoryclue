import "server-only";

/** Resolved matchups. Served only after the client already has a solved score. */
const MATCHUPS: Record<string, string> = {
  "miracle-on-ice-1980": "USA mot Sovjetunionen (1980)",
  "miracle-1980": "USA mot Sovjetunionen (1980)",
  "summit-series-1972": "Kanada mot Sovjetunionen (1972)",
  "sverige-sovjet-1984": "Sverige mot Sovjetunionen (1984)",
  "comaneci-1976": "Nadia Comăneci (1976)",
  "dream-team-1992": "USA:s uppvisningslag mot Kroatien (1992)",
  "bolt-beijing-2008": "Usain Bolt (2008)",
  "bolt-2008": "Usain Bolt (2008)",
  "duplantis-2026": "Armand Duplantis (2026)",
  "pele-sweden-1958": "Brasilien mot Sverige (1958)",
  "pele-1958": "Brasilien mot Sverige (1958)",
  "hand-of-god-1986": "Argentina mot England (1986)",
  "maradona-1986": "Argentina mot England (1986)",
  "rumble-in-the-jungle-1974": "Muhammad Ali mot George Foreman (1974)",
  "ali-1974": "Muhammad Ali mot George Foreman (1974)",
  "wimbledon-epic-1980": "Björn Borg mot John McEnroe (1980)",
  "pasadena-bronze-1994": "Sverige mot Bulgarien (1994)",
  "turin-gold-2006": "Sverige mot Finland (2006)",
  "slaget-i-sudden": "Växjö mot Frölunda (2015)",
  "guldkampen-i-norr": "Skellefteå mot Luleå (2013)",
  "sondagsmorgonen-stockholms-stad": "Hammarby mot Djurgården (2018)",
  "guldstriden-sista-omgangen": "IFK Göteborg mot Trelleborg (2007)",
  "farjestad-skelleftea-2011": "Färjestad mot Skellefteå (2011)",
  "brynas-skelleftea-2012": "Brynäs mot Skellefteå (2012)",
  "skelleftea-farjestad-2014": "Skellefteå mot Färjestad (2014)",
  "frolunda-skelleftea-2016": "Frölunda mot Skellefteå (2016)",
  "aik-djurgarden-2017": "AIK mot Djurgården (2017)",
  "malmo-ifk-2015": "Malmö FF mot IFK Göteborg (2015)",
  "elfsborg-djurgarden-2006": "Elfsborg mot Djurgården (2006)",
  "hammarby-aik-2016": "Hammarby mot AIK (2016)",
  "tyson-holyfield-1996": "Mike Tyson mot Evander Holyfield (1996)",
  "thrilla-manila-1975": "Muhammad Ali mot Joe Frazier (1975)",
  "clay-liston-1964": "Cassius Clay mot Sonny Liston (1964)",
  "hagler-leonard-1987": "Sugar Ray Leonard mot Marvin Hagler (1987)",
  "louis-schmeling-1938": "Joe Louis mot Max Schmeling (1938)",
  "federer-nadal-2008": "Roger Federer mot Rafael Nadal (2008)",
  "borg-mcenroe-1981": "Björn Borg mot John McEnroe (1981)",
  "edberg-becker-1988": "Stefan Edberg mot Boris Becker (1988)",
  "wilander-1982": "Mats Wilander mot Guillermo Vilas (1982)",
  "saint-cyr-1956": "Henri Saint Cyr (1956)",
  "tokyo-hopp-2021": "Sveriges hopplandslag (2021)",
  "dujardin-2012": "Charlotte Dujardin (2012)",
  "handboll-vm-1999": "Sverige mot Ryssland (1999)",
  "handboll-em-1994": "Sverige mot Ryssland (1994)",
  "handboll-em-2022": "Sverige mot Spanien (2022)",
};

export function solvedMatchup(id: string): string | null {
  return MATCHUPS[id] ?? null;
}

export function allMatchupLabels(): string[] {
  return Array.from(new Set(Object.values(MATCHUPS)));
}
