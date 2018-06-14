import request from 'request';
import cheerio from 'cheerio';
import { CONFIG } from './config';

class RankingTeams {
  constructor(callback) {
    const uri = `${CONFIG.BASE}/${CONFIG.RANKING_TEAMS}`;
    
    request({uri, followRedirect: false}, (error, response, body) => {
      if (error) {
        return callback(error);
      }

      let rankingUrl = uri;
      if (response.statusCode == 302) {
        rankingUrl = `${CONFIG.BASE}${response.headers['location']}`;
      }
      let region = this._getRegion();
      rankingUrl += region;

      request({uri: rankingUrl}, (error, response, body) => {
        if (error) {
          return callback(error);
        }

        const $ = cheerio.load(body, {
          normalizeWhitespace: true
        });

        const data = this._getRankingTeams($);
        return callback(null, data);
      });

    });
  }

  _getRankingTeams($) {
    const rankedRows = $('.ranking .ranked-team');
    let teams = [];

    rankedRows.each((i, row) => {
      const $row = $(row);

      const logo = $row.find('.team-logo img').attr('src');
      const name = $row.find('.name').text()
      let dataurl = $row.find('.name').attr('data-url') || ''
      let datalist= dataurl.match(/.team\/(\d+)\/\w/)
      let teamId
      if (datalist && datalist.length > 0) {
        teamId = datalist[1]
      }

      const position = parseInt($row.find('.position').text().split('#')[1]);
      const points = parseInt($row.find('.points').text().replace('(', '').replace(' points)', ''));
      let change = $row.find('.change').text();
      change = change == '-' ? 0 : parseInt(change);

      teams.push({
        logo,
        name,
        teamId,
        position,
        points,
        change,
      });

      teams.sort((a, b) => {
        return a.position - b.position;
      });

    });

    return teams;
  }
}


export class WorldRankingTeams extends RankingTeams {
  constructor(callback) {
    super(callback)
  }

  _getRegion() {
    return ''
  }
}

export class RegionRankingTeams extends RankingTeams {
  constructor(region, callback) {
    super(callback)
  }

  _getRegion() {
    return this.region
  }
}
