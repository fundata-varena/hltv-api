import Results from './results';
import Results2 from './results2';
import RSS from './rss';
import Matches from './matches';
import MatchDetail from './match_detail';
import MatchSchedule from './match_schedule';
import Events from './events';

export const getNews = (cb) => new RSS('news', cb);
export const getResults = (cb) => new Results(cb);
export const getMatches = (id, cb) => new Matches(id, cb);
export const getMatchDetails = (id, cb) => new MatchDetail(id, cb);
export const getResultsByOffset = (offset, cb) => new Results2(offset, cb);
export const MatchScheduleHandler = MatchSchedule;
export const EventsHandler = Events;
