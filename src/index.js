import Results from './results';
import RSS from './rss';
import Matches from './matches';
import MatchDetail from './match_detail';

export const getNews = (cb) => new RSS('news', cb);
export const getResults = (cb) => new Results(cb);
export const getMatches = (id, cb) => new Matches(id, cb);
export const getMatchDetails = (id, cb) => new MatchDetail(id, cb);
