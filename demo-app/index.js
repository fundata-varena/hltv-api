import express from 'express';
import { getNews, getResultsByOffset, getResults, getMatches, getMatchDetails, MatchScheduleHandler } from '../src/index';

const app = express();

app.get('/', (req, res) => {
  getNews(news => res.json(news));
});

app.get('/results', (req, res) => {
  if (req.query.offset) { // if offset is set, use getResultsByOffset
    getResultsByOffset(req.query.offset, results => res.json(results));
  } else {
    getResults(results => res.json(results));
  }
});

app.get('/schedules', (req, res) => {
    const handler = new MatchScheduleHandler((ok, error) => {
        if (error) {
            res.status(500).send(error);
            return;
        }

        const liveMatches = handler.getLiveMatches();
        const schduleMatches = handler.getScheduleMatches();

        res.json({
            lives: liveMatches,
            schedules: schduleMatches
        });
    });
});

app.get('/match-detail/:matchId(*)', (req, res) => {
  const { matchId } = req.params;
  getMatchDetails(matchId, (stats) => res.json(stats));
});

app.get('/:matchId(*)', (req, res) => {
  const { matchId } = req.params;
  getMatches(matchId, (stats) => res.json(stats));
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`); // eslint-disable-line no-console
});
