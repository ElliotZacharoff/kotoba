
const reload = require('require-reload')(require);

const ScoreStorageUtils = reload('./../kotoba/quiz/score_storage_utils.js');
const constants = reload('./../kotoba/constants.js');
const MAX_SCORERS = 20;

function createFieldForScorer(index, username, score) {
  return {
    name: `${(index + 1).toString()}) ${username}`,
    value: `${score.toString()} points`,
    inline: true,
  };
}

function createScoreTotalString(scores) {
  let scoreTotal = 0;
  const users = {};
  for (const score of scores) {
    scoreTotal += score.score;
    users[score.username] = true;
  }

  const usersTotal = Object.keys(users).length;
  const scoreTotalString = scoreTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${scoreTotalString} points have been scored by ${usersTotal} players.`;
}

function sendScores(bot, msg, scores, title, description, footer) {
  const content = {};
  content.embed = {
    title,
    description: `${description}\n${createScoreTotalString(scores)}`,
    color: constants.EMBED_NEUTRAL_COLOR,
  };
  if (footer) {
    content.embed.footer = footer;
  }
  content.embed.fields = [];
  scores = scores.sort((a, b) => b.score - a.score);
  for (let i = 0; i < scores.length && i < MAX_SCORERS; ++i) {
    let userName = scores[i].username;
    const score = scores[i].score;
    if (!userName) {
      userName = '<Name Unknown>';
    }
    content.embed.fields.push(createFieldForScorer(i, userName, score));
  }

  const commandInvokersRow = scores.find(row => row.userId === msg.author.id);

  if (commandInvokersRow) {
    const commandInvokersIndex = scores.indexOf(commandInvokersRow);

    if (commandInvokersIndex >= MAX_SCORERS) {
      content.embed.fields.push(createFieldForScorer(commandInvokersIndex, commandInvokersRow.username, commandInvokersRow.score));
    }
  }

  return msg.channel.createMessage(content, null, msg);
}

module.exports = {
  commandAliases: ['k!lb', 'k!leaderboard'],
  canBeChannelRestricted: true,
  cooldown: 3,
  uniqueId: 'leaderboard409359',
  action(bot, msg, suffix) {
    let title = '';
    let footer = {};
    let description = '';

    if (!suffix && msg.channel.guild) {
      title = `Server leaderboard for **${msg.channel.guild.name}**`;
      description = 'The top scorers in this server.';
      footer = {
        text: 'Say \'k!lb global\' to see the global leaderboard.',
        icon_url: constants.FOOTER_ICON_URI,
      };
      return ScoreStorageUtils.getServerScores(msg.channel.guild.id).then(scores => sendScores(bot, msg, scores, title, description, footer));
    }
    title = 'Global leaderboard';
    description = 'The top scorers in the whole wide world.';
    return ScoreStorageUtils.getGlobalScores().then(scores => sendScores(bot, msg, scores, title, description));
  },
};
