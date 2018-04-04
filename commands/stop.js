
const reload = require('require-reload')(require);

const quizManager = reload('./../kotoba/quiz/manager.js');
const shiritoriManager = reload('./../kotoba/shiritori/shiritori_manager.js');

module.exports = {
  commandAliases: ['k!endquiz', 'k!endtest', 'k!stop', 'k!quit', 'ｋ！ｑｓ'],
  canBeChannelRestricted: false,
  action(bot, msg, suffix) {
    const locationId = msg.channel.id;
    const userId = msg.author.id;
    return Promise.resolve(quizManager.stopQuiz(locationId, userId)).then(() => shiritoriManager.stop(locationId, userId));
  },
};
